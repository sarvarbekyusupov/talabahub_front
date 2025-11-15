'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Discount, PaginatedResponse } from '@/types';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const data = await api.getDiscounts({ limit: 20 }) as PaginatedResponse<Discount>;
      setDiscounts(data.data);
    } catch (err: any) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center text-red-600">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Chegirmalar</h1>
        <p className="text-lg text-gray-600">
          Talabalar uchun maxsus chegirmalar va takliflar
        </p>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-600">
            Hozircha chegirmalar mavjud emas
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <Card key={discount.id} hover className="flex flex-col">
              {discount.imageUrl && (
                <img
                  src={discount.imageUrl}
                  alt={discount.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {discount.title}
                  </h3>
                  <Badge variant="success" size="md">
                    -{discount.discount}%
                  </Badge>
                </div>

                <p className="text-gray-600 mb-4 flex-1">
                  {discount.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Brend:</span>
                    <span className="font-medium">{discount.brand.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Kategoriya:</span>
                    <span className="font-medium">{discount.category.nameUz}</span>
                  </div>
                  {discount.promoCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Promo kod:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                        {discount.promoCode}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Amal qiladi:</span>
                    <span className="text-sm">
                      {new Date(discount.validUntil).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
