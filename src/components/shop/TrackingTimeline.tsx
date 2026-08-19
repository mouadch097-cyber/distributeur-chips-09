import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, Check, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

interface TrackingTimelineProps {
  status: OrderStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

const STEPS = [
  { key: 'pending', label: 'طلب جديد', desc: 'تم استلام طلبكم في النظام', icon: Clock },
  { key: 'confirmed', label: 'تم التأكيد', desc: 'تمت مراجعة وتأكيد تفاصيل الطلبية', icon: CheckCircle2 },
  { key: 'preparing', label: 'قيد التحضير', desc: 'تجهيز الكراتين وتحميل الشاحنة', icon: PackageCheck },
  { key: 'out_for_delivery', label: 'خرج للتوصيل', desc: 'الشاحنة في طريقها إلى عنوانكم', icon: Truck },
  { key: 'delivered', label: 'تم التسليم', desc: 'تم تسليم الطلبية واستلام الفاتورة', icon: Check },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/50 flex items-center gap-4 text-right">
        <div className="w-12 h-12 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center text-red-400">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-red-200">الطلبية ملغاة</h4>
          <p className="text-xs text-red-400/80 mt-1">تم إلغاء هذه الطلبية من قبل الإدارة أو بناءً على طلبكم.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-right">
      <h3 className="text-base font-black text-zinc-100 mb-6">مراحل تتبع الطلبية</h3>
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex-1 flex md:flex-col items-center gap-4 md:gap-3 relative z-10">
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-zinc-950 ring-4 ring-amber-400/20 font-black shadow-lg shadow-amber-500/20'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-950 text-zinc-600 border border-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text */}
              <div className="text-right md:text-center">
                <h4
                  className={`text-xs sm:text-sm font-bold ${
                    isCurrent
                      ? 'text-amber-400 font-black'
                      : isDone
                      ? 'text-zinc-200'
                      : 'text-zinc-600'
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[140px] leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
