import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { devicesApi, containersApi, schedulesApi, type DeviceDto, type ContainerDto, type TodayScheduleItemDto } from '@/api/client';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState<DeviceDto | null>(null);
  const [containers, setContainers] = useState<ContainerDto[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    Promise.all([
      devicesApi.get(deviceId),
      containersApi.listByDevice(deviceId),
      schedulesApi.today(deviceId).catch(() => ({ data: [] })),
    ]).then(([devRes, contRes, schedRes]) => {
      setDevice(devRes.data);
      setContainers(contRes.data);
      setTodaySchedules(schedRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [deviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Device not found</h2>
        <Link to="/devices" className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to Devices
        </Link>
      </div>
    );
  }

  const getTimeSince = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHours / 24)} day(s) ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-700">Active</span>;
      case 'Paused':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">Paused</span>;
      default:
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">{status}</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        <div>
          <Link to="/devices" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Devices
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{device.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{device.type === 'Main' ? 'Main Dispenser (SMD-100)' : 'Portable Dispenser (SMD-200)'}</p>
            </div>
            {getStatusBadge(device.status)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-gray-900">{device.status}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Last Heartbeat</span>
              <span className="text-sm font-medium text-gray-900">{getTimeSince(device.lastHeartbeatAtUtc)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Time Zone</span>
              <span className="text-sm font-medium text-gray-900">{device.timeZoneId || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Containers</span>
              <span className="text-sm font-medium text-gray-900">{containers.length} slots</span>
            </div>
            {device.batteryLevel != null && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Battery</span>
                <span className="text-sm font-medium text-gray-900">{device.batteryLevel}%</span>
              </div>
            )}
            {device.wifiSignal != null && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">WiFi Signal</span>
                <span className="text-sm font-medium text-gray-900">{device.wifiSignal} dBm</span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <Link to={`/devices/${device.id}/containers`}>
              <button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Manage Containers
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          {todaySchedules.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No medications scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => (
                <div key={schedule.scheduleId} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-50 text-brand-700 p-2 rounded-lg font-semibold min-w-[80px] text-center text-sm">
                      {new Date(schedule.scheduledAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{schedule.medicationName}</p>
                      <p className="text-sm text-gray-600">{schedule.pillsPerDose} pill{schedule.pillsPerDose > 1 ? 's' : ''}{schedule.notes && ` - ${schedule.notes}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
