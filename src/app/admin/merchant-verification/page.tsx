'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building2,
  ShoppingBag,
  Truck,
  Eye,
  Search,
  Filter,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { User, MerchantType, VerificationStatus } from '@/types';

export default function AdminMerchantVerificationPage() {
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const [selectedMerchant, setSelectedMerchant] = useState<User | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [overrideType, setOverrideType] = useState<MerchantType>('WHOLESALE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/merchant-verification?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setMerchants(data.merchants || []);
        setPendingCount(data.pendingCount || 0);
      }
    } catch (e) {
      console.error('Fetch merchants error', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleOpenReview = (merchant: User, action: 'APPROVE' | 'REJECT') => {
    setSelectedMerchant(merchant);
    setReviewAction(action);
    setOverrideType((merchant.merchantType as MerchantType) || 'WHOLESALE');
    setRejectionReason('');
    setActionError('');
  };

  const handleExecuteReview = async () => {
    if (!selectedMerchant || !reviewAction) return;

    if (reviewAction === 'REJECT' && !rejectionReason.trim()) {
      setActionError('يرجى كتابة سبب الرفض لتوضيحه للتاجر');
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch('/api/admin/merchant-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMerchant.id,
          action: reviewAction,
          rejectionReason: rejectionReason.trim(),
          merchantType: overrideType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشلت معالجة الطلب');
      }

      setSelectedMerchant(null);
      setReviewAction(null);
      await fetchMerchants();
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMerchants = merchants.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.companyName?.toLowerCase().includes(q) ||
      m.wilaya?.toLowerCase().includes(q) ||
      m.phone?.includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة وتوثيق التجار (Merchant Verification)"
        subtitle="مراجعة وثائق السجلات التجارية وتفعيل مستويات أسعار الجملة"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'all'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              الكل ({merchants.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-amber-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>قيد المراجعة</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'approved'
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                  : 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              معتمد (Approved)
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-zinc-950 border-red-500'
                  : 'bg-zinc-900 text-red-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              مرفوض (Rejected)
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم، المحل، الولاية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-right"
            />
          </div>
        </div>

        {/* Merchants Table */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 text-center text-amber-400 text-xs font-bold">جاري تحميل طلبات التجار...</div>
          ) : filteredMerchants.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">لا توجد طلبات توثيق تطابق الفلتر المحدد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                    <th className="p-4 font-bold">التاجر / المحل</th>
                    <th className="p-4 font-bold">الاتصال والولاية</th>
                    <th className="p-4 font-bold text-center">نوع التاجر</th>
                    <th className="p-4 font-bold text-center">الحالة</th>
                    <th className="p-4 font-bold text-center">وثيقة السجل</th>
                    <th className="p-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredMerchants.map((merchant) => {
                    const status = merchant.verificationStatus || 'PENDING';
                    const type = merchant.merchantType || 'RETAIL';

                    return (
                      <tr key={merchant.id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* Trader / Store */}
                        <td className="p-4">
                          <span className="font-bold text-zinc-100 block text-sm">{merchant.name}</span>
                          <span className="text-zinc-400 block mt-0.5">{merchant.companyName || 'بدون اسم مؤسسة'}</span>
                          <span className="text-[10px] text-zinc-500 block font-mono">{merchant.email}</span>
                        </td>

                        {/* Location & Phone */}
                        <td className="p-4">
                          <span className="font-mono font-bold text-zinc-200 block">{merchant.phone || '-'}</span>
                          <span className="text-zinc-400 block">{merchant.wilaya || '-'}</span>
                          <span className="text-[10px] text-zinc-500 block truncate max-w-xs">{merchant.address || '-'}</span>
                        </td>

                        {/* Merchant Type */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                              type === 'SUPER_WHOLESALE'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : type === 'WHOLESALE'
                                ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            }`}
                          >
                            {type === 'SUPER_WHOLESALE' ? (
                              <>
                                <Truck className="w-3 h-3" />
                                <span>سوبر جملة</span>
                              </>
                            ) : type === 'WHOLESALE' ? (
                              <>
                                <Building2 className="w-3 h-3" />
                                <span>جملة</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>تجزئة</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : status === 'REJECTED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {status === 'APPROVED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>معتمد</span>
                              </>
                            ) : status === 'REJECTED' ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>مرفوض</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>قيد المراجعة</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Document View */}
                        <td className="p-4 text-center">
                          {merchant.commercialRegisterUrl ? (
                            <a
                              href={merchant.commercialRegisterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold border border-zinc-700 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>عرض السجل</span>
                              <ArrowUpRight className="w-3 h-3 opacity-60" />
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">لم يرفع وثيقة</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenReview(merchant, 'APPROVE')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-[11px] py-1 px-2.5 h-auto"
                            >
                              اعتماد
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReview(merchant, 'REJECT')}
                              className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-[11px] py-1 px-2.5 h-auto"
                            >
                              رفض
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Approval / Rejection Modal */}
      <Modal
        isOpen={!!selectedMerchant && !!reviewAction}
        onClose={() => setSelectedMerchant(null)}
        title={reviewAction === 'APPROVE' ? 'الموافقة على توثيق التاجر' : 'رفض طلب التوثيق'}
        maxWidth="md"
      >
        {selectedMerchant && (
          <div className="space-y-5 text-right text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-zinc-400 block">التاجر: <strong className="text-zinc-100">{selectedMerchant.name}</strong></span>
              <span className="text-zinc-400 block">المحل: <strong className="text-zinc-100">{selectedMerchant.companyName || '-'}</strong> ({selectedMerchant.wilaya})</span>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {reviewAction === 'APPROVE' ? (
              <div className="space-y-3">
                <label className="block text-zinc-300 font-bold">تحديد رتبة التاجر المعتمدة:</label>
                <select
                  value={overrideType}
                  onChange={(e) => setOverrideType(e.target.value as MerchantType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 text-right cursor-pointer"
                >
                  <option value="RETAIL">تاجر تجزئة (Retail) — يرى أسعار التجزئة</option>
                  <option value="WHOLESALE">تاجر جملة (Wholesale) — يرى أسعار الجملة</option>
                  <option value="SUPER_WHOLESALE">تاجر سوبر جملة (Super Wholesale) — يرى أسعار السوبر جملة</option>
                </select>
                <p className="text-[11px] text-zinc-400">
                  بمجرد الضغط على تأكيد، ستظهر لهذا التاجر أسعار الرتبة المحددة تلقائياً ويصبح قادراً على الشراء.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-zinc-300 font-bold">سبب رفض طلب التوثيق *:</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: صورة السجل التجاري غير واضحة، يرجى إعادة رفع نسخة ممسوحة ضوئياً واضحة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-400 text-right resize-none"
                />
                <p className="text-[11px] text-zinc-400">
                  سيتم إرسال هذا السبب كإشعار فوري للتاجر مع إتاحة خيار إعادة تقديم الوثائق له.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant={reviewAction === 'APPROVE' ? 'primary' : 'outline'}
                size="md"
                isLoading={actionLoading}
                onClick={handleExecuteReview}
                className={`flex-1 font-bold ${
                  reviewAction === 'REJECT' ? 'border-red-500/60 text-red-400 hover:bg-red-500/10' : ''
                }`}
              >
                {reviewAction === 'APPROVE' ? 'تأكيد الاعتماد وتفعيل الأسعار' : 'تأكيد الرفض'}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedMerchant(null)}
                disabled={actionLoading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
