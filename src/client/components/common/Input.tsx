import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3.5 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant shrink-0 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={`w-full rounded-md border border-m3-sys-light-outline dark:border-m3-sys-dark-outline bg-transparent px-4 py-3 text-base text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary dark:focus:ring-m3-sys-dark-primary focus:border-m3-sys-light-primary dark:focus:border-m3-sys-dark-primary transition-all ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-m3-sys-light-error dark:border-m3-sys-dark-error focus:ring-m3-sys-light-error dark:focus:ring-m3-sys-dark-error focus:border-m3-sys-light-error dark:focus:border-m3-sys-dark-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-m3-sys-light-error dark:text-m3-sys-dark-error font-medium ml-1 mt-0.5">{error}</p>}
    </div>
  );
};
