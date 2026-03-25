/** Home tab: today's schedule for active device, schedule local notifications, tap item → dose screen. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { devicesApi, schedulesApi, dispensingApi, getApiErrorMessage } from '../../src/api/client'
import { scheduleDoseNotifications } from '../../src/notifications/scheduleNotifications'
import type { DeviceDto, TodayScheduleItemDto } from '../../src/api/client'
import * as Localization from 'expo-localization'

type DoseStatus = 'pending' | 'dispensed' | 'confirmed' | 'missed'

interface DoseItemState {
  scheduleId: string
  status: DoseStatus
  dispenseEventId?: string
}

export default function Home() {
  const router = useRouter()
  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [todayItems, setTodayItems] = useState<TodayScheduleItemDto[]>([])
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [doseStates, setDoseStates] = useState<Record<string, DoseItemState>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const devRes = await devicesApi.list()
      setDevices(devRes.data)
      const active = devRes.data.find((d) => d.status === 'Active') ?? devRes.data[0]
      if (active) {
        setActiveDeviceId(active.id)
        const tz = Localization.getCalendars?.()[0]?.timeZone ?? undefined
        const schedRes = await schedulesApi.today(active.id, tz)
        setTodayItems(schedRes.data)
        // Initialize dose states as pending
        const states: Record<string, DoseItemState> = {}
        schedRes.data.forEach(item => {
          const scheduledTime = new Date(item.scheduledAtUtc)
          const now = new Date()
          const isPast = scheduledTime < now
          states[item.scheduleId] = {
            scheduleId: item.scheduleId,
            status: isPast ? 'pending' : 'pending',
          }
        })
        setDoseStates(states)
        scheduleDoseNotifications(schedRes.data, active.id).catch(() => {})
      } else {
        setTodayItems([])
      }
    } catch {
      setTodayItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  const handleDispense = async (item: TodayScheduleItemDto) => {
    if (!activeDeviceId) return
    setActionLoading(item.scheduleId)
    try {
      const { data } = await dispensingApi.dispense(activeDeviceId, { scheduleId: item.scheduleId })
      setDoseStates(prev => ({
        ...prev,
        [item.scheduleId]: { scheduleId: item.scheduleId, status: 'dispensed', dispenseEventId: data.id }
      }))
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirm = async (item: TodayScheduleItemDto) => {
    const state = doseStates[item.scheduleId]
    if (!state?.dispenseEventId) {
      Alert.alert('Dispense first', 'Press Dispense first, then confirm after taking the dose.')
      return
    }
    setActionLoading(item.scheduleId)
    try {
      await dispensingApi.confirm(state.dispenseEventId)
      setDoseStates(prev => ({
        ...prev,
        [item.scheduleId]: { ...prev[item.scheduleId], status: 'confirmed' }
      }))
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelay = async (item: TodayScheduleItemDto) => {
    const state = doseStates[item.scheduleId]
    if (!state?.dispenseEventId) return
    setActionLoading(item.scheduleId)
    try {
      await dispensingApi.delay(state.dispenseEventId, { minutes: 15 })
      Alert.alert('Delayed', 'Reminder delayed by 15 minutes.')
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (scheduleId: string): { label: string; color: string; bg: string } => {
    const state = doseStates[scheduleId]
    switch (state?.status) {
      case 'confirmed':
        return { label: 'Confirmed', color: '#059669', bg: '#d1fae5' }
      case 'dispensed':
        return { label: 'Dispensed', color: '#d97706', bg: '#fef3c7' }
      case 'missed':
        return { label: 'Missed', color: '#dc2626', bg: '#fee2e2' }
      default:
        return { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' }
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const allConfirmed = todayItems.length > 0 && todayItems.every(item => doseStates[item.scheduleId]?.status === 'confirmed')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today&apos;s Schedule</Text>
      {devices.length > 1 && (
        <View style={styles.deviceRow}>
          <Text style={styles.label}>Device: </Text>
          {devices.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => {
                setActiveDeviceId(d.id)
                const tz = Localization.getCalendars?.()[0]?.timeZone ?? undefined
                schedulesApi.today(d.id, tz).then((r) => setTodayItems(r.data)).catch(() => setTodayItems([]))
              }}
              style={[styles.deviceChip, activeDeviceId === d.id && styles.deviceChipActive]}
            >
              <Text style={activeDeviceId === d.id ? styles.deviceChipTextActive : styles.deviceChipText}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {allConfirmed && (
        <View style={styles.allDoneBanner}>
          <Text style={styles.allDoneText}>All doses taken today!</Text>
        </View>
      )}
      <FlatList
        data={todayItems}
        keyExtractor={(item) => item.scheduleId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No doses scheduled today.</Text>}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.scheduleId)
          const state = doseStates[item.scheduleId]
          const isLoading = actionLoading === item.scheduleId
          const isConfirmed = state?.status === 'confirmed'

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/dose/[id]', params: { id: item.scheduleId, containerId: item.containerId, deviceId: activeDeviceId ?? '', medicationName: item.medicationName, pillsPerDose: item.pillsPerDose } })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.medName}>{item.medicationName}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
              <Text style={styles.detail}>
                {item.pillsPerDose} pill(s) · {new Date(item.scheduledAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

              {!isConfirmed && (
                <View style={styles.actionRow}>
                  {!state?.dispenseEventId && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionDispense, isLoading && styles.actionDisabled]}
                      onPress={() => handleDispense(item)}
                      disabled={isLoading}
                    >
                      <Text style={styles.actionBtnText}>Dispense</Text>
                    </TouchableOpacity>
                  )}
                  {state?.dispenseEventId && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionConfirm, isLoading && styles.actionDisabled]}
                        onPress={() => handleConfirm(item)}
                        disabled={isLoading}
                      >
                        <Text style={styles.actionBtnText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionDelay, isLoading && styles.actionDisabled]}
                        onPress={() => handleDelay(item)}
                        disabled={isLoading}
                      >
                        <Text style={styles.actionBtnText}>Delay</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  label: { marginRight: 8, color: '#6b7280' },
  deviceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8, marginBottom: 4 },
  deviceChipActive: { backgroundColor: '#2563eb' },
  deviceChipText: { color: '#374151' },
  deviceChipTextActive: { color: '#fff' },
  allDoneBanner: { backgroundColor: '#d1fae5', padding: 12, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  allDoneText: { color: '#059669', fontWeight: '600', fontSize: 15 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medName: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  detail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  notes: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center', flex: 1 },
  actionDispense: { backgroundColor: '#2563eb' },
  actionConfirm: { backgroundColor: '#059669' },
  actionDelay: { backgroundColor: '#6b7280' },
  actionDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
})
