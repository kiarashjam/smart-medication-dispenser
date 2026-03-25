import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Plus, Edit, Trash2, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { devicesApi, containersApi, type DeviceDto, type ContainerDto } from '@/api/client';
import { appPath } from '@/lib/appRoutes';
import { toast } from 'sonner';

export default function Containers() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState<DeviceDto | null>(null);
  const [containers, setContainers] = useState<ContainerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<ContainerDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ slotNumber: '', medicationName: '', imageUrl: '', quantity: '', pillsPerDose: '', lowStockThreshold: '' });

  const load = async () => {
    if (!deviceId) return;
    try {
      const [devRes, contRes] = await Promise.all([devicesApi.get(deviceId), containersApi.listByDevice(deviceId)]);
      setDevice(devRes.data);
      setContainers(contRes.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [deviceId]);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;
  if (!device) return (<div className="text-center py-12"><h2 className="text-sm font-medium text-gray-900">Device not found</h2><Link to={appPath('/devices')}><Button className="mt-4">Back to Devices</Button></Link></div>);

  const handleAdd = () => {
    setEditingContainer(null);
    setFormData({ slotNumber: '', medicationName: '', imageUrl: '', quantity: '', pillsPerDose: '', lowStockThreshold: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (c: ContainerDto) => {
    setEditingContainer(c);
    setFormData({ slotNumber: c.slotNumber.toString(), medicationName: c.medicationName, imageUrl: c.medicationImageUrl || '', quantity: c.quantity.toString(), pillsPerDose: c.pillsPerDose.toString(), lowStockThreshold: c.lowStockThreshold.toString() });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContainer) {
        await containersApi.update(editingContainer.id, { slotNumber: Number(formData.slotNumber), medicationName: formData.medicationName, medicationImageUrl: formData.imageUrl || undefined, quantity: Number(formData.quantity), pillsPerDose: Number(formData.pillsPerDose), lowStockThreshold: Number(formData.lowStockThreshold) });
        toast.success('Container updated');
      } else {
        await containersApi.create(deviceId!, { slotNumber: Number(formData.slotNumber), medicationName: formData.medicationName, medicationImageUrl: formData.imageUrl || undefined, quantity: Number(formData.quantity), pillsPerDose: Number(formData.pillsPerDose), lowStockThreshold: Number(formData.lowStockThreshold) });
        toast.success('Container added');
      }
      setIsFormOpen(false);
      load();
    } catch { toast.error('Failed to save container'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await containersApi.delete(id);
      toast.success('Container deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Failed to delete container'); }
  };

  const getStockPercentage = (quantity: number, lowStockThreshold: number) => {
    return Math.min((quantity / (lowStockThreshold * 2)) * 100, 100);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <Link to={appPath('/devices')}><Button variant="ghost" className="mb-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4 mr-2" />Back to Devices</Button></Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Containers</h1>
            <p className="text-sm text-gray-500 mt-1">{device.name} - Medication Slots</p>
          </div>
          <Button onClick={handleAdd} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />Add Container
          </Button>
        </div>
      </div>

      {containers.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-900 mt-3">No containers yet</p>
          <p className="text-sm text-gray-500 mt-1">Add your first medication container</p>
          <Button onClick={handleAdd} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-4">
            <Plus className="w-4 h-4 mr-2" />Add Container
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container) => (
            <div key={container.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 p-2 rounded-lg"><Package className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{container.medicationName}</h3>
                    <p className="text-xs text-gray-500">Slot {container.slotNumber}</p>
                  </div>
                </div>
                {container.quantity < container.lowStockThreshold && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">Low</span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-gray-900">{container.quantity} pills</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Per dose:</span>
                  <span className="font-medium text-gray-900">{container.pillsPerDose} pill{container.pillsPerDose > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Low stock alert:</span>
                  <span className="font-medium text-gray-900">&lt; {container.lowStockThreshold}</span>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        container.quantity < container.lowStockThreshold
                          ? 'bg-accent-600'
                          : container.quantity < container.lowStockThreshold * 2
                          ? 'bg-brand-600'
                          : 'bg-success-600'
                      }`}
                      style={{ width: `${getStockPercentage(container.quantity, container.lowStockThreshold)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={appPath(`/containers/${container.id}/schedules`)} className="flex-1">
                  <Button variant="outline" className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 mr-2" />Schedules
                  </Button>
                </Link>
                <Button onClick={() => handleEdit(container)} variant="outline" size="icon" className="border border-gray-200 hover:bg-gray-50 text-gray-700">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button onClick={() => setDeleteId(container.id)} variant="outline" size="icon" className="border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-red-600 hover:border-red-200">
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
              <h2 className="text-lg font-semibold text-gray-900">{editingContainer ? 'Edit Container' : 'Add Container'}</h2>
              <p className="text-sm text-gray-500 mt-1">{editingContainer ? 'Update container details' : 'Add a new medication container'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slot Number</Label>
                <Input type="number" value={formData.slotNumber} onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })} min="1" required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Medication Name</Label>
                <Input value={formData.medicationName} onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })} required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity (pills)</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} min="0" required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pills per Dose</Label>
                <Input type="number" value={formData.pillsPerDose} onChange={(e) => setFormData({ ...formData, pillsPerDose: e.target.value })} min="1" required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low Stock Threshold</Label>
                <Input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} min="1" required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{editingContainer ? 'Update' : 'Add'} Container</Button>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Container</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This will also remove associated schedules.</AlertDialogDescription>
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
