'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePendingApprovalDiscounts } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Discount } from '@/types';

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  const { discounts, meta, isLoading, error, mutate } = usePendingApprovalDiscounts({
    page: currentPage,
    limit: 10,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleApprove = async (discountId: string) => {
    const token = getToken();
    if (!token) return;

    setProcessingId(discountId);
    try {
      await api.approveDiscount(token, discountId, approvalNote || undefined);
      setApprovalNote('');
      mutate();
    } catch (err) {
      console.error('Error approving discount:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (discountId: string) => {
    const token = getToken();
    if (!token || !rejectReason) return;

    setProcessingId(discountId);
    try {
      await api.rejectDiscount(token, discountId, rejectReason);
      setRejectReason('');
      setShowRejectModal(null);
      mutate();
    } catch (err) {
      console.error('Error rejecting discount:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xatolik</h3>
            <p className="text-gray-600">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chegirmalarni tasdiqlash</h1>
        <p className="text-gray-600">
          Partnerlar tomonidan yaratilgan chegirmalarni ko'rib chiqing va tasdiqlang
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center bg-orange-50 border-2 border-orange-200">
          <div className="text-3xl font-bold text-orange-600">{meta?.total || 0}</div>
          <div className="text-sm text-gray-600">Kutayotgan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {/* This would come from additional API data */}
            -
          </div>
          <div className="text-sm text-gray-600">Bugun tasdiqlangan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {/* This would come from additional API data */}
            -
          </div>
          <div className="text-sm text-gray-600">Rad etilgan</div>
        </Card>
      </div>

      {/* Discounts List */}
      {discounts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kutayotgan chegirmalar yo'q
            </h3>
            <p className="text-gray-600">
              Barcha chegirmalar ko'rib chiqilgan
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {discounts.map((discount: Discount) => (
            <Card key={discount.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Discount Image */}
                {discount.imageUrl && (
                  <div className="relative w-full lg:w-64 h-48 flex-shrink-0">
                    <Image
                      src={discount.imageUrl}
                      alt={discount.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                      -{discount.discount}%
                    </div>
                  </div>
                )}

                {/* Discount Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {discount.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{discount.brand.name}</span>
                        <span>•</span>
                        <span>{discount.category.nameUz}</span>
                      </div>
                    </div>
                    <Badge variant="warning">Kutilmoqda</Badge>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {discount.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Chegirma:</span>
                      <div className="font-semibold text-gray-900">
                        {discount.discountType === 'percentage'
                          ? `${discount.discount}%`
                          : `${discount.discount.toLocaleString()} so'm`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Boshlanish:</span>
                      <div className="font-semibold text-gray-900">
                        {new Date(discount.validFrom).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tugash:</span>
                      <div className="font-semibold text-gray-900">
                        {new Date(discount.validUntil).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                    {discount.usageLimit && (
                      <div>
                        <span className="text-gray-500">Limit:</span>
                        <div className="font-semibold text-gray-900">
                          {discount.usageLimit}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discount.promoCode && (
                      <Badge variant="info">Promo kod: {discount.promoCode}</Badge>
                    )}
                    {discount.minimumPurchase && (
                      <Badge variant="info">
                        Min: {discount.minimumPurchase.toLocaleString()} so'm
                      </Badge>
                    )}
                    {discount.firstTimeOnly && (
                      <Badge variant="info">Birinchi xarid</Badge>
                    )}
                  </div>

                  {/* Terms */}
                  {discount.termsAndConditions && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4 text-sm">
                      <div className="font-medium text-gray-700 mb-1">Shartlar:</div>
                      <p className="text-gray-600 line-clamp-2">
                        {discount.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(discount.id)}
                      loading={processingId === discount.id}
                    >
                      Tasdiqlash
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectModal(discount.id)}
                    >
                      Rad etish
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/discounts/${discount.id}`)}
                    >
                      Ko'rish
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rejection Modal */}
              {showRejectModal === discount.id && (
                <div className="mt-6 pt-6 border-t">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rad etish sababi *
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      rows={3}
                      placeholder="Rad etish sababini kiriting..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      onClick={() => handleReject(discount.id)}
                      loading={processingId === discount.id}
                      disabled={!rejectReason.trim()}
                    >
                      Rad etish
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowRejectModal(null);
                        setRejectReason('');
                      }}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/discounts')}>
          Barcha chegirmalar
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/analytics')}>
          Statistika
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/fraud-alerts')}>
          Firibgarlik ogohlantirishlari
        </Button>
      </div>
    </Container>
  );
}
