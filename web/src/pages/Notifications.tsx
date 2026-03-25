import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertTriangle, Package, Wifi, Battery, Pill, Loader2 } from 'lucide-react';
import { notificationsApi, type NotificationDto } from '@/api/client';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationsApi.list(100);
      setNotifications(res.data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Missed') || type.includes('Dose')) return <Pill className="w-5 h-5" />;
    if (type.includes('LowStock') || type.includes('Refill')) return <Package className="w-5 h-5" />;
    if (type.includes('Device') || type.includes('Online') || type.includes('Offline')) return <Wifi className="w-5 h-5" />;
    if (type.includes('Battery')) return <Battery className="w-5 h-5" />;
    if (type.includes('Travel')) return <AlertTriangle className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  const getTypeBadge = (type: string) => {
    if (type.includes('Missed')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">{type}</span>;
    if (type.includes('LowStock') || type.includes('Refill')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">{type}</span>;
    if (type.includes('Device') || type.includes('Online')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-700">{type}</span>;
    if (type.includes('Offline') || type.includes('Error')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">{type}</span>;
    if (type.includes('Battery')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">{type}</span>;
    if (type.includes('Travel')) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{type}</span>;
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{type}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-900 mt-3">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {unread.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Unread</h2>
              <div className="space-y-3">
                {unread.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-xl border border-gray-200 p-4 ${!notif.isRead ? 'border-l-2 border-brand-500' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-gray-400">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                          {getTypeBadge(notif.type)}
                        </div>
                        <p className="text-sm text-gray-600">{notif.body}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAtUtc).toLocaleString()}</p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="flex-shrink-0 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {read.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mt-6">Read</h2>
              <div className="space-y-3">
                {read.map((notif) => (
                  <div key={notif.id} className="bg-white rounded-xl border border-gray-200 p-4 opacity-70">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-gray-400">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-700">{notif.title}</p>
                          {getTypeBadge(notif.type)}
                        </div>
                        <p className="text-sm text-gray-600">{notif.body}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAtUtc).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
