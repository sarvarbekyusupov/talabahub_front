'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePlatformDiscountAnalytics } from '@/lib/hooks';
import { getToken } from '@/lib/auth';

export default function AdminDiscountAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('month');
  const { analytics, isLoading, error } = usePlatformDiscountAnalytics({ period });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !analytics) {
    return (
      <Container className="py-8">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xatolik</h3>
            <p className="text-gray-600">Statistikani yuklashda xatolik yuz berdi</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platforma statistikasi</h1>
          <p className="text-gray-600">Chegirmalar tizimining umumiy ko'rsatkichlari</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? 'Hafta' : p === 'month' ? 'Oy' : 'Yil'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalDiscounts}</div>
          <div className="text-xs text-gray-600">Jami chegirmalar</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.overview.activeDiscounts}</div>
          <div className="text-xs text-gray-600">Faol</div>
        </Card>
        <Card className="text-center bg-orange-50">
          <div className="text-2xl font-bold text-orange-600">{analytics.overview.pendingApproval}</div>
          <div className="text-xs text-gray-600">Kutayotgan</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.overview.totalClaims.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Olingan</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{analytics.overview.totalRedemptions.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Ishlatilgan</div>
        </Card>
        <Card className="text-center bg-green-50">
          <div className="text-2xl font-bold text-green-600">
            {(analytics.overview.totalSavings / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-600">Tejaldi (so'm)</div>
        </Card>
      </div>

      {/* User Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{analytics.userEngagement.activeUsers}</div>
          <div className="text-sm text-gray-600">Faol foydalanuvchilar</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{analytics.userEngagement.newUsers}</div>
          <div className="text-sm text-gray-600">Yangi foydalanuvchilar</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{analytics.userEngagement.returningUsers}</div>
          <div className="text-sm text-gray-600">Qaytib kelganlar</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {analytics.userEngagement.averageClaimsPerUser.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">O'rtacha olishlar</div>
        </Card>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Claims Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunlik olinganlar</h3>
          {analytics.trends.claimsByDay.length > 0 ? (
            <div className="space-y-2">
              {analytics.trends.claimsByDay.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-blue-500 rounded"
                      style={{
                        width: `${Math.max(5, (day.claims / Math.max(...analytics.trends.claimsByDay.map(d => d.claims), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-700 text-right">{day.claims}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Redemptions Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunlik ishlatilganlar</h3>
          {analytics.trends.redemptionsByDay.length > 0 ? (
            <div className="space-y-2">
              {analytics.trends.redemptionsByDay.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-green-500 rounded"
                      style={{
                        width: `${Math.max(5, (day.redemptions / Math.max(...analytics.trends.redemptionsByDay.map(d => d.redemptions), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-700 text-right">{day.redemptions}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Brands */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng yaxshi brendlar</h3>
          {analytics.topBrands.length > 0 ? (
            <div className="space-y-3">
              {analytics.topBrands.slice(0, 5).map((brand, index) => (
                <div key={brand.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{brand.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{brand.claims}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Top Categories */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng yaxshi kategoriyalar</h3>
          {analytics.topCategories.length > 0 ? (
            <div className="space-y-3">
              {analytics.topCategories.slice(0, 5).map((cat, index) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{cat.claims}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Fraud Metrics */}
        <Card className="bg-red-50 border-2 border-red-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Firibgarlik statistikasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Jami ogohlantirishlar:</span>
              <span className="font-bold text-gray-900">{analytics.fraudMetrics.totalAlerts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Yangi:</span>
              <span className="font-bold text-red-600">{analytics.fraudMetrics.newAlerts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Hal qilingan:</span>
              <span className="font-bold text-green-600">{analytics.fraudMetrics.resolvedAlerts}</span>
            </div>
            <div className="pt-3 border-t">
              {analytics.fraudMetrics.alertsBySeverity.map((item) => (
                <div key={item.severity} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{item.severity}:</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            fullWidth
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push('/admin/discounts/fraud-alerts')}
          >
            Batafsil ko'rish
          </Button>
        </Card>
      </div>

      {/* Top Discounts */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng mashhur chegirmalar</h3>
        {analytics.topDiscounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Nomi</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Brend</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Olingan</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Ishlatilgan</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Daraja</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topDiscounts.map((discount, index) => (
                  <tr key={discount.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index < 3 ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                        <button
                          onClick={() => router.push(`/discounts/${discount.id}`)}
                          className="text-blue-600 hover:underline text-left"
                        >
                          {discount.title}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">{discount.brand}</td>
                    <td className="py-3 px-3 text-right">{discount.claims}</td>
                    <td className="py-3 px-3 text-right">{discount.redemptions}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-medium ${
                        discount.claims > 0 ? (discount.redemptions / discount.claims * 100 > 50 ? 'text-green-600' : 'text-orange-600') : 'text-gray-400'
                      }`}>
                        {discount.claims > 0 ? (discount.redemptions / discount.claims * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/discounts')}>
          Barcha chegirmalar
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/approvals')}>
          Tasdiqlash
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/fraud-alerts')}>
          Firibgarlik
        </Button>
      </div>
    </Container>
  );
}
