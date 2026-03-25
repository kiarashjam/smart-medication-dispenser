/** Devices tab: list user devices, pause/resume, navigate to containers. */
import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { devicesApi } from '../../src/api/client'
import type { DeviceDto } from '../../src/api/client'

export default function Devices() {
  const router = useRouter()
  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await devicesApi.list()
      setDevices(res.data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const onRefresh = () => { setRefreshing(true); load() }

  const handlePause = async (id: string) => {
    try {
      await devicesApi.pause(id)
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Paused' } : d)))
    } catch {}
  }

  const handleResume = async (id: string) => {
    try {
      await devicesApi.resume(id)
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Active' } : d)))
    } catch {}
  }

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devices</Text>
      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No devices.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.type === 'Main' ? 'Main Dispenser' : 'Portable'} ·{' '}
                  {item.isOnline ? '🟢 Online' : '🔴 Offline'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#dcfce7' : '#fed7aa' }]}>
                <Text style={{ color: item.status === 'Active' ? '#16a34a' : '#ea580c', fontWeight: '600', fontSize: 12 }}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Device stats */}
            <View style={styles.statsRow}>
              {item.batteryLevel != null && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Battery</Text>
                  <Text style={styles.statValue}>{item.batteryLevel}%</Text>
                </View>
              )}
              {item.wifiSignal != null && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>WiFi</Text>
                  <Text style={styles.statValue}>{item.wifiSignal} dBm</Text>
                </View>
              )}
              {item.firmwareVersion && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Firmware</Text>
                  <Text style={styles.statValue}>{item.firmwareVersion}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push({ pathname: '/containers/[deviceId]', params: { deviceId: item.id } })}
              >
                <Text style={styles.actionButtonText}>Containers</Text>
              </TouchableOpacity>
              {item.status === 'Active' ? (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#fef3c7' }]} onPress={() => handlePause(item.id)}>
                  <Text style={[styles.actionButtonText, { color: '#d97706' }]}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dcfce7' }]} onPress={() => handleResume(item.id)}>
                  <Text style={[styles.actionButtonText, { color: '#16a34a' }]}>Resume</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#1f2937' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 17, fontWeight: '600', color: '#1f2937' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  stat: {},
  statLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, backgroundColor: '#dbeafe', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
})
