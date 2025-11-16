'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SaveButton } from '@/components/ui/SaveButton';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { api as clientApi } from '@/lib/api';
import { Course as CourseType, Review, Rating, PaginatedResponse } from '@/types';
import { getToken } from '@/lib/auth';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseType[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
      loadReviews();
      loadRating();
      loadCurrentUser();
    }
  }, [id]);

  useEffect(() => {
    if (course) {
      loadRelatedCourses();
    }
  }, [course]);

  const loadCourse = async () => {
    try {
      const data = await clientApi.getCourse(id) as CourseType;
      setCourse(data);
    } catch (err: any) {
      setError('Kurs topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await clientApi.getReviews('courses', id) as PaginatedResponse<Review>;
      setReviews(data.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadRating = async () => {
    try {
      const data = await clientApi.getRating('courses', id) as Rating;
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

  const loadRelatedCourses = async () => {
    try {
      const data = await clientApi.getCourses({ limit: 4 }) as PaginatedResponse<CourseType>;
      // Filter out the current course and limit to 3-4 related courses
      const filtered = data.data.filter((c: CourseType) => c.id !== id).slice(0, 4);
      setRelatedCourses(filtered);
    } catch (err) {
      console.error('Error loading related courses:', err);
    }
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (editingReview) {
      await clientApi.updateReview(token, 'courses', id, editingReview.id, data);
      setEditingReview(null);
    } else {
      await clientApi.createReview(token, 'courses', id, data);
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

    await clientApi.deleteReview(token, 'courses', id, reviewId);
    await loadReviews();
    await loadRating();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEnroll = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await clientApi.enrollInCourse(token, id);
      alert('Kursga muvaffaqiyatli yozildingiz!');
    } catch (err: any) {
      alert('Kursga yozilishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'));
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${course?.title} - TalabaHub`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kurs topilmadi</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/courses')}>
              Kurslarga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {course.imageUrl && (
              <div className="relative w-full h-64 mb-6">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b">
              {rating && (
                <div className="flex items-center gap-2">
                  <RatingStars rating={rating.average} size="md" />
                  <span className="text-lg font-semibold text-gray-900">{rating.average.toFixed(1)}</span>
                  <span className="text-gray-600">({rating.count} ta sharh)</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{course.duration}</span>
                </div>
              )}
            </div>

            {/* Partner Info with Logo */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Ta'lim markazi</h3>
              <div className="flex items-center gap-4">
                {course.partner.logoUrl && (
                  <Image
                    src={course.partner.logoUrl}
                    alt={course.partner.name}
                    width={64}
                    height={64}
                    className="object-contain rounded-lg border border-gray-200 p-2"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">{course.partner.name}</p>
                  <p className="text-sm text-gray-600">Tasdiqlangan hamkor</p>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Kurs haqida</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{course.description}</p>
            </div>

            {/* What You'll Learn - Mock data (will be dynamic when API supports it) */}
            <div className="mb-6 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Siz nimalarni o'rganasiz</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Asosiy konsepsiyalar va nazariya</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Amaliy mashg'ulotlar va topshiriqlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Real loyihalar ustida ishlash</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Sertifikat olish imkoniyati</span>
                </li>
              </ul>
            </div>

            {/* Prerequisites - Mock data */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Talablar</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Kompyuter va internet ulanishi</li>
                <li>O'rganishga intilish va motivatsiya</li>
                <li>Darslarni muntazam kuzatish</li>
              </ul>
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            {/* Enhanced Price Display */}
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Kurs narxi</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-4xl font-bold text-blue-600">
                  {formatPrice(course.price)}
                </p>
                <span className="text-xl font-semibold text-gray-700">so'm</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handleEnroll}
                loading={enrolling}
                className="h-12 text-base font-semibold"
              >
                Kursga yozilish
              </Button>
              <div className="w-full">
                <SaveButton
                  itemType="course"
                  itemId={course.id}
                  className="w-full h-10 rounded-lg font-medium"
                />
              </div>
            </div>

            {/* Social Sharing Buttons */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Ulashish</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Havolani nusxalash"
                >
                  <svg className="w-5 h-5 text-gray-700 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    {copiedLink ? 'Nusxalandi!' : 'Nusxalash'}
                  </span>
                </button>

                <button
                  onClick={handleShareTelegram}
                  className="flex flex-col items-center justify-center p-3 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Telegramda ulashish"
                >
                  <svg className="w-5 h-5 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span className="text-xs font-medium text-blue-700">Telegram</span>
                </button>

                <button
                  onClick={handleShareFacebook}
                  className="flex flex-col items-center justify-center p-3 border border-blue-400 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Facebookda ulashish"
                >
                  <svg className="w-5 h-5 text-blue-700 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-medium text-blue-800">Facebook</span>
                </button>
              </div>
            </div>

            {/* Course Info */}
            <div className="mt-6 pt-6 border-t space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Kurs haqida ma'lumot
              </h4>

              {course.duration && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Davomiyligi</p>
                    <p className="font-semibold text-gray-900">{course.duration}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Daraja</p>
                  <p className="font-semibold text-gray-900">Barcha darajalar</p>
                </div>
              </div>

              {rating && rating.count > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">O'rtacha baho</p>
                    <p className="font-semibold text-gray-900">{rating.average.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Talabalar</p>
                  <p className="font-semibold text-gray-900">
                    {rating ? rating.count * 10 : '50'}+ talaba
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Related/Similar Courses Section */}
      {relatedCourses.length > 0 && (
        <div className="mt-12">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">O'xshash kurslar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <div
                  key={relatedCourse.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/courses/${relatedCourse.id}`)}
                >
                  {relatedCourse.imageUrl && (
                    <div className="relative w-full h-40">
                      <Image
                        src={relatedCourse.imageUrl}
                        alt={relatedCourse.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {relatedCourse.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{relatedCourse.partner.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(relatedCourse.price)} so'm
                      </span>
                    </div>
                    {relatedCourse.duration && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{relatedCourse.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

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
