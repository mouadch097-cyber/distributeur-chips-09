'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Plus, Trash2, Loader2, AlertTriangle, CheckCircle2, Check, X } from 'lucide-react';

interface FlavorItem {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  color: string | null;
  active: boolean;
  _count?: { products: number };
}

export default function AdminFlavorsPage() {
  const [flavors, setFlavors] = useState<FlavorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Flavor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    arabicName: '',
    name: '',
    slug: '',
    color: '#eab308',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Flavor Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flavorToDelete, setFlavorToDelete] = useState<FlavorItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadFlavors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/flavors');
      if (res.ok) {
        const data = await res.json();
        setFlavors(data.flavors || []);
      }
    } catch (e) {
      console.error('Error loading flavors:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlavors();
  }, [loadFlavors]);

  // Toggle Availability
  const handleToggleAvailability = async (flavor: FlavorItem) => {
    setTogglingId(flavor.id);
    const newStatus = !flavor.active;

    // Optimistic UI update
    setFlavors((prev) =>
      prev.map((f) => (f.id === flavor.id ? { ...f, active: newStatus } : f))
    );

    try {
      const res = await fetch('/api/admin/flavors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flavor.id, active: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل تحديث حالة النكهة');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تعديل حالة التوفر');
      loadFlavors(); // Rollback on error
    } finally {
      setTogglingId(null);
    }
  };

  const openAddModal = () => {
    setFormData({
      arabicName: '',
      name: '',
      slug: '',
      color: '#eab308',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const slug =
        formData.slug.trim() ||
        formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const res = await fetch('/api/admin/flavors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arabicName: formData.arabicName.trim(),
          name: formData.name.trim(),
          slug,
          color: formData.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إضافة النكهة');
      }

      setIsAddModalOpen(false);
      loadFlavors();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء إضافة النكهة');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (flavor: FlavorItem) => {
    setFlavorToDelete(flavor);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!flavorToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/flavors?id=${flavorToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف النكهة');
      }

      setIsDeleteModalOpen(false);
      setFlavorToDelete(null);
      loadFlavors();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء محاولة الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة نكهات الشيبس وتوفرها"
        subtitle="التحكم في حالة توفر النكهات للزبائن (متوفر / غير متوفر) وإضافة نكهات جديدة"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="flex items-center gap-1.5 font-bold shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نكهة</span>
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل النكهات...</span>
          </div>
        ) : flavors.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا توجد نكهات مسجلة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flavors.map((flavor) => {
              const isToggling = togglingId === flavor.id;

              return (
                <div
                  key={flavor.id}
                  className={`p-5 rounded-2xl bg-zinc-900/90 border transition-all ${
                    flavor.active
                      ? 'border-zinc-800 hover:border-amber-400/40'
                      : 'border-red-900/40 bg-zinc-950/80 opacity-75'
                  }`}
                >
                  {/* Top row: Color + Names + Availability badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: flavor.color || '#eab308' }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100">{flavor.arabicName}</h3>
                        <span className="text-xs text-zinc-500 font-mono block">{flavor.name}</span>
                      </div>
                    </div>

                    <Badge variant={flavor.active ? 'success' : 'neutral'}>
                      {flavor.active ? 'متوفر' : 'غير متوفر'}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-zinc-400 mb-4 flex items-center justify-between">
                    <span>المنتجات المرتبطة:</span>
                    <span className="font-bold text-zinc-200 font-mono">
                      {flavor._count?.products || 0} منتج
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant={flavor.active ? 'outline' : 'primary'}
                      isLoading={isToggling}
                      onClick={() => handleToggleAvailability(flavor)}
                      className={`text-xs font-bold flex-1 ${
                        flavor.active
                          ? 'border-zinc-700 hover:border-red-500 hover:text-red-400 hover:bg-red-950/20'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/10'
                      }`}
                    >
                      {flavor.active ? (
                        <>
                          <X className="w-3.5 h-3.5 mr-1" />
                          <span>جعل غير متوفر</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>جعل متوفر</span>
                        </>
                      )}
                    </Button>

                    <button
                      onClick={() => openDeleteModal(flavor)}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="حذف النكهة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Flavor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة نكهة جديدة"
        maxWidth="md"
      >
        <form onSubmit={handleSaveFlavor} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="اسم النكهة بالعربية *"
            value={formData.arabicName}
            onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            placeholder="مثال: فلفل حار وليد، باربكيو مدخن"
            required
          />

          <Input
            label="اسم النكهة باللاتينية / الفرنسية *"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              });
            }}
            placeholder="مثال: Hot Pepper, Barbecue"
            required
          />

          <Input
            label="المعرف الفريد (Slug) *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="hot-pepper"
            required
          />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              لون النكهة المميز (Color Tag)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-zinc-900 border border-zinc-700"
              />
              <span className="text-xs text-zinc-400 font-mono">{formData.color}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => setIsAddModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              حفظ النكهة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف النكهة"
        maxWidth="sm"
      >
        <div className="space-y-4 text-right">
          {deleteError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
            <p className="text-xs text-zinc-300">
              هل أنت متأكد من رغبتك في حذف نكهة{' '}
              <strong className="text-amber-400">{flavorToDelete?.arabicName}</strong>؟
              {flavorToDelete?._count && flavorToDelete._count.products > 0
                ? ' ملاحظة: نظراً لوجود منتجات مرتبطة بهذه النكهة، سيتم تعطيلها تلقائياً للحفاظ على سلامة سجلات المنتجات والطلبيات السابقة.'
                : ''}
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleConfirmDelete}
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
