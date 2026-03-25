import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Box, Play, Pause, Package, Wifi, Battery, Signal, Loader2 } from 'lucide-react';
import { devicesApi, type DeviceDto } from '@/api/client';
import { toast } from 'sonner';

export default function Devices() {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await devicesApi.list();
      setDevices(res.data);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePause = async (deviceId: string) => {
    try {
      await devicesApi.pause(deviceId);
      toast.success('Device paused successfully');
      load();
    } catch { toast.error('Failed to pause device'); }
  };

  const handleResume = async (deviceId: string) => {
    try {
      await devicesApi.resume(deviceId);
      toast.success('Device resumed successfully');
      load();
    } catch { toast.error('Failed to resume device'); }
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

  const getTimeSince = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHours / 24)} day(s) ago`;
  };

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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your smart medication dispensers</p>
        </div>

        {devices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
            <p className="text-sm text-gray-600">Connect your first smart dispenser to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Box className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <Link to={`/devices/${device.id}`} className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                        {device.name}
                      </Link>
                      <p className="text-sm text-gray-500">{device.type === 'Main' ? 'Main Dispenser' : 'Portable Dispenser'}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(device.status)}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-gray-400" />
                    <span>{device.wifiSignal ? `${device.wifiSignal} dBm` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span>{device.batteryLevel != null ? `${device.batteryLevel}%` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-4 h-4 text-gray-400" />
                    <span>{device.status === 'Active' ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'Active' ? 'bg-success-600' : 'bg-accent-600'}`} />
                    <p className="text-sm text-gray-600">Last heartbeat: {getTimeSince(device.lastHeartbeatAtUtc)}</p>
                  </div>
                  {device.timeZoneId && (
                    <p className="text-sm text-gray-600">Time zone: {device.timeZoneId}</p>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  <Link to={`/devices/${device.id}`} className="flex-1">
                    <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      View Details
                    </button>
                  </Link>
                  <Link to={`/devices/${device.id}/containers`}>
                    <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      <Package className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <div className="flex gap-2">
                  {device.status === 'Paused' ? (
                    <button
                      onClick={() => handleResume(device.id)}
                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePause(device.id)}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
