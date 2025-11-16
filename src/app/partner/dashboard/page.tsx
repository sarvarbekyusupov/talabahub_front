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
    totalDiscounts: 0,
    activeDiscounts: 0,
    pendingDiscounts: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalCourses: 0,
    activeCourses: 0,
    pendingCourses: 0,
    totalViews: 0,
    totalApplications: 0,
    totalEnrollments: 0,
  });
  const [recentDiscounts, setRecentDiscounts] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

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
            totalDiscounts: partnerStats.totalDiscounts || 0,
            activeDiscounts: partnerStats.activeDiscounts || 0,
            pendingDiscounts: partnerStats.pendingDiscounts || 0,
            totalJobs: partnerStats.totalJobs || 0,
            activeJobs: partnerStats.activeJobs || 0,
            pendingJobs: partnerStats.pendingJobs || 0,
            totalCourses: partnerStats.totalCourses || 0,
            activeCourses: partnerStats.activeCourses || 0,
            pendingCourses: partnerStats.pendingCourses || 0,
            totalViews: partnerStats.totalViews || 0,
            totalApplications: partnerStats.totalApplications || 0,
            totalEnrollments: partnerStats.totalEnrollments || 0,
          });
        } catch (err) {
          console.error('Error loading partner stats:', err);
        }

        // Load partner's recent offerings
        try {
          // Assuming we need to get partner's content by filtering
          // This would ideally be a dedicated endpoint in the backend
          const [discountsData, jobsData, coursesData] = await Promise.all([
            api.getDiscounts({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
            api.getJobs({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
            api.getCourses({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
          ]);

          setRecentDiscounts(discountsData.data || []);
          setRecentJobs(jobsData.data || []);
          setRecentCourses(coursesData.data || []);
        } catch (err) {
          console.error('Error loading recent offerings:', err);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-accent to-accent-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Chegirmalar</p>
              <h3 className="text-3xl font-bold">{stats.totalDiscounts}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>✓ Faol: {stats.activeDiscounts}</span>
            <span>• Kutilmoqda: {stats.pendingDiscounts}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Ish o'rinlari</p>
              <h3 className="text-3xl font-bold">{stats.totalJobs}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>✓ Faol: {stats.activeJobs}</span>
            <span>• Kutilmoqda: {stats.pendingJobs}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Kurslar</p>
              <h3 className="text-3xl font-bold">{stats.totalCourses}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>✓ Faol: {stats.activeCourses}</span>
            <span>• Kutilmoqda: {stats.pendingCourses}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Kurs talabalar</p>
              <h3 className="text-3xl font-bold">{stats.totalEnrollments}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Ro'yxatga olingan</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Ko'rishlar</p>
              <h3 className="text-3xl font-bold">{stats.totalViews}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Barcha takliflar</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Ish arizalari</p>
              <h3 className="text-3xl font-bold">{stats.totalApplications}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Jami topshirildi</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Tasdiqlash kutilmoqda</p>
              <h3 className="text-3xl font-bold">
                {stats.pendingDiscounts + stats.pendingJobs + stats.pendingCourses}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Admin tasdiqlashi</span>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Tezkor harakatlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button fullWidth variant="primary" onClick={() => router.push('/partner/discounts/create')}>
            Yangi chegirma e'lon qilish
          </Button>
          <Button fullWidth variant="primary" onClick={() => router.push('/partner/jobs/create')}>
            Yangi ish o'rni e'lon qilish
          </Button>
          <Button fullWidth variant="primary" onClick={() => router.push('/partner/courses/create')}>
            Yangi kurs qo'shish
          </Button>
        </div>
      </Card>

      {/* My Offerings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">So'nggi chegirmalarim</h2>
          {recentDiscounts.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentDiscounts.map((discount, index) => (
                  <div
                    key={discount.id}
                    className={`flex items-center justify-between py-3 ${
                      index < recentDiscounts.length - 1 ? 'border-b border-lavender-200' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-dark line-clamp-1">{discount.title}</p>
                      <p className="text-sm text-dark/60">
                        {discount.discount}% chegirma
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        discount.isActive ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {discount.isActive ? 'Faol' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                fullWidth
                className="mt-4"
                onClick={() => router.push('/partner/discounts')}
              >
                Barchasini ko'rish
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">Hali chegirmalar yo'q</p>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">So'nggi ish o'rinlarim</h2>
          {recentJobs.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`flex items-center justify-between py-3 ${
                      index < recentJobs.length - 1 ? 'border-b border-lavender-200' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-dark line-clamp-1">{job.title}</p>
                      <p className="text-sm text-dark/60">{job.location}</p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        job.isActive ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {job.isActive ? 'Faol' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                fullWidth
                className="mt-4"
                onClick={() => router.push('/partner/jobs')}
              >
                Barchasini ko'rish
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">Hali ish o'rinlari yo'q</p>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">So'nggi kurslarim</h2>
          {recentCourses.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className={`flex items-center justify-between py-3 ${
                      index < recentCourses.length - 1 ? 'border-b border-lavender-200' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-dark line-clamp-1">{course.title}</p>
                      <p className="text-sm text-dark/60">
                        {course.price?.toLocaleString()} so'm
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        course.isActive ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {course.isActive ? 'Faol' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                fullWidth
                className="mt-4"
                onClick={() => router.push('/partner/courses')}
              >
                Barchasini ko'rish
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">Hali kurslar yo'q</p>
          )}
        </Card>
      </div>
    </Container>
  );
}
