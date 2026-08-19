'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/lib/auth-context';
import { WILAYAS } from '@/lib/constants';
import {
  ShieldCheck,
  Building2,
  ShoppingBag,
  Truck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function VerificationPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();

  const [merchantType, setMerchantType] = useState<'RETAIL' | 'WHOLESALE' | 'SUPER_WHOLESALE'>('WHOLESALE');
  const [companyName, setCompanyName] = useState('');
  const [wilaya, setWilaya] = useState(WILAYAS[0].name);
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      if (user.merchantType) setMerchantType(user.merchantType as any);
      if (user.companyName) setCompanyName(user.companyName);
      if (user.wilaya) setWilaya(user.wilaya);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الملف يتجاوز 10 ميغابايت');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('يرجى اختيار صورة صالحة (JPG, PNG, WebP) أو ملف PDF');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedFile) {
      setError('يرجى إرفاق صورة أو ملف السجل التجاري');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('merchantType', merchantType);
      formData.append('companyName', companyName);
      formData.append('wilaya', wilaya);
      formData.append('address', address);
      formData.append('document', selectedFile);

      const res = await fetch('/api/merchant/verification', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال طلب التوثيق');
      }

      setSuccessMsg(data.message || 'تم إرسال طلب التوثيق بنجاح');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center text-amber-400 text-sm">جاري تحميل بيانات الحساب...</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
        <Navbar />
        <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 px-4 sm:px-8">
          <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold">تسجيل الدخول مطلوب</h2>
          <p className="text-xs text-zinc-400">
            يرجى تسجيل الدخول أو إنشاء حساب تاجر للوصول إلى استمارة توثيق النشاط التجاري.
          </p>
          <Link href="/login?redirect=/verification">
            <Button variant="primary" size="md" className="w-full min-h-[44px]">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = user.verificationStatus || 'PENDING';

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full text-right">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>بوابة التوثيق التجاري للتجار</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
            توثيق <span className="text-amber-400">النشاط التجاري ورتبة التاجر</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            منصة Distributeur Chips 09 مخصصة للتجار والموزعين. يتيح توثيق السجل التجاري الوصول المباشر لأسعار الجملة الرسمية وتقديم الطلبيات.
          </p>
        </div>

        {/* Current Status Cards */}
        {status === 'APPROVED' && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-base font-black text-emerald-300">حسابك التجاري موثق ومعتمد ✓</h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                تم اعتماد حسابك التجاري كـ (
                <strong className="text-amber-300">
                  {user.merchantType === 'SUPER_WHOLESALE'
                    ? 'تاجر سوبر جملة'
                    : user.merchantType === 'WHOLESALE'
                    ? 'تاجر جملة'
                    : 'تاجر تجزئة'}
                </strong>
                ). جميع أسعار الجملة مفعلة في حسابك ويمكنك تقديم طلبياتك مباشرة.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/catalog">
                  <Button variant="primary" size="sm" className="flex items-center gap-1 min-h-[44px]">
                    <span>تصفح الكتالوج والأسعار</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                {user.commercialRegisterUrl && (
                  <a
                    href={user.commercialRegisterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-zinc-100 min-h-[44px]"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>عرض الوثيقة المعتمدة</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'PENDING' && user.commercialRegisterUrl && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-amber-950/40 border border-amber-800 text-amber-200 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
            <Clock className="w-8 h-8 text-amber-400 shrink-0 mt-1 animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-base font-black text-amber-300">طلب التوثيق قيد المراجعة حالياً</h3>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                تم استلام وثائق السجل التجاري بنجاح وهي قيد التدقيق من قبل إدارة المبيعات. ستتم مراجعة الطلب وتفعيل أسعار الجملة خلال أقل من 24 ساعة.
              </p>
              <div className="pt-1 text-[11px] text-zinc-400">
                الرتبة المطلوبة:{' '}
                <span className="font-bold text-amber-400">
                  {merchantType === 'SUPER_WHOLESALE'
                    ? 'تاجر سوبر جملة'
                    : merchantType === 'WHOLESALE'
                    ? 'تاجر جملة'
                    : 'تاجر تجزئة'}
                </span>{' '}
                • المحل: {companyName || user.companyName || 'غير محدد'}
              </div>
            </div>
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-red-950/40 border border-red-800 text-red-200 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
            <XCircle className="w-8 h-8 text-red-400 shrink-0 mt-1" />
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-black text-red-300">تم رفض طلب التوثيق السابق</h3>
              <p className="text-xs text-red-200/90 leading-relaxed">
                سبب الرفض: <strong className="text-zinc-100">{user.rejectionReason || 'الوثائق غير واضحة أو غير مطابقة.'}</strong>
              </p>
              <p className="text-[11px] text-zinc-300">
                يمكنك تصحيح البيانات وإعادة رفع صورة واضحة من السجل التجاري عبر الاستمارة أدناه.
              </p>
            </div>
          </div>
        )}

        {/* Verification Form (Shown if not approved or if re-submitting) */}
        {status !== 'APPROVED' && (
          <form onSubmit={handleSubmit} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-8 lg:p-10 space-y-8 shadow-2xl">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Step 1: Choose Merchant Type */}
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-start gap-2 text-zinc-100 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>اختر نوع ونشاطك التجاري:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Retail Card */}
                <button
                  type="button"
                  onClick={() => setMerchantType('RETAIL')}
                  className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[120px] ${
                    merchantType === 'RETAIL'
                      ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <ShoppingBag className={`w-6 h-6 mb-3 ${merchantType === 'RETAIL' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <h3 className="font-bold text-sm text-zinc-100">تاجر تجزئة</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      محلات المواد الغذائية، السوبرماركت، والأكشاك (الطلبيات من 5 إلى 20 كرتونة).
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-amber-400 block font-mono">
                    {merchantType === 'RETAIL' ? '● محدد' : 'اختيار'}
                  </span>
                </button>

                {/* Wholesale Card */}
                <button
                  type="button"
                  onClick={() => setMerchantType('WHOLESALE')}
                  className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[120px] ${
                    merchantType === 'WHOLESALE'
                      ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <Building2 className={`w-6 h-6 mb-3 ${merchantType === 'WHOLESALE' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <h3 className="font-bold text-sm text-zinc-100">تاجر جملة</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      مستودعات الجملة ونقاط التوزيع المتوسطة (الطلبيات من 20 إلى 100 كرتونة).
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-amber-400 block font-mono">
                    {merchantType === 'WHOLESALE' ? '● محدد (موصى به)' : 'اختيار'}
                  </span>
                </button>

                {/* Super Wholesale Card */}
                <button
                  type="button"
                  onClick={() => setMerchantType('SUPER_WHOLESALE')}
                  className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[120px] ${
                    merchantType === 'SUPER_WHOLESALE'
                      ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <Truck className={`w-6 h-6 mb-3 ${merchantType === 'SUPER_WHOLESALE' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <h3 className="font-bold text-sm text-zinc-100">تاجر سوبر جملة</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      الموزعون الكبار والمستودعات الإقليمية (الطلبيات بأحجام شاحنات كاملة +100 كرتونة).
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-amber-400 block font-mono">
                    {merchantType === 'SUPER_WHOLESALE' ? '● محدد' : 'اختيار'}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Merchant & Store Details */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-start gap-2 text-zinc-100 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>بيانات المحل أو المؤسسة:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="اسم المحل التجاري أو المؤسسة *"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="مؤسسة النور لتوزيع المواد الغذائية"
                  className="w-full"
                />

                <Select
                  label="الولاية *"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  required
                  className="w-full"
                >
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </Select>

                <div className="sm:col-span-2">
                  <Input
                    label="العنوان الدقيق للمحل أو المستودع *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="حي المستقبل، طريق الشفة، المستودع رقم 04"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Upload Commercial Register */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-start gap-2 text-zinc-100 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span className="leading-snug">رفع وثيقة السجل التجاري (Registre de Commerce) *:</span>
              </div>

              <div className="border-2 border-dashed border-zinc-800 hover:border-amber-400/60 rounded-3xl p-5 sm:p-8 text-center transition-colors bg-zinc-950/60">
                <input
                  type="file"
                  id="commercial-register-file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label htmlFor="commercial-register-file" className="cursor-pointer block space-y-3">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto stroke-[1.5]" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-200 block">
                      انقر لاختيار ملف السجل التجاري أو اسحبه هنا
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      الصيغ المدعومة: JPG, PNG, WebP, PDF (الحد الأقصى 10 ميغابايت)
                    </span>
                  </div>
                </label>

                {selectedFile && (
                  <div className="mt-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 inline-flex items-center gap-3 text-xs text-amber-400 font-bold max-w-full overflow-hidden">
                    <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}

                {filePreview && (
                  <div className="mt-4 max-w-xs mx-auto rounded-xl overflow-hidden border border-zinc-800">
                    <img src={filePreview} alt="معاينة السجل" className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-zinc-800">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 shadow-xl shadow-amber-500/10 min-h-[44px]"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>إرسال طلب التوثيق التجاري للمراجعة</span>
              </Button>
              <p className="text-center text-[11px] text-zinc-500 mt-3">
                بياناتك ووثائقك محفوظة بشكل مشفر وسري، ولا يمكن لأي طرف خارجي الاطلاع عليها.
              </p>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
