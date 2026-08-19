import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'gold' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  children,
  className,
}) => {
  const variants = {
    gold: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
    warning: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
