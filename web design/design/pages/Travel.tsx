import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Play, Square, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { mockDevices } from '@/lib/mockData';
import { toast } from 'sonner';

export default function Travel() {
  const mainDevice = mockDevices.find((d) => d.name === 'Main Dispenser');
  const portableDevices = mockDevices.filter((d) => d.name !== 'Main Dispenser');
  
  const [selectedPortableId, setSelectedPortableId] = useState<string>(
    portableDevices.length > 0 ? portableDevices[0].id.toString() : ''
  );
  const [days, setDays] = useState<number>(7);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartTravel = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsActive(true);
      setLoading(false);
      toast.success(`Travel mode activated for ${days} days!`, {
        description: 'Main dispenser paused, portable device activated',
      });
    }, 1500);
  };

  const handleEndTravel = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsActive(false);
      setLoading(false);
      toast.success('Travel mode ended!', {
        description: 'Main dispenser resumed, portable device paused',
      });
    }, 1500);
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Travel Mode
        </h1>
        <p className="text-gray-600 mt-1">Switch to a portable device while traveling</p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-4 rounded-2xl ${
                  isActive
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Plane className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Travel Mode Status</h2>
                <p className="text-gray-600">
                  {isActive ? 'Currently traveling' : 'Not active'}
                </p>
              </div>
            </div>
            <Badge
              className={
                isActive
                  ? 'bg-green-500 hover:bg-green-600 text-lg px-4 py-1'
                  : 'bg-gray-400 hover:bg-gray-500 text-lg px-4 py-1'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {mainDevice && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Main Device</p>
                  <p className="text-lg font-bold text-gray-800">{mainDevice.name}</p>
                </div>
                <Badge variant={isActive ? 'secondary' : 'default'}>
                  {isActive ? 'Paused' : 'Active'}
                </Badge>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Travel Setup Card */}
      {!isActive ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Plane className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800">Start Travel Mode</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Portable Device
                </label>
                <Select value={selectedPortableId} onValueChange={setSelectedPortableId}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {portableDevices.map((device) => (
                      <SelectItem key={device.id} value={device.id.toString()}>
                        {device.name} - {device.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Days (1-14)
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((numDays) => (
                    <motion.button
                      key={numDays}
                      type="button"
                      onClick={() => setDays(numDays)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`h-12 rounded-xl font-bold transition-all ${
                        days === numDays
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {numDays}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-gray-700">
                  <strong>Travel mode will:</strong>
                  <br />• Pause your main dispenser
                  <br />• Activate the selected portable device
                  <br />• Keep your medication schedule synchronized
                  <br />• Automatically end after {days} day{days > 1 ? 's' : ''}
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleStartTravel}
                  disabled={loading || !selectedPortableId}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Travel Mode
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800">Travel Mode Active</h2>
            </div>

            <div className="space-y-4 mb-6">
              <motion.div
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Active Device</p>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {portableDevices.find((d) => d.id.toString() === selectedPortableId)?.name}
                </p>
              </motion.div>

              <motion.div
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-gray-700">
                  <strong>Duration:</strong> {days} day{days > 1 ? 's' : ''}
                  <br />
                  <strong>Remaining:</strong> {days} day{days > 1 ? 's' : ''} (mock)
                </p>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleEndTravel}
                disabled={loading}
                variant="outline"
                className="w-full border-red-200 hover:border-red-500 hover:text-red-600 py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    End Travel Mode
                  </>
                )}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
