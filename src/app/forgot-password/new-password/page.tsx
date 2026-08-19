'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NewPasswordPage() {
  const router = useRouter();
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('chips09_reset_token');
      if (!token) {
        // If user navigated directly without verified OTP, redirect to forgot-password
        router.replace('/forgot-password');
      } else {
        setResetToken(token);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تغيير كلمة المرور.');
      }

      // Clear reset session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('chips09_reset_token');
        sessionStorage.removeItem('chips09_otp_email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-9 shadow-2xl text-right">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-zinc-100">تم تغيير كلمة المرور بنجاح!</h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                تم تحديث كلمة المرور الخاصة بحسابك بأمان. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
              </p>
              <div className="pt-4">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-zinc-100">تعيين كلمة مرور جديدة</h1>
                <p className="text-xs text-zinc-400 mt-2">
                  أدخل كلمة المرور الجديدة القوية لحسابك.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  label="كلمة المرور الجديدة"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />

                <Input
                  type="password"
                  label="تأكيد كلمة المرور الجديدة"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full flex items-center justify-center gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" />
                  <span>تغيير كلمة المرور</span>
                </Button>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
