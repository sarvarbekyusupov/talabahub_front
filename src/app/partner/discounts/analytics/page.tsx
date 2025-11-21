'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePartnerDiscountAnalytics } from '@/lib/hooks';
import { getToken } from '@/lib/auth';

export default function PartnerDiscountAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('month');
  const { analytics, isLoading, error } = usePartnerDiscountAnalytics({ period });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chegirma statistikasi</h1>
          <p className="text-gray-600">Chegirmalaringizning samaradorligini kuzating</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{analytics.totalDiscounts}</div>
          <div className="text-sm text-gray-600">Jami chegirmalar</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{analytics.activeDiscounts}</div>
          <div className="text-sm text-gray-600">Faol</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{analytics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Ko'rishlar</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">{analytics.totalClaims}</div>
          <div className="text-sm text-gray-600">Olingan</div>
        </Card>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Olish darajasi</h3>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {analytics.claimRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              Ko'rganlarning {analytics.claimRate.toFixed(1)}%i chegirmani oldi
            </p>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.min(100, analytics.claimRate)}%` }}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ishlatilish darajasi</h3>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {analytics.redemptionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              Olganlarning {analytics.redemptionRate.toFixed(1)}%i ishlatdi
            </p>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${Math.min(100, analytics.redemptionRate)}%` }}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI</h3>
          <div className="text-center">
            <div className={`text-5xl font-bold mb-2 ${analytics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              Investitsiya qaytishi
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Views Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunlik ko'rishlar</h3>
          {analytics.viewsByDay.length > 0 ? (
            <div className="space-y-2">
              {analytics.viewsByDay.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-blue-500 rounded"
                      style={{
                        width: `${Math.max(5, (day.views / Math.max(...analytics.viewsByDay.map(d => d.views))) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-700 text-right">{day.views}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Claims Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunlik olinganlar</h3>
          {analytics.claimsByDay.length > 0 ? (
            <div className="space-y-2">
              {analytics.claimsByDay.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-green-500 rounded"
                      style={{
                        width: `${Math.max(5, (day.claims / Math.max(...analytics.claimsByDay.map(d => d.claims), 1)) * 100)}%`
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
      </div>

      {/* Top Performing Discounts */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng yaxshi chegirmalar</h3>
        {analytics.topDiscounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Nomi</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Ko'rishlar</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Olingan</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Ishlatilgan</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Daraja</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topDiscounts.map((discount) => (
                  <tr key={discount.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <button
                        onClick={() => router.push(`/discounts/${discount.id}`)}
                        className="text-blue-600 hover:underline text-left"
                      >
                        {discount.title}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">{discount.views.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">{discount.claims}</td>
                    <td className="py-3 px-3 text-right">{discount.redemptions}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-medium ${
                        discount.views > 0 ? (discount.claims / discount.views * 100 > 5 ? 'text-green-600' : 'text-orange-600') : 'text-gray-400'
                      }`}>
                        {discount.views > 0 ? (discount.claims / discount.views * 100).toFixed(1) : 0}%
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

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Universities */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Universitetlar</h3>
          {analytics.demographics.universities.length > 0 ? (
            <div className="space-y-3">
              {analytics.demographics.universities.slice(0, 5).map((uni, index) => (
                <div key={uni.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1">{uni.name}</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">{uni.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Genders */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jins</h3>
          {analytics.demographics.genders.length > 0 ? (
            <div className="space-y-3">
              {analytics.demographics.genders.map((gender) => (
                <div key={gender.gender} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {gender.gender === 'male' ? 'Erkak' : gender.gender === 'female' ? 'Ayol' : 'Belgilanmagan'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{gender.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Age Groups */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yosh guruhlari</h3>
          {analytics.demographics.ageGroups.length > 0 ? (
            <div className="space-y-3">
              {analytics.demographics.ageGroups.map((group) => (
                <div key={group.range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{group.range}</span>
                  <span className="text-sm font-medium text-gray-900">{group.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>
      </div>

      {/* Peak Times */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng faol soatlar</h3>
        {analytics.peakTimes.length > 0 ? (
          <div className="flex items-end gap-1 h-40">
            {analytics.peakTimes.map((time) => (
              <div key={time.hour} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{
                    height: `${Math.max(10, (time.claims / Math.max(...analytics.peakTimes.map(t => t.claims), 1)) * 100)}%`
                  }}
                />
                <div className="text-xs text-gray-600 mt-1">{time.hour}:00</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/partner/discounts')}>
          Chegirmalarimga qaytish
        </Button>
        <Button variant="outline" onClick={() => router.push('/partner/discounts/verifications')}>
          Tekshirishlarni ko'rish
        </Button>
      </div>
    </Container>
  );
}
