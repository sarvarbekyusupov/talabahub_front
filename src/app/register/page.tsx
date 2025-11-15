'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    setLoading(true);

    try {
      await api.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="py-20">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ro'yxatdan o'tish
          </h1>
          <p className="text-gray-600">
            TALABA HUB ga qo'shiling va imtiyozlardan foydalaning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ism"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ism"
              required
            />

            <Input
              label="Familiya"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Familiya"
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />

          <Input
            label="Telefon raqam"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+998901234567"
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            label="Parolni tasdiqlash"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <div className="text-xs text-gray-500">
            Ro'yxatdan o'tish orqali siz{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Foydalanish shartlari
            </Link>{' '}
            va{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Maxfiylik siyosati
            </Link>
            ga rozilik bildirasiz.
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Ro'yxatdan o'tish
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Kirish
          </Link>
        </div>
      </Card>
    </Container>
  );
}
