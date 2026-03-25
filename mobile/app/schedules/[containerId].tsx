/** Schedule management for a container: view, add, delete dosing schedules. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput, Modal } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { schedulesApi, type ScheduleDto } from '../../src/api/client'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatBitmask(bitmask: number): string {
  if (bitmask === 0x7F) return 'Every day'
  if (bitmask === 0x1F) return 'Weekdays'
  if (bitmask === 0x60) return 'Weekends'
  const days: string[] = []
  DAY_NAMES.forEach((name, i) => {
    if (bitmask & (1 << i)) days.push(name)
  })
  return days.join(', ')
}

export default function SchedulesScreen() {
  const { containerId, medicationName } = useLocalSearchParams<{ containerId: string; medicationName: string }>()
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTime, setNewTime] = useState('08:00')
  const [newNotes, setNewNotes] = useState('')
  const [selectedDays, setSelectedDays] = useState(0x7F) // All days

  const load = useCallback(async () => {
    if (!containerId) return
    try {
      const res = await schedulesApi.listByContainer(containerId)
      setSchedules(res.data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [containerId])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const toggleDay = (index: number) => {
    setSelectedDays(prev => prev ^ (1 << index))
  }

  const handleAdd = async () => {
    if (!containerId || !newTime || selectedDays === 0) return
    try {
      await schedulesApi.create(containerId, {
        timeOfDay: newTime,
        daysOfWeekBitmask: selectedDays,
        startDate: new Date().toISOString(),
        notes: newNotes.trim() || undefined,
      })
      setShowAddModal(false)
      setNewTime('08:00')
      setNewNotes('')
      setSelectedDays(0x7F)
      load()
    } catch {
      Alert.alert('Error', 'Failed to add schedule')
    }
  }

  const handleDelete = (schedule: ScheduleDto) => {
    Alert.alert(
      'Delete Schedule',
      `Remove the ${schedule.timeOfDay} schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await schedulesApi.delete(schedule.id)
            load()
          } catch {
            Alert.alert('Error', 'Failed to delete schedule')
          }
        }},
      ]
    )
  }

  if (loading) {
    return <View style={styles.center}><Text>Loading schedules...</Text></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedules</Text>
          {medicationName && <Text style={styles.subtitle}>{medicationName}</Text>}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No schedules configured</Text>
            <Text style={styles.emptySubtitle}>Add a dosing schedule to start reminders</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item)}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{item.timeOfDay}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.daysText}>{formatBitmask(item.daysOfWeekBitmask)}</Text>
              <Text style={styles.dateRange}>
                From {new Date(item.startDate).toLocaleDateString()}
                {item.endDate ? ` to ${new Date(item.endDate).toLocaleDateString()}` : ' (ongoing)'}
              </Text>
              {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Schedule Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Schedule</Text>

            <Text style={styles.inputLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="08:00"
              autoFocus
            />

            <Text style={styles.inputLabel}>Days</Text>
            <View style={styles.daysRow}>
              {DAY_NAMES.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, (selectedDays & (1 << i)) ? styles.dayChipActive : null]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={(selectedDays & (1 << i)) ? styles.dayChipTextActive : styles.dayChipText}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="e.g. Take with food"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, selectedDays === 0 && { opacity: 0.5 }]}
                onPress={handleAdd}
                disabled={selectedDays === 0}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  timeBadge: { backgroundColor: '#2563eb', width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  timeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardContent: { flex: 1 },
  daysText: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  dateRange: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  notes: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  dayChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  dayChipActive: { backgroundColor: '#2563eb' },
  dayChipText: { color: '#374151', fontWeight: '500' },
  dayChipTextActive: { color: '#fff', fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelButtonText: { color: '#6b7280', fontWeight: '600' },
  saveButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
})
