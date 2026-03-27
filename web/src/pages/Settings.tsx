import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Shield,
  Bell,
  Globe,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, api, type MeProfileResponse } from '@/api/client';
import { toast } from 'sonner';

type HealthStatus = {
  status: string;
  timestamp: string;
  checks?: Record<string, { status: string; [key: string]: unknown }>;
};

type NotifPrefs = {
  missedDose: boolean;
  lowStock: boolean;
  deviceOffline: boolean;
  dailySummary: boolean;
  caregiverUpdates: boolean;
};

type RegionPrefs = {
  language: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
};

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'preferences'>('profile');
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    missedDose: true,
    lowStock: true,
    deviceOffline: true,
    dailySummary: false,
    caregiverUpdates: true,
  });
  const [regionPrefs, setRegionPrefs] = useState<RegionPrefs>({
    language: 'en',
    timeZone: 'Europe/Zurich',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    // Load saved preferences from localStorage
    try {
      const savedNotif = localStorage.getItem('smd_notif_prefs');
      if (savedNotif) setNotifPrefs(JSON.parse(savedNotif));
      const savedRegion = localStorage.getItem('smd_region_prefs');
      if (savedRegion) setRegionPrefs(JSON.parse(savedRegion));
    } catch (err) {
      console.warn('Failed to load saved preferences, using defaults:', err);
    }

    Promise.all([
      authApi.meProfile().catch(() => null),
      api.get<HealthStatus>('/api/health/ready').catch(() => null),
    ]).then(([profileRes, healthRes]) => {
      if (profileRes?.data) setProfile(profileRes.data);
      if (healthRes?.data) setHealth(healthRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'system' as const, label: 'System Health', icon: Server },
    { id: 'preferences' as const, label: 'Preferences', icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                <p className="text-sm text-gray-500 mt-1">Your personal details and account settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                  <p className="text-sm text-gray-900 mt-1">{user?.fullName || profile?.fullName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-900 mt-1">{user?.email || profile?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 inline-block mt-1">
                    {user?.role || profile?.role || 'Patient'}
                  </span>
                </div>
              </div>
              {profile?.linkedCaregiver && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Linked caregiver</p>
                    <p className="text-sm text-gray-900 mt-1">{profile.linkedCaregiver.fullName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{profile.linkedCaregiver.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">User ID</p>
                  <p className="text-sm font-mono text-gray-600 mt-1">{profile?.userId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Devices */}
          {profile?.devices && profile.devices.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-semibold text-gray-900">Connected Devices</h3>
              </div>
              <div className="space-y-3">
                {profile.devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{device.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{device.type === 'Main' ? 'Main Dispenser' : 'Portable'}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      device.status === 'Active' ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500 mt-0.5">Last changed: Unknown</p>
                </div>
                <button
                  onClick={() => toast.info('Password change coming soon')}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500 mt-0.5">Add extra security to your account</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                health?.status === 'healthy' ? 'bg-success-600' : 'bg-red-600'
              }`}>
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {health?.timestamp ? `Last checked: ${new Date(health.timestamp).toLocaleString()}` : 'Checking...'}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                health?.status === 'healthy' ? 'bg-success-50 text-success-700' : 'bg-red-50 text-red-700'
              }`}>
                {health?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>

            {health?.checks && (
              <div className="space-y-3">
                {Object.entries(health.checks).map(([name, check]) => (
                  <div key={name} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                    {check.status === 'healthy' ? (
                      <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-accent-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {Object.entries(check)
                          .filter(([k]) => k !== 'status')
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ') || check.status}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      check.status === 'healthy' ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-semibold text-gray-900">API Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">API Version</p>
                <p className="text-sm text-gray-900">v1.0.0</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Framework</p>
                <p className="text-sm text-gray-900">ASP.NET Core 8</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Database</p>
                <p className="text-sm text-gray-900">PostgreSQL 15</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hosting Region</p>
                <p className="text-sm text-gray-900">Switzerland North</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-1">Configure how you receive alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              {([
                { key: 'missedDose' as const, label: 'Missed Dose Alerts', desc: 'Get notified when a dose is missed' },
                { key: 'lowStock' as const, label: 'Low Stock Warnings', desc: 'Alert when medication is running low' },
                { key: 'deviceOffline' as const, label: 'Device Offline Alerts', desc: 'Notify when device loses connection' },
                { key: 'dailySummary' as const, label: 'Daily Summary', desc: 'Receive a daily adherence report' },
                { key: 'caregiverUpdates' as const, label: 'Caregiver Updates', desc: 'Send updates to assigned caregivers' },
              ]).map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{pref.desc}</p>
                  </div>
                  <button
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      notifPrefs[pref.key] ? 'bg-brand-600' : 'bg-gray-300'
                    }`}
                    onClick={() => {
                      const updated = { ...notifPrefs, [pref.key]: !notifPrefs[pref.key] };
                      setNotifPrefs(updated);
                      toast.success(`${pref.label} ${updated[pref.key] ? 'enabled' : 'disabled'}`);
                    }}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                      notifPrefs[pref.key] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-success-600 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
                <p className="text-sm text-gray-500 mt-1">Set your language and formatting preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Language</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
                  value={regionPrefs.language}
                  onChange={(e) => setRegionPrefs({ ...regionPrefs, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Time Zone</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
                  value={regionPrefs.timeZone}
                  onChange={(e) => setRegionPrefs({ ...regionPrefs, timeZone: e.target.value })}
                >
                  <option value="Europe/Zurich">Europe/Zurich (CET/CEST)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Date Format</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
                  value={regionPrefs.dateFormat}
                  onChange={(e) => setRegionPrefs({ ...regionPrefs, dateFormat: e.target.value })}
                >
                  <option value="dd.MM.yyyy">DD.MM.YYYY (Swiss)</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Time Format</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
                  value={regionPrefs.timeFormat}
                  onChange={(e) => setRegionPrefs({ ...regionPrefs, timeFormat: e.target.value })}
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour (AM/PM)</option>
                </select>
              </div>
            </div>

            <button
              className="mt-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={savingPrefs}
              onClick={async () => {
                setSavingPrefs(true);
                try {
                  // Persist to localStorage for client-side preference storage
                  localStorage.setItem('smd_notif_prefs', JSON.stringify(notifPrefs));
                  localStorage.setItem('smd_region_prefs', JSON.stringify(regionPrefs));
                  toast.success('Preferences saved successfully');
                } catch (err) {
                  console.error('Failed to save preferences:', err);
                  toast.error('Failed to save preferences');
                } finally {
                  setSavingPrefs(false);
                }
              }}
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
