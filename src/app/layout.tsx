import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Distributeur Chips 09 | منصة توزيع الشيبس بالجملة في الجزائر',
  description: 'الموزع المعتمد لرقائق الشيبس بالجملة في الجزائر (Master Chips, Mahboul, Rifkus, Dadi, Tifouf) - خدمة التوصيل لجميع الولايات للمحلات والمتاجر وتجار التجزئة.',
  keywords: 'شيبس, توزيع شيبس, ماستر شيبس, مهبول, ريكوس, دادي, تيفوف, بيع بالجملة, الجزائر, distributeur chips',
  authors: [{ name: 'Distributeur Chips 09' }],
  openGraph: {
    title: 'Distributeur Chips 09 | منصة توزيع الشيبس بالجملة',
    description: 'الموزع المعتمد لرقائق الشيبس بالجملة في الجزائر - توصيل لجميع الولايات',
    url: BUSINESS_INFO.productionUrl,
    siteName: 'Distributeur Chips 09',
    locale: 'ar_DZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#08080a] text-zinc-100 antialiased selection:bg-amber-400 selection:text-black">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
