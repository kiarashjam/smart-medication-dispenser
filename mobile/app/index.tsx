/** Entry screen: show loading until auth is ready; then redirect to home (if logged in) or login. */
import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { View, Text, ActivityIndicator } from 'react-native'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    )
  }

  if (user) return <Redirect href="/(tabs)/home" />
  return <Redirect href="/login" />
}
