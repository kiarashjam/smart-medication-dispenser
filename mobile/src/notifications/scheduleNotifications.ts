/**
 * Dose reminders: request notification permission, schedule local notifications for today’s doses,
 * and provide listener for notification tap → pass schedule/container/device data to navigator.
 */
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { TodayScheduleItemDto } from '../api/client'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const CHANNEL_ID = 'dose-reminders'

/** Request notification permission; on Android create channel first. Returns true if granted. */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Dose reminders',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleDoseNotifications(
  items: TodayScheduleItemDto[],
  deviceId: string
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  const granted = await requestPermissions()
  if (!granted) return
  const now = Date.now()
  for (const item of items) {
    const at = new Date(item.scheduledAtUtc).getTime()
    if (at <= now) continue
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for medication',
        body: `${item.medicationName} – ${item.pillsPerDose} pill(s)`,
        data: {
          scheduleId: item.scheduleId,
          containerId: item.containerId,
          deviceId,
          medicationName: item.medicationName,
          pillsPerDose: String(item.pillsPerDose),
        },
      },
      trigger: { date: new Date(item.scheduledAtUtc), channelId: CHANNEL_ID },
    })
  }
}

/** Subscribe to notification tap; handler receives scheduleId, containerId, deviceId, medicationName, pillsPerDose. Returns unsubscribe. */
export function addNotificationResponseListener(
  handler: (data: { scheduleId: string; containerId: string; deviceId: string; medicationName: string; pillsPerDose: string }) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as unknown as {
      scheduleId?: string
      containerId?: string
      deviceId?: string
      medicationName?: string
      pillsPerDose?: string
    }
    if (data?.scheduleId && data?.containerId && data?.deviceId != null) {
      handler({
        scheduleId: data.scheduleId,
        containerId: data.containerId,
        deviceId: data.deviceId ?? '',
        medicationName: data.medicationName ?? '',
        pillsPerDose: data.pillsPerDose ?? '1',
      })
    }
  })
  return () => sub.remove()
}
