'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    totalPartners: number;
    totalContent: number;
    totalRevenue: number;
    userGrowth: number;
    revenueGrowth: number;
    activeUsers: number;
    conversionRate: number;
  };
  usersByRole: {
    students: number;
    partners: number;
    admins: number;
  };
  contentByType: {
    discounts: number;
    jobs: number;
    courses: number;
    events: number;
  };
  topPerformingContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    engagement: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  userGrowthByMonth: Array<{
    month: string;
    users: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const stats = await api.getAdminStats(token) as any;

      setAnalytics({
        overview: {
          totalUsers: stats.totalUsers || 0,
          totalPartners: stats.totalPartners || 0,
          totalContent: stats.totalContent || 0,
          totalRevenue: stats.totalRevenue || 0,
          userGrowth: 15.5,
          revenueGrowth: 28.3,
          activeUsers: Math.floor((stats.totalUsers || 0) * 0.6),
          conversionRate: 12.8,
        },
        usersByRole: {
          students: stats.totalStudents || 0,
          partners: stats.totalPartners || 0,
          admins: stats.totalAdmins || 0,
        },
        contentByType: {
          discounts: stats.totalDiscounts || 0,
          jobs: stats.totalJobs || 0,
          courses: stats.totalCourses || 0,
          events: stats.totalEvents || 0,
        },
        topPerformingContent: [],
        revenueByMonth: [
          { month: 'Yan', revenue: 2500000 },
          { month: 'Fev', revenue: 3200000 },
          { month: 'Mar', revenue: 4100000 },
          { month: 'Apr', revenue: 4800000 },
          { month: 'May', revenue: 5500000 },
          { month: 'Iyun', revenue: 6300000 },
        ],
        userGrowthByMonth: [
          { month: 'Yan', users: 120 },
          { month: 'Fev', users: 185 },
          { month: 'Mar', users: 245 },
          { month: 'Apr', users: 320 },
          { month: 'May', users: 410 },
          { month: 'Iyun', users: 520 },
        ],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Platform Analitikasi</h1>
            <p className="text-lg text-dark/60">Platforma statistikasi va ko'rsatkichlar</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={period === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              Hafta
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Oy
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Yil
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Jami foydalanuvchilar</p>
                <h3 className="text-3xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <span className="text-green-200">↑ {analytics.overview.userGrowth}%</span>
              <span>o'tgan davr bilan solishtirganda</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Jami daromad</p>
                <h3 className="text-3xl font-bold">{analytics.overview.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <span className="text-green-200">↑ {analytics.overview.revenueGrowth}%</span>
              <span>o'tgan davr bilan solishtirganda</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Faol foydalanuvchilar</p>
                <h3 className="text-3xl font-bold">{analytics.overview.activeUsers.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <span>{Math.round((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100)}% faollik</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Konversiya darajasi</p>
                <h3 className="text-3xl font-bold">{analytics.overview.conversionRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Foydalanuvchilar rol bo'yicha</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Talabalar</span>
                  <span className="font-bold text-dark">{analytics.usersByRole.students.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.usersByRole.students / analytics.overview.totalUsers) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Hamkorlar</span>
                  <span className="font-bold text-dark">{analytics.usersByRole.partners.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.usersByRole.partners / analytics.overview.totalUsers) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Adminlar</span>
                  <span className="font-bold text-dark">{analytics.usersByRole.admins.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.usersByRole.admins / analytics.overview.totalUsers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Content by Type */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Kontent turi bo'yicha</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Ish o'rinlari</span>
                  <span className="font-bold text-dark">{analytics.contentByType.jobs.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.contentByType.jobs / analytics.overview.totalContent) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Chegirmalar</span>
                  <span className="font-bold text-dark">{analytics.contentByType.discounts.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-accent h-3 rounded-full"
                    style={{
                      width: `${(analytics.contentByType.discounts / analytics.overview.totalContent) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Kurslar</span>
                  <span className="font-bold text-dark">{analytics.contentByType.courses.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.contentByType.courses / analytics.overview.totalContent) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Tadbirlar</span>
                  <span className="font-bold text-dark">{analytics.contentByType.events.toLocaleString()}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.contentByType.events / analytics.overview.totalContent) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Daromad trendi</h2>
          <div className="h-64 flex items-end gap-2">
            {analytics.revenueByMonth.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:opacity-80 transition-opacity relative group">
                  <div
                    className="w-full"
                    style={{
                      height: `${(item.revenue / Math.max(...analytics.revenueByMonth.map((r) => r.revenue))) * 200}px`,
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.revenue.toLocaleString()} so'm
                  </div>
                </div>
                <span className="text-sm text-dark/70">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* User Growth Trend */}
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Foydalanuvchilar o'sishi</h2>
          <div className="h-64 flex items-end gap-2">
            {analytics.userGrowthByMonth.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-brand to-brand-400 rounded-t-lg hover:opacity-80 transition-opacity relative group">
                  <div
                    className="w-full"
                    style={{
                      height: `${(item.users / Math.max(...analytics.userGrowthByMonth.map((r) => r.users))) * 200}px`,
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.users} ta
                  </div>
                </div>
                <span className="text-sm text-dark/70">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}
