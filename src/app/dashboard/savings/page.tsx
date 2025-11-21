'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStudentSavingsAnalytics } from '@/lib/hooks';
import { getToken } from '@/lib/auth';
import { DiscountClaim } from '@/types';

export default function SavingsAnalyticsPage() {
  const router = useRouter();
  const { analytics, isLoading, error } = useStudentSavingsAnalytics();

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tejamkorlik statistikasi</h1>
        <p className="text-gray-600">Chegirmalar orqali qancha tejadingiz</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {analytics.totalSavings.toLocaleString()} so'm
            </div>
            <div className="text-gray-700 font-medium">Jami tejaldi</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {analytics.totalClaims}
            </div>
            <div className="text-gray-700 font-medium">Jami chegirmalar</div>
          </div>
        </Card>
      </div>

      {/* Monthly Savings Chart */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Oylik tejamkorlik</h2>
        {analytics.claimsByMonth.length > 0 ? (
          <div className="space-y-4">
            {analytics.claimsByMonth.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 bg-gradient-to-r from-green-400 to-green-600 rounded"
                      style={{
                        width: `${Math.max(5, (item.savings / Math.max(...analytics.claimsByMonth.map(m => m.savings))) * 100)}%`
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.savings.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{item.count} ta</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
        )}
      </Card>

      {/* Categories and Brands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Favorite Categories */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sevimli kategoriyalar</h2>
          {analytics.favoriteCategories.length > 0 ? (
            <div className="space-y-3">
              {analytics.favoriteCategories.slice(0, 5).map((cat, index) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{cat.count} ta</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>

        {/* Favorite Brands */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sevimli brendlar</h2>
          {analytics.favoriteBrands.length > 0 ? (
            <div className="space-y-3">
              {analytics.favoriteBrands.slice(0, 5).map((brand, index) => (
                <div key={brand.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{brand.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{brand.count} ta</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
          )}
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kategoriya bo'yicha tejamkorlik</h2>
        {analytics.claimsByCategory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.claimsByCategory.map((item) => (
              <div key={item.category} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">{item.category}</div>
                <div className="text-lg font-bold text-green-600">
                  {item.savings.toLocaleString()} so'm
                </div>
                <div className="text-sm text-gray-500">{item.count} ta chegirma</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Ma'lumot mavjud emas</p>
        )}
      </Card>

      {/* Recent Claims */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">So'nggi chegirmalar</h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/my-claims')}>
            Barchasini ko'rish
          </Button>
        </div>
        {analytics.recentClaims.length > 0 ? (
          <div className="space-y-4">
            {analytics.recentClaims.slice(0, 5).map((claim: DiscountClaim) => (
              <div key={claim.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {claim.discount.imageUrl && (
                  <Image
                    src={claim.discount.imageUrl}
                    alt={claim.discount.title}
                    width={48}
                    height={48}
                    className="rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {claim.discount.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {claim.discount.brand.name}
                  </div>
                </div>
                <div className="text-right">
                  {claim.savedAmount && (
                    <div className="font-medium text-green-600">
                      -{claim.savedAmount.toLocaleString()} so'm
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(claim.claimedAt).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Hali chegirmalar yo'q</p>
        )}
      </Card>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Button size="lg" onClick={() => router.push('/discounts')}>
          Yangi chegirmalarni ko'rish
        </Button>
      </div>
    </Container>
  );
}
