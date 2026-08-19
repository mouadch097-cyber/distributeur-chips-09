'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('رمز إعادة التعيين مفقود من الرابط.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن لا تقل عن 8 أحرف.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إعادة تعيين كلمة المرور');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-right">
      {/* Header */}
      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>

      <h1 className="text-2xl font-black text-zinc-100 text-center mb-2">
        تعيين كلمة مرور جديدة
      </h1>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-100">
            تم تغيير كلمة المرور بنجاح!
          </p>
          <p className="text-xs text-zinc-400">
            يمكنك الآن تسجيل الدخول إلى حسابك باستخدام كلمة المرور الجديدة.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                الانتقال لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="كلمة المرور الجديدة *"
            placeholder="8 أحرف على الأقل"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            label="تأكيد كلمة المرور الجديدة *"
            placeholder="أعد إدخال كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            حفظ كلمة المرور الجديدة
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs text-zinc-400">جاري التحميل...</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
