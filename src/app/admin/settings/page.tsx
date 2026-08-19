'use client';

import React from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { BUSINESS_INFO } from '@/lib/constants';
import { Settings, Mail, Phone, MapPin, Globe, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إعدادات النظام والمنصة"
        subtitle="بيانات المؤسسة المعتمدة، قنوات الاتصال، وإعدادات الربط التقني"
      />

      <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-4xl">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-zinc-100 pb-3 border-b border-zinc-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>بيانات المؤسسة المعتمدة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-zinc-500 block mb-1">اسم المؤسسة:</span>
              <span className="font-bold text-zinc-100 text-sm">{BUSINESS_INFO.name}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">البريد الإلكتروني المعتمد:</span>
              <span className="font-mono text-amber-400 font-bold">{BUSINESS_INFO.email}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">رقم الهاتف / واتساب:</span>
              <span className="font-mono text-zinc-100 font-bold">{BUSINESS_INFO.phone}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">رابط الإنتاج الرسمي:</span>
              <span className="font-mono text-zinc-300">{BUSINESS_INFO.productionUrl}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-zinc-500 block mb-1">نطاق التغطية والتوزيع:</span>
              <span className="text-zinc-200">{BUSINESS_INFO.location}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-black text-zinc-100 pb-3 border-b border-zinc-800">
            حالة الربط والخدمات السحابية
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-300">قاعدة البيانات: Neon PostgreSQL (Prisma ORM)</span>
              <span className="text-emerald-400 font-bold">متصل</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-300">خدمة البريد الإلكتروني: Gmail SMTP (Nodemailer)</span>
              <span className="text-emerald-400 font-bold">مفعل في الخادم</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-300">نظام المصادقة: JWT + HttpOnly Cookies + Google OAuth</span>
              <span className="text-emerald-400 font-bold">آمن ومحمي</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
