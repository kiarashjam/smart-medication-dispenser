import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Box, Play, Pause, AlertCircle, CheckCircle, Package, Wifi, Battery, Signal, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { mockDevices } from '@/lib/mockData';
import { toast } from 'sonner';

export default function Devices() {
  const [devices, setDevices] = useState(mockDevices);

  const handlePause = (deviceId: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isPaused: true, status: 'paused' } : d))
    );
    toast.success('Device paused successfully');
  };

  const handleResume = (deviceId: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isPaused: false, status: 'active' } : d))
    );
    toast.success('Device resumed successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-orange-500';
      case 'idle':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Active
          </Badge>
        );
      case 'paused':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Paused</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
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
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Devices
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage your smart medication dispensers</p>
      </motion.div>

      {devices.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-12 text-center">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Box className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No devices found</h3>
            <p className="text-gray-500">Connect your first smart dispenser to get started</p>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -5 }}
            >
              <Card className="relative bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all overflow-hidden group">
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />

                {/* Status indicator glow */}
                {device.status === 'active' && (
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full opacity-10 blur-3xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl relative shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-md opacity-50"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                        <Box className="w-8 h-8 text-white relative z-10" />
                      </motion.div>
                      <div>
                        <Link to={`/devices/${device.id}`}>
                          <motion.h3
                            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
                            whileHover={{ x: 3 }}
                          >
                            {device.name}
                          </motion.h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{device.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>

                  {/* Device Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Wifi className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-blue-700 font-medium">Connected</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Battery className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-700 font-medium">95%</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Signal className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-purple-700 font-medium">Strong</p>
                    </motion.div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-sm text-gray-600">
                        Last heartbeat: {getTimeSince(device.lastHeartbeat)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">Time zone: {device.timeZone}</p>
                    </div>
                  </div>

                  <motion.div
                    className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  />

                  <div className="flex gap-2 mb-4">
                    <Link to={`/devices/${device.id}`} className="flex-1">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to={`/devices/${device.id}/containers`}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          className="border-purple-200 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Containers
                        </Button>
                      </motion.div>
                    </Link>
                  </div>

                  <div className="flex gap-2">
                    {device.isPaused ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleResume(device.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handlePause(device.id)}
                          variant="outline"
                          className="w-full border-orange-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Corner decoration */}
                <motion.div
                  className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-200/30 to-transparent rounded-tl-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}