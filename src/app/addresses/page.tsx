'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WILAYAS } from '@/lib/constants';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface CustomerAddressItem {
  id: string;
  title: string;
  wilaya: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddressItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    wilaya: WILAYAS[0].name,
    address: '',
    phone: '',
    isDefault: false,
  });

  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      title: 'المحل الرئيسي',
      wilaya: user?.wilaya || WILAYAS[0].name,
      address: user?.address || '',
      phone: user?.phone || '',
      isDefault: addresses.length === 0,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddressItem) => {
    setEditingAddress(addr);
    setFormData({
      title: addr.title,
      wilaya: addr.wilaya,
      address: addr.address,
      phone: addr.phone,
      isDefault: addr.isDefault,
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
      if (editingAddress) {
        res = await fetch('/api/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAddress.id, ...formData }),
        });
      } else {
        res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ العنوان');
      }

      setIsModalOpen(false);
      loadAddresses();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ العنوان');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAddresses();
      }
    } catch (e) {
      console.error('Failed to delete address:', e);
    }
  };

  const handleSetDefault = async (addr: CustomerAddressItem) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addr.id, isDefault: true }),
      });
      if (res.ok) {
        loadAddresses();
      }
    } catch (e) {
      console.error('Failed to set default address:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">عناويني</span>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              className="flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنوان جديد</span>
            </Button>
            <div className="flex items-center gap-2.5">
              <div>
                <h1 className="text-2xl font-black text-zinc-100">عناويني المسجلة</h1>
                <p className="text-xs text-zinc-400">إدارة عناوين التوصيل لمحلاتك ومستودعاتك</p>
              </div>
              <MapPin className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <span className="text-xs text-zinc-400">جاري تحميل العناوين...</span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
              <MapPin className="w-10 h-10 text-amber-400/40 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">لا توجد عناوين مسجلة حالياً.</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                أضف عنوان متجرك أو مستودعك لتسهيل عملية الطلب والتوصيل السريع بواسطة شاحناتنا.
              </p>
              <Button variant="outline" size="sm" onClick={openCreateModal} className="mt-2 text-amber-400 border-amber-400/30">
                + إضافة عنوانك الأول
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 rounded-3xl bg-zinc-900/90 border transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                    addr.isDefault ? 'border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-zinc-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {addr.isDefault ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-bold">
                          العنوان الافتراضي
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors"
                        >
                          تعيين كافتراضي
                        </button>
                      )}
                      <h3 className="text-sm font-black text-zinc-100">{addr.title}</h3>
                    </div>

                    <p className="text-xs text-zinc-300 font-bold">الولاية: {addr.wilaya}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{addr.address}</p>

                    {addr.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono pt-1">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{addr.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'تعديل عنوان التوصيل' : 'إضافة عنوان توصيل جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="اسم أو مسمى العنوان *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="مثال: المحل الرئيسي، المستودع، المتجر رقم 2"
            required
          />

          <Select
            label="الولاية *"
            value={formData.wilaya}
            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
            required
          >
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name}
              </option>
            ))}
          </Select>

          <Input
            label="العنوان التفصيلي (الحي، الشارع، المعلم القريب) *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="حي السلام، مقابل المسجد الكبير"
            required
          />

          <Input
            label="رقم هاتف المستلم في هذا العنوان *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0541655938"
            required
          />

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-700 text-amber-500 w-4 h-4"
              />
              <span>تعيين كعنوان توصيل افتراضي للطلبيات القادمة</span>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              حفظ العنوان
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
