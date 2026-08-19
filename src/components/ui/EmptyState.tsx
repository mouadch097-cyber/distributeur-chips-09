import React from 'react';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800/80 my-6">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-2">{title}</h3>
      {description && <p className="text-sm text-zinc-400 max-w-md mb-6">{description}</p>}
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
};
