'use client';

import { useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          buttonClass: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-md w-full"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleConfirm}
                className={`${styles.buttonClass} text-white flex-1`}
                disabled={isLoading}
              >
                {isLoading ? 'Yuklanmoqda...' : confirmLabel}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Specialized confirm dialogs
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="O'chirishni tasdiqlash"
      message={`Haqiqatan ham "${itemName}" ni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.`}
      confirmLabel="O'chirish"
      cancelLabel="Bekor qilish"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
