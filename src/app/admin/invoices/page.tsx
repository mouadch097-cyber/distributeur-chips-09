'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { FileText, Printer, Loader2, Search } from 'lucide-react';
import { Invoice } from '@/types';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch (e) {
        console.error('Failed to load invoices:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.order?.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة وسجل الفواتير"
        subtitle="متابعة جميع فواتير المبيعات الصادرة وإمكانية طباعتها"
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="البحث برقم الفاتورة أو الطلبية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <span className="text-xs text-zinc-400">إجمالي الفواتير: {filtered.length}</span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل الفواتير...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا توجد فواتير صادرة حالياً.
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                    <th className="p-4 font-bold">رقم الفاتورة</th>
                    <th className="p-4 font-bold">رقم الطلبية</th>
                    <th className="p-4 font-bold">تاريخ الإصدار</th>
                    <th className="p-4 font-bold text-left">المبلغ</th>
                    <th className="p-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="text-zinc-200 hover:bg-zinc-800/40">
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 font-mono text-zinc-300">
                        {inv.order?.orderNumber}
                      </td>
                      <td className="p-4 text-zinc-400">
                        {new Date(inv.issuedAt).toLocaleDateString('ar-DZ')}
                      </td>
                      <td className="p-4 text-left font-mono font-bold">
                        {inv.amount.toLocaleString()} دج
                      </td>
                      <td className="p-4 text-center">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1.5 mx-auto">
                            <Printer className="w-3.5 h-3.5" />
                            <span>معاينة وطباعة</span>
                          </Button>
                        </Link>
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
