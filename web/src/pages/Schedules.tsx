import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { schedulesApi, type ScheduleDto } from '@/api/client';
import { toast } from 'sonner';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function bitmaskToDays(bitmask: number): string {
  if (bitmask === 127) return 'Every day';
  if (bitmask === 62) return 'Weekdays';
  if (bitmask === 65) return 'Weekends';
  return DAY_NAMES.filter((_, i) => bitmask & (1 << i)).join(', ');
}

export default function Schedules() {
  const { containerId } = useParams();
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ timeOfDay: '08:00', daysOfWeekBitmask: 127, startDate: new Date().toISOString().split('T')[0], endDate: '', notes: '' });

  const load = async () => {
    if (!containerId) return;
    try {
      const res = await schedulesApi.listByContainer(containerId);
      setSchedules(res.data);
    } catch { toast.error('Failed to load schedules'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [containerId]);

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormData({ timeOfDay: '08:00', daysOfWeekBitmask: 127, startDate: new Date().toISOString().split('T')[0], endDate: '', notes: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (s: ScheduleDto) => {
    setEditingSchedule(s);
    setFormData({ timeOfDay: s.timeOfDay, daysOfWeekBitmask: s.daysOfWeekBitmask, startDate: s.startDate.split('T')[0], endDate: s.endDate?.split('T')[0] || '', notes: s.notes || '' });
    setIsFormOpen(true);
  };

  const toggleDay = (bit: number) => {
    setFormData((prev) => ({ ...prev, daysOfWeekBitmask: prev.daysOfWeekBitmask ^ (1 << bit) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { timeOfDay: formData.timeOfDay, daysOfWeekBitmask: formData.daysOfWeekBitmask, startDate: new Date(formData.startDate).toISOString(), endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined, notes: formData.notes || undefined };
    try {
      if (editingSchedule) {
        await schedulesApi.update(editingSchedule.id, body);
        toast.success('Schedule updated');
      } else {
        await schedulesApi.create(containerId!, body);
        toast.success('Schedule created');
      }
      setIsFormOpen(false);
      load();
    } catch { toast.error('Failed to save schedule'); }
  };

  const handleDelete = async (id: string) => {
    try { await schedulesApi.delete(id); toast.success('Schedule deleted'); setDeleteId(null); load(); }
    catch { toast.error('Failed to delete schedule'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <Link to="/devices"><Button variant="ghost" className="mb-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schedules</h1>
            <p className="text-sm text-gray-500 mt-1">Medication dosing schedule</p>
          </div>
          <Button onClick={handleAdd} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />Add Schedule
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-900 mt-3">No schedules</p>
          <p className="text-sm text-gray-500 mt-1">Create a dosing schedule</p>
          <Button onClick={handleAdd} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-4">
            <Plus className="w-4 h-4 mr-2" />Add Schedule
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 p-2 rounded-lg">
                    <span className="font-mono text-sm font-semibold text-brand-600">{schedule.timeOfDay}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{bitmaskToDays(schedule.daysOfWeekBitmask)}</p>
                    <p className="text-xs text-gray-500">From {new Date(schedule.startDate).toLocaleDateString()}{schedule.endDate && ` to ${new Date(schedule.endDate).toLocaleDateString()}`}</p>
                  </div>
                </div>
              </div>
              {schedule.notes && <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{schedule.notes}</p>}
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(schedule)} variant="outline" className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 mr-2" />Edit
                </Button>
                <Button onClick={() => setDeleteId(schedule.id)} variant="outline" size="icon" className="border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-red-600 hover:border-red-200">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editingSchedule ? 'Edit' : 'Add'} Schedule</h2>
              <p className="text-sm text-gray-500 mt-1">{editingSchedule ? 'Update schedule details' : 'Create a new medication schedule'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time of Day</Label>
                <Input type="time" value={formData.timeOfDay} onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })} required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Days of Week</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {DAY_NAMES.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        formData.daysOfWeekBitmask & (1 << i)
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date (optional)</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes (optional)</Label>
                <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. Take with food" />
              </div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{editingSchedule ? 'Update' : 'Create'} Schedule</Button>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this schedule?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
