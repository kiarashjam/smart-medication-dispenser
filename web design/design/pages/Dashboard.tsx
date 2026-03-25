import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimationControls } from 'motion/react';
import {
  Activity,
  Box,
  Bell,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Zap,
  Heart,
  Shield,
  Droplet,
  Calendar,
  Pill,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  Star,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { mockDevices, mockContainers, mockSchedules, mockNotifications, mockHistory } from '@/lib/mockData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const controls = useAnimationControls();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate adherence
  const last30Days = mockHistory.filter((h) => {
    const date = new Date(h.scheduledTime);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });
  const confirmed = last30Days.filter((h) => h.status === 'Confirmed').length;
  const total = last30Days.length;
  const adherenceRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  // Calculate weekly trend
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayHistory = mockHistory.filter((h) => {
      const hDate = new Date(h.scheduledTime);
      return hDate.toDateString() === date.toDateString();
    });
    const dayConfirmed = dayHistory.filter((h) => h.status === 'Confirmed').length;
    const dayTotal = dayHistory.length;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      rate: dayTotal > 0 ? Math.round((dayConfirmed / dayTotal) * 100) : 0,
      confirmed: dayConfirmed,
      total: dayTotal,
    };
  });

  // Low stock alerts
  const lowStock = mockContainers.filter((c) => c.quantity < c.lowStockThreshold).slice(0, 5);

  // Unread notifications
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  // Today's schedule for Main device
  const mainDevice = mockDevices.find((d) => d.name === 'Main Dispenser');
  const todaySchedules = mainDevice
    ? mockSchedules
        .filter((s) => {
          const container = mockContainers.find((c) => c.id === s.containerId && c.deviceId === mainDevice.id);
          return container !== undefined;
        })
        .map((s) => {
          const container = mockContainers.find((c) => c.id === s.containerId);
          // Check if time has passed
          const [hours, minutes] = s.timeOfDay.split(':');
          const scheduleTime = new Date();
          scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          const isPast = currentTime > scheduleTime;
          return {
            time: s.timeOfDay,
            medication: container?.medicationName || '',
            pills: container?.pillsPerDose || 0,
            notes: s.notes,
            isPast,
            scheduleTime,
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  // Next upcoming dose
  const nextDose = todaySchedules.find((s) => !s.isPast);

  // Device health score (mock calculation)
  const deviceHealthScore = 95;

  // Radial chart data for adherence
  const radialData = [
    {
      name: 'Adherence',
      value: adherenceRate,
      fill: adherenceRate >= 90 ? '#10b981' : adherenceRate >= 70 ? '#f59e0b' : '#ef4444',
    },
  ];

  // Pie chart data for medication distribution
  const medicationDistribution = mockContainers.map((c) => ({
    name: c.medicationName,
    value: c.quantity,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await controls.start({
      rotate: 360,
      transition: { duration: 0.5 },
    });
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      controls.set({ rotate: 0 });
    }, 500);
  };

  // Streak calculation
  const currentStreak = 7;
  const bestStreak = 14;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 lg:space-y-8 pb-8"
    >
      {/* Enhanced Header with Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="text-3xl"
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                >
                  👋
                </motion.div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700">
                  Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}
                </span>
              </div>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Health Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                </motion.div>
                <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={controls}
            >
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="relative overflow-hidden border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-lg hover:shadow-xl bg-white"
                disabled={isRefreshing}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="relative z-10">Refresh</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Overview - Hero Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Adherence Rate - Primary Metric */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="sm:col-span-2 lg:col-span-1"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 border-0 shadow-2xl hover:shadow-3xl transition-all p-5 sm:p-6 lg:p-8 h-full">
            <motion.div
              className="absolute -right-12 -top-12 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-100" />
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Adherence Rate</p>
                  </div>
                  <motion.div
                    className="flex items-baseline gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  >
                    <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                      {adherenceRate}
                    </h3>
                    <span className="text-2xl sm:text-3xl text-blue-100 font-semibold">%</span>
                  </motion.div>
                  <p className="text-sm text-blue-100 mt-2">Last 30 days</p>
                </div>
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  <ResponsiveContainer>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: '#ffffff30' }}
                        dataKey="value"
                        cornerRadius={10}
                        fill="#ffffff"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-50">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{confirmed} Taken</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{total - confirmed} Missed</span>
                  </span>
                </div>
                <Progress value={adherenceRate} className="h-2 bg-blue-400/30" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Active Devices */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Link to="/devices">
            <Card className="relative overflow-hidden bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xl hover:shadow-2xl transition-all p-5 sm:p-6 cursor-pointer group h-full">
              <motion.div
                className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <Box className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <motion.div
                    className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs font-semibold text-green-700">Online</span>
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Devices</p>
                  <motion.h3
                    className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                  >
                    {mockDevices.length}
                  </motion.h3>
                  <p className="text-sm text-gray-600 mt-2">All systems operational</p>
                </div>
                <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                  <span>View Devices</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all p-5 sm:p-6 h-full">
            <motion.div
              className="absolute -right-6 -top-6 w-24 h-24 bg-amber-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-2xl">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-1">Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <motion.h3
                    className="text-4xl sm:text-5xl font-bold text-amber-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                  >
                    {currentStreak}
                  </motion.h3>
                  <span className="text-xl text-amber-600 font-semibold">days</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                  <Award className="w-4 h-4" />
                  <span>Best: {bestStreak} days</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Link to="/notifications">
            <Card className="relative overflow-hidden bg-white border-2 border-orange-100 hover:border-orange-300 shadow-xl hover:shadow-2xl transition-all p-5 sm:p-6 cursor-pointer group h-full">
              {unreadCount > 0 && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-orange-400 rounded-full hidden sm:block"
                      initial={{ opacity: 0, x: '50%', y: '50%' }}
                      animate={{
                        opacity: [0, 1, 0],
                        x: ['50%', `${50 + Math.cos((i * 2 * Math.PI) / 3) * 40}%`],
                        y: ['50%', `${50 + Math.sin((i * 2 * Math.PI) / 3) * 40}%`],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </>
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl relative group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    {unreadCount > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {unreadCount}
                      </motion.div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Notifications</p>
                  <motion.h3
                    className="text-4xl sm:text-5xl font-bold text-orange-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                  >
                    {unreadCount}
                  </motion.h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {unreadCount > 0 ? 'Unread messages' : 'All caught up!'}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Next Dose Alert - Prominent CTA */}
      {nextDose && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-2xl p-5 sm:p-6 lg:p-8">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Pill className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-white" />
                    <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Next Dose</p>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate mb-1">
                    {nextDose.medication}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{nextDose.time}</span>
                    </div>
                    <div className="h-4 w-px bg-white/30" />
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      <span>{nextDose.pills} pill{nextDose.pills > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-lg px-6 py-6 text-base">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Mark as Taken
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly Trend Chart - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border-2 border-gray-100 shadow-xl p-5 sm:p-6 lg:p-8 h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Weekly Adherence</h2>
                </div>
                <p className="text-sm text-gray-500">Your medication compliance over the last 7 days</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-sm font-semibold">
                7 Days
              </Badge>
            </div>
            
            {/* Mobile Chart */}
            <ResponsiveContainer width="100%" height={180} className="sm:hidden">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorRate)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Desktop Chart */}
            <ResponsiveContainer width="100%" height={280} className="hidden sm:block">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  style={{ fontSize: '13px', fontWeight: '500' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '13px', fontWeight: '500' }}
                  label={{ value: 'Adherence %', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                  labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorRate)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase">Avg</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {Math.round(weeklyData.reduce((acc, d) => acc + d.rate, 0) / weeklyData.length)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase">Best</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {Math.max(...weeklyData.map(d => d.rate))}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {weeklyData.reduce((acc, d) => acc + d.confirmed, 0)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Medication Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white border-2 border-gray-100 shadow-xl p-5 sm:p-6 h-full">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2.5 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Inventory</h2>
              </div>
              <p className="text-sm text-gray-500">Current stock levels</p>
            </div>
            
            {/* Mobile Pie Chart */}
            <ResponsiveContainer width="100%" height={160} className="sm:hidden">
              <PieChart>
                <Pie
                  data={medicationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {medicationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Desktop Pie Chart */}
            <ResponsiveContainer width="100%" height={220} className="hidden sm:block">
              <PieChart>
                <Pie
                  data={medicationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {medicationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {medicationDistribution.slice(0, 4).map((med, index) => (
                <motion.div
                  key={med.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <motion.div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      whileHover={{ scale: 1.5 }}
                    />
                    <span className="text-gray-700 font-medium truncate">{med.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold ml-2 flex-shrink-0">
                    {med.value}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white border-2 border-red-100 shadow-xl p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Low Stock Alerts</h2>
                  <p className="text-sm text-gray-500">Medications that need refilling soon</p>
                </div>
              </div>
              <Link to="/notifications">
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {lowStock.map((container, index) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="group"
                >
                  <div className="relative overflow-hidden flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl hover:shadow-lg transition-all">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                    <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                      <motion.div
                        className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl flex-shrink-0"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Droplet className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 text-base truncate">{container.medicationName}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-red-600">{container.quantity} pills</span> • Slot {container.slotNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="font-bold text-xs flex-shrink-0 ml-3 relative z-10">
                      LOW
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-white border-2 border-gray-100 shadow-xl p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Schedule</h2>
                <p className="text-sm text-gray-500">
                  {todaySchedules.filter((s) => !s.isPast).length} doses remaining • {mainDevice?.name}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 font-semibold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Badge>
          </div>

          {todaySchedules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">No medications scheduled for today</p>
              <p className="text-sm text-gray-400 mt-2">You're all set!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="group"
                >
                  <div
                    className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
                      schedule.isPast
                        ? 'bg-gray-50 border-2 border-gray-200'
                        : 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {/* Timeline connector */}
                    {index !== todaySchedules.length - 1 && (
                      <div className="absolute left-12 sm:left-14 top-full w-0.5 h-3 bg-gray-300 hidden sm:block" />
                    )}

                    {/* Time Badge */}
                    <motion.div
                      className={`relative z-10 ${
                        schedule.isPast
                          ? 'bg-gray-300'
                          : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                      } text-white p-3 sm:p-4 rounded-2xl font-bold min-w-[70px] sm:min-w-[90px] text-center shadow-lg flex-shrink-0`}
                      whileHover={{ scale: schedule.isPast ? 1 : 1.1, rotate: schedule.isPast ? 0 : 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="text-xs sm:text-sm opacity-90">
                        {schedule.time.split(':')[0]}
                      </div>
                      <div className="text-xl sm:text-2xl">
                        {schedule.time.split(':')[1]}
                      </div>
                      {!schedule.isPast && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Medication Info */}
                    <div className="flex-1 min-w-0">
                      <motion.p
                        className={`font-bold text-base sm:text-lg truncate ${
                          schedule.isPast ? 'text-gray-500' : 'text-gray-800'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                      >
                        {schedule.medication}
                      </motion.p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-sm ${schedule.isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                          {schedule.pills} pill{schedule.pills > 1 ? 's' : ''}
                        </span>
                        {schedule.notes && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className={`text-sm ${schedule.isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                              {schedule.notes}
                            </span>
                          </>
                        )}
                      </div>
                      {!schedule.isPast && (
                        <motion.div
                          className="flex items-center gap-1.5 mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs text-amber-600 font-semibold">Upcoming</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Status Icon */}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: schedule.isPast ? 0 : 360 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="flex-shrink-0"
                    >
                      {schedule.isPast ? (
                        <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                      ) : (
                        <motion.div
                          animate={{ rotate: [0, 10, 0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500 fill-pink-100" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* System Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-0 shadow-2xl p-5 sm:p-6 lg:p-8">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(255, 255, 255, 0.7)',
                    '0 0 0 20px rgba(255, 255, 255, 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">System Health</h3>
                <p className="text-white/90 text-sm sm:text-base">All devices operational and connected</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <motion.div
                className="text-5xl sm:text-6xl font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 1.1 }}
              >
                {deviceHealthScore}%
              </motion.div>
              <p className="text-white/90 text-sm sm:text-base mt-1 font-medium">Health Score</p>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <div className="h-4 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${deviceHealthScore}%` }}
                transition={{ duration: 1.5, delay: 1.1 }}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center py-4"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="w-4 h-4 text-blue-500" />
          </motion.div>
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
