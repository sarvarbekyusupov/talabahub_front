'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SaveButton } from '@/components/ui/SaveButton';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { api as clientApi } from '@/lib/api';
import { Discount as DiscountType, Review, Rating, PaginatedResponse } from '@/types';
import { getToken } from '@/lib/auth';

export default function DiscountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [discount, setDiscount] = useState<DiscountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [relatedDiscounts, setRelatedDiscounts] = useState<DiscountType[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadDiscount();
      loadReviews();
      loadRating();
      loadCurrentUser();
    }
  }, [id]);

  useEffect(() => {
    if (discount) {
      loadRelatedDiscounts();
      generateQRCode();
    }
  }, [discount]);

  const loadDiscount = async () => {
    try {
      const data = await clientApi.getDiscount(id) as DiscountType;
      setDiscount(data);

      // Track discount view
      clientApi.trackDiscountView(id).catch(err => {
        console.error('Error tracking view:', err);
      });
    } catch (err: any) {
      setError('Chegirma topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedDiscounts = async () => {
    if (!discount) return;

    try {
      // Fetch discounts from the same brand
      const brandDiscounts = await clientApi.getDiscounts({
        brandId: discount.brand.id,
        limit: 4,
        isActive: true,
      }) as PaginatedResponse<DiscountType>;

      // Filter out the current discount
      const filtered = brandDiscounts.data.filter(d => d.id !== discount.id);

      // If we have less than 3, try to get some from the same category
      if (filtered.length < 3) {
        const categoryDiscounts = await clientApi.getDiscounts({
          categoryId: discount.category.id,
          limit: 4,
          isActive: true,
        }) as PaginatedResponse<DiscountType>;

        const categoryFiltered = categoryDiscounts.data.filter(
          d => d.id !== discount.id && !filtered.find(f => f.id === d.id)
        );

        filtered.push(...categoryFiltered);
      }

      setRelatedDiscounts(filtered.slice(0, 4));
    } catch (err) {
      console.error('Error loading related discounts:', err);
    }
  };

  const generateQRCode = () => {
    if (!discount?.promoCode) return;

    // Generate QR code URL using a free API service
    const text = encodeURIComponent(discount.promoCode);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${text}`;
    setQrCodeUrl(qrUrl);
  };

  const loadReviews = async () => {
    try {
      const data = await clientApi.getReviews('discounts', id) as PaginatedResponse<Review>;
      setReviews(data.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadRating = async () => {
    try {
      const data = await clientApi.getRating('discounts', id) as Rating;
      setRating(data);
    } catch (err) {
      console.error('Error loading rating:', err);
    }
  };

  const loadCurrentUser = async () => {
    const token = getToken();
    if (token) {
      try {
        const user: any = await clientApi.getProfile(token);
        setCurrentUserId(user.id);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    }
  };

  const handleCopyPromoCode = () => {
    if (discount?.promoCode) {
      navigator.clipboard.writeText(discount.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const url = window.location.href;
    const text = `${discount?.title} - ${discount?.discount}% chegirma!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (editingReview) {
      await clientApi.updateReview(token, 'discounts', id, editingReview.id, data);
      setEditingReview(null);
    } else {
      await clientApi.createReview(token, 'discounts', id, data);
    }

    setShowReviewForm(false);
    await loadReviews();
    await loadRating();
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const token = getToken();
    if (!token) return;

    await clientApi.deleteReview(token, 'discounts', id, reviewId);
    await loadReviews();
    await loadRating();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  // Calculate countdown and progress
  const validityInfo = useMemo(() => {
    if (!discount) return null;

    const now = new Date();
    const startDate = new Date(discount.validFrom);
    const endDate = new Date(discount.validUntil);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const remaining = endDate.getTime() - now.getTime();

    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(remaining / (1000 * 60 * 60));
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
    const hasExpired = remaining < 0;

    return {
      progress,
      daysRemaining,
      hoursRemaining,
      isExpiringSoon,
      hasExpired,
      startDate,
      endDate,
    };
  }, [discount]);

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !discount) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chegirma topilmadi
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/discounts')}>
              Chegirmalarga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <Card>
            {discount.imageUrl && (
              <div className="relative">
                <img
                  src={discount.imageUrl}
                  alt={discount.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />

                {/* Large Discount Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl shadow-2xl p-6 text-center transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="text-5xl font-black leading-none">
                      -{discount.discount}%
                    </div>
                    <div className="text-sm font-semibold mt-1 uppercase tracking-wider">
                      Chegirma
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              {/* Title and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {discount.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!discount.imageUrl && (
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl px-4 py-2 text-center">
                        <span className="text-2xl font-black">-{discount.discount}%</span>
                        <span className="text-xs ml-2 font-semibold uppercase">Chegirma</span>
                      </div>
                    )}
                    {discount.isActive && !validityInfo?.hasExpired && (
                      <Badge variant="primary">Aktiv</Badge>
                    )}
                    {validityInfo?.hasExpired && (
                      <Badge variant="danger">Muddati tugagan</Badge>
                    )}
                    {validityInfo?.isExpiringSoon && !validityInfo.hasExpired && (
                      <Badge variant="warning">
                        Tez orada tugaydi: {validityInfo.daysRemaining} kun
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown Timer for expiring discounts */}
              {validityInfo?.isExpiringSoon && !validityInfo.hasExpired && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">⏰</div>
                      <div>
                        <div className="text-sm font-medium text-orange-900">
                          Shoshiling! Chegirma tez orada tugaydi
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {validityInfo.daysRemaining > 0
                            ? `${validityInfo.daysRemaining} kun qoldi`
                            : `${validityInfo.hoursRemaining} soat qoldi`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validity Period with Progress Bar */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Amal qilish muddati</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Boshlanish: <span className="font-medium text-gray-900">
                        {new Date(discount.validFrom).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Tugash: <span className="font-medium text-gray-900">
                        {new Date(discount.validUntil).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        validityInfo?.hasExpired
                          ? 'bg-gray-400'
                          : validityInfo?.isExpiringSoon
                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                            : 'bg-gradient-to-r from-green-400 to-blue-500'
                      }`}
                      style={{ width: `${validityInfo?.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {validityInfo?.hasExpired
                        ? 'Tugagan'
                        : validityInfo?.isExpiringSoon
                          ? 'Tez orada tugaydi'
                          : 'Aktiv'
                      }
                    </span>
                    {validityInfo && !validityInfo.hasExpired && (
                      <span className="font-medium">
                        {validityInfo.daysRemaining} kun qoldi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-semibold mb-3">Tavsif</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {discount.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Kategoriya</h3>
                  <p className="text-gray-900 font-medium">{discount.category.nameUz}</p>
                </div>
                {discount.usageLimit && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Foydalanish limiti</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">
                        {discount.usageCount || 0} / {discount.usageLimit}
                      </p>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((discount.usageCount || 0) / discount.usageLimit) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code with QR Code */}
              {discount.promoCode && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="flex-shrink-0">
                        <div className="bg-white p-3 rounded-lg shadow-md">
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-32 h-32"
                          />
                          <p className="text-xs text-center text-gray-600 mt-2">
                            QR kodni skanerlang
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Promo Code */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Promo kod
                      </h3>
                      <code className="text-3xl md:text-4xl font-bold text-blue-600 tracking-wider block mb-3">
                        {discount.promoCode}
                      </code>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant={copied ? 'primary' : 'outline'}
                          onClick={handleCopyPromoCode}
                          className="flex-1"
                        >
                          {copied ? '✓ Nusxalandi' : 'Kodni nusxalash'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        💡 Bu kodni to'lov vaqtida kiriting yoki QR kodni skanerlang
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Card>

          {/* Enhanced Brand Information Card */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Brend haqida</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {discount.brand.logoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={discount.brand.logoUrl}
                    alt={discount.brand.name}
                    className="w-32 h-32 object-contain rounded-lg bg-gray-50 p-4 border border-gray-200"
                  />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {discount.brand.name}
                </h3>

                {discount.brand.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {discount.brand.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/discounts?brandId=${discount.brand.id}`)}
                  >
                    Bu brendning boshqa chegirmalari
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Discounts */}
          {relatedDiscounts.length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                O'xshash chegirmalar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedDiscounts.map((relDiscount) => (
                  <div
                    key={relDiscount.id}
                    onClick={() => router.push(`/discounts/${relDiscount.id}`)}
                    className="cursor-pointer group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                  >
                    {relDiscount.imageUrl && (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={relDiscount.imageUrl}
                          alt={relDiscount.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                          -{relDiscount.discount}%
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {relDiscount.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {relDiscount.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {relDiscount.brand.name}
                        </span>
                        <span className="text-blue-600 font-medium">
                          Batafsil →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Harakatlar</h3>
            <div className="space-y-3">
              <Button fullWidth size="lg" variant="primary">
                Chegirmadan foydalanish
              </Button>

              <div className="w-full">
                <SaveButton
                  itemType="discount"
                  itemId={discount.id}
                  className="w-full h-10 rounded-lg font-medium"
                />
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Ulashish
              </h4>
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleCopyLink}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {linkCopied ? '✓ Nusxalandi' : 'Havolani nusxalash'}
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleShareTelegram}
                  className="justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-1.146 6.208-1.146 6.208-.088.36-.252.468-.414.468-.234 0-.378-.144-.54-.27l-2.88-2.088-1.134.99c-.126.108-.234.198-.486.198-.306 0-.378-.144-.378-.414v-2.034l5.274-4.752c.234-.198.144-.306-.126-.108l-6.516 4.122-2.52-.792c-.54-.18-.558-.54.126-.792l9.864-3.798c.45-.162.846.108.702.792z"/>
                  </svg>
                  Telegram orqali ulashish
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleShareFacebook}
                  className="justify-start bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook orqali ulashish
                </Button>
              </div>
            </div>

            {/* Quick Brand Info */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Brend
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/discounts?brandId=${discount.brand.id}`)}
              >
                {discount.brand.logoUrl && (
                  <img
                    src={discount.brand.logoUrl}
                    alt={discount.brand.name}
                    className="w-12 h-12 object-contain rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {discount.brand.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Boshqa chegirmalar →
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sharhlar va baholar</h2>
              {rating && (
                <div className="flex items-center gap-3 mt-2">
                  <RatingStars rating={rating.average} size="md" />
                  <span className="text-lg font-semibold">{rating.average.toFixed(1)}</span>
                  <span className="text-gray-600">({rating.count} ta sharh)</span>
                </div>
              )}
            </div>
            {!showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                Sharh qoldirish
              </Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingReview ? 'Sharhni tahrirlash' : 'Sharh qoldiring'}
              </h3>
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={handleCancelReview}
                existingReview={editingReview || undefined}
              />
            </div>
          )}

          <ReviewList
            reviews={reviews}
            currentUserId={currentUserId || undefined}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </Card>
      </div>
    </Container>
  );
}
