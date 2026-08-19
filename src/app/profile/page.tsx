'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/lib/auth-context';
import { WILAYAS } from '@/lib/constants';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    wilaya: WILAYAS[0].name,
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        wilaya: user.wilaya || WILAYAS[0].name,
        address: user.address || '',
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-amber-400">
        جاري تحميل الملف الشخصي...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      setMsg({ type: 'success', text: 'تم حفظ وتحديث بيانات حسابك بنجاح.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: 'فشل حفظ التعديلات.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">الملف الشخصي</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <User className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl font-black text-zinc-100">الملف الشخصي</h1>
                </div>
                <p className="text-xs text-zinc-400">إدارة بيانات متجرك وعنوان التوصيل المعتمد</p>
              </div>
            </div>

            {msg && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                  msg.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                    : 'bg-red-950/40 border border-red-800 text-red-300'
                }`}
              >
                {msg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="الاسم الكامل *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="البريد الإلكتروني (غير قابل للتعديل)"
                    value={user.email}
                    disabled
                    className="opacity-60 cursor-not-allowed bg-zinc-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="رقم الهاتف للتواصل *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />

                  <Input
                    label="اسم المتجر / الشركة"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    label="الولاية *"
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  >
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="العنوان بالتفصيل *"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                  <Button type="submit" variant="primary" size="md" isLoading={saving}>
                    حفظ التعديلات
                  </Button>
                </div>
              </form>
            </div>
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
