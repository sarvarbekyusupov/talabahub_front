'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalApplications: number;
    totalEnrollments: number;
    totalRevenue: number;
    viewsGrowth: number;
    applicationsGrowth: number;
    enrollmentsGrowth: number;
    revenueGrowth: number;
  };
  viewsByContentType: {
    discounts: number;
    jobs: number;
    courses: number;
  };
  applicationsByStatus: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
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
  engagementRate: number;
  conversionRate: number;
}

export default function PartnerAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

    setLoading(true);
    try {
      const params = { period };
      const analyticsData = await api.getPartnerAnalytics(token, params) as any;

      setAnalytics({
        overview: {
          totalViews: analyticsData.overview?.totalViews || 0,
          totalApplications: analyticsData.overview?.totalApplications || 0,
          totalEnrollments: analyticsData.overview?.totalEnrollments || 0,
          totalRevenue: analyticsData.overview?.totalRevenue || 0,
          viewsGrowth: analyticsData.overview?.viewsGrowth || 0,
          applicationsGrowth: analyticsData.overview?.applicationsGrowth || 0,
          enrollmentsGrowth: analyticsData.overview?.enrollmentsGrowth || 0,
          revenueGrowth: analyticsData.overview?.revenueGrowth || 0,
        },
        viewsByContentType: {
          discounts: analyticsData.viewsByContentType?.discounts || 0,
          jobs: analyticsData.viewsByContentType?.jobs || 0,
          courses: analyticsData.viewsByContentType?.courses || 0,
        },
        applicationsByStatus: {
          pending: analyticsData.applicationsByStatus?.pending || 0,
          reviewed: analyticsData.applicationsByStatus?.reviewed || 0,
          shortlisted: analyticsData.applicationsByStatus?.shortlisted || 0,
          rejected: analyticsData.applicationsByStatus?.rejected || 0,
        },
        topPerformingContent: analyticsData.topPerformingContent || [],
        revenueByMonth: analyticsData.revenueByMonth || [],
        engagementRate: analyticsData.engagementRate || 0,
        conversionRate: analyticsData.conversionRate || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set empty analytics on error
      setAnalytics({
        overview: {
          totalViews: 0,
          totalApplications: 0,
          totalEnrollments: 0,
          totalRevenue: 0,
          viewsGrowth: 0,
          applicationsGrowth: 0,
          enrollmentsGrowth: 0,
          revenueGrowth: 0,
        },
        viewsByContentType: { discounts: 0, jobs: 0, courses: 0 },
        applicationsByStatus: { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 },
        topPerformingContent: [],
        revenueByMonth: [],
        engagementRate: 0,
        conversionRate: 0,
      });
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-dark mb-2">Analitika</h1>
          <p className="text-lg text-dark/60">
            Sizning kontentingiz samaradorligi va statistikasi
          </p>
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
              <p className="text-white/80 text-sm mb-1">Jami ko'rishlar</p>
              <h3 className="text-3xl font-bold">{analytics.overview.totalViews.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/70">
            <span className={analytics.overview.viewsGrowth >= 0 ? 'text-green-200' : 'text-red-200'}>
              {analytics.overview.viewsGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.overview.viewsGrowth)}%
            </span>
            <span>o'tgan davr bilan solishtirganda</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Jami arizalar</p>
              <h3 className="text-3xl font-bold">{analytics.overview.totalApplications.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/70">
            <span className={analytics.overview.applicationsGrowth >= 0 ? 'text-green-200' : 'text-red-200'}>
              {analytics.overview.applicationsGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.overview.applicationsGrowth)}%
            </span>
            <span>o'tgan davr bilan solishtirganda</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Kurs talabalar</p>
              <h3 className="text-3xl font-bold">{analytics.overview.totalEnrollments.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/70">
            <span className={analytics.overview.enrollmentsGrowth >= 0 ? 'text-green-200' : 'text-red-200'}>
              {analytics.overview.enrollmentsGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.overview.enrollmentsGrowth)}%
            </span>
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
            <span className={analytics.overview.revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'}>
              {analytics.overview.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.overview.revenueGrowth)}%
            </span>
            <span>o'tgan davr bilan solishtirganda</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Views by Content Type */}
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Kontent turi bo'yicha ko'rishlar</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Ish o'rinlari</span>
                <span className="font-bold text-dark">{analytics.viewsByContentType.jobs.toLocaleString()}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.viewsByContentType.jobs / analytics.overview.totalViews) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Chegirmalar</span>
                <span className="font-bold text-dark">{analytics.viewsByContentType.discounts.toLocaleString()}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-accent h-3 rounded-full"
                  style={{
                    width: `${(analytics.viewsByContentType.discounts / analytics.overview.totalViews) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Kurslar</span>
                <span className="font-bold text-dark">{analytics.viewsByContentType.courses.toLocaleString()}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.viewsByContentType.courses / analytics.overview.totalViews) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Applications by Status */}
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Arizalar holati</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Kutilmoqda</span>
                <span className="font-bold text-dark">{analytics.applicationsByStatus.pending}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.applicationsByStatus.pending / analytics.overview.totalApplications) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Ko'rib chiqildi</span>
                <span className="font-bold text-dark">{analytics.applicationsByStatus.reviewed}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.applicationsByStatus.reviewed / analytics.overview.totalApplications) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Tanlandi</span>
                <span className="font-bold text-dark">{analytics.applicationsByStatus.shortlisted}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.applicationsByStatus.shortlisted / analytics.overview.totalApplications) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark/70">Rad etildi</span>
                <span className="font-bold text-dark">{analytics.applicationsByStatus.rejected}</span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{
                    width: `${(analytics.applicationsByStatus.rejected / analytics.overview.totalApplications) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-dark mb-6">Oylik daromad trendi</h2>
        <div className="h-64 flex items-end gap-2">
          {analytics.revenueByMonth.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-brand to-brand-400 rounded-t-lg hover:opacity-80 transition-opacity relative group">
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Jalb qilish darajasi</h2>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-brand mb-4">
              <span className="text-5xl font-bold text-brand">{analytics.engagementRate}%</span>
            </div>
            <p className="text-dark/70">
              Foydalanuvchilarning sizning kontentingiz bilan o'zaro ta'sir qilish darajasi
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">Konversiya darajasi</h2>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-green-500 mb-4">
              <span className="text-5xl font-bold text-green-600">{analytics.conversionRate}%</span>
            </div>
            <p className="text-dark/70">
              Ko'rishlardan arizalar yoki ro'yxatdan o'tishlarga o'tish darajasi
            </p>
          </div>
        </Card>
      </div>
    </Container>
  );
}
