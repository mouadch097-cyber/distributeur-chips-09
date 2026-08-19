'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle, Clock } from 'lucide-react';

interface OfferItem {
  id: string;
  title: string;
  arabicTitle: string;
  description: string | null;
  discountPercent: number | null;
  bundlePrice: number | null;
  active: boolean;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    arabicTitle: '',
    title: '',
    description: '',
    discountPercent: '',
    bundlePrice: '',
    validUntil: '',
    active: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<OfferItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/offers');
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (e) {
      console.error('Error fetching admin offers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      arabicTitle: '',
      title: '',
      description: '',
      discountPercent: '',
      bundlePrice: '',
      validUntil: '',
      active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    setFormData({
      arabicTitle: offer.arabicTitle,
      title: offer.title || '',
      description: offer.description || '',
      discountPercent: offer.discountPercent ? String(offer.discountPercent) : '',
      bundlePrice: offer.bundlePrice ? String(offer.bundlePrice) : '',
      validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
      active: offer.active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const payload: any = {
        arabicTitle: formData.arabicTitle.trim(),
        title: formData.title.trim() || formData.arabicTitle.trim(),
        description: formData.description.trim() || null,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null,
        bundlePrice: formData.bundlePrice ? Number(formData.bundlePrice) : null,
        validUntil: formData.validUntil ? formData.validUntil : null,
        active: formData.active,
      };

      let res;
      if (editingOffer) {
        res = await fetch('/api/admin/offers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingOffer.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ العرض');
      }

      setIsModalOpen(false);
      loadOffers();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ العرض');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (offer: OfferItem) => {
    try {
      await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, active: !offer.active }),
      });
      loadOffers();
    } catch (e) {
      console.error('Failed to toggle offer status', e);
    }
  };

  const openDeleteModal = (offer: OfferItem) => {
    setOfferToDelete(offer);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/offers?id=${offerToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف العرض');
      }

      setIsDeleteModalOpen(false);
      setOfferToDelete(null);
      loadOffers();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء محاولة الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة العروض الترويجية والخصومات"
        subtitle="إنشاء باقات التوفير ونسب التخفيض وتحديد فترات صلاحية العروض للتجار"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عرض جديد</span>
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل العروض...</span>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
            <Tag className="w-10 h-10 text-amber-400/40 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300">لا توجد عروض ترويجية مسجلة حالياً.</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              يمكنك إضافة خصومات على باقات الكراتين أو تخفيضات موسمية لتشجيع التجار على الشراء.
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="mt-2 text-amber-400 border-amber-400/30">
              + إضافة أول عرض
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer) => {
              const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();
              const isEffectivelyActive = offer.active && !isExpired;

              return (
                <div
                  key={offer.id}
                  className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-400/30 transition-colors shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {isExpired ? (
                        <Badge variant="danger">منتهي الصلاحية</Badge>
                      ) : offer.active ? (
                        <Badge variant="success">فعال ونشط</Badge>
                      ) : (
                        <Badge variant="neutral">غير مفعل (مسودة)</Badge>
                      )}

                      {offer.discountPercent ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-xs font-mono">
                          -{offer.discountPercent}%
                        </span>
                      ) : offer.bundlePrice ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs font-mono">
                          {offer.bundlePrice.toLocaleString()} دج
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-zinc-100">{offer.arabicTitle}</h3>
                      {offer.title && offer.title !== offer.arabicTitle && (
                        <span className="text-[11px] text-zinc-500 font-mono block">{offer.title}</span>
                      )}
                    </div>

                    {offer.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {offer.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {offer.validUntil
                          ? `ينتهي في: ${new Date(offer.validUntil).toLocaleDateString('ar-DZ')}`
                          : 'عرض دائم بدون تاريخ انتهاء'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleActive(offer)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                        offer.active
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {offer.active ? (
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
                        onClick={() => openEditModal(offer)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                        title="تعديل العرض"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(offer)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                        title="حذف العرض"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="عنوان العرض بالعربية *"
              value={formData.arabicTitle}
              onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
              placeholder="مثال: باقة ماستر شيبس الذهبية"
              required
            />

            <Input
              label="العنوان باللاتينية / الفرنسية"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Pack Master Gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="نسبة الخصم % (اختياري)"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              placeholder="مثال: 15"
              min="1"
              max="99"
            />

            <Input
              type="number"
              label="سعر الباقة الإجمالي دج (اختياري)"
              value={formData.bundlePrice}
              onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
              placeholder="مثال: 35000"
            />
          </div>

          <Input
            type="date"
            label="تاريخ انتهاء العرض (اتركه فارغاً للعروض الدائمة)"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              تفاصيل ومكونات العرض (اختياري)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="مثال: 20 كرتون شيبس جبنة + 5 كراتين شواء بسعر مخفض لفترة محدودة..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-700 text-amber-500 w-4 h-4"
              />
              <span>تفعيل العرض وإظهاره مباشرة في صفحة العروض العامة</span>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              حفظ العرض
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setIsDeleteModalOpen(false);
            setOfferToDelete(null);
          }
        }}
        title="تأكيد حذف العرض"
        maxWidth="md"
      >
        <div className="space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-200 mb-1">هل أنت متأكد من حذف هذا العرض؟</h4>
              <p className="text-xs text-zinc-300">
                العرض: <span className="font-bold text-amber-400">{offerToDelete?.arabicTitle}</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                سيتم حذف العرض نهائياً ولن يظهر بعد الآن للزبائن.
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
                setOfferToDelete(null);
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
