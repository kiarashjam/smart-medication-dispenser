/** Dose screen: dispense (create event), confirm intake, or delay reminder by 15 minutes. */
import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { dispensingApi, getApiErrorMessage } from '../../src/api/client'

const DELAY_MINUTES = 15

export default function DoseScreen() {
  const { id: scheduleId, containerId, deviceId, medicationName, pillsPerDose } = useLocalSearchParams<{
    id: string
    containerId: string
    deviceId: string
    medicationName: string
    pillsPerDose: string
  }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dispenseEventId, setDispenseEventId] = useState<string | null>(null)

  const handleDispense = async () => {
    if (!deviceId || !scheduleId) return
    setLoading(true)
    try {
      const { data } = await dispensingApi.dispense(deviceId, { scheduleId })
      setDispenseEventId(data.id)
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!dispenseEventId) {
      Alert.alert('Dispense first', 'Press Dispense on the device or here, then confirm after taking the dose.')
      return
    }
    setLoading(true)
    try {
      await dispensingApi.confirm(dispenseEventId)
      Alert.alert('Confirmed', 'Dose recorded.', [{ text: 'OK', onPress: () => router.back() }])
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const handleDelay = async () => {
    if (!dispenseEventId) return
    setLoading(true)
    try {
      await dispensingApi.delay(dispenseEventId, { minutes: DELAY_MINUTES })
      Alert.alert('Reminder delayed', `You will be reminded again in ${DELAY_MINUTES} minutes.`)
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.medName}>{medicationName}</Text>
      <Text style={styles.detail}>{pillsPerDose} pill(s) per dose</Text>
      {!dispenseEventId ? (
        <TouchableOpacity style={[styles.button, styles.primary, loading && styles.disabled]} onPress={handleDispense} disabled={loading}>
          <Text style={styles.buttonText}>Dispense</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={[styles.button, styles.secondary, loading && styles.disabled]} onPress={handleConfirm} disabled={loading}>
        <Text style={styles.buttonText}>Confirm intake</Text>
      </TouchableOpacity>
      {dispenseEventId ? (
        <TouchableOpacity style={[styles.button, styles.delay, loading && styles.disabled]} onPress={handleDelay} disabled={loading}>
          <Text style={styles.buttonText}>Remind me in {DELAY_MINUTES} min</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.hint}>Dispense on the device or here, then confirm after taking the medication.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  medName: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  detail: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#059669' },
  delay: { backgroundColor: '#6b7280' },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  hint: { marginTop: 24, fontSize: 14, color: '#6b7280' },
})
