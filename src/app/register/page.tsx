'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { validate, emailSchema, passwordSchema, phoneSchema } from '@/lib/validations';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validate individual fields
    const validationErrors: Record<string, string> = {};

    // Validate email
    const emailResult = validate(emailSchema, formData.email);
    if (!emailResult.success) {
      validationErrors.email = Object.values(emailResult.errors)[0];
    }

    // Validate password
    const passwordResult = validate(passwordSchema, formData.password);
    if (!passwordResult.success) {
      validationErrors.password = Object.values(passwordResult.errors)[0];
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Parollar mos kelmadi';
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneResult = validate(phoneSchema, formData.phone);
      if (!phoneResult.success) {
        validationErrors.phone = Object.values(phoneResult.errors)[0];
      }
    }

    // Validate names
    if (formData.firstName.trim().length < 2) {
      validationErrors.firstName = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak';
    }
    if (formData.lastName.trim().length < 2) {
      validationErrors.lastName = 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
            <div>
              <Input
                label="Ism"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ism"
                required
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Input
                label="Familiya"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Familiya"
                required
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              label="Telefon raqam"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998901234567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <Input
              label="Parol"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <Input
              label="Parolni tasdiqlash"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

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
