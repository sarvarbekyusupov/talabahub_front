'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email yuborildi
              </h1>
              <p className="text-gray-600 mb-6">
                Parolni tiklash bo'yicha yo'riqnoma {email} manziliga yuborildi.
                Iltimos, emailingizni tekshiring.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Email kelmadimi? Spam papkasini tekshiring yoki qayta urinib ko'ring.
              </p>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Login sahifasiga qaytish
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
              Parolni unutdingizmi?
            </h1>
            <p className="text-gray-600">
              Emailingizni kiriting va biz parolni tiklash uchun havola yuboramiz
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Yuborilmoqda...' : 'Parolni tiklash havolasini yuborish'}
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
