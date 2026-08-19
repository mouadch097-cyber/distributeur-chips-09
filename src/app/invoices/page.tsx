'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Invoice } from '@/types';
import { FileText, Printer, Loader2 } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch (e) {
        console.error('Error fetching invoices:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">فواتيري</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <FileText className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl font-black text-zinc-100">فواتيري</h1>
                </div>
                <p className="text-xs text-zinc-400">عرض وتحميل وطباعة فواتير طلبيات الجملة الصادرة</p>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-amber-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <span className="text-xs text-zinc-400">جاري تحميل الفواتير...</span>
              </div>
            ) : invoices.length === 0 ? (
              <EmptyState
                title="لا توجد فواتير حالياً."
                description="يتم إصدار الفاتورة تلقائياً عند إتمام أي طلبية جملة على المنصة."
                actionText="تصفح الكتالوج والطلب"
                actionHref="/catalog"
                icon={<FileText className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => {
                  const formattedDate = new Date(inv.issuedAt).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={inv.id}
                      className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-zinc-100 block text-sm">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-xs text-zinc-400">
                            تاريخ الإصدار: {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                        <div className="text-right sm:text-left">
                          <span className="text-[11px] text-zinc-500 block">المبلغ الإجمالي:</span>
                          <span className="text-lg font-black text-amber-400 font-mono">
                            {inv.amount.toLocaleString()} دج
                          </span>
                        </div>

                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5" />
                            <span>عرض وطباعة</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
