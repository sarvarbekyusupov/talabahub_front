'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Tasdiqlash tokeni topilmadi');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await api.verifyEmail(token);
      setStatus('success');
      setMessage('Emailingiz muvaffaqiyatli tasdiqlandi!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Email tasdiqlashda xatolik yuz berdi');
    }
  };

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Email tekshirilmoqda...
                </h1>
                <p className="text-gray-600">
                  Iltimos, kuting
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tasdiqlandi!
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Siz avtomatik tarzda login sahifasiga yo'naltirilasiz...
                </p>
                <Link href="/login">
                  <Button>
                    Login sahifasiga o'tish
                  </Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Xatolik yuz berdi
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-2">
                  <Link href="/login">
                    <Button variant="primary" fullWidth>
                      Login sahifasiga qaytish
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" fullWidth>
                      Qayta ro'yxatdan o'tish
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
