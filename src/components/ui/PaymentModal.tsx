'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Button } from './Button';
import { useToast } from './Toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  itemType: string;
  itemId: string;
  itemTitle: string;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  itemType,
  itemId,
  itemTitle,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | null>(null);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!paymentMethod) {
      showToast('Iltimos, to\'lov usulini tanlang', 'error');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('Iltimos, tizimga kiring', 'error');
      return;
    }

    setProcessing(true);

    try {
      let response: any;

      if (paymentMethod === 'click') {
        response = await api.prepareClickPayment(token, {
          amount,
          itemType,
          itemId,
        });
      } else {
        response = await api.preparePaymePayment(token, {
          amount,
          itemType,
          itemId,
        });
      }

      // In a real implementation, this would redirect to the payment provider
      // For now, we'll simulate a successful payment
      if (response.paymentUrl) {
        // Redirect to payment provider
        window.location.href = response.paymentUrl;
      } else {
        // Simulate payment completion
        showToast('To\'lov muvaffaqiyatli amalga oshirildi', 'success');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || 'To\'lovda xatolik yuz berdi', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">To'lov</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Mahsulot:</p>
              <p className="font-semibold">{itemTitle}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {amount.toLocaleString('uz-UZ')} so'm
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">To'lov usulini tanlang:</p>

              {/* Click.uz */}
              <button
                onClick={() => setPaymentMethod('click')}
                className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition ${
                  paymentMethod === 'click'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="8" fill="#00A3E0"/>
                    <text x="24" y="32" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">CLICK</text>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Click.uz</p>
                  <p className="text-xs text-gray-500">Plastik kartalar orqali to'lov</p>
                </div>
                {paymentMethod === 'click' && (
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Payme */}
              <button
                onClick={() => setPaymentMethod('payme')}
                className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition ${
                  paymentMethod === 'payme'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="8" fill="#14B4E7"/>
                    <text x="24" y="32" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">Payme</text>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Payme</p>
                  <p className="text-xs text-gray-500">Humo, UzCard orqali to'lov</p>
                </div>
                {paymentMethod === 'payme' && (
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Bekor qilish
            </Button>
            <Button
              fullWidth
              onClick={handlePayment}
              disabled={!paymentMethod || processing}
            >
              {processing ? 'Kutilmoqda...' : 'To\'lovni amalga oshirish'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            To'lovni amalga oshirish orqali siz{' '}
            <a href="#" className="text-blue-600 hover:underline">
              foydalanish shartlari
            </a>
            ga rozilik bildirasiz
          </p>
        </div>
      </div>
    </>
  );
}
