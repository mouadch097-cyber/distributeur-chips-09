'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Truck, Plus, Loader2, Phone, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Driver } from '@/types';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
      }
    } catch (e) {
      console.error('Failed to load drivers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({ name: '', phone: '', vehicle: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      let res;
      if (editingDriver) {
        res = await fetch('/api/admin/drivers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingDriver.id, ...formData }),
        });
      } else {
        res = await fetch('/api/admin/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ بيانات السائق');
      }

      setIsModalOpen(false);
      loadDrivers();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ السائق');
    } finally {
      setSaving(false);
    }
  };

  const toggleDriverActive = async (driver: any) => {
    try {
      await fetch('/api/admin/drivers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: driver.id, active: !driver.active }),
      });
      loadDrivers();
    } catch (e) {
      console.error('Failed to toggle driver status', e);
    }
  };

  const openDeleteModal = (driver: any) => {
    setDriverToDelete(driver);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/drivers?id=${driverToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف السائق');
      }

      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
      loadDrivers();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة سائقي وشاحنات التوزيع"
        subtitle="متابعة أسطول التوزيع وتعيين السائقين لتسليم طلبيات الولايات"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سائق جديد</span>
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل قائمة السائقين...</span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا يوجد سائقين مسجلين حالياً. اضغط على &quot;إضافة سائق جديد&quot; لتسجيل أول سائق في الأسطول.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-400/30 transition-colors shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={driver.active ? 'success' : 'neutral'}>
                      {driver.active ? 'نشط في الخدمة' : 'غير متوفر'}
                    </Badge>
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-zinc-100">{driver.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex justify-between">
                    <span>الشاحنة / المركبة:</span>
                    <span className="text-zinc-200 font-bold">{driver.vehicle || 'شاحنة توزيع'}</span>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    الطلبيات المسندة: <span className="font-bold text-amber-400 font-mono">{driver._count?.orders || 0}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => toggleDriverActive(driver)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      driver.active
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {driver.active ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>تعطيل</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تفعيل</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(driver)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق توزيع جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="اسم السائق الكامل *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="ياسين كمال"
          />

          <Input
            label="رقم الهاتف للتواصل *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            placeholder="0541655938"
          />

          <Input
            label="نوع الشاحنة أو الترقيم (اختياري)"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            placeholder="شاحنة هيونداي HD72"
          />

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              حفظ السائق
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Driver Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setIsDeleteModalOpen(false);
            setDriverToDelete(null);
          }
        }}
        title="تأكيد حذف السائق"
        maxWidth="md"
      >
        <div className="space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-200 mb-1">هل أنت متأكد من حذف هذا السائق؟</h4>
              <p className="text-xs text-zinc-300">
                السائق: <span className="font-bold text-amber-400">{driverToDelete?.name}</span> ({driverToDelete?.phone})
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                سيتم إزالة السائق من قائمة الأسطول مع الحفاظ على سجل الطلبيات القديمة.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={deleting}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDriverToDelete(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              isLoading={deleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              حذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
