'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const notifications: any[] = [];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">الإشعارات</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Bell className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl font-black text-zinc-100">الإشعارات</h1>
                </div>
                <p className="text-xs text-zinc-400">تحديثات حالة الطلبيات والتوريد والعروض الخاصة</p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <EmptyState
                title="لا توجد إشعارات حالياً."
                description="سيتم إرسال إشعارات فورية عند تحديث حالة طلبياتك أو خروج شاحنة التوزيع إلى متجرك."
                actionText="متابعة طلبياتي"
                actionHref="/orders"
                icon={<Bell className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{notif.title}</h4>
                      <p className="text-xs text-zinc-400">{notif.message}</p>
                    </div>
                  </div>
                ))}
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
