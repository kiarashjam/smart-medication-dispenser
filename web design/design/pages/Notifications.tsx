import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { mockNotifications as initialNotifications } from '@/lib/mockData';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success('Notification marked as read');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'missed_dose':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'device_offline':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'from-orange-50 to-yellow-50 border-orange-200';
      case 'missed_dose':
        return 'from-red-50 to-pink-50 border-red-200';
      case 'device_offline':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl relative"
          animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bell className="w-8 h-8 text-white" />
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {unreadCount}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-12 text-center">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bell className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all overflow-hidden ${
                  !notification.isRead ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className={`p-6 bg-gradient-to-r ${getTypeColor(notification.type)} border`}>
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="bg-white p-3 rounded-xl shadow-md"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {getIcon(notification.type)}
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <Badge className="bg-blue-500 animate-pulse">New</Badge>
                            </motion.div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {getTimeSince(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4">{notification.body}</p>

                      {!notification.isRead && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleMarkRead(notification.id)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
