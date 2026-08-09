import React from 'react';
import { motion } from 'motion/react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' | 'teal';
  progress?: number;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'indigo',
  progress,
  id,
}) => {
  const colorBg = {
    indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  };

  const progressBg = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    teal: 'bg-teal-600',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600',
    rose: 'bg-rose-600',
  };

  return (
    <div
      id={id}
      className="bg-expressive-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-[28px] p-5 shadow-expressive-sm hover:shadow-expressive hover:-translate-y-1 transition-all duration-200 transform-gpu group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-title-small font-semibold text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant truncate">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-2xl border ${colorBg[color]} shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 transform-gpu`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-display-small font-bold tracking-tight text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
          {value}
        </span>
        {trend && (
          <span
            className={`text-label-small font-bold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-3 w-full bg-m3-sys-light-surface-variant/40 dark:bg-m3-sys-dark-surface-variant/40 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full ${progressBg[color]}`}
          />
        </div>
      )}

      {subtitle && (
        <p className="text-body-small text-m3-sys-light-on-surface-variant/80 dark:text-m3-sys-dark-on-surface-variant/80 mt-2 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
