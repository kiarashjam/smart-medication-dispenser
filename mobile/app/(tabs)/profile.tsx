/** Profile tab: user info, connected devices, adherence summary, and settings. */
import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, Modal, Switch, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, adherenceApi, type MeProfileResponse, type AdherenceSummaryDto } from '../../src/api/client'
import { useAuth } from '../../src/context/AuthContext'

const APP_VERSION = '1.0.0'
const NOTIF_PREFS_KEY = 'smd_mobile_notif_prefs'
const REGION_PREFS_KEY = 'smd_mobile_region_prefs'

type NotifPrefsType = {
  missedDose: boolean
  lowStock: boolean
  deviceOffline: boolean
  dailySummary: boolean
}

type RegionPrefsType = {
  language: string
  timeZone: string
}

const DEFAULT_NOTIF: NotifPrefsType = { missedDose: true, lowStock: true, deviceOffline: true, dailySummary: false }
const DEFAULT_REGION: RegionPrefsType = { language: 'English', timeZone: 'Europe/Zurich' }

const LANGUAGES = ['English', 'Français', 'Deutsch', 'Italiano']
const TIMEZONES = ['Europe/Zurich', 'Europe/London', 'America/New_York', 'UTC']

export default function Profile() {
  const router = useRouter()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<MeProfileResponse | null>(null)
  const [adherence, setAdherence] = useState<AdherenceSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Settings modals
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefsType>(DEFAULT_NOTIF)
  const [regionPrefs, setRegionPrefs] = useState<RegionPrefsType>(DEFAULT_REGION)

  const load = useCallback(async () => {
    try {
      const [profileRes, adherenceRes, savedNotif, savedRegion] = await Promise.all([
        authApi.meProfile().catch(() => null),
        adherenceApi.me().catch(() => null),
        AsyncStorage.getItem(NOTIF_PREFS_KEY).catch(() => null),
        AsyncStorage.getItem(REGION_PREFS_KEY).catch(() => null),
      ])
      if (profileRes?.data) setProfile(profileRes.data)
      if (adherenceRes?.data) setAdherence(adherenceRes.data)
      if (savedNotif) try { setNotifPrefs(JSON.parse(savedNotif)) } catch {}
      if (savedRegion) try { setRegionPrefs(JSON.parse(savedRegion)) } catch {}
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const saveNotifPrefs = async (prefs: NotifPrefsType) => {
    setNotifPrefs(prefs)
    try {
      await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs))
    } catch (err) {
      console.warn('Failed to save notification prefs:', err)
    }
  }

  const saveRegionPrefs = async (prefs: RegionPrefsType) => {
    setRegionPrefs(prefs)
    try {
      await AsyncStorage.setItem(REGION_PREFS_KEY, JSON.stringify(prefs))
    } catch (err) {
      console.warn('Failed to save region prefs:', err)
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/login') } },
    ])
  }

  if (loading) {
    return <View style={styles.center}><Text>Loading...</Text></View>
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.fullName?.[0] || 'U').toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.fullName}>{profile?.fullName || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || ''}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profile?.role || 'Patient'}</Text>
            </View>
            {profile?.linkedCaregiver && (
              <View style={styles.caregiverBox}>
                <Text style={styles.caregiverLabel}>Linked caregiver</Text>
                <Text style={styles.caregiverName}>{profile.linkedCaregiver.fullName}</Text>
                <Text style={styles.caregiverEmail}>{profile.linkedCaregiver.email}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Adherence Summary */}
      {adherence && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adherence</Text>
          <View style={styles.adherenceRow}>
            <View style={[styles.adherenceCard, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.adherenceValue, { color: '#16a34a' }]}>{adherence.adherencePercent}%</Text>
              <Text style={styles.adherenceLabel}>Overall</Text>
            </View>
            <View style={[styles.adherenceCard, { backgroundColor: '#dbeafe' }]}>
              <Text style={[styles.adherenceValue, { color: '#2563eb' }]}>{adherence.confirmed}</Text>
              <Text style={styles.adherenceLabel}>Taken</Text>
            </View>
            <View style={[styles.adherenceCard, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.adherenceValue, { color: '#dc2626' }]}>{adherence.missed}</Text>
              <Text style={styles.adherenceLabel}>Missed</Text>
            </View>
            <View style={[styles.adherenceCard, { backgroundColor: '#fef9c3' }]}>
              <Text style={[styles.adherenceValue, { color: '#ca8a04' }]}>{adherence.pending}</Text>
              <Text style={styles.adherenceLabel}>Pending</Text>
            </View>
          </View>
        </View>
      )}

      {/* Connected Devices */}
      {profile?.devices && profile.devices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          {profile.devices.map((device) => (
            <View key={device.deviceId} style={styles.deviceCard}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type === 'Main' ? 'Main Dispenser' : 'Portable'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: device.status === 'Active' ? '#dcfce7' : '#fed7aa' }]}>
                <Text style={{ color: device.status === 'Active' ? '#16a34a' : '#ea580c', fontWeight: '600', fontSize: 12 }}>
                  {device.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowNotifModal(true)}>
          <Text style={styles.settingText}>Notification Preferences</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowLangModal(true)}>
          <Text style={styles.settingText}>Language & Region</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowPrivacyModal(true)}>
          <Text style={styles.settingText}>Privacy & Data</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowAboutModal(true)}>
          <Text style={styles.settingText}>About</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* ── Notification Preferences Modal ── */}
      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Notification Preferences</Text>
            {([
              { key: 'missedDose' as const, label: 'Missed Dose Alerts' },
              { key: 'lowStock' as const, label: 'Low Stock Warnings' },
              { key: 'deviceOffline' as const, label: 'Device Offline Alerts' },
              { key: 'dailySummary' as const, label: 'Daily Summary' },
            ]).map(item => (
              <View key={item.key} style={modalStyles.row}>
                <Text style={modalStyles.rowLabel}>{item.label}</Text>
                <Switch
                  value={notifPrefs[item.key]}
                  onValueChange={(val) => saveNotifPrefs({ ...notifPrefs, [item.key]: val })}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={notifPrefs[item.key] ? '#2563eb' : '#9ca3af'}
                />
              </View>
            ))}
            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowNotifModal(false)}>
              <Text style={modalStyles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Language & Region Modal ── */}
      <Modal visible={showLangModal} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Language & Region</Text>
            <Text style={modalStyles.label}>Language</Text>
            <View style={modalStyles.optionsRow}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[modalStyles.chip, regionPrefs.language === lang && modalStyles.chipActive]}
                  onPress={() => saveRegionPrefs({ ...regionPrefs, language: lang })}
                >
                  <Text style={[modalStyles.chipText, regionPrefs.language === lang && modalStyles.chipTextActive]}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[modalStyles.label, { marginTop: 16 }]}>Time Zone</Text>
            <View style={modalStyles.optionsRow}>
              {TIMEZONES.map(tz => (
                <TouchableOpacity
                  key={tz}
                  style={[modalStyles.chip, regionPrefs.timeZone === tz && modalStyles.chipActive]}
                  onPress={() => saveRegionPrefs({ ...regionPrefs, timeZone: tz })}
                >
                  <Text style={[modalStyles.chipText, regionPrefs.timeZone === tz && modalStyles.chipTextActive]}>{tz}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowLangModal(false)}>
              <Text style={modalStyles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Privacy & Data Modal ── */}
      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Privacy & Data</Text>
            <View style={{ gap: 12 }}>
              <Text style={modalStyles.infoText}>
                Your medication and health data is stored securely and encrypted. Data is processed in accordance with Swiss data protection law (nDSG) and GDPR.
              </Text>
              <Text style={modalStyles.infoText}>
                You can request a full export or deletion of your data by contacting support.
              </Text>
              <TouchableOpacity
                style={[modalStyles.closeBtn, { backgroundColor: '#fee2e2' }]}
                onPress={() => Alert.alert('Delete Account', 'To delete your account and all associated data, please contact support@smartdispenser.com', [{ text: 'OK' }])}
              >
                <Text style={[modalStyles.closeBtnText, { color: '#dc2626' }]}>Request Data Deletion</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowPrivacyModal(false)}>
              <Text style={modalStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── About Modal ── */}
      <Modal visible={showAboutModal} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>About</Text>
            <View style={{ gap: 10 }}>
              <View style={modalStyles.aboutRow}>
                <Text style={modalStyles.aboutLabel}>App Version</Text>
                <Text style={modalStyles.aboutValue}>{APP_VERSION}</Text>
              </View>
              <View style={modalStyles.aboutRow}>
                <Text style={modalStyles.aboutLabel}>Platform</Text>
                <Text style={modalStyles.aboutValue}>{Platform.OS} {Platform.Version}</Text>
              </View>
              <View style={modalStyles.aboutRow}>
                <Text style={modalStyles.aboutLabel}>Backend</Text>
                <Text style={modalStyles.aboutValue}>ASP.NET Core 8</Text>
              </View>
              <View style={modalStyles.aboutRow}>
                <Text style={modalStyles.aboutLabel}>Compliance</Text>
                <Text style={modalStyles.aboutValue}>GDPR / nDSG</Text>
              </View>
              <Text style={[modalStyles.infoText, { marginTop: 8, textAlign: 'center' }]}>
                Smart Medication Dispenser{'\n'}© 2026 All rights reserved
              </Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowAboutModal(false)}>
              <Text style={modalStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  userInfo: { marginLeft: 16, flex: 1 },
  fullName: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  badgeText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  caregiverBox: { marginTop: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  caregiverLabel: { fontSize: 11, color: '#15803d', fontWeight: '600', textTransform: 'uppercase' },
  caregiverName: { fontSize: 15, fontWeight: '600', color: '#14532d', marginTop: 4 },
  caregiverEmail: { fontSize: 13, color: '#166534', marginTop: 2 },
  adherenceRow: { flexDirection: 'row', gap: 8 },
  adherenceCard: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  adherenceValue: { fontSize: 20, fontWeight: '800' },
  adherenceLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  deviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  deviceType: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingText: { fontSize: 15, color: '#374151' },
  settingArrow: { fontSize: 20, color: '#9ca3af' },
  logoutButton: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
})

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 15, color: '#374151', flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#6b7280' },
  chipTextActive: { color: '#2563eb', fontWeight: '600' },
  infoText: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  aboutLabel: { fontSize: 14, color: '#6b7280' },
  aboutValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  closeBtn: { marginTop: 20, backgroundColor: '#dbeafe', borderRadius: 12, padding: 14, alignItems: 'center' },
  closeBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
})
