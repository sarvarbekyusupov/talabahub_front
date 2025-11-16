'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface NotificationPreferences {
  email: {
    applications: boolean;
    enrollments: boolean;
    reviews: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
  };
  push: {
    applications: boolean;
    enrollments: boolean;
    reviews: boolean;
    systemUpdates: boolean;
  };
  inApp: {
    applications: boolean;
    enrollments: boolean;
    reviews: boolean;
    systemUpdates: boolean;
  };
}

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      applications: true,
      enrollments: true,
      reviews: true,
      systemUpdates: true,
      weeklyDigest: false,
    },
    push: {
      applications: true,
      enrollments: true,
      reviews: false,
      systemUpdates: true,
    },
    inApp: {
      applications: true,
      enrollments: true,
      reviews: true,
      systemUpdates: true,
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // In a real implementation, fetch from API
      const data = await api.request('/users/me/notification-preferences', { token }) as any;
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: 'email' | 'push' | 'inApp', key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.request('/users/me/notification-preferences', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ preferences }),
      });

      showToast('Sozlamalar saqlandi', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Sozlamalarni saqlashda xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">Bildirishnoma sozlamalari</h1>
          <p className="text-lg text-dark/60">
            Qanday bildirishnomalarni olishni tanlang
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Email bildirishnomalar</h2>
                <p className="text-dark/60">Emailga bildirishnoma olish</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Ish arizalari</p>
                  <p className="text-sm text-dark/60">Ish arizalaringiz holati o'zgarganda</p>
                </div>
                <button
                  onClick={() => handleToggle('email', 'applications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email.applications ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email.applications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Kurs ro'yxatdan o'tishlar</p>
                  <p className="text-sm text-dark/60">Kursga ro'yxatdan o'tganingizda</p>
                </div>
                <button
                  onClick={() => handleToggle('email', 'enrollments')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email.enrollments ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email.enrollments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Sharhlar</p>
                  <p className="text-sm text-dark/60">Sizning kontentingizga sharh qoldirilganda</p>
                </div>
                <button
                  onClick={() => handleToggle('email', 'reviews')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email.reviews ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email.reviews ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Tizim yangilanishlari</p>
                  <p className="text-sm text-dark/60">Muhim tizim yangilanishlari haqida</p>
                </div>
                <button
                  onClick={() => handleToggle('email', 'systemUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email.systemUpdates ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-dark mb-1">Haftalik xulosa</p>
                  <p className="text-sm text-dark/60">Haftalik faoliyatingiz xulosasi</p>
                </div>
                <button
                  onClick={() => handleToggle('email', 'weeklyDigest')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email.weeklyDigest ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Push Notifications */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Push bildirishnomalar</h2>
                <p className="text-dark/60">Brauzer orqali bildirishnoma olish</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Ish arizalari</p>
                  <p className="text-sm text-dark/60">Ish arizalaringiz holati o'zgarganda</p>
                </div>
                <button
                  onClick={() => handleToggle('push', 'applications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.push.applications ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.push.applications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Kurs ro'yxatdan o'tishlar</p>
                  <p className="text-sm text-dark/60">Kursga ro'yxatdan o'tganingizda</p>
                </div>
                <button
                  onClick={() => handleToggle('push', 'enrollments')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.push.enrollments ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.push.enrollments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Sharhlar</p>
                  <p className="text-sm text-dark/60">Sizning kontentingizga sharh qoldirilganda</p>
                </div>
                <button
                  onClick={() => handleToggle('push', 'reviews')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.push.reviews ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.push.reviews ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-dark mb-1">Tizim yangilanishlari</p>
                  <p className="text-sm text-dark/60">Muhim tizim yangilanishlari haqida</p>
                </div>
                <button
                  onClick={() => handleToggle('push', 'systemUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.push.systemUpdates ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.push.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Ilova ichidagi bildirishnomalar</h2>
                <p className="text-dark/60">Platforma ichida bildirishnoma olish</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Ish arizalari</p>
                  <p className="text-sm text-dark/60">Ish arizalaringiz holati o'zgarganda</p>
                </div>
                <button
                  onClick={() => handleToggle('inApp', 'applications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inApp.applications ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inApp.applications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Kurs ro'yxatdan o'tishlar</p>
                  <p className="text-sm text-dark/60">Kursga ro'yxatdan o'tganingizda</p>
                </div>
                <button
                  onClick={() => handleToggle('inApp', 'enrollments')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inApp.enrollments ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inApp.enrollments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-lavender-200">
                <div>
                  <p className="font-semibold text-dark mb-1">Sharhlar</p>
                  <p className="text-sm text-dark/60">Sizning kontentingizga sharh qoldirilganda</p>
                </div>
                <button
                  onClick={() => handleToggle('inApp', 'reviews')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inApp.reviews ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inApp.reviews ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-dark mb-1">Tizim yangilanishlari</p>
                  <p className="text-sm text-dark/60">Muhim tizim yangilanishlari haqida</p>
                </div>
                <button
                  onClick={() => handleToggle('inApp', 'systemUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inApp.systemUpdates ? 'bg-brand' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inApp.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
          </Button>
        </div>
      </div>
    </Container>
  );
}
