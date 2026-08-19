'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Newspaper, Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle, Bell } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  arabicTitle: string;
  content: string;
  arabicContent: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    arabicTitle: '',
    title: '',
    arabicContent: '',
    content: '',
    published: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadNews = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/news');
      if (res.ok) {
        const data = await res.json();
        setNewsList(data.news || []);
      }
    } catch (e) {
      console.error('Error fetching admin news:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      arabicTitle: '',
      title: '',
      arabicContent: '',
      content: '',
      published: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      arabicTitle: item.arabicTitle,
      title: item.title,
      arabicContent: item.arabicContent,
      content: item.content,
      published: item.published,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      let res;
      if (editingItem) {
        res = await fetch('/api/admin/news', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData,
          }),
        });
      } else {
        res = await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ الإعلان');
      }

      setIsModalOpen(false);
      loadNews();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
    } finally {
      setSaving(false);
    }
  };

  const togglePublishStatus = async (item: NewsItem) => {
    try {
      await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          published: !item.published,
        }),
      });
      loadNews();
    } catch (e) {
      console.error('Toggle publish status error:', e);
    }
  };

  const openDeleteModal = (item: NewsItem) => {
    setItemToDelete(item);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/news?id=${itemToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف الإعلان');
      }

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadNews();
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء محاولة الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="الأخبار والإعلانات الترويجية"
        subtitle="إدارة ونشر التحديثات ومواعيد توزيع الشاحنات والعروض الجديدة للتجار"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إعلان جديد</span>
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل الإعلانات...</span>
          </div>
        ) : newsList.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
            <Bell className="w-10 h-10 text-amber-400/40 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300">لا توجد إعلانات أو أخبار مسجلة حالياً.</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              يمكنك نشر إعلانات وصول شحنات جديدة، تخفيضات، أو مواعيد التوزيع في الولايات.
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="mt-2 text-amber-400 border-amber-400/30">
              + إضافة أول إعلان
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {newsList.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-400/30 transition-colors shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString('ar-DZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <Badge variant={item.published ? 'success' : 'neutral'}>
                      {item.published ? 'منشور' : 'مسودة (مخفي)'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-black text-zinc-100">{item.arabicTitle}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                    {item.arabicContent}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {item.title ? item.title : '—'}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Toggle Published */}
                    <button
                      onClick={() => togglePublishStatus(item)}
                      className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                        item.published
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                      title={item.published ? 'إخفاء الإعلان' : 'نشر الإعلان'}
                    >
                      {item.published ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => openDeleteModal(item)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'تعديل الإعلان الترويجي' : 'إضافة إعلان أو خبر جديد'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="عنوان الإعلان بالعربية *"
            value={formData.arabicTitle}
            onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
            placeholder="مثال: وصول شحنة جديدة من ماستر شيبس بنكهة الجبنة والشواء"
            required
          />

          <Input
            label="العنوان باللاتينية / الفرنسية (اختياري)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="مثال: Arrivage Master Chips Fromage"
          />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              محتوى وتفاصيل الإعلان بالعربية *
            </label>
            <textarea
              rows={5}
              value={formData.arabicContent}
              onChange={(e) => setFormData({ ...formData, arabicContent: e.target.value })}
              placeholder="اكتب تفاصيل الإعلان، شروط العرض، أو مواعيد مرور شاحنات التوزيع في الولايات..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm resize-none"
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-700 text-amber-500 w-4 h-4"
              />
              <span>نشر الإعلان مباشرة للمشاهدة في صفحة الأخبار العامة</span>
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
              حفظ الإعلان
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
            setItemToDelete(null);
          }
        }}
        title="تأكيد حذف الإعلان"
        maxWidth="md"
      >
        <div className="space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-200 mb-1">هل أنت متأكد من حذف هذا الإعلان؟</h4>
              <p className="text-xs text-zinc-300">
                العنوان: <span className="font-bold text-amber-400">{itemToDelete?.arabicTitle}</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                سيتم حذف هذا الإعلان نهائياً من قائمة الأخبار والإعلانات الترويجية.
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
                setItemToDelete(null);
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
