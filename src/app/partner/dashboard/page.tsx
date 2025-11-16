'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken, clearAuth } from '@/lib/auth';
import { User } from '@/types';

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDiscounts: 0,
    activeJobs: 0,
    activeCourses: 0,
    totalViews: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    const loadPartnerData = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await api.getProfile(token) as User;

        // Check if user is partner
        if (profile.role !== 'partner') {
          router.push('/dashboard');
          return;
        }

        setUser(profile);

        // Load partner statistics from API
        try {
          const partnerStats = await api.getPartnerStats(token) as any;
          setStats({
            activeDiscounts: partnerStats.activeDiscounts || 0,
            activeJobs: partnerStats.activeJobs || 0,
            activeCourses: partnerStats.activeCourses || 0,
            totalViews: partnerStats.totalViews || 0,
            totalApplications: partnerStats.totalApplications || 0,
          });
        } catch (err) {
          console.error('Error loading partner stats:', err);
          // Use default values on error
          setStats({
            activeDiscounts: 0,
            activeJobs: 0,
            activeCourses: 0,
            totalViews: 0,
            totalApplications: 0,
          });
        }
      } catch (error) {
        console.error('Error loading partner data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadPartnerData();
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Hamkor Paneli</h1>
            <p className="text-lg text-dark/60">
              Xush kelibsiz, {user.firstName} {user.lastName}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Chiqish
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-accent to-accent-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Faol chegirmalar</p>
              <h3 className="text-3xl font-bold">{stats.activeDiscounts}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Faol ish o'rinlari</p>
              <h3 className="text-3xl font-bold">{stats.activeJobs}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Faol kurslar</p>
              <h3 className="text-3xl font-bold">{stats.activeCourses}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Jami ko'rishlar</p>
              <h3 className="text-3xl font-bold">{stats.totalViews}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Jami arizalar</p>
              <h3 className="text-3xl font-bold">{stats.totalApplications}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Tezkor harakatlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button fullWidth variant="primary">
            Yangi chegirma e'lon qilish
          </Button>
          <Button fullWidth variant="primary">
            Yangi ish o'rni e'lon qilish
          </Button>
          <Button fullWidth variant="primary">
            Yangi kurs qo'shish
          </Button>
        </div>
      </Card>

      {/* My Offerings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Mening chegirmalarim</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-lavender-200">
              <div>
                <p className="font-medium text-dark">30% chegirma IT kurslarga</p>
                <p className="text-sm text-dark/60">Amal qiladi: 2024-12-31</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Faol</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-lavender-200">
              <div>
                <p className="font-medium text-dark">20% chegirma barcha kurslar</p>
                <p className="text-sm text-dark/60">Amal qiladi: 2024-11-30</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Faol</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark">15% chegirma yangi talabalar</p>
                <p className="text-sm text-dark/60">Amal qiladi: 2024-10-31</p>
              </div>
              <span className="text-red-600 text-sm font-medium">Tugagan</span>
            </div>
          </div>
          <Button variant="ghost" fullWidth className="mt-4">
            Barchasini ko'rish
          </Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Mening ish o'rinlarim</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-lavender-200">
              <div>
                <p className="font-medium text-dark">Frontend Developer</p>
                <p className="text-sm text-dark/60">8 ta ariza</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Faol</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-lavender-200">
              <div>
                <p className="font-medium text-dark">Marketing Specialist</p>
                <p className="text-sm text-dark/60">5 ta ariza</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Faol</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark">Data Analyst Intern</p>
                <p className="text-sm text-dark/60">12 ta ariza</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Faol</span>
            </div>
          </div>
          <Button variant="ghost" fullWidth className="mt-4">
            Barchasini ko'rish
          </Button>
        </Card>
      </div>
    </Container>
  );
}
