'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container className="py-20">
      <Card className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-red-500 mb-4"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xatolik yuz berdi
          </h1>
          <p className="text-gray-600 mb-4">
            Kechirasiz, kutilmagan xatolik yuz berdi. Sahifani qayta yuklashga urinib ko'ring.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mb-4">
              Xatolik kodi: {error.digest}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left bg-gray-100 p-4 rounded-lg overflow-auto text-sm mb-4">
              {error.message}
            </pre>
          )}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset}>
            Qayta urinish
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Bosh sahifaga qaytish
          </Button>
        </div>
      </Card>
    </Container>
  );
}
