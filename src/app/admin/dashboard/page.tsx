'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken, clearAuth } from '@/lib/auth';
import { User } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDiscounts: 0,
    activeDiscounts: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalApplications: 0,
    totalRegistrations: 0,
    totalEnrollments: 0,
    totalBrands: 0,
    totalCompanies: 0,
    totalCategories: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await api.getProfile(token) as User;

        // Check if user is admin
        if (profile.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setUser(profile);

        // Load admin statistics from API
        const [
          usersData,
          discountsData,
          jobsData,
          eventsData,
          coursesData,
          brandsData,
          companiesData,
          categoriesData,
        ] = await Promise.all([
          api.getAllUsers(token, {}) as Promise<any>,
          api.getDiscounts({}) as Promise<any>,
          api.getJobs({}) as Promise<any>,
          api.getEvents({}) as Promise<any>,
          api.getCourses({}) as Promise<any>,
          api.getBrands({}) as Promise<any>,
          api.getCompanies({}) as Promise<any>,
          api.getCategories({}) as Promise<any>,
        ]);

        // Get active counts by fetching filtered data
        const [activeDiscountsData, activeJobsData, activeEventsData, activeCoursesData] = await Promise.all([
          api.getDiscounts({ isActive: true }) as Promise<any>,
          api.getJobs({ isActive: true }) as Promise<any>,
          api.getEvents({ isActive: true }) as Promise<any>,
          api.getCourses({ isActive: true }) as Promise<any>,
        ]);

        setStats({
          totalUsers: usersData.meta?.total || 0,
          activeUsers: usersData.meta?.total || 0, // All users are considered active
          totalDiscounts: discountsData.meta?.total || 0,
          activeDiscounts: activeDiscountsData.meta?.total || 0,
          totalJobs: jobsData.meta?.total || 0,
          activeJobs: activeJobsData.meta?.total || 0,
          totalEvents: eventsData.meta?.total || 0,
          activeEvents: activeEventsData.meta?.total || 0,
          totalCourses: coursesData.meta?.total || 0,
          activeCourses: activeCoursesData.meta?.total || 0,
          totalApplications: 0, // Will be loaded separately
          totalRegistrations: 0, // Will be loaded separately
          totalEnrollments: 0, // Will be loaded separately
          totalBrands: brandsData.meta?.total || 0,
          totalCompanies: companiesData.meta?.total || 0,
          totalCategories: categoriesData.meta?.total || 0,
        });

        // Load recent discounts, jobs, events for activity feed
        const [recentDiscountsData, recentJobsData, recentEventsData] = await Promise.all([
          api.getDiscounts({ sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
          api.getJobs({ sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
          api.getEvents({ sortBy: 'createdAt', sortOrder: 'desc' }) as Promise<any>,
        ]);

        const activities = [
          ...(recentDiscountsData.data || []).map((d: any) => ({
            type: 'discount',
            title: `Yangi chegirma: ${d.title}`,
            time: new Date(d.createdAt),
          })),
          ...(recentJobsData.data || []).map((j: any) => ({
            type: 'job',
            title: `Yangi ish: ${j.title}`,
            time: new Date(j.createdAt),
          })),
          ...(recentEventsData.data || []).map((e: any) => ({
            type: 'event',
            title: `Yangi tadbir: ${e.title}`,
            time: new Date(e.createdAt),
          })),
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        // Silently fail - backend endpoints may not be fully available
        console.warn('Some admin data could not be loaded');
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalDiscounts: 0,
          activeDiscounts: 0,
          totalJobs: 0,
          activeJobs: 0,
          totalEvents: 0,
          activeEvents: 0,
          totalCourses: 0,
          activeCourses: 0,
          totalApplications: 0,
          totalRegistrations: 0,
          totalEnrollments: 0,
          totalBrands: 0,
          totalCompanies: 0,
          totalCategories: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return '🏷️';
      case 'job':
        return '💼';
      case 'event':
        return '📅';
      default:
        return '📌';
    }
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
            <h1 className="text-4xl font-bold text-dark mb-2">Admin Panel</h1>
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
        <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Foydalanuvchilar</p>
              <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>✓ Faol: {stats.activeUsers}</span>
          </div>
        </Card>

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
            <span>• Nofaol: {stats.totalDiscounts - stats.activeDiscounts}</span>
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
            <span>• Nofaol: {stats.totalJobs - stats.activeJobs}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Tadbirlar</p>
              <h3 className="text-3xl font-bold">{stats.totalEvents}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>✓ Faol: {stats.activeEvents}</span>
            <span>• Nofaol: {stats.totalEvents - stats.activeEvents}</span>
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
            <span>• Nofaol: {stats.totalCourses - stats.activeCourses}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Kompaniyalar</p>
              <h3 className="text-3xl font-bold">{stats.totalCompanies}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Hamkorlar</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Brendlar</p>
              <h3 className="text-3xl font-bold">{stats.totalBrands}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Chegirma hamkorlari</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Kategoriyalar</p>
              <h3 className="text-3xl font-bold">{stats.totalCategories}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Barcha turlar</span>
          </div>
        </Card>
      </div>

      {/* System Management */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Tizim boshqaruvi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/users')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Foydalanuvchilar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/health')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tizim Monitoringi
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/categories')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Kategoriyalar
            </div>
          </Button>
        </div>
      </Card>

      {/* Content Management */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Kontent boshqaruvi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/discounts')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Chegirmalar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/jobs')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Ish o'rinlari
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tadbirlar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/courses')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Kurslar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/blog-posts')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </div>
          </Button>
        </div>
      </Card>

      {/* Partner Management */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Hamkorlar boshqaruvi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/companies')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Kompaniyalar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/brands')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Brendlar
            </div>
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/universities')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              Universitetlar
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="mt-6">
        <h2 className="text-2xl font-bold text-dark mb-6">So'nggi faollik</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 py-3 ${
                  index < recentActivity.length - 1 ? 'border-b border-lavender-200' : ''
                }`}
              >
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="font-medium text-dark">{activity.title}</p>
                  <p className="text-sm text-dark/60">{getTimeAgo(activity.time)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Hozircha faollik yo'q</p>
        )}
      </Card>
    </Container>
  );
}
