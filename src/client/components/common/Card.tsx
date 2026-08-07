import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  id,
}) => {
  return (
    <div
      id={id}
      className={`bg-expressive-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-[28px] shadow-expressive-sm p-6 transition-all duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-4 border-b border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 gap-3">
          <div>
            {title && <h3 className="text-title-large text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{title}</h3>}
            {subtitle && <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
        {children}
      </div>
    </div>
  );
};
