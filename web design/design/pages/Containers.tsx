import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Edit, Trash2, Calendar, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { mockDevices, mockContainers as initialContainers } from '@/lib/mockData';
import { toast } from 'sonner';

export default function Containers() {
  const { deviceId } = useParams();
  const device = mockDevices.find((d) => d.id === Number(deviceId));
  const [containers, setContainers] = useState(initialContainers.filter((c) => c.deviceId === Number(deviceId)));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    slotNumber: '',
    medicationName: '',
    imageUrl: '',
    quantity: '',
    pillsPerDose: '',
    lowStockThreshold: '',
  });

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Device not found</h2>
        <Link to="/devices">
          <Button className="mt-4">Back to Devices</Button>
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    setEditingContainer(null);
    setFormData({
      slotNumber: '',
      medicationName: '',
      imageUrl: '',
      quantity: '',
      pillsPerDose: '',
      lowStockThreshold: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (container: any) => {
    setEditingContainer(container);
    setFormData({
      slotNumber: container.slotNumber.toString(),
      medicationName: container.medicationName,
      imageUrl: container.imageUrl || '',
      quantity: container.quantity.toString(),
      pillsPerDose: container.pillsPerDose.toString(),
      lowStockThreshold: container.lowStockThreshold.toString(),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContainer) {
      // Update existing container
      setContainers((prev) =>
        prev.map((c) =>
          c.id === editingContainer.id
            ? {
                ...c,
                slotNumber: Number(formData.slotNumber),
                medicationName: formData.medicationName,
                imageUrl: formData.imageUrl || null,
                quantity: Number(formData.quantity),
                pillsPerDose: Number(formData.pillsPerDose),
                lowStockThreshold: Number(formData.lowStockThreshold),
              }
            : c
        )
      );
      toast.success('Container updated successfully');
    } else {
      // Add new container
      const newContainer = {
        id: Math.max(...containers.map((c) => c.id), 0) + 1,
        deviceId: Number(deviceId),
        slotNumber: Number(formData.slotNumber),
        medicationName: formData.medicationName,
        imageUrl: formData.imageUrl || null,
        quantity: Number(formData.quantity),
        pillsPerDose: Number(formData.pillsPerDose),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };
      setContainers((prev) => [...prev, newContainer]);
      toast.success('Container added successfully');
    }
    
    setIsFormOpen(false);
  };

  const handleDelete = (id: number) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
    toast.success('Container deleted successfully');
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
        <Link to="/devices">
          <Button variant="ghost" className="mb-4 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Containers
            </h1>
            <p className="text-gray-600 mt-1">{device.name} - Medication Slots</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Container
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {containers.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-12 text-center">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Package className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No containers yet</h3>
            <p className="text-gray-500 mb-4">Add your first medication container to get started</p>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Container
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container, index) => (
            <motion.div
              key={container.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Package className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{container.medicationName}</h3>
                      <p className="text-sm text-gray-600">Slot {container.slotNumber}</p>
                    </div>
                  </div>
                  {container.quantity < container.lowStockThreshold && (
                    <Badge variant="destructive" className="animate-pulse">Low</Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-800">{container.quantity} pills</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Per dose:</span>
                    <span className="font-semibold text-gray-800">{container.pillsPerDose} pill{container.pillsPerDose > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Low stock alert:</span>
                    <span className="font-semibold text-gray-800">&lt; {container.lowStockThreshold}</span>
                  </div>
                </div>

                <motion.div
                  className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                />

                <div className="flex gap-2">
                  <Link to={`/containers/${container.id}/schedules`} className="flex-1">
                    <Button variant="outline" className="w-full border-blue-200 hover:border-blue-500 hover:text-blue-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedules
                    </Button>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleEdit(container)}
                      variant="outline"
                      size="icon"
                      className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setDeleteId(container.id)}
                      variant="outline"
                      size="icon"
                      className="border-gray-200 hover:border-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingContainer ? 'Edit Container' : 'Add Container'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="slotNumber">Slot Number</Label>
                  <Input
                    id="slotNumber"
                    type="number"
                    value={formData.slotNumber}
                    onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                    min="1"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="medicationName">Medication Name</Label>
                  <Input
                    id="medicationName"
                    value={formData.medicationName}
                    onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (pills)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    min="0"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="pillsPerDose">Pills per Dose</Label>
                  <Input
                    id="pillsPerDose"
                    type="number"
                    value={formData.pillsPerDose}
                    onChange={(e) => setFormData({ ...formData, pillsPerDose: e.target.value })}
                    min="1"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    min="1"
                    required
                    className="mt-2"
                  />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
                  >
                    {editingContainer ? 'Update Container' : 'Add Container'}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Container</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this container? This action cannot be undone and will also remove all associated schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
