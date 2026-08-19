'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/types';
import { BUSINESS_INFO } from '@/lib/constants';
import { Printer, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'تعذر تحميل الفاتورة');
        }
        const data = await res.json();
        setInvoice(data.invoice);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ في الخادم');
      } finally {
        setLoading(false);
      }
    }
    if (invoiceId) loadInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Navigation & Print Actions */}
        <div className="no-print flex items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800">
          <Link
            href="/invoices"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الفواتير</span>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </Button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تجهيز الفاتورة...</span>
          </div>
        ) : error || !invoice ? (
          <div className="p-8 rounded-2xl bg-red-950/30 border border-red-800 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-200 mb-2">{error || 'الفاتورة غير موجودة'}</h3>
          </div>
        ) : (
          /* Printable Invoice Sheet */
          <div className="bg-white text-zinc-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-zinc-200 font-sans">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b-2 border-amber-400">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
                  DISTRIBUTEUR CHIPS 09
                </span>
                <h1 className="text-2xl font-black text-zinc-900">{BUSINESS_INFO.name}</h1>
                <p className="text-xs text-zinc-600 mt-1">توزيع رقائق الشيبس بالجملة - الجزائر</p>
                <p className="text-xs text-zinc-500 font-mono">هاتف: {BUSINESS_INFO.phone} | بريد: {BUSINESS_INFO.email}</p>
              </div>

              <div className="text-right sm:text-left">
                <div className="inline-block bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-300">
                  <span className="text-xs text-zinc-500 block">رقم الفاتورة:</span>
                  <span className="text-lg font-black text-zinc-900 font-mono">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2 font-mono">
                  تاريخ الإصدار: {new Date(invoice.issuedAt).toLocaleDateString('ar-DZ')}
                </p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
              <div>
                <h3 className="font-black text-zinc-900 text-sm mb-2">فاتورة موجهة إلى (الزبون):</h3>
                <p className="font-bold text-zinc-800 text-sm">{invoice.user?.name || invoice.order?.customerName}</p>
                {invoice.user?.companyName && (
                  <p className="text-zinc-600">المحل / المؤسسة: {invoice.user.companyName}</p>
                )}
                <p className="text-zinc-600">رقم الهاتف: {invoice.user?.phone || invoice.order?.phone}</p>
                <p className="text-zinc-600">الولاية: {invoice.user?.wilaya || invoice.order?.wilaya}</p>
                <p className="text-zinc-600">العنوان: {invoice.user?.address || invoice.order?.address}</p>
              </div>

              <div className="text-right sm:text-left">
                <h3 className="font-black text-zinc-900 text-sm mb-2">بيانات الطلبية:</h3>
                <p className="text-zinc-600">رقم الطلبية: <span className="font-mono font-bold text-zinc-800">{invoice.order?.orderNumber}</span></p>
                <p className="text-zinc-600">طريقة الدفع: الدفع عند الاستلام</p>
                <p className="text-zinc-600">حالة الفاتورة: <span className="text-emerald-700 font-bold">صادرة ومؤكدة</span></p>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-6 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700">
                    <th className="p-3 font-bold">#</th>
                    <th className="p-3 font-bold">الصنف / العلامة التجارية</th>
                    <th className="p-3 font-bold text-center">الكراتين</th>
                    <th className="p-3 font-bold text-left">سعر الكرتون</th>
                    <th className="p-3 font-bold text-left">المجموع (دج)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {invoice.order?.items?.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-zinc-800">
                      <td className="p-3 font-mono">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold block">{item.productName}</span>
                        <span className="text-[11px] text-zinc-500">
                          {item.brandName} • كرتون {item.cartonQuantity} قطعة
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{item.cartonsCount}</td>
                      <td className="p-3 text-left font-mono">{item.cartonPrice.toLocaleString()} دج</td>
                      <td className="p-3 text-left font-mono font-bold">{item.totalPrice.toLocaleString()} دج</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Signature */}
            <div className="pt-6 border-t-2 border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-xs text-zinc-500 text-right sm:text-right">
                <p className="font-bold text-zinc-800 mb-1">شروط الاستلام:</p>
                <p>يتم فحص عدد الكراتين وسلامة الأغلفة عند الاستلام من قبل السائق.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 min-w-[240px] text-right">
                <span className="text-xs text-zinc-600 block">المبلغ الإجمالي المستحق:</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {invoice.amount.toLocaleString()} دج
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
