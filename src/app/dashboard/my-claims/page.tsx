'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { useMyClaims } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DiscountClaim, ClaimStatus } from '@/types';

const statusLabels: Record<ClaimStatus, string> = {
  pending: 'Kutilmoqda',
  active: 'Faol',
  used: 'Ishlatilgan',
  expired: 'Muddati tugagan',
  cancelled: 'Bekor qilingan',
};

const statusVariants: Record<ClaimStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  active: 'primary',
  used: 'success',
  expired: 'danger',
  cancelled: 'danger',
};

export default function MyClaimsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { claims, meta, isLoading, error, mutate } = useMyClaims({
    page: currentPage,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleCopyCode = (code: string, claimId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(claimId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelClaim = async (claimId: string) => {
    const token = getToken();
    if (!token) return;

    setCancellingId(claimId);
    try {
      await api.cancelClaim(token, claimId);
      mutate();
    } catch (err) {
      console.error('Error cancelling claim:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const getQrCodeUrl = (code: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mening chegirmalarim</h1>
        <p className="text-gray-600">Siz olgan barcha chegirmalar ro'yxati</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'active', 'pending', 'used', 'expired', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
          >
            {status === 'all' ? 'Barchasi' : statusLabels[status as ClaimStatus]}
          </Button>
        ))}
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chegirmalar topilmadi
            </h3>
            <p className="text-gray-600 mb-4">
              Siz hali hech qanday chegirma olmadingiz
            </p>
            <Button onClick={() => router.push('/discounts')}>
              Chegirmalarni ko'rish
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim: DiscountClaim) => (
            <Card key={claim.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Discount Image */}
                {claim.discount.imageUrl && (
                  <div className="relative w-full md:w-48 h-32 flex-shrink-0">
                    <Image
                      src={claim.discount.imageUrl}
                      alt={claim.discount.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      -{claim.discount.discount}%
                    </div>
                  </div>
                )}

                {/* Claim Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.discount.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {claim.discount.brand.name}
                      </p>
                    </div>
                    <Badge variant={statusVariants[claim.status]}>
                      {statusLabels[claim.status]}
                    </Badge>
                  </div>

                  {/* Claim Code */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Sizning kodingiz</p>
                      <code className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        {claim.claimCode}
                      </code>
                    </div>
                    {claim.status === 'active' && (
                      <div className="hidden md:block">
                        <Image
                          src={getQrCodeUrl(claim.claimCode)}
                          alt="QR Code"
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dates and Countdown */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Olingan:</span>{' '}
                        {new Date(claim.claimedAt).toLocaleDateString('uz-UZ')}
                      </div>
                      {claim.usedAt && (
                        <div>
                          <span className="font-medium">Ishlatilgan:</span>{' '}
                          {new Date(claim.usedAt).toLocaleDateString('uz-UZ')}
                        </div>
                      )}
                    </div>
                    {/* Countdown Timer for active claims */}
                    {claim.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Qolgan vaqt:</span>
                        <CountdownTimer
                          targetDate={claim.expiresAt}
                          size="sm"
                          showLabels={true}
                        />
                      </div>
                    )}
                    {claim.status !== 'active' && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Amal qiladi:</span>{' '}
                        {new Date(claim.expiresAt).toLocaleDateString('uz-UZ')}
                      </div>
                    )}
                  </div>

                  {/* Savings */}
                  {claim.savedAmount && (
                    <div className="text-sm text-green-600 font-medium mb-3">
                      Tejaldi: {claim.savedAmount.toLocaleString()} so'm
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {claim.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant={copiedId === claim.id ? 'primary' : 'outline'}
                          onClick={() => handleCopyCode(claim.claimCode, claim.id)}
                        >
                          {copiedId === claim.id ? '✓ Nusxalandi' : 'Kodni nusxalash'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelClaim(claim.id)}
                          loading={cancellingId === claim.id}
                        >
                          Bekor qilish
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/discounts/${claim.discount.id}`)}
                    >
                      Chegirmani ko'rish
                    </Button>
                  </div>
                </div>
              </div>
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

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {claims.filter((c: DiscountClaim) => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Faol</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {claims.filter((c: DiscountClaim) => c.status === 'used').length}
          </div>
          <div className="text-sm text-gray-600">Ishlatilgan</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {claims.filter((c: DiscountClaim) => c.status === 'expired').length}
          </div>
          <div className="text-sm text-gray-600">Muddati tugagan</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{meta?.total || 0}</div>
          <div className="text-sm text-gray-600">Jami</div>
        </Card>
      </div>

      {/* Link to Analytics */}
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => router.push('/dashboard/savings')}>
          Tejamkorlik statistikasini ko'rish
        </Button>
      </div>
    </Container>
  );
}
