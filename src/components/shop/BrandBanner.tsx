import React from 'react';
import Link from 'next/link';
import { REAL_BRANDS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

export const BrandBanner: React.FC = () => {
  return (
    <section className="py-12 bg-zinc-950/60 border-y border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-right">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
              تسوق حسب <span className="text-amber-400">العلامة التجارية</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              نوفر المنتجات الأصلية المعتمدة مباشرة من المصانع الجزائرية
            </p>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>عرض جميع المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {REAL_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/catalog?brand=${brand.slug}`}
              className="group p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/60 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3 group-hover:border-amber-400/50 transition-colors">
                <span className="text-xs font-black text-amber-400 tracking-tighter uppercase">
                  {brand.name.slice(0, 3)}
                </span>
              </div>
              <h3 className="text-base font-black text-zinc-100 group-hover:text-amber-400 transition-colors">
                {brand.name}
              </h3>
              <span className="text-xs text-zinc-500 mt-0.5">{brand.arabicName}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
