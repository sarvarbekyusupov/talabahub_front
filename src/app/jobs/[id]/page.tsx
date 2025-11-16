'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { SaveButton } from '@/components/ui/SaveButton';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { useToast } from '@/components/ui/Toast';
import { api as clientApi } from '@/lib/api';
import { Job as JobType, Review, Rating, PaginatedResponse } from '@/types';
import { getToken } from '@/lib/auth';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();

  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cvUrl: '',
    coverLetter: '',
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobType[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
      loadReviews();
      loadRating();
      loadCurrentUser();
    }
  }, [id]);

  useEffect(() => {
    if (job) {
      loadRelatedJobs();
    }
  }, [job]);

  const loadJob = async () => {
    try {
      const data = await clientApi.getJob(id) as JobType;
      setJob(data);
    } catch (err: any) {
      setError('Ish o\'rni topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await clientApi.getReviews('jobs', id) as PaginatedResponse<Review>;
      setReviews(data.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadRating = async () => {
    try {
      const data = await clientApi.getRating('jobs', id) as Rating;
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

  const loadRelatedJobs = async () => {
    if (!job) return;

    setLoadingRelated(true);
    try {
      // Try to get jobs from the same company first
      const params: Record<string, any> = {
        limit: '4',
      };

      // We'll fetch all jobs and filter on the client side
      const data = await clientApi.getJobs(params) as PaginatedResponse<JobType>;

      // Filter out the current job and get jobs from the same company
      const sameCompanyJobs = data.data
        .filter((j) => j.id !== job.id && j.company.id === job.company.id)
        .slice(0, 4);

      // If we have enough jobs from the same company, use those
      if (sameCompanyJobs.length >= 3) {
        setRelatedJobs(sameCompanyJobs.slice(0, 4));
      } else {
        // Otherwise, mix with jobs of the same type
        const sameTypeJobs = data.data
          .filter((j) => j.id !== job.id && j.jobType === job.jobType && j.company.id !== job.company.id)
          .slice(0, 4 - sameCompanyJobs.length);

        setRelatedJobs([...sameCompanyJobs, ...sameTypeJobs].slice(0, 4));
      }
    } catch (err) {
      console.error('Error loading related jobs:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const getDaysUntilDeadline = () => {
    if (!job) return null;
    const deadline = new Date(job.applicationDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const copyLinkToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      showToast('Havola nusxalandi!', 'success');
    } catch (err) {
      showToast('Havolani nusxalashda xatolik', 'error');
    }
  };

  const shareOnTelegram = () => {
    const url = window.location.href;
    const text = `${job?.title} - ${job?.company.name}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
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
      await clientApi.updateReview(token, 'jobs', id, editingReview.id, data);
      setEditingReview(null);
    } else {
      await clientApi.createReview(token, 'jobs', id, data);
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

    await clientApi.deleteReview(token, 'jobs', id, reviewId);
    await loadReviews();
    await loadRating();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!applicationData.cvUrl) {
      showToast('Iltimos, CV faylini yuklang', 'error');
      return;
    }

    setApplying(true);
    try {
      await clientApi.applyForJob(token, id, applicationData);
      showToast('Ariza muvaffaqiyatli yuborildi!', 'success');
      setShowApplyForm(false);
      setApplicationData({ cvUrl: '', coverLetter: '' });
    } catch (err: any) {
      showToast('Ariza yuborishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleResumeUpload = async (file: File): Promise<string> => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      throw new Error('Not authenticated');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('resume', file);

    // In a real implementation, this would upload to your backend
    // For now, we'll simulate it with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would be:
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/resume`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: formData
    // });
    // const data = await response.json();
    // return data.fileUrl;

    // For now, create a simulated URL
    const url = `https://example.com/resumes/${file.name}`;

    // Update application data with CV URL
    setApplicationData(prev => ({ ...prev, cvUrl: url }));

    return url;
  };

  const handleResumeRemove = () => {
    setApplicationData(prev => ({ ...prev, cvUrl: '' }));
  };

  const getJobTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      full_time: { label: 'To\'liq vaqt', variant: 'primary' },
      part_time: { label: 'Qisman vaqt', variant: 'info' },
      internship: { label: 'Amaliyot', variant: 'warning' },
      contract: { label: 'Kontrakt', variant: 'success' },
    };
    return types[type] || { label: type, variant: 'info' };
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ish o'rni topilmadi
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/jobs')}>
              Ish o'rinlariga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const typeBadge = getJobTypeBadge(job.jobType);
  const daysUntilDeadline = getDaysUntilDeadline();

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4 mb-6">
              {job.company.logoUrl && (
                <Image
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  width={80}
                  height={80}
                  className="object-contain rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{job.company.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  {job.isActive && <Badge variant="success">Aktiv</Badge>}
                  {daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                    <Badge variant="warning">
                      Muddati yaqin - {daysUntilDeadline} kun qoldi
                    </Badge>
                  )}
                  {daysUntilDeadline !== null && daysUntilDeadline <= 0 && (
                    <Badge variant="danger">Muddat tugagan</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Joylashuv</h3>
                <p className="text-gray-900">{job.location}</p>
              </div>
              {job.salary && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Maosh</h3>
                  <p className="text-gray-900">{job.salary} so'm</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Muddat</h3>
                <p className="text-gray-900">
                  {new Date(job.applicationDeadline).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Tavsif</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Talablar</h2>
                <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Majburiyatlar</h2>
                <div className="text-gray-700 whitespace-pre-line">{job.responsibilities}</div>
              </div>
            )}
          </Card>

          {/* Application Form */}
          {showApplyForm && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Ariza topshirish</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV yuklash *
                  </label>
                  <FileUpload
                    currentFile={applicationData.cvUrl}
                    onUpload={handleResumeUpload}
                    onRemove={handleResumeRemove}
                    maxSizeMB={10}
                    acceptedTypes={['.pdf', '.doc', '.docx']}
                    label="CV faylini yuklang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qo'shimcha xat (ixtiyoriy)
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, coverLetter: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nega siz bu lavozimga mos kelishingiz haqida yozing..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={applying}>
                    Yuborish
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Harakatlar</h3>
            <div className="space-y-3">
              {!showApplyForm ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setShowApplyForm(true)}
                >
                  Ariza topshirish
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  variant="outline"
                  onClick={() => setShowApplyForm(false)}
                >
                  Formani yopish
                </Button>
              )}
              <div className="w-full">
                <SaveButton
                  itemType="job"
                  itemId={job.id}
                  className="w-full h-10 rounded-lg font-medium"
                />
              </div>

              {/* Social Sharing */}
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ulashish</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={copyLinkToClipboard}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-brand hover:bg-brand/5 transition-all"
                    title="Havolani nusxalash"
                  >
                    <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-600">Nusxa</span>
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-[#0088cc] hover:bg-[#0088cc]/5 transition-all"
                    title="Telegram orqali ulashish"
                  >
                    <svg className="w-5 h-5 text-[#0088cc] mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.325.016.093.036.305.02.469z"/>
                    </svg>
                    <span className="text-xs text-gray-600">Telegram</span>
                  </button>
                  <button
                    onClick={shareOnFacebook}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-[#1877f2] hover:bg-[#1877f2]/5 transition-all"
                    title="Facebook orqali ulashish"
                  >
                    <svg className="w-5 h-5 text-[#1877f2] mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs text-gray-600">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Kompaniya haqida</h3>
            <div className="flex items-start gap-4">
              {job.company.logoUrl && (
                <div className="flex-shrink-0">
                  <Image
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    width={64}
                    height={64}
                    className="object-contain rounded-lg border-2 border-gray-100 p-2"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {job.company.name}
                </h4>
                {job.company.industry && (
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm text-gray-600">{job.company.industry}</span>
                  </div>
                )}
              </div>
            </div>
            {job.company.description && (
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
                {job.company.description}
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">O'xshash ish o'rinlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedJobs.map((relatedJob) => {
              const relatedTypeBadge = getJobTypeBadge(relatedJob.jobType);
              return (
                <Link key={relatedJob.id} href={`/jobs/${relatedJob.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start gap-4">
                      {relatedJob.company?.logoUrl && (
                        <div className="flex-shrink-0">
                          <Image
                            src={relatedJob.company.logoUrl}
                            alt={relatedJob.company.name}
                            width={48}
                            height={48}
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {relatedJob.title}
                          </h3>
                          <Badge variant={relatedTypeBadge.variant} size="sm">
                            {relatedTypeBadge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{relatedJob.company?.name}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{relatedJob.location}</span>
                          </div>
                          {relatedJob.salary && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{relatedJob.salary} so'm</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(relatedJob.applicationDeadline).toLocaleDateString('uz-UZ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
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
