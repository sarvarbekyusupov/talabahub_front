'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { setToken, setRefreshToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = await api.login(email, password);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Kirish xato. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="py-20">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kirish</h1>
          <p className="text-gray-600">
            TALABA HUB hisobingizga kiring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          <Input
            label="Parol"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-600">Eslab qolish</span>
            </label>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Parolni unutdingizmi?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Kirish
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Hisobingiz yo'qmi?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </Card>
    </Container>
  );
}
