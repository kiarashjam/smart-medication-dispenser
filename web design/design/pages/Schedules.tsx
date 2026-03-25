import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Clock, 
  Pill,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  Sunset,
  Filter,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { mockContainers, mockSchedules as initialSchedules } from '@/lib/mockData';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_PERIODS = [
  { label: 'Morning', icon: Sun, time: '08:00', color: 'from-amber-400 to-orange-500' },
  { label: 'Afternoon', icon: Coffee, time: '12:00', color: 'from-blue-400 to-cyan-500' },
  { label: 'Evening', icon: Sunset, time: '18:00', color: 'from-orange-400 to-pink-500' },
  { label: 'Night', icon: Moon, time: '22:00', color: 'from-indigo-500 to-purple-600' },
];

export default function Schedules() {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    containerId: 0,
    timeOfDay: '',
    daysOfWeek: [true, true, true, true, true, true, true], // Sun-Sat
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    timeZone: 'America/New_York',
  });

  const bitmaskToDays = (bitmask: number): boolean[] => {
    return Array.from({ length: 7 }, (_, i) => Boolean(bitmask & (1 << i)));
  };

  const daysToBitmask = (days: boolean[]): number => {
    return days.reduce((acc, day, i) => (day ? acc | (1 << i) : acc), 0);
  };

  const formatDays = (bitmask: number): string => {
    const days = bitmaskToDays(bitmask);
    if (days.every((d) => d)) return 'Every day';
    if (days.slice(1, 6).every((d) => d) && !days[0] && !days[6]) return 'Weekdays';
    if (days[0] && days[6] && !days.slice(1, 6).some((d) => d)) return 'Weekends';
    return DAYS.filter((_, i) => days[i]).join(', ');
  };

  const getTimePeriod = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const getTimePeriodColor = (time: string) => {
    const period = getTimePeriod(time);
    const periodData = TIME_PERIODS.find(p => p.label === period);
    return periodData?.color || 'from-gray-400 to-gray-600';
  };

  const getTimePeriodIcon = (time: string) => {
    const period = getTimePeriod(time);
    const periodData = TIME_PERIODS.find(p => p.label === period);
    return periodData?.icon || Clock;
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormData({
      containerId: mockContainers[0]?.id || 1,
      timeOfDay: '',
      daysOfWeek: [true, true, true, true, true, true, true],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      timeZone: 'America/New_York',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormData({
      containerId: schedule.containerId,
      timeOfDay: schedule.timeOfDay,
      daysOfWeek: bitmaskToDays(schedule.daysOfWeek),
      startDate: schedule.startDate,
      endDate: schedule.endDate || '',
      notes: schedule.notes || '',
      timeZone: schedule.timeZone || 'America/New_York',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                containerId: formData.containerId,
                timeOfDay: formData.timeOfDay,
                daysOfWeek: daysToBitmask(formData.daysOfWeek),
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                notes: formData.notes || null,
                timeZone: formData.timeZone,
              }
            : s
        )
      );
      toast.success('Schedule updated successfully');
    } else {
      const newSchedule = {
        id: Math.max(...schedules.map((s) => s.id), 0) + 1,
        containerId: formData.containerId,
        timeOfDay: formData.timeOfDay,
        daysOfWeek: daysToBitmask(formData.daysOfWeek),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        notes: formData.notes || null,
        timeZone: formData.timeZone,
      };
      setSchedules((prev) => [...prev, newSchedule]);
      toast.success('Schedule added successfully');
    }
    
    setIsFormOpen(false);
  };

  const handleDelete = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
    toast.success('Schedule deleted successfully');
  };

  const toggleDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.map((d, i) => (i === index ? !d : d)),
    }));
  };

  const setQuickDays = (type: 'all' | 'weekdays' | 'weekends') => {
    let days: boolean[];
    switch (type) {
      case 'all':
        days = [true, true, true, true, true, true, true];
        break;
      case 'weekdays':
        days = [false, true, true, true, true, true, false];
        break;
      case 'weekends':
        days = [true, false, false, false, false, false, true];
        break;
      default:
        days = [true, true, true, true, true, true, true];
    }
    setFormData(prev => ({ ...prev, daysOfWeek: days }));
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const container = mockContainers.find(c => c.id === schedule.containerId);
    const matchesSearch = !searchTerm || 
      container?.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.timeOfDay.includes(searchTerm);
    
    const matchesPeriod = filterPeriod === 'all' || getTimePeriod(schedule.timeOfDay) === filterPeriod;
    
    return matchesSearch && matchesPeriod;
  });

  // Group schedules by time period
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const period = getTimePeriod(schedule.timeOfDay);
    if (!acc[period]) acc[period] = [];
    acc[period].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Medication Schedules
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 ml-16">
              {schedules.length} active schedule{schedules.length !== 1 ? 's' : ''} • {mockContainers.length} medications
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-6 py-6 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Schedule
            </Button>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border-2 border-gray-100 shadow-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search medications or times..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPeriod === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('all')}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>
              {TIME_PERIODS.map((period) => (
                <Button
                  key={period.label}
                  variant={filterPeriod === period.label ? 'default' : 'outline'}
                  onClick={() => setFilterPeriod(period.label)}
                  className="hidden lg:inline-flex"
                >
                  <period.icon className="w-4 h-4 mr-2" />
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {TIME_PERIODS.map((period, index) => {
          const count = schedules.filter(s => getTimePeriod(s.timeOfDay) === period.label).length;
          return (
            <motion.div
              key={period.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${period.color} p-2.5 rounded-xl`}>
                    <period.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{period.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border-2 border-gray-100 shadow-xl p-12 sm:p-16 text-center">
            <motion.div
              className="flex justify-center mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl">
                <Calendar className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'No schedules found' : 'No schedules yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Add your first medication schedule to get started'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleAdd} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Schedule
              </Button>
            )}
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([period, periodSchedules]) => (
            <div key={period}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`bg-gradient-to-r ${getTimePeriodColor('12:00')} h-1 w-12 rounded-full`} />
                <h2 className="text-xl font-bold text-gray-800">{period}</h2>
                <Badge variant="outline" className="ml-auto">
                  {periodSchedules.length} schedule{periodSchedules.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {periodSchedules.map((schedule, index) => {
                  const container = mockContainers.find(c => c.id === schedule.containerId);
                  const PeriodIcon = getTimePeriodIcon(schedule.timeOfDay);
                  
                  return (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all p-5 sm:p-6 group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <motion.div
                              className={`bg-gradient-to-br ${getTimePeriodColor(schedule.timeOfDay)} p-4 rounded-2xl flex-shrink-0`}
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <PeriodIcon className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-800">
                                  {schedule.timeOfDay}
                                </h3>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                  {getTimePeriod(schedule.timeOfDay)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <Pill className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <p className="font-semibold text-gray-700 truncate">
                                  {container?.medicationName || 'Unknown Medication'}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {bitmaskToDays(schedule.daysOfWeek).map((active, i) => (
                                  <motion.span
                                    key={i}
                                    whileHover={active ? { scale: 1.1 } : {}}
                                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full transition-all ${
                                      active
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {DAYS[i][0]}
                                  </motion.span>
                                ))}
                              </div>

                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                  <span className="font-medium">{formatDays(schedule.daysOfWeek)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                  <span>
                                    Start: {new Date(schedule.startDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {schedule.endDate && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                    <span>
                                      End: {new Date(schedule.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {schedule.notes && (
                                  <p className="text-gray-500 italic text-xs mt-2 line-clamp-2">
                                    "{schedule.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => handleEdit(schedule)}
                                variant="outline"
                                size="icon"
                                className="border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => setDeleteId(schedule.id)}
                                variant="outline"
                                size="icon"
                                className="border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {editingSchedule ? 'Edit Schedule' : 'New Schedule'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medication Selection */}
                <div>
                  <Label htmlFor="containerId" className="text-base font-semibold mb-3 block">
                    Medication
                  </Label>
                  <select
                    id="containerId"
                    value={formData.containerId}
                    onChange={(e) => setFormData({ ...formData, containerId: Number(e.target.value) })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    required
                  >
                    <option value="">Select medication...</option>
                    {mockContainers.map((container) => (
                      <option key={container.id} value={container.id}>
                        {container.medicationName} - Slot {container.slotNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Period Quick Select */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Quick Time Selection</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIME_PERIODS.map((period) => (
                      <motion.button
                        key={period.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeOfDay: period.time })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.timeOfDay === period.time
                            ? `bg-gradient-to-br ${period.color} text-white border-transparent shadow-lg`
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <period.icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{period.label}</p>
                        <p className="text-xs opacity-80">{period.time}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Time */}
                <div>
                  <Label htmlFor="timeOfDay" className="text-base font-semibold mb-3 block">
                    Custom Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="timeOfDay"
                      type="time"
                      value={formData.timeOfDay}
                      onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                      required
                      className="h-12 pl-12 border-2"
                    />
                  </div>
                </div>

                {/* Days of Week */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Days of Week</Label>
                  
                  {/* Quick Select */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDays('all')}
                      className="text-xs"
                    >
                      Every Day
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDays('weekdays')}
                      className="text-xs"
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDays('weekends')}
                      className="text-xs"
                    >
                      Weekends
                    </Button>
                  </div>

                  {/* Day Toggles */}
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day, index) => (
                      <motion.button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex-1 min-w-[60px] h-14 rounded-xl font-bold text-sm transition-all ${
                          formData.daysOfWeek[index]
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <div>{day}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-base font-semibold mb-3 block">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="h-12 border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-base font-semibold mb-3 block">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="h-12 border-2"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any special instructions..."
                    className="border-2 min-h-[100px]"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this schedule? This action cannot be undone and will stop all future medication reminders for this time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)} 
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
