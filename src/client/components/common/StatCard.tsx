import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'indigo',
  id,
}) => {
  const colorBg = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
  };

  return (
    <div
      id={id}
      className="bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant rounded-3xl p-5 shadow-sm hover:shadow transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-label-large font-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
          {title}
        </span>
        <div className={`p-3 rounded-2xl ${colorBg[color]}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-headline-large font-normal text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{value}</span>
        {trend && (
          <span
            className={`text-label-medium font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container'
                : 'bg-m3-sys-light-error-container dark:bg-m3-sys-dark-error-container text-m3-sys-light-on-error-container dark:text-m3-sys-dark-on-error-container'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1.5">{subtitle}</p>}
    </div>
  );
};
