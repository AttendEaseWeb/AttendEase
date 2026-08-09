import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col bg-expressive-surface rounded-[28px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 p-5 sm:p-7 overflow-hidden z-10 transform-gpu`}
          >
            <div className="flex items-center justify-between pb-3 sm:pb-4 shrink-0 border-b border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
              <h3 className="text-title-large font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 transition-all duration-200 ease-out hover:rotate-90 hover:scale-110 active:scale-90 transform-gpu cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pt-3 overflow-y-auto max-h-[calc(88vh-4.5rem)] pr-1 custom-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
