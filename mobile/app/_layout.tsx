/**
 * Root layout: AuthProvider, Stack (index, tabs, login, register, dose/[id]).
 * Hides splash when auth loading finishes; handles notification tap → navigate to dose screen.
 */
import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { addNotificationResponseListener } from '../src/notifications/scheduleNotifications'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync()
  }, [loading])

  // When user taps a dose notification, open the dose screen with schedule/container/device params.
  useEffect(() => {
    const unsubscribe = addNotificationResponseListener((data) => {
      router.push({
        pathname: '/dose/[id]',
        params: {
          id: data.scheduleId,
          containerId: data.containerId,
          deviceId: data.deviceId,
          medicationName: data.medicationName,
          pillsPerDose: data.pillsPerDose,
        },
      })
    })
    return unsubscribe
  }, [router])

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="dose/[id]" options={{ title: 'Dose' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
