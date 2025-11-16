'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Discount } from '@/types';

export default function PartnerDiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await api.getPartnerContent(token, 'discounts') as any;
      setDiscounts(data.data || []);
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu chegirmani o\'chirishni tasdiqlaysizmi?')) return;

    const token = getToken();
    if (!token) return;

    try {
      setDeleteId(id);
      await api.deleteDiscount(token, id);
      await loadDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Chegirmani o\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/partner/discounts/${id}/edit`);
  };

  if (loading) {
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
          <h1 className="text-4xl font-bold text-dark mb-2">Mening chegirmalarim</h1>
          <p className="text-lg text-dark/60">
            Siz yaratgan barcha chegirmalar ro'yxati
          </p>
        </div>
        <Button onClick={() => router.push('/partner/discounts/create')}>
          Yangi chegirma qo'shish
        </Button>
      </div>

      {discounts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-lavender-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-3">Hali chegirmalar yo'q</h2>
            <p className="text-dark/60 mb-6">
              Talabalar uchun birinchi chegirmangizni yarating
            </p>
            <Button onClick={() => router.push('/partner/discounts/create')}>
              Yangi chegirma qo'shish
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {discounts.map((discount) => (
            <Card key={discount.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-6">
                {discount.imageUrl && (
                  <img
                    src={discount.imageUrl}
                    alt={discount.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-2">{discount.title}</h3>
                      <p className="text-dark/70 line-clamp-2 mb-3">{discount.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={discount.isActive ? 'success' : 'warning'}>
                        {discount.isActive ? 'Faol' : 'Kutilmoqda'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Chegirma</p>
                      <p className="font-bold text-brand text-xl">{discount.discount}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Ko'rildi</p>
                      <p className="font-semibold text-dark">{discount.views || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Saqlangan</p>
                      <p className="font-semibold text-dark">{discount.savedCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Reyting</p>
                      <p className="font-semibold text-dark">
                        {discount.averageRating ? `${discount.averageRating.toFixed(1)} ⭐` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(discount.id)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                      disabled={deleteId === discount.id}
                    >
                      {deleteId === discount.id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/discounts/${discount.id}`)}
                    >
                      Ko'rish
                    </Button>
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
