/** Tab navigator: Home, Devices, History, Notifications, Profile with icons and unread badge. */
import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { notificationsApi } from '../../src/api/client'

const showMvpHeader = process.env.EXPO_PUBLIC_MVP_MODE === 'true'

function MvpHeaderBadge() {
  if (!showMvpHeader) return null
  return (
    <View style={mvpHeaderStyles.wrap}>
      <Text style={mvpHeaderStyles.text}>MVP</Text>
    </View>
  )
}

const mvpHeaderStyles = StyleSheet.create({
  wrap: {
    marginRight: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: { fontSize: 11, fontWeight: '700', color: '#92400e' },
})

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <View style={badgeStyles.container}>
      <Text style={badgeStyles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: { color: '#fff', fontSize: 10, fontWeight: '700' },
})

export default function TabLayout() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread count on mount and every 30 seconds
    const fetchUnread = () => {
      notificationsApi.list(50)
        .then(r => {
          const unread = r.data.filter((n: any) => !n.isRead).length
          setUnreadCount(unread)
        })
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: showMvpHeader ? () => <MvpHeaderBadge /> : undefined,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon label="H" color={color} />,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color }) => <TabIcon label="D" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon label="Hi" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <View>
              <TabIcon label="N" color={color} />
              <NotificationBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon label="P" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <View style={[iconStyles.container, { borderColor: color }]}>
      <Text style={[iconStyles.text, { color }]}>{label}</Text>
    </View>
  )
}

const iconStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { fontSize: 11, fontWeight: '700' },
})
