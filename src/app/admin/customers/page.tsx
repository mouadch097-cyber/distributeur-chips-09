'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Users, Loader2, Phone, MapPin, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const toggleCustomerActive = async (customer: any) => {
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer.id,
          active: !customer.active,
        }),
      });

      if (res.ok) {
        loadCustomers();
      }
    } catch (e) {
      console.error('Failed to toggle customer status', e);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (c.wilaya && c.wilaya.includes(search))
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="دليل الزبائن والمتاجر"
        subtitle="عرض حسابات التجار المسجلين، مواقعهم، وسجل مشترياتهم وتفعيل الحسابات"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="البحث بالاسم، المحل، الهاتف، أو الولاية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <span className="text-xs text-zinc-400">إجمالي التجار: {filtered.length}</span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل دليل الزبائن...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا يوجد زبائن مسجلون حالياً.
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                    <th className="p-4 font-bold">اسم التاجر / الزبون</th>
                    <th className="p-4 font-bold">المتجر / الشركة</th>
                    <th className="p-4 font-bold">الهاتف والولاية</th>
                    <th className="p-4 font-bold text-center">الرتبة التجارية</th>
                    <th className="p-4 font-bold text-center">حالة التوثيق</th>
                    <th className="p-4 font-bold text-center">الطلبيات</th>
                    <th className="p-4 font-bold text-center">الحساب</th>
                    <th className="p-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map((c) => (
                    <tr key={c.id} className="text-zinc-200 hover:bg-zinc-800/40">
                      <td className="p-4">
                        <span className="font-bold text-zinc-100 text-sm block">{c.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block">{c.email}</span>
                      </td>
                      <td className="p-4 text-amber-400 font-bold">{c.companyName || '—'}</td>
                      <td className="p-4">
                        <span className="font-mono text-zinc-200 block">{c.phone || '—'}</span>
                        <span className="text-zinc-400 text-[11px] block">{c.wilaya || '—'}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-300">
                          {c.merchantType === 'SUPER_WHOLESALE'
                            ? 'سوبر جملة'
                            : c.merchantType === 'WHOLESALE'
                            ? 'جملة'
                            : 'تجزئة'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {c.verificationStatus === 'APPROVED' ? (
                          <span className="text-emerald-400 font-bold text-[11px]">معتمد ✓</span>
                        ) : c.verificationStatus === 'REJECTED' ? (
                          <span className="text-red-400 font-bold text-[11px]">مرفوض ✗</span>
                        ) : (
                          <a
                            href="/admin/merchant-verification"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline bg-amber-400/10 px-2 py-0.5 rounded"
                          >
                            <span>قيد المراجعة</span>
                          </a>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono font-bold">{c._count?.orders || 0}</td>
                      <td className="p-4 text-center">
                        <Badge variant={c.active ? 'success' : 'neutral'}>
                          {c.active ? 'نشط' : 'معطل'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleCustomerActive(c)}
                          className={`p-1.5 rounded-lg transition-colors text-xs ${
                            c.active
                              ? 'bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400'
                              : 'bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400'
                          }`}
                          title={c.active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          {c.active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
