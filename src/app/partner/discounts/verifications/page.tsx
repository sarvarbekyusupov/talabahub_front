'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePartnerPendingVerifications } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DiscountClaim } from '@/types';

export default function PartnerVerificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);

  const { claims, meta, isLoading, error, mutate } = usePartnerPendingVerifications({
    page: currentPage,
    limit: 20,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleVerify = async (claimId: string, verified: boolean) => {
    const token = getToken();
    if (!token) return;

    setVerifyingId(claimId);
    try {
      await api.verifyDiscountClaim(token, claimId, {
        verified,
        note: verificationNote || undefined,
      });
      setVerificationNote('');
      setShowNoteModal(null);
      mutate();
    } catch (err) {
      console.error('Error verifying claim:', err);
    } finally {
      setVerifyingId(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tekshirish kutayotgan chegirmalar</h1>
        <p className="text-gray-600">
          Studentlar tomonidan olingan chegirmalarni tasdiqlang
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">{meta?.total || 0}</div>
          <div className="text-sm text-gray-600">Kutayotgan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {claims.filter((c: DiscountClaim) => c.status === 'used').length}
          </div>
          <div className="text-sm text-gray-600">Bugun tasdiqlangan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {claims.filter((c: DiscountClaim) => c.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Rad etilgan</div>
        </Card>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tekshirish kutayotgan chegirmalar yo'q
            </h3>
            <p className="text-gray-600">
              Barcha chegirmalar tekshirilgan
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim: DiscountClaim) => (
            <Card key={claim.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Student Info */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    {claim.user.avatarUrl ? (
                      <Image
                        src={claim.user.avatarUrl}
                        alt={`${claim.user.firstName} ${claim.user.lastName}`}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {claim.user.firstName[0]}{claim.user.lastName[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {claim.user.firstName} {claim.user.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{claim.user.email}</div>
                    </div>
                  </div>
                  {claim.user.university && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Universitet:</span><br />
                      {claim.user.university.nameUz}
                    </div>
                  )}
                </div>

                {/* Discount & Claim Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.discount.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {claim.discount.brand.name} • -{claim.discount.discount}%
                      </p>
                    </div>
                    <Badge variant="warning">Kutilmoqda</Badge>
                  </div>

                  {/* Claim Code */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="text-sm text-gray-600 mb-1">Kod</div>
                    <code className="text-xl font-bold text-blue-600">
                      {claim.claimCode}
                    </code>
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Olingan:</span>{' '}
                      {new Date(claim.claimedAt).toLocaleString('uz-UZ')}
                    </div>
                    <div>
                      <span className="font-medium">Amal qiladi:</span>{' '}
                      {new Date(claim.expiresAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleVerify(claim.id, true)}
                      loading={verifyingId === claim.id}
                    >
                      Tasdiqlash
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNoteModal(claim.id)}
                    >
                      Rad etish
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="lg:w-32 flex-shrink-0 text-center">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(claim.claimCode)}`}
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="mx-auto rounded"
                  />
                  <p className="text-xs text-gray-500 mt-2">Skanerlang</p>
                </div>
              </div>

              {/* Rejection Note Modal */}
              {showNoteModal === claim.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rad etish sababi (ixtiyoriy)
                    </label>
                    <textarea
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      rows={2}
                      placeholder="Rad etish sababini kiriting..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleVerify(claim.id, false)}
                      loading={verifyingId === claim.id}
                    >
                      Rad etish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNoteModal(null);
                        setVerificationNote('');
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
        <Button variant="outline" onClick={() => router.push('/partner/discounts')}>
          Chegirmalarimga qaytish
        </Button>
        <Button variant="outline" onClick={() => router.push('/partner/discounts/analytics')}>
          Statistikani ko'rish
        </Button>
      </div>
    </Container>
  );
}
