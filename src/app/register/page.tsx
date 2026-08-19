'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/lib/auth-context';
import { WILAYAS } from '@/lib/constants';
import { AlertCircle, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    wilaya: WILAYAS[0].name,
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      await refreshUser();
      router.push('/verification');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-right">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4 font-black text-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-zinc-100">تسجيل حساب تاجر جديد</h1>
            <p className="text-xs text-zinc-400 mt-1">
              انضم لشبكة المحلات والموزعين واستفد من أسعار الجملة المباشرة
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل *"
                placeholder="أحمد بلعيد"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                type="email"
                label="البريد الإلكتروني *"
                placeholder="contact@store.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف للتواصل والتأكيد *"
                placeholder="0541655938"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <Input
                label="اسم المتجر / المحل / المؤسسة"
                placeholder="سوبرماركت البركة"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="حي الصنوبر، المحل 04"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="password"
                label="كلمة المرور *"
                placeholder="8 أحرف على الأقل"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                type="password"
                label="تأكيد كلمة المرور *"
                placeholder="أعد إدخال كلمة المرور"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <span>إنشاء الحساب ومتابعة التسوق</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800">
            <span>لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-amber-400 font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
