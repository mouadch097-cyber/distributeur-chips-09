'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Product, Brand, Flavor } from '@/types';
import {
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  Search,
  Trash2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    slug: '',
    brandId: '',
    flavorId: '',
    flavorIds: [] as string[],
    unitPrice: 90,
    cartonQuantity: 20,
    cartonPrice: 1800,
    retailPrice: 1900,
    wholesalePrice: 1800,
    superWholesalePrice: 1700,
    stock: 50,
    active: true,
    featured: false,
    description: '',
    imageUrl: '',
  });

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setBrands(data.brands || []);
        setFlavors(data.flavors || []);
        if (data.brands && data.brands.length > 0 && !formData.brandId) {
          setFormData((prev) => ({ ...prev, brandId: data.brands[0].id }));
        }
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  }, [formData.brandId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({
      name: '',
      arabicName: '',
      slug: '',
      brandId: brands[0]?.id || '',
      flavorId: '',
      flavorIds: flavors.slice(0, 3).map((f) => f.id),
      unitPrice: 90,
      cartonQuantity: 20,
      cartonPrice: 1800,
      retailPrice: 1900,
      wholesalePrice: 1800,
      superWholesalePrice: 1700,
      stock: 50,
      active: true,
      featured: false,
      description: '',
      imageUrl: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSelectedFile(null);
    setImagePreview(product.imageUrl || null);
    const existingFlavorIds = product.flavors
      ? product.flavors.map((pf) => pf.flavorId)
      : product.flavorId
      ? [product.flavorId]
      : [];

    const defaultCartonPrice = product.cartonPrice || 1800;

    setFormData({
      name: product.name,
      arabicName: product.arabicName,
      slug: product.slug,
      brandId: product.brandId,
      flavorId: product.flavorId || '',
      flavorIds: existingFlavorIds,
      unitPrice: product.unitPrice,
      cartonQuantity: product.cartonQuantity,
      cartonPrice: defaultCartonPrice,
      retailPrice: product.retailPrice ?? (defaultCartonPrice + 100),
      wholesalePrice: product.wholesalePrice ?? defaultCartonPrice,
      superWholesalePrice: product.superWholesalePrice ?? (defaultCartonPrice - 100),
      stock: product.stock,
      active: product.active,
      featured: product.featured,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم الصورة كبير جداً. الحد الأقصى هو 5 ميغابايت.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFormError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
      return;
    }

    setFormError('');
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف المنتج');
      }

      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء محاولة الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || 'فشل رفع صورة المنتج');
        }

        finalImageUrl = uploadJson.url;
        setUploadingImage(false);
      }

      const payload: any = {
        name: formData.name,
        arabicName: formData.arabicName,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        brandId: formData.brandId,
        flavorId: formData.flavorId || (formData.flavorIds[0] || null),
        flavorIds: formData.flavorIds,
        unitPrice: Number(formData.unitPrice),
        cartonQuantity: Number(formData.cartonQuantity),
        cartonPrice: Number(formData.cartonPrice),
        retailPrice: Number(formData.retailPrice || formData.cartonPrice),
        wholesalePrice: Number(formData.wholesalePrice || formData.cartonPrice),
        superWholesalePrice: Number(formData.superWholesalePrice || formData.cartonPrice),
        stock: Number(formData.stock),
        active: formData.active,
        featured: formData.featured,
        description: formData.description || null,
        imageUrl: finalImageUrl || null,
      };

      let res;
      if (editingProduct) {
        res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ بيانات المنتج');
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ غير متوقع أثناء الحفظ');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const toggleProductActive = async (product: Product) => {
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, active: !product.active }),
      });
      loadProducts();
    } catch (e) {
      console.error('Error toggling active status:', e);
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      const newStock = product.stock > 0 ? 0 : 50;
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, stock: newStock }),
      });
      loadProducts();
    } catch (e) {
      console.error('Error toggling availability status:', e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.arabicName.includes(search) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة المنتجات والأصناف"
        subtitle="إنشاء وتعديل المنتجات وربطها بالأذواق وتحديد المخزون والأسعار"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </Button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="البحث باسم المنتج أو العلامة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <span className="text-xs text-zinc-400">إجمالي الأصناف: {filteredProducts.length}</span>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل المنتجات...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا توجد منتجات مسجلة حالياً.
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                    <th className="p-4 font-bold">صورة المنتج</th>
                    <th className="p-4 font-bold">المنتج</th>
                    <th className="p-4 font-bold">العلامة التجارية</th>
                    <th className="p-4 font-bold">النكهات المرتبطة</th>
                    <th className="p-4 font-bold text-center">حجم الكرتون</th>
                    <th className="p-4 font-bold text-left">سعر الكرتون</th>
                    <th className="p-4 font-bold text-center">المخزون / التوفر</th>
                    <th className="p-4 font-bold text-center">الحالة</th>
                    <th className="p-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="text-zinc-200 hover:bg-zinc-800/40">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.arabicName}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-zinc-100 block">{product.arabicName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{product.name}</span>
                      </td>
                      <td className="p-4 font-bold text-amber-400">{product.brand?.name}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.flavors && product.flavors.length > 0 ? (
                            product.flavors.map((pf) => (
                              <span
                                key={pf.id}
                                className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-amber-300 text-[10px] font-mono flex items-center gap-1"
                              >
                                <span>{pf.flavor?.arabicName}</span>
                                <span className="text-zinc-400 font-bold">({pf.stock})</span>
                              </span>
                            ))
                          ) : product.flavor ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px]">
                              {product.flavor.arabicName}
                            </span>
                          ) : (
                            <span className="text-zinc-500">بدون نكهات</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono">{product.cartonQuantity} باكي</td>
                      <td className="p-4 text-left font-mono font-bold text-amber-400">
                        {product.cartonPrice.toLocaleString()} دج
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={product.stock > 0 ? 'success' : 'warning'}>
                            {product.stock > 0 ? `متوفر (${product.stock})` : 'طلب مسبق'}
                          </Badge>
                          <button
                            onClick={() => toggleProductAvailability(product)}
                            className="text-[10px] text-amber-400/90 hover:text-amber-300 underline font-bold"
                          >
                            {product.stock > 0 ? 'جعل طلب مسبق' : 'تفعيل وتوريد (+50)'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={product.active ? 'success' : 'neutral'}>
                          {product.active ? 'نشط' : 'معطل'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleProductActive(product)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.active
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'
                                : 'bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400'
                            }`}
                            title={product.active ? 'تعطيل المنتج' : 'تفعيل المنتج'}
                          >
                            {product.active ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج شيبس جديد'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="الاسم بالعربية *"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
              required
              placeholder="ماستر شيبس 100غ"
            />

            <Input
              label="الاسم باللاتينية / الفرنسية *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Master Chips 100g"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="العلامة التجارية *"
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              required
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.arabicName})
                </option>
              ))}
            </Select>

            <Input
              label="الرابط الفريد (Slug)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="master-chips-100g"
            />
          </div>

          {/* Available Flavors Section (Multi-Select) */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">اختر جميع الأذواق المتوفرة لهذا المنتج</span>
              <label className="block text-xs font-bold text-amber-400">
                النكهات المتوفرة للمنتج (Multi-Select):
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {flavors.map((f) => {
                const isChecked = formData.flavorIds.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      isChecked
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, flavorIds: [...formData.flavorIds, f.id] });
                        } else {
                          setFormData({
                            ...formData,
                            flavorIds: formData.flavorIds.filter((id) => id !== f.id),
                          });
                        }
                      }}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0"
                    />
                    <span>{f.arabicName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="عدد الحبات في الكرتون *"
              value={formData.cartonQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cartonQuantity: Number(e.target.value),
                  unitPrice: Math.round(formData.cartonPrice / (Number(e.target.value) || 1)),
                })
              }
              required
            />

            <Input
              type="number"
              label="إجمالي المخزون المبدئي *"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
            />
          </div>

          {/* Tiered Pricing Section */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>نظام الأسعار حسب رتبة التاجر (Tiered Pricing - دج / كرتونة):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="number"
                label="سعر التجزئة (Retail) *"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                required
                placeholder="1900"
              />

              <Input
                type="number"
                label="سعر الجملة (Wholesale) *"
                value={formData.wholesalePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wholesalePrice: Number(e.target.value),
                    cartonPrice: Number(e.target.value),
                    unitPrice: Math.round(Number(e.target.value) / (formData.cartonQuantity || 20)),
                  })
                }
                required
                placeholder="1800"
              />

              <Input
                type="number"
                label="سعر سوبر جملة (Super) *"
                value={formData.superWholesalePrice}
                onChange={(e) => setFormData({ ...formData, superWholesalePrice: Number(e.target.value) })}
                required
                placeholder="1700"
              />
            </div>
          </div>

          {/* Product Image Upload Section */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-zinc-300">
              صورة المنتج (PNG, JPG, WEBP - الحد الأقصى 5 ميغابايت)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-md">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="معاينة صورة المنتج"
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                      title="حذف الصورة"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-zinc-600">
                    <Package className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] block">لا توجد صورة</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 w-full text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-amber-400/40 text-amber-400 hover:bg-amber-400/10 font-bold"
                >
                  <FileText className="w-4 h-4" />
                  <span>{imagePreview ? 'استبدال الصورة من الكمبيوتر' : 'اختيار صورة من الكمبيوتر'}</span>
                </Button>

                {selectedFile && (
                  <div className="text-[11px] text-zinc-400 font-mono">
                    الملف المحدد: <span className="text-amber-400 font-bold">{selectedFile.name}</span> (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <Input
                  label="أو أدخل رابط صورة مباشر (URL)"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (!selectedFile) setImagePreview(e.target.value || null);
                  }}
                  placeholder="/images/products/master-cheese.png"
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
              placeholder="وصف مكونات وحجم كيس الشيبس..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0"
              />
              <span>منتج نشط في المتجر</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0"
              />
              <span>تمييز كمنتج رائج (Featured)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={saving || uploadingImage}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving || uploadingImage}
              className="font-bold flex items-center gap-1.5"
            >
              {saving || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingImage ? 'جاري رفع الصورة...' : 'جاري الحفظ...'}</span>
                </>
              ) : (
                <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        title="تأكيد حذف المنتج"
        maxWidth="sm"
      >
        <div className="space-y-4 text-right">
          {deleteError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {deleteError}
            </div>
          )}

          <p className="text-xs text-zinc-300">
            هل أنت متأكد من رغبتك في حذف المنتج:{' '}
            <strong className="text-amber-400">{productToDelete?.arabicName}</strong>؟
          </p>

          <p className="text-[11px] text-zinc-500">
            إذا كانت هناك طلبيات أو فواتير سابقة مرتبطة بهذا المنتج، فسيتم إيقافه وتعطيله تلقائياً للحفاظ على سلامة السجلات المالية.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="font-bold flex items-center gap-1.5"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحذف...</span>
                </>
              ) : (
                <span>تأكيد الحذف</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
