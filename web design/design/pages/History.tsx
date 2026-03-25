import React, { useState } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { mockDevices, mockHistory } from '@/lib/mockData';

export default function History() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');

  const filteredHistory =
    selectedDeviceId === 'all'
      ? mockHistory
      : mockHistory.filter((h) => h.deviceId === Number(selectedDeviceId));

  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Missed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case 'Missed':
        return <Badge className="bg-red-500 hover:bg-red-600">Missed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-gray-600 mt-1">Dispense events from the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger className="w-[200px] border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              {mockDevices.map((device) => (
                <SelectItem key={device.id} value={device.id.toString()}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {sortedHistory.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-12 text-center">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <HistoryIcon className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No history found</h3>
            <p className="text-gray-500">No dispense events in the last 30 days</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Scheduled Time</th>
                    <th className="px-6 py-4 text-left font-semibold">Medication</th>
                    <th className="px-6 py-4 text-left font-semibold">Pills</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Confirmed Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedHistory.map((event, index) => {
                    const scheduled = formatDateTime(event.scheduledTime);
                    const confirmed = event.confirmedTime ? formatDateTime(event.confirmedTime) : null;
                    
                    return (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{scheduled.time}</span>
                            <span className="text-sm text-gray-600">{scheduled.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{event.medicationName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{event.pillsDispensed}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            {getStatusBadge(event.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {confirmed ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{confirmed.time}</span>
                              <span className="text-sm text-gray-600">{confirmed.date}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-500"
      >
        Showing {sortedHistory.length} event{sortedHistory.length !== 1 ? 's' : ''}
      </motion.div>
    </motion.div>
  );
}
