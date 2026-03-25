import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { devicesApi, historyApi, type DeviceDto, type DispenseEventDto } from '@/api/client';

export default function History() {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [events, setEvents] = useState<DispenseEventDto[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devicesApi.list().then((res) => {
      setDevices(res.data);
      if (res.data.length > 0) {
        const active = res.data.find(d => d.status === 'Active') ?? res.data[0];
        setSelectedDevice(active.id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;
    const params: Record<string, string> = {};
    if (fromDate) params.fromUtc = new Date(fromDate).toISOString();
    if (toDate) params.toUtc = new Date(toDate + 'T23:59:59').toISOString();
    historyApi.events(selectedDevice, { ...params, limit: 200 }).then((res) => setEvents(res.data)).catch(() => setEvents([]));
  }, [selectedDevice, fromDate, toDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Taken</span>;
      case 'Missed':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" />Missed</span>;
      case 'Pending':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
      case 'Delayed':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Delayed</span>;
      case 'Dispensed':
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Dispensed</span>;
      default:
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">History</h1>
        <p className="text-sm text-gray-500 mt-1">Dispense event timeline</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-end">
          {devices.length > 1 && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-12">
            <HistoryIcon className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-900 mt-3">No events found</p>
            <p className="text-sm text-gray-500 mt-1">Adjust filters or wait for scheduled doses</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="text-sm font-mono text-gray-500 min-w-[80px]">
                  {new Date(event.scheduledAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{event.medicationName || 'Medication'}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {new Date(event.scheduledAtUtc).toLocaleDateString()} - {event.pillsPerDose} pill{(event.pillsPerDose || 1) > 1 ? 's' : ''}
                  </p>
                </div>
                {getStatusBadge(event.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
