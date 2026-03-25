/** Container management for a device: view, add, edit medication slots. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput, Modal } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { containersApi, type ContainerDto } from '../../src/api/client'

export default function ContainersScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>()
  const router = useRouter()
  const [containers, setContainers] = useState<ContainerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [newQuantity, setNewQuantity] = useState('30')
  const [newPillsPerDose, setNewPillsPerDose] = useState('1')
  const [newLowStock, setNewLowStock] = useState('7')

  const load = useCallback(async () => {
    if (!deviceId) return
    try {
      const res = await containersApi.listByDevice(deviceId)
      setContainers(res.data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [deviceId])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const handleAdd = async () => {
    if (!deviceId || !newMedName.trim()) return
    try {
      const nextSlot = containers.length > 0 ? Math.max(...containers.map(c => c.slotNumber)) + 1 : 1
      await containersApi.create(deviceId, {
        slotNumber: nextSlot,
        medicationName: newMedName.trim(),
        quantity: parseInt(newQuantity) || 30,
        pillsPerDose: parseInt(newPillsPerDose) || 1,
        lowStockThreshold: parseInt(newLowStock) || 7,
      })
      setShowAddModal(false)
      setNewMedName('')
      load()
    } catch (err) {
      Alert.alert('Error', 'Failed to add container')
    }
  }

  const handleDelete = (container: ContainerDto) => {
    Alert.alert(
      'Delete Container',
      `Remove ${container.medicationName} from slot ${container.slotNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await containersApi.delete(container.id)
            load()
          } catch {
            Alert.alert('Error', 'Failed to delete container')
          }
        }},
      ]
    )
  }

  const getStockStatus = (container: ContainerDto) => {
    if (container.quantity === 0) return { label: 'Empty', color: '#dc2626', bg: '#fee2e2' }
    if (container.quantity <= container.lowStockThreshold) return { label: 'Low', color: '#ea580c', bg: '#fed7aa' }
    return { label: 'OK', color: '#16a34a', bg: '#dcfce7' }
  }

  if (loading) {
    return <View style={styles.center}><Text>Loading containers...</Text></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Slots</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={containers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No medications configured</Text>
            <Text style={styles.emptySubtitle}>Add your first medication to get started</Text>
          </View>
        }
        renderItem={({ item }) => {
          const stock = getStockStatus(item)
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/schedules/[containerId]', params: { containerId: item.id, medicationName: item.medicationName } })}
              onLongPress={() => handleDelete(item)}
            >
              <View style={styles.slotBadge}>
                <Text style={styles.slotText}>Slot {item.slotNumber}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.medName}>{item.medicationName}</Text>
                <Text style={styles.detail}>{item.pillsPerDose} pill(s) per dose</Text>
                <View style={styles.stockRow}>
                  <Text style={styles.stockText}>{item.quantity} pills remaining</Text>
                  <View style={[styles.stockBadge, { backgroundColor: stock.bg }]}>
                    <Text style={[styles.stockBadgeText, { color: stock.color }]}>{stock.label}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
      />

      {/* Add Container Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medication</Text>

            <Text style={styles.inputLabel}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={newMedName}
              onChangeText={setNewMedName}
              placeholder="e.g. Metformin 500mg"
              autoFocus
            />

            <Text style={styles.inputLabel}>Initial Quantity</Text>
            <TextInput
              style={styles.input}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="number-pad"
              placeholder="30"
            />

            <Text style={styles.inputLabel}>Pills Per Dose</Text>
            <TextInput
              style={styles.input}
              value={newPillsPerDose}
              onChangeText={setNewPillsPerDose}
              keyboardType="number-pad"
              placeholder="1"
            />

            <Text style={styles.inputLabel}>Low Stock Threshold</Text>
            <TextInput
              style={styles.input}
              value={newLowStock}
              onChangeText={setNewLowStock}
              keyboardType="number-pad"
              placeholder="7"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !newMedName.trim() && { opacity: 0.5 }]}
                onPress={handleAdd}
                disabled={!newMedName.trim()}
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
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  slotBadge: { backgroundColor: '#dbeafe', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  slotText: { color: '#2563eb', fontWeight: '700', fontSize: 10 },
  cardContent: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  detail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  stockText: { fontSize: 13, color: '#6b7280' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  stockBadgeText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelButtonText: { color: '#6b7280', fontWeight: '600' },
  saveButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
})
