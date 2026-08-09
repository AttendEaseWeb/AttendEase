import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out active:scale-[0.97] hover:scale-[1.02] transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-m3-sys-light-primary hover:bg-m3-sys-light-primary/90 text-m3-sys-light-on-primary dark:bg-m3-sys-dark-primary dark:hover:bg-m3-sys-dark-primary/90 dark:text-m3-sys-dark-on-primary shadow-sm hover:shadow focus:ring-m3-sys-light-primary',
    secondary: 'bg-m3-sys-light-secondary-container hover:bg-m3-sys-light-secondary-container/80 text-m3-sys-light-on-secondary-container dark:bg-m3-sys-dark-secondary-container dark:hover:bg-m3-sys-dark-secondary-container/80 dark:text-m3-sys-dark-on-secondary-container focus:ring-m3-sys-light-secondary',
    outline: 'border border-m3-sys-light-outline dark:border-m3-sys-dark-outline hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 text-m3-sys-light-primary dark:text-m3-sys-dark-primary focus:ring-m3-sys-light-primary',
    danger: 'bg-m3-sys-light-error hover:bg-m3-sys-light-error/90 text-m3-sys-light-on-error dark:bg-m3-sys-dark-error dark:hover:bg-m3-sys-dark-error/90 dark:text-m3-sys-dark-on-error shadow-sm focus:ring-m3-sys-light-error',
    ghost: 'hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 text-m3-sys-light-primary dark:text-m3-sys-dark-primary focus:ring-m3-sys-light-primary',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
