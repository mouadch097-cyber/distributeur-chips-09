'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { Brand } from '@/types';

interface BrandItem {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  active: boolean;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    slug: '',
    logoUrl: '',
    description: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Logo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (e) {
      console.error('Error loading brands:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setSelectedFile(null);
    setLogoPreview(null);
    setFormData({
      name: '',
      arabicName: '',
      slug: '',
      logoUrl: '',
      description: '',
      active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setSelectedFile(null);
    setLogoPreview(brand.logoUrl || null);
    setFormData({
      name: brand.name,
      arabicName: brand.arabicName,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
      description: brand.description || '',
      active: brand.active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم الشعار كبير جداً. الحد الأقصى هو 5 ميغابايت.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFormError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
      return;
    }

    setFormError('');
    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeSelectedLogo = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      let finalLogoUrl = formData.logoUrl;

      // If user selected a new file from disk, upload it first
      if (selectedFile) {
        setUploadingLogo(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('folder', 'brands');

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || 'فشل رفع شعار العلامة التجارية');
        }

        finalLogoUrl = uploadJson.url;
        setUploadingLogo(false);
      }

      const slug =
        formData.slug.trim() ||
        formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const payload = {
        name: formData.name.trim(),
        arabicName: formData.arabicName.trim(),
        slug,
        logoUrl: finalLogoUrl || null,
        description: formData.description.trim() || null,
        active: formData.active,
      };

      let res;
      if (editingBrand) {
        res = await fetch('/api/admin/brands', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBrand.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ العلامة التجارية');
      }

      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ العلامة التجارية');
    } finally {
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  const toggleBrandActive = async (brand: BrandItem) => {
    try {
      await fetch('/api/admin/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: brand.id, active: !brand.active }),
      });
      loadBrands();
    } catch (e) {
      console.error('Failed to toggle brand status', e);
    }
  };

  const openDeleteModal = (brand: BrandItem) => {
    setBrandToDelete(brand);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/brands?id=${brandToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف العلامة التجارية');
      }

      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
      loadBrands();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="العلامات التجارية المعتمدة"
        subtitle="العلامات التجارية الرسمية لشيبس الجملة، رفع الشعارات وإضافة علامات جديدة"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة علامة تجارية</span>
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل العلامات التجارية...</span>
          </div>
        ) : brands.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا توجد علامات تجارية مسجلة.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-colors shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={brand.active ? 'success' : 'neutral'}>
                      {brand.active ? 'معتمدة ونشطة' : 'معطلة'}
                    </Badge>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-amber-400/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.arabicName}
                          className="w-full h-full object-contain p-1.5"
                        />
                      ) : (
                        <span className="text-amber-400 font-black text-sm uppercase">
                          {brand.name.slice(0, 3)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-zinc-100">{brand.name}</h3>
                    <span className="text-xs text-amber-400 font-bold block mt-0.5">
                      {brand.arabicName}
                    </span>
                    {brand.description && (
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex justify-between items-center">
                    <span>الرمز (Slug):</span>
                    <span className="font-mono text-zinc-300">{brand.slug}</span>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    المنتجات المرتبطة:{' '}
                    <span className="font-bold text-amber-400 font-mono">
                      {brand._count?.products || 0}
                    </span>{' '}
                    منتج
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => toggleBrandActive(brand)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      brand.active
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {brand.active ? (
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
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                      title="تعديل العلامة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(brand)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="حذف العلامة"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'تعديل بيانات العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="اسم العلامة باللاتينية / الفرنسية *"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              });
            }}
            placeholder="مثال: Master Chips"
            required
          />

          <Input
            label="اسم العلامة بالعربية *"
            value={formData.arabicName}
            onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            placeholder="مثال: ماستر شيبس"
            required
          />

          <Input
            label="الرمز التعريفي (Slug) *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="master-chips"
            required
          />

          {/* Brand Logo Upload Section */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-zinc-300">
              شعار العلامة التجارية (PNG, JPG, WEBP - الحد الأقصى 5 ميغابايت)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview Box */}
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-md">
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="معاينة شعار العلامة"
                      className="w-full h-full object-contain p-1.5"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedLogo}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                      title="حذف الشعار"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-zinc-600">
                    <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50 text-amber-400" />
                    <span className="text-[10px] block">لا يوجد شعار</span>
                  </div>
                )}
              </div>

              {/* Upload & Select Button */}
              <div className="space-y-2 flex-1 w-full text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-amber-400/40 text-amber-400 hover:bg-amber-400/10 font-bold"
                >
                  <FileText className="w-4 h-4" />
                  <span>{logoPreview ? 'استبدال الشعار من الكمبيوتر' : 'اختيار شعار من الكمبيوتر'}</span>
                </Button>

                {selectedFile && (
                  <div className="text-[11px] text-zinc-400 font-mono">
                    الملف المحدد: <span className="text-amber-400 font-bold">{selectedFile.name}</span> (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <Input
                  label="أو أدخل رابط شعار مباشر (URL)"
                  value={formData.logoUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, logoUrl: e.target.value });
                    if (!selectedFile) setLogoPreview(e.target.value || null);
                  }}
                  placeholder="/images/brands/master.png"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">الوصف (اختياري)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف منتجات وجودة هذه العلامة التجارية..."
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
              <span>تفعيل العلامة التجارية في النظام والكتالوج</span>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={saving || uploadingLogo}
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving || uploadingLogo}
            >
              حفظ العلامة
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
            setBrandToDelete(null);
          }
        }}
        title="تأكيد حذف العلامة التجارية"
        maxWidth="md"
      >
        <div className="space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-200 mb-1">
                هل أنت متأكد من حذف هذه العلامة التجارية؟
              </h4>
              <p className="text-xs text-zinc-300">
                العلامة: <span className="font-bold text-amber-400">{brandToDelete?.arabicName}</span>{' '}
                ({brandToDelete?.name})
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                إذا كانت هناك منتجات مرتبطة بهذه العلامة، سيتم تعطيلها بأمان دون حذف المنتجات أو التأثير على سجلات الطلبيات والمبيعات.
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
                setBrandToDelete(null);
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
