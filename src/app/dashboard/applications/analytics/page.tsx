'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ApplicationAnalytics {
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  successRate: number;
  averageResponseTime: number; // in days
  applicationsByMonth: Array<{ month: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: Array<{
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
    updatedAt?: string;
  }>;
}

export default function ApplicationAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

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
      // Fetch application data
      const applicationsData = await api.request('/users/me/applications', { token }) as any;
      const applications = applicationsData.data || [];

      // Calculate analytics
      const pending = applications.filter((a: any) => a.status === 'pending').length;
      const reviewed = applications.filter((a: any) => a.status === 'reviewed').length;
      const shortlisted = applications.filter((a: any) => a.status === 'shortlisted').length;
      const rejected = applications.filter((a: any) => a.status === 'rejected').length;

      // Calculate success rate (shortlisted / total)
      const successRate =
        applications.length > 0 ? (shortlisted / applications.length) * 100 : 0;

      // Calculate average response time
      const responseTimes = applications
        .filter((a: any) => a.updatedAt && a.createdAt)
        .map((a: any) => {
          const created = new Date(a.createdAt).getTime();
          const updated = new Date(a.updatedAt).getTime();
          return (updated - created) / (1000 * 60 * 60 * 24); // days
        });
      const avgResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : 0;

      // Group by month
      const monthlyData = applications.reduce((acc: any, app: any) => {
        const month = new Date(app.createdAt).toLocaleString('uz-UZ', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const applicationsByMonth = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count: count as number,
      }));

      // Top categories (mock data - would come from actual job categories)
      const topCategories = [
        { category: 'IT & Dasturlash', count: Math.floor(applications.length * 0.4) },
        { category: 'Dizayn', count: Math.floor(applications.length * 0.3) },
        { category: 'Marketing', count: Math.floor(applications.length * 0.2) },
        { category: 'Boshqa', count: Math.floor(applications.length * 0.1) },
      ];

      // Recent activity
      const recentActivity = applications.slice(0, 10).map((app: any) => ({
        jobTitle: app.job?.title || 'Job Title',
        companyName: app.job?.companyName || 'Company',
        status: app.status,
        appliedAt: app.createdAt,
        updatedAt: app.updatedAt,
      }));

      setAnalytics({
        totalApplications: applications.length,
        pendingApplications: pending,
        reviewedApplications: reviewed,
        shortlistedApplications: shortlisted,
        rejectedApplications: rejected,
        successRate: Math.round(successRate),
        averageResponseTime: Math.round(avgResponseTime),
        applicationsByMonth,
        topCategories,
        recentActivity,
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
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-dark mb-2">Arizalar analitikasi</h1>
              <p className="text-lg text-dark/60">Ish arizalaringiz statistikasi va tahlili</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={period === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod('month')}
              >
                Oy
              </Button>
              <Button
                variant={period === 'quarter' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod('quarter')}
              >
                Chorak
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
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Jami arizalar</p>
                <h3 className="text-3xl font-bold">{analytics.totalApplications}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Muvaffaqiyat darajasi</p>
                <h3 className="text-3xl font-bold">{analytics.successRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-white/70">
              {analytics.shortlistedApplications} ta tanlangan
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">O'rtacha javob</p>
                <h3 className="text-3xl font-bold">{analytics.averageResponseTime}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-white/70">kun ichida</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Kutilmoqda</p>
                <h3 className="text-3xl font-bold">{analytics.pendingApplications}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Arizalar holati</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Kutilmoqda</span>
                  <span className="font-bold text-dark">{analytics.pendingApplications}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.pendingApplications / analytics.totalApplications) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Ko'rib chiqildi</span>
                  <span className="font-bold text-dark">{analytics.reviewedApplications}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.reviewedApplications / analytics.totalApplications) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Tanlandi</span>
                  <span className="font-bold text-dark">{analytics.shortlistedApplications}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.shortlistedApplications / analytics.totalApplications) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark/70">Rad etildi</span>
                  <span className="font-bold text-dark">{analytics.rejectedApplications}</span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.rejectedApplications / analytics.totalApplications) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Top kategoriyalar</h2>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-dark/70">{category.category}</span>
                    <span className="font-bold text-dark">{category.count} ta</span>
                  </div>
                  <div className="w-full bg-lavender-100 rounded-full h-3">
                    <div
                      className="bg-brand h-3 rounded-full"
                      style={{
                        width: `${(category.count / analytics.totalApplications) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Monthly Trend */}
        {analytics.applicationsByMonth.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-dark mb-6">Oylik trend</h2>
            <div className="h-64 flex items-end gap-2">
              {analytics.applicationsByMonth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-brand to-brand-400 rounded-t-lg hover:opacity-80 transition-opacity relative group">
                    <div
                      className="w-full"
                      style={{
                        height: `${
                          (item.count /
                            Math.max(...analytics.applicationsByMonth.map((r) => r.count))) *
                          200
                        }px`,
                      }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count} ta
                    </div>
                  </div>
                  <span className="text-sm text-dark/70">{item.month}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">So'nggi faoliyat</h2>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-center py-8 text-dark/60">Faoliyat yo'q</p>
          ) : (
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-lavender-200 last:border-0"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark mb-1">{activity.jobTitle}</h4>
                    <p className="text-sm text-dark/60">{activity.companyName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-dark/60">
                      {new Date(activity.appliedAt).toLocaleDateString('uz-UZ')}
                    </span>
                    <Badge
                      variant={
                        activity.status === 'shortlisted'
                          ? 'success'
                          : activity.status === 'rejected'
                          ? 'danger'
                          : activity.status === 'reviewed'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      {activity.status === 'pending'
                        ? 'Kutilmoqda'
                        : activity.status === 'reviewed'
                        ? 'Ko\'rib chiqildi'
                        : activity.status === 'shortlisted'
                        ? 'Tanlandi'
                        : 'Rad etildi'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
