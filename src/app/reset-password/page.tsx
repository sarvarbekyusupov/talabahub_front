'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token topilmadi. Iltimos, emailingizdagi havoladan foydalaning.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Parolni tiklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Noto'g'ri havola
              </h1>
              <p className="text-gray-600 mb-6">
                Parolni tiklash tokeni topilmadi. Iltimos, emailingizdagi havoladan foydalaning.
              </p>
              <Link href="/forgot-password">
                <Button fullWidth>
                  Qayta parol tiklash
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Parol muvaffaqiyatli o'zgartirildi!
              </h1>
              <p className="text-gray-600 mb-6">
                Endi yangi parolingiz bilan tizimga kirishingiz mumkin.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Siz avtomatik tarzda login sahifasiga yo'naltirilasiz...
              </p>
              <Link href="/login">
                <Button fullWidth>
                  Login sahifasiga o'tish
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yangi parol o'rnatish
            </h1>
            <p className="text-gray-600">
              Yangi parolingizni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yangi parol
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Kamida 8 ta belgi"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Parolni tasdiqlang
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Parolni qayta kiriting"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'O\'zgartrilmoqda...' : 'Parolni o\'zgartirish'}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
                Login sahifasiga qaytish
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
