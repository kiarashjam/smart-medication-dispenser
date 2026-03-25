/** Notifications tab: list, mark as read, pull-to-refresh, sorted by date. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { notificationsApi } from '../../src/api/client'
import type { NotificationDto } from '../../src/api/client'

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  DoseMissed: { color: '#dc2626', bg: '#fee2e2' },
  LowStock: { color: '#d97706', bg: '#fef3c7' },
  RefillCritical: { color: '#dc2626', bg: '#fee2e2' },
  DeviceOffline: { color: '#6b7280', bg: '#f3f4f6' },
  DeviceError: { color: '#dc2626', bg: '#fee2e2' },
  BatteryLow: { color: '#f59e0b', bg: '#fffbeb' },
  BatteryCritical: { color: '#dc2626', bg: '#fee2e2' },
  DoseConfirmed: { color: '#059669', bg: '#d1fae5' },
  TravelModeOn: { color: '#2563eb', bg: '#dbeafe' },
  TravelModeOff: { color: '#2563eb', bg: '#dbeafe' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await notificationsApi.list(50)
      // Sort by date descending (newest first)
      const sorted = [...r.data].sort((a, b) =>
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
      )
      setNotifications(sorted)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    for (const n of unread) {
      try { await notificationsApi.markRead(n.id) } catch {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllLink}>Mark all read ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
        renderItem={({ item }) => {
          const typeStyle = TYPE_COLORS[item.type] ?? { color: '#6b7280', bg: '#f3f4f6' }
          return (
            <View style={[styles.card, !item.isRead && styles.cardUnread]}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: typeStyle.color }]}>{item.type.replace(/([A-Z])/g, ' $1').trim()}</Text>
                </View>
                <Text style={styles.time}>{getRelativeTime(item.createdAtUtc)}</Text>
              </View>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              {!item.isRead && (
                <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.markReadBtn}>
                  <Text style={styles.link}>Mark read</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }}
      />
    </View>
  )
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  markAllLink: { color: '#2563eb', fontSize: 13 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardUnread: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  time: { fontSize: 11, color: '#9ca3af' },
  titleText: { fontWeight: '600', fontSize: 15, marginTop: 4 },
  body: { fontSize: 13, color: '#4b5563', marginTop: 4 },
  markReadBtn: { marginTop: 8 },
  link: { color: '#2563eb', fontWeight: '500', fontSize: 13 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
})
