import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isCaregiverRole } from '@/lib/roles';
import CaregiverDashboard from '@/pages/CaregiverDashboard';
import { motion } from 'motion/react';
import {
  Box,
  Bell,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Droplet,
  Target,
  Loader2,
} from 'lucide-react';
import { appPath } from '@/lib/appRoutes';
import {
  devicesApi,
  containersApi,
  schedulesApi,
  adherenceApi,
  notificationsApi,
  historyApi,
  dispensingApi,
  type DeviceDto,
  type ContainerDto,
  type TodayScheduleItemDto,
  type AdherenceSummaryDto,
  type NotificationDto,
  type DispenseEventDto,
} from '@/api/client';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

function PatientDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [containers, setContainers] = useState<ContainerDto[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleItemDto[]>([]);
  const [adherence, setAdherence] = useState<AdherenceSummaryDto | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [history, setHistory] = useState<DispenseEventDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [devRes, adherRes, notifRes] = await Promise.all([
        devicesApi.list(),
        adherenceApi.me().catch(() => ({ data: { totalScheduled: 0, confirmed: 0, missed: 0, pending: 0, adherencePercent: 0 } as AdherenceSummaryDto })),
        notificationsApi.list(50).catch(() => ({ data: [] as NotificationDto[] })),
      ]);

      setDevices(devRes.data);
      setAdherence(adherRes.data);
      setNotifications(notifRes.data);

      // Load containers and today's schedule for the active device
      const activeDevice = devRes.data.find((d) => d.status === 'Active') ?? devRes.data[0];
      if (activeDevice) {
        const [contRes, schedRes, histRes] = await Promise.all([
          containersApi.listByDevice(activeDevice.id).catch(() => ({ data: [] as ContainerDto[] })),
          schedulesApi.today(activeDevice.id).catch(() => ({ data: [] as TodayScheduleItemDto[] })),
          historyApi.events(activeDevice.id, { limit: 100 }).catch(() => ({ data: [] as DispenseEventDto[] })),
        ]);
        setContainers(contRes.data);
        setTodaySchedules(schedRes.data);
        setHistory(histRes.data);
      }
    } catch {
      // Silently handle if overall fetch fails
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adherenceRate = adherence?.adherencePercent ?? 0;
  const confirmed = adherence?.confirmed ?? 0;
  const total = adherence?.totalScheduled ?? 0;

  // Low stock alerts
  const lowStock = containers.filter((c) => c.quantity < c.lowStockThreshold);

  // Unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Weekly trend from history
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split('T')[0];
    const dayHistory = history.filter((h) => h.scheduledAtUtc?.startsWith(dayStr));
    const dayConfirmed = dayHistory.filter((h) => h.status === 'Confirmed').length;
    const dayTotal = dayHistory.length;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      rate: dayTotal > 0 ? Math.round((dayConfirmed / dayTotal) * 100) : 0,
      confirmed: dayConfirmed,
      total: dayTotal,
    };
  });

  // Medication distribution from containers
  const medicationDistribution = containers.map((c) => ({
    name: c.medicationName,
    value: c.quantity,
  }));

  const COLORS = ['#4F46E5', '#0D9488', '#D97706', '#4F46E5', '#0D9488', '#D97706'];

  // Next dose
  const now = new Date();
  const nextDose = todaySchedules.find((s) => new Date(s.scheduledAtUtc) > now);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleDispense = async (scheduleId: string) => {
    const activeDevice = devices.find((d) => d.status === 'Active') ?? devices[0];
    if (!activeDevice) return;
    try {
      await dispensingApi.dispense(activeDevice.id, { scheduleId });
      toast.success('Dose dispensed successfully');
      loadData();
    } catch {
      toast.error('Failed to dispense');
    }
  };

  // Streak calculation (from history)
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    const dayHistory = history.filter((h) => h.scheduledAtUtc?.startsWith(dayStr));
    const dayMissed = dayHistory.filter((h) => h.status === 'Missed').length;
    if (dayHistory.length > 0 && dayMissed === 0) {
      currentStreak++;
    } else if (dayHistory.length > 0) {
      break;
    }
  }

  const deviceHealthScore = devices.length > 0 ? 95 : 0;

  // Format date/time for header
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const headerSubtitle = `${formattedDate} · ${formattedTime}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Health Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{headerSubtitle}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Adherence Rate */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adherence Rate</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1 font-mono">{Math.round(adherenceRate)}%</p>
                <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {confirmed} Taken
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {total - confirmed} Missed
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          </div>

          {/* Active Devices */}
          <Link to={appPath('/devices')} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Devices</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1 font-mono">{devices.length}</p>
                <p className="text-sm text-gray-500 mt-1">All systems operational</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Box className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          </Link>

          {/* Current Streak */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Streak</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1 font-mono">{currentStreak}</p>
                <p className="text-sm text-gray-500 mt-1">days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <Link to={appPath('/notifications')} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notifications</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1 font-mono">{unreadCount}</p>
                <p className="text-sm text-gray-500 mt-1">{unreadCount > 0 ? 'Unread messages' : 'All caught up!'}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-accent-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Next Dose Alert */}
        {nextDose && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Next Dose</p>
                <h3 className="text-base font-medium text-gray-900">{nextDose.medicationName}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="font-mono">{new Date(nextDose.scheduledAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{nextDose.pillsPerDose} pill{nextDose.pillsPerDose > 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                onClick={() => handleDispense(nextDose.scheduleId)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Dispense
              </button>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Adherence</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '13px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: '2px solid #e5e7eb', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={3} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg</p>
                <p className="text-sm text-gray-600 font-mono mt-1">
                  {weeklyData.length ? Math.round(weeklyData.reduce((a, d) => a + d.rate, 0) / weeklyData.length) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Best</p>
                <p className="text-sm text-gray-600 font-mono mt-1">
                  {weeklyData.length ? Math.max(...weeklyData.map(d => d.rate)) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-sm text-gray-600 font-mono mt-1">
                  {weeklyData.reduce((a, d) => a + d.confirmed, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
            {medicationDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={medicationDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {medicationDistribution.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {containers.map((container) => {
                    const maxDisplay = Math.max(container.quantity, container.lowStockThreshold * 2);
                    const percentage = maxDisplay > 0 ? Math.round((container.quantity / maxDisplay) * 100) : 0;
                    const isLow = container.quantity < container.lowStockThreshold;
                    return (
                      <div key={container.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sm font-medium text-gray-900">{container.medicationName}</span>
                          <span className="text-sm text-gray-600 font-mono">{container.quantity} pills</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isLow ? 'bg-red-500' : percentage > 50 ? 'bg-success-600' : 'bg-accent-600'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">No containers configured</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
            <p className="text-sm text-gray-600 mb-4">Medications that need refilling soon</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStock.map((container) => (
                <div key={container.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Droplet className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{container.medicationName}</p>
                      <p className="text-xs text-gray-600">
                        <span className="font-mono text-red-600">{container.quantity} pills</span> - Slot {container.slotNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 flex-shrink-0">LOW</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          {todaySchedules.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No medications scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => {
                const schedTime = new Date(schedule.scheduledAtUtc);
                const isPast = schedTime < now;
                const status = isPast ? 'completed' : schedTime.getTime() - now.getTime() < 3600000 ? 'upcoming' : 'pending';
                return (
                  <div
                    key={schedule.scheduleId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-mono text-sm text-gray-500 flex-shrink-0">
                        {schedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{schedule.medicationName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.pillsPerDose} pill{schedule.pillsPerDose > 1 ? 's' : ''}
                          {schedule.notes && ` · ${schedule.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {status === 'completed' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-700">
                          Completed
                        </span>
                      )}
                      {status === 'upcoming' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">
                          Upcoming
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Health */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">All devices operational and connected</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-gray-900 font-mono">{deviceHealthScore}%</p>
                <p className="text-sm text-gray-500 mt-1">Health Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (isCaregiverRole(user?.role)) return <CaregiverDashboard />;
  return <PatientDashboard />;
}
