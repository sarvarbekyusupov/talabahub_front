'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SaveButton } from '@/components/ui/SaveButton';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { api } from '@/lib/api';
import { Discount, Review, Rating, PaginatedResponse } from '@/types';
import { getToken } from '@/lib/auth';

export default function DiscountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDiscount();
      loadReviews();
      loadRating();
      loadCurrentUser();
    }
  }, [id]);

  const loadDiscount = async () => {
    try {
      const data = await api.getDiscount(id) as Discount;
      setDiscount(data);

      // Track discount view
      api.trackDiscountView(id).catch(err => {
        console.error('Error tracking view:', err);
      });
    } catch (err: any) {
      setError('Chegirma topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await api.getReviews('discounts', id) as PaginatedResponse<Review>;
      setReviews(data.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadRating = async () => {
    try {
      const data = await api.getRating('discounts', id) as Rating;
      setRating(data);
    } catch (err) {
      console.error('Error loading rating:', err);
    }
  };

  const loadCurrentUser = async () => {
    const token = getToken();
    if (token) {
      try {
        const user: any = await api.getProfile(token);
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

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (editingReview) {
      await api.updateReview(token, 'discounts', id, editingReview.id, data);
      setEditingReview(null);
    } else {
      await api.createReview(token, 'discounts', id, data);
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

    await api.deleteReview(token, 'discounts', id, reviewId);
    await loadReviews();
    await loadRating();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

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
        <div className="lg:col-span-2">
          <Card>
            {discount.imageUrl && (
              <img
                src={discount.imageUrl}
                alt={discount.title}
                className="w-full h-64 object-cover rounded-t-lg mb-6"
              />
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {discount.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="success" size="md">
                    -{discount.discount}% Chegirma
                  </Badge>
                  {discount.isActive && (
                    <Badge variant="primary">Aktiv</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <h2 className="text-xl font-semibold mb-3">Tavsif</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {discount.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Brend</h3>
                <p className="text-gray-900">{discount.brand.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Kategoriya</h3>
                <p className="text-gray-900">{discount.category.nameUz}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amal qilish muddati</h3>
                <p className="text-gray-900">
                  {new Date(discount.validFrom).toLocaleDateString('uz-UZ')} - {' '}
                  {new Date(discount.validUntil).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              {discount.usageLimit && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Foydalanish limiti</h3>
                  <p className="text-gray-900">
                    {discount.usageCount || 0} / {discount.usageLimit}
                  </p>
                </div>
              )}
            </div>

            {/* Promo Code */}
            {discount.promoCode && (
              <Card className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Promo kod
                    </h3>
                    <code className="text-2xl font-bold text-blue-600">
                      {discount.promoCode}
                    </code>
                  </div>
                  <Button
                    variant={copied ? 'primary' : 'outline'}
                    onClick={handleCopyPromoCode}
                  >
                    {copied ? '✓ Nusxalandi' : 'Nusxalash'}
                  </Button>
                </div>
              </Card>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Harakatlar</h3>
            <div className="space-y-3">
              <Button fullWidth size="lg">
                Chegirmadan foydalanish
              </Button>
              <div className="w-full">
                <SaveButton
                  itemType="discount"
                  itemId={discount.id}
                  className="w-full h-10 rounded-lg font-medium"
                />
              </div>
              <Button fullWidth variant="ghost">
                Ulashish
              </Button>
            </div>

            {/* Brand Info */}
            {discount.brand && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Brend haqida
                </h4>
                <div className="flex items-center gap-3">
                  {discount.brand.logoUrl && (
                    <img
                      src={discount.brand.logoUrl}
                      alt={discount.brand.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {discount.brand.name}
                    </p>
                    {discount.brand.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {discount.brand.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
