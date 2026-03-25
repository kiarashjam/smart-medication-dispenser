/** History tab: select device, show dispense events with date filter and color-coded status. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { devicesApi, historyApi } from '../../src/api/client'
import type { DeviceDto, DispenseEventDto } from '../../src/api/client'

type DateFilter = 'today' | 'week' | 'month'

const DATE_FILTERS: { key: DateFilter; label: string; days: number }[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: 'week', label: '7 Days', days: 7 },
  { key: 'month', label: '30 Days', days: 30 },
]

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Confirmed: { color: '#059669', bg: '#d1fae5' },
  Dispensed: { color: '#d97706', bg: '#fef3c7' },
  Pending: { color: '#6b7280', bg: '#f3f4f6' },
  Delayed: { color: '#f59e0b', bg: '#fffbeb' },
  Missed: { color: '#dc2626', bg: '#fee2e2' },
}

export default function History() {
  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [events, setEvents] = useState<DispenseEventDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('week')

  const loadEvents = useCallback(async (deviceId: string, filter: DateFilter) => {
    const to = new Date()
    const from = new Date()
    const days = DATE_FILTERS.find(f => f.key === filter)?.days ?? 7
    from.setDate(from.getDate() - days)
    try {
      const r = await historyApi.events(deviceId, { fromUtc: from.toISOString(), toUtc: to.toISOString(), limit: 100 })
      setEvents(r.data)
    } catch {
      setEvents([])
    }
  }, [])

  useEffect(() => {
    devicesApi.list().then((r) => {
      setDevices(r.data)
      if (r.data.length > 0) {
        setSelectedId(r.data[0].id)
        loadEvents(r.data[0].id, dateFilter)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    loadEvents(selectedId, dateFilter)
  }, [selectedId, dateFilter, loadEvents])

  const onRefresh = useCallback(() => {
    if (!selectedId) return
    setRefreshing(true)
    loadEvents(selectedId, dateFilter).finally(() => setRefreshing(false))
  }, [selectedId, dateFilter, loadEvents])

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      {/* Device selector */}
      {devices.length > 1 && (
        <View style={styles.filterRow}>
          {devices.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.chip, selectedId === d.id && styles.chipActive]}
              onPress={() => setSelectedId(d.id)}
            >
              <Text style={selectedId === d.id ? styles.chipTextActive : styles.chipText}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Date filter */}
      <View style={styles.filterRow}>
        {DATE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, dateFilter === f.key && styles.chipActive]}
            onPress={() => setDateFilter(f.key)}
          >
            <Text style={dateFilter === f.key ? styles.chipTextActive : styles.chipText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No events for this period.</Text>}
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.Pending
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.med}>{item.medicationName ?? 'Unknown'} · {item.pillsPerDose ?? 0} pill(s)</Text>
                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.time}>
                Scheduled: {new Date(item.scheduledAtUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.dispensedAtUtc && (
                <Text style={styles.timeSecondary}>
                  Dispensed: {new Date(item.dispensedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
              {item.confirmedAtUtc && (
                <Text style={styles.timeSecondary}>
                  Confirmed: {new Date(item.confirmedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
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
  filterRow: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#374151', fontSize: 13 },
  chipTextActive: { color: '#fff', fontSize: 13 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  med: { fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  time: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  timeSecondary: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
})
