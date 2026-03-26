import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plane, Play, Square, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { devicesApi, travelApi, type DeviceDto } from '@/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isCaregiverRole } from '@/lib/roles';
import { appPath } from '@/lib/appRoutes';

export default function Travel() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [portableDeviceId, setPortableDeviceId] = useState('');
  const [days, setDays] = useState('7');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [activeTravel, setActiveTravel] = useState(false);

  useEffect(() => {
    devicesApi.list().then((res) => {
      setDevices(res.data);
      const portable = res.data.find((d) => d.type === 'Portable');
      if (portable) {
        setPortableDeviceId(portable.id);
        setActiveTravel(portable.status === 'Active');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStart = async () => {
    if (!portableDeviceId) return toast.error('No portable device selected');
    setStarting(true);
    try {
      await travelApi.start({ portableDeviceId, days: Number(days) });
      toast.success('Travel mode started');
      setActiveTravel(true);
      const res = await devicesApi.list();
      setDevices(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'Failed to start travel';
      toast.error(typeof msg === 'string' ? msg : 'Failed to start travel');
    } finally { setStarting(false); }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await travelApi.end();
      toast.success('Travel mode ended');
      setActiveTravel(false);
      const res = await devicesApi.list();
      setDevices(res.data);
    } catch { toast.error('Failed to end travel'); }
    finally { setEnding(false); }
  };

  if (isCaregiverRole(user?.role)) return <Navigate to={appPath()} replace />;

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;

  const portableDevices = devices.filter((d) => d.type === 'Portable');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Travel Mode</h1>
        <p className="text-sm text-gray-500 mt-1">Manage medication for trips</p>
      </div>

      {activeTravel ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-50 p-3 rounded-lg">
              <Plane className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Travel Active</h2>
              <p className="text-sm text-gray-500">Your portable device is active and dispensing medications</p>
            </div>
          </div>
          <Button onClick={handleEnd} disabled={ending} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Square className="w-4 h-4 mr-2" />{ending ? 'Ending...' : 'End Travel'}
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-600 p-3 rounded-lg"><Plane className="w-5 h-5 text-white" /></div>
            <h2 className="text-lg font-semibold text-gray-900">Start Travel Session</h2>
          </div>
          {portableDevices.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-900 mt-3">No portable device found</p>
              <p className="text-sm text-gray-500 mt-1">Create a portable device first</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Portable Device</label>
                <select value={portableDeviceId} onChange={(e) => setPortableDeviceId(e.target.value)} className="mt-2 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                  {portableDevices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration (days)</label>
                <input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" max="14" className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                <p className="text-xs text-gray-500 mt-1">Maximum 14 days</p>
              </div>
              <Button onClick={handleStart} disabled={starting} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-full">
                <Play className="w-4 h-4 mr-2" />{starting ? 'Starting...' : 'Start Travel'}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Travel Mode Works</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">1</span>
            <span className="text-sm text-gray-600">Containers and schedules are copied from your main device to the portable device</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">2</span>
            <span className="text-sm text-gray-600">Your main device is paused; the portable device becomes active</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">3</span>
            <span className="text-sm text-gray-600">When you end travel, the main device resumes and the portable is paused</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
