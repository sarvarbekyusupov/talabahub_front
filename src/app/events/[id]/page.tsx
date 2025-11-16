'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SaveButton } from '@/components/ui/SaveButton';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { api as clientApi } from '@/lib/api';
import { Event as EventType, Review, Rating, PaginatedResponse } from '@/types';
import { getToken } from '@/lib/auth';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventType[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
      loadReviews();
      loadRating();
      loadCurrentUser();
    }
  }, [id]);

  useEffect(() => {
    if (event) {
      loadRelatedEvents();
    }
  }, [event]);

  // Countdown timer effect
  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventDate = new Date(event.eventDate).getTime();
      const difference = eventDate - now;

      // Only show countdown if event is in the future and within 30 days
      const daysUntil = Math.floor(difference / (1000 * 60 * 60 * 24));
      if (difference > 0 && daysUntil <= 30) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setCountdown(`${days} kun ${hours} soat ${minutes} daqiqa qoldi`);
      } else {
        setCountdown('');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event]);

  const loadEvent = async () => {
    try {
      const data = await clientApi.getEvent(id) as EventType;
      setEvent(data);
    } catch (err: any) {
      setError('Tadbir topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedEvents = async () => {
    if (!event) return;

    try {
      // Fetch events of the same type, limit to 4
      const data = await clientApi.getEvents({
        eventType: event.eventType,
        limit: 5,
        isActive: true,
      }) as PaginatedResponse<EventType>;

      // Filter out current event and take only 4
      const filtered = data.data.filter(e => e.id !== event.id).slice(0, 4);
      setRelatedEvents(filtered);
    } catch (err) {
      console.error('Error loading related events:', err);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await clientApi.getReviews('events', id) as PaginatedResponse<Review>;
      setReviews(data.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadRating = async () => {
    try {
      const data = await clientApi.getRating('events', id) as Rating;
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

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (editingReview) {
      await clientApi.updateReview(token, 'events', id, editingReview.id, data);
      setEditingReview(null);
    } else {
      await clientApi.createReview(token, 'events', id, data);
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

    await clientApi.deleteReview(token, 'events', id, reviewId);
    await loadReviews();
    await loadRating();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleRegister = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setRegistering(true);
    try {
      await clientApi.registerForEvent(token, id);
      alert('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
      loadEvent(); // Reload to update participant count
    } catch (err: any) {
      alert('Ro\'yxatdan o\'tishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'));
    } finally {
      setRegistering(false);
    }
  };

  const getEventTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      workshop: { label: 'Workshop', variant: 'primary' },
      conference: { label: 'Konferensiya', variant: 'success' },
      seminar: { label: 'Seminar', variant: 'info' },
      webinar: { label: 'Vebinar', variant: 'warning' },
      competition: { label: 'Musobaqa', variant: 'danger' },
      networking: { label: 'Networking', variant: 'info' },
    };
    return types[type] || { label: type, variant: 'info' };
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event?.title || '');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const generateICSFile = () => {
    if (!event) return;

    const eventDate = new Date(event.eventDate);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TalabaHub//Event//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@talabahub.uz`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(eventDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToGoogleCalendar = () => {
    if (!event) return;

    const eventDate = new Date(event.eventDate);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${formatGoogleDate(eventDate)}/${formatGoogleDate(endDate)}`,
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const getCapacityStatus = () => {
    if (!event?.maxParticipants) return null;

    const registered = event.registeredCount || 0;
    const max = event.maxParticipants;
    const percentage = (registered / max) * 100;
    const seatsLeft = max - registered;

    let statusColor = 'bg-green-500';
    let statusText = 'Ko\'p o\'rin mavjud';

    if (percentage >= 90) {
      statusColor = 'bg-red-500';
      statusText = 'Deyarli to\'lgan';
    } else if (percentage >= 70) {
      statusColor = 'bg-yellow-500';
      statusText = 'Kam o\'rin qoldi';
    }

    return { percentage, seatsLeft, statusColor, statusText };
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tadbir topilmadi</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/events')}>
              Tadbirlarga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const typeBadge = getEventTypeBadge(event.eventType);
  const isFull = event.maxParticipants && event.registeredCount && event.registeredCount >= event.maxParticipants;
  const capacityStatus = getCapacityStatus();

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {event.imageUrl && (
              <div className="relative w-full h-64 mb-6">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{event.title}</h1>
              <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
            </div>

            {/* Countdown Timer */}
            {countdown && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tadbir boshlanishiga</p>
                    <p className="text-lg font-bold text-blue-700">{countdown}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Date/Time Display */}
            <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center border-2 border-gray-300">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {new Date(event.eventDate).toLocaleString('uz-UZ', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {new Date(event.eventDate).getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Sana va vaqt</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Date(event.eventDate).toLocaleString('uz-UZ', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-lg font-semibold text-indigo-600 mt-1">
                    {new Date(event.eventDate).toLocaleString('uz-UZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Toshkent vaqti (UTC+5)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Joylashuv</p>
                  <p className="text-gray-900 font-semibold">{event.location}</p>
                </div>
              </div>

              {event.maxParticipants && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ishtirokchilar</p>
                    <p className="text-gray-900 font-semibold">
                      {event.registeredCount || 0} / {event.maxParticipants}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Tadbir haqida</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          </Card>

          {/* Related Events Section */}
          {relatedEvents.length > 0 && (
            <div className="mt-8">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">O'xshash tadbirlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedEvents.map((relatedEvent) => {
                    const relatedTypeBadge = getEventTypeBadge(relatedEvent.eventType);
                    return (
                      <Link
                        key={relatedEvent.id}
                        href={`/events/${relatedEvent.id}`}
                        className="group block"
                      >
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-indigo-300">
                          {relatedEvent.imageUrl && (
                            <div className="relative w-full h-32 mb-3">
                              <Image
                                src={relatedEvent.imageUrl}
                                alt={relatedEvent.title}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                              {relatedEvent.title}
                            </h3>
                            <Badge variant={relatedTypeBadge.variant} size="sm">
                              {relatedTypeBadge.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {new Date(relatedEvent.eventDate).toLocaleString('uz-UZ', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-8">
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
        </div>

        <div>
          <Card className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Ro'yxatdan o'tish</h3>

            {/* Capacity Indicator */}
            {capacityStatus && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{capacityStatus.statusText}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {capacityStatus.seatsLeft} o'rin qoldi
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${capacityStatus.statusColor}`}
                    style={{ width: `${capacityStatus.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {event.registeredCount || 0} / {event.maxParticipants} ishtirokchi ro'yxatdan o'tgan
                </p>
              </div>
            )}

            {isFull ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  Barcha o'rinlar band. Ro'yxatdan o'tish mumkin emas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleRegister}
                  loading={registering}
                >
                  Ro'yxatdan o'tish
                </Button>
                <div className="w-full">
                  <SaveButton
                    itemType="event"
                    itemId={event.id}
                    className="w-full h-10 rounded-lg font-medium"
                  />
                </div>

                {/* Social Sharing */}
                <div className="relative">
                  <Button
                    fullWidth
                    variant="ghost"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Ulashish
                  </Button>

                  {showShareMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {copySuccess ? 'Nusxalandi!' : 'Havolani nusxalash'}
                        </span>
                      </button>
                      <button
                        onClick={handleShareTelegram}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                      >
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.093.036.306.02.472z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Telegram orqali</span>
                      </button>
                      <button
                        onClick={handleShareFacebook}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Facebook orqali</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Add to Calendar */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Kalendaringizga qo'shing</p>
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      variant="outline"
                      size="sm"
                      onClick={handleAddToGoogleCalendar}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                      </svg>
                      Google Calendar
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      size="sm"
                      onClick={generateICSFile}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      .ics faylini yuklab olish
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {event.isActive && (
              <div className="mt-4">
                <Badge variant="success" size="md">Aktiv tadbir</Badge>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
