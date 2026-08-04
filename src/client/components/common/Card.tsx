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
      className={`bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant rounded-3xl shadow-sm p-5 transition-all duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-m3-sys-light-surface-variant dark:border-m3-sys-dark-surface-variant">
          <div>
            {title && <h3 className="text-title-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{title}</h3>}
            {subtitle && <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
        {children}
      </div>
    </div>
  );
};
