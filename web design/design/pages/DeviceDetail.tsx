import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Box, Clock, MapPin, Activity, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { mockDevices, mockContainers, mockSchedules } from '@/lib/mockData';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const device = mockDevices.find((d) => d.id === Number(deviceId));

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Device not found</h2>
        <Link to="/devices">
          <Button className="mt-4">Back to Devices</Button>
        </Link>
      </div>
    );
  }

  // Get today's schedule for this device
  const deviceContainers = mockContainers.filter((c) => c.deviceId === device.id);
  const todaySchedules = mockSchedules
    .filter((s) => {
      const container = deviceContainers.find((c) => c.id === s.containerId);
      return container !== undefined;
    })
    .map((s) => {
      const container = deviceContainers.find((c) => c.id === s.containerId);
      return {
        time: s.timeOfDay,
        medication: container?.medicationName || '',
        pills: container?.pillsPerDose || 0,
        notes: s.notes,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-1">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Active
          </Badge>
        );
      case 'paused':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-lg px-4 py-1">Paused</Badge>;
      case 'idle':
        return <Badge variant="secondary" className="text-lg px-4 py-1">Idle</Badge>;
      default:
        return <Badge variant="secondary" className="text-lg px-4 py-1">{status}</Badge>;
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/devices">
          <Button variant="ghost" className="mb-4 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {device.name}
            </h1>
            <p className="text-gray-600 mt-1">{device.type}</p>
          </div>
          {getStatusBadge(device.status)}
        </div>
      </motion.div>

      {/* Device Info Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Box className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800">Device Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-blue-500 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Status</p>
                <p className="text-lg font-bold text-gray-800 capitalize">{device.status}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-purple-500 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Last Heartbeat</p>
                <p className="text-lg font-bold text-gray-800">{getTimeSince(device.lastHeartbeat)}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-pink-500 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Time Zone</p>
                <p className="text-lg font-bold text-gray-800">{device.timeZone}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-orange-500 p-3 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Containers</p>
                <p className="text-lg font-bold text-gray-800">{deviceContainers.length} slots</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link to={`/devices/${device.id}/containers`}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg">
                <Package className="w-5 h-5 mr-2" />
                Manage Containers
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
          </div>
          {todaySchedules.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No medications scheduled for today</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all border border-blue-100"
                >
                  <motion.div
                    className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-xl font-bold min-w-[80px] text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    {schedule.time}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{schedule.medication}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.pills} pill{schedule.pills > 1 ? 's' : ''}
                      {schedule.notes && ` • ${schedule.notes}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
