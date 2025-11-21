'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePendingArticles, useReports, useBlogPlatformAnalytics } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Article, Report } from '@/types';

export default function AdminBlogPage() {
  const router = useRouter();
  const token = getToken();

  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'analytics'>('pending');

  const { articles: pendingArticles, isLoading: pendingLoading, mutate: mutatePending } = usePendingArticles();
  const { reports, isLoading: reportsLoading, mutate: mutateReports } = useReports({ status: 'pending' });
  const { analytics, isLoading: analyticsLoading } = useBlogPlatformAnalytics();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async (articleId: string) => {
    if (!token) return;

    setActionLoading(articleId);
    try {
      await api.approveArticle(token, articleId);
      mutatePending();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (articleId: string) => {
    if (!token || !rejectionReason.trim()) return;

    setActionLoading(articleId);
    try {
      await api.rejectArticle(token, articleId, rejectionReason.trim());
      setShowRejectModal(null);
      setRejectionReason('');
      mutatePending();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'warn' | 'remove') => {
    if (!token) return;

    setActionLoading(reportId);
    try {
      await api.resolveReport(token, reportId, { action });
      mutateReports();
    } catch (err) {
      console.error('Failed to resolve report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const reportReasonLabels: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Haqorat',
    inappropriate: 'Nomaqbul kontent',
    misinformation: 'Noto\'g\'ri ma\'lumot',
    copyright: 'Mualliflik huquqi buzilishi',
    other: 'Boshqa',
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Kirish talab qilinadi</h2>
          <p className="text-gray-600 mb-6">Admin panelini ko'rish uchun hisobingizga kiring</p>
          <Button onClick={() => router.push('/login')}>Kirish</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog moderatsiyasi</h1>
        <p className="text-gray-600 mt-1">Maqolalar va hisobotlarni boshqaring</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tekshiruvda ({pendingArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Shikoyatlar ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Statistika
        </button>
      </div>

      {/* Pending Articles Tab */}
      {activeTab === 'pending' && (
        <>
          {pendingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-48" />
                </Card>
              ))}
            </div>
          ) : pendingArticles.length === 0 ? (
            <Card>
              <EmptyState
                title="Tekshiruv kutilmagan"
                message="Hozircha tekshiruv kutayotgan maqolalar yo'q"
                showAction={false}
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingArticles.map((article: Article) => (
                <Card key={article.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-lg font-bold text-gray-900 hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                      {article.subtitle && (
                        <p className="text-gray-600 mt-1 line-clamp-2">{article.subtitle}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {article.author.avatarUrl ? (
                            <Image
                              src={article.author.avatarUrl}
                              alt={article.author.firstName}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-semibold">
                                {article.author.firstName[0]}
                              </span>
                            </div>
                          )}
                          <span>
                            {article.author.firstName} {article.author.lastName}
                          </span>
                        </div>
                        <span>{formatDate(article.createdAt)}</span>
                        <span>{article.readingTimeMinutes} min o'qish</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(article.id)}
                        disabled={actionLoading === article.id}
                      >
                        Tasdiqlash
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectModal(article.id)}
                        disabled={actionLoading === article.id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Rad etish
                      </Button>
                    </div>
                  </div>

                  {/* Reject Modal */}
                  {showRejectModal === article.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">Rad etish sababi</p>
                      <Input
                        placeholder="Sabab..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleReject(article.id)}
                          disabled={!rejectionReason.trim() || actionLoading === article.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Rad etish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
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
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-48" />
                </Card>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <EmptyState
                title="Shikoyatlar yo'q"
                message="Hozircha kutilayotgan shikoyatlar yo'q"
                showAction={false}
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report: Report) => (
                <Card key={report.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="warning" className="mb-2">
                        {reportReasonLabels[report.reason] || report.reason}
                      </Badge>
                      <p className="text-gray-900">{report.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(report.createdAt)}</span>
                  </div>

                  {report.article && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <p className="text-sm text-gray-500 mb-1">Shikoyat qilingan maqola:</p>
                      <Link
                        href={`/blog/${report.article.slug}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {report.article.title}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'dismiss')}
                      disabled={actionLoading === report.id}
                    >
                      Rad etish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'warn')}
                      disabled={actionLoading === report.id}
                      className="text-yellow-600 border-yellow-300"
                    >
                      Ogohlantirish
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveReport(report.id, 'remove')}
                      disabled={actionLoading === report.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      O'chirish
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-sm text-gray-600 mb-1">Jami maqolalar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalArticles || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Nashr qilingan</p>
                <p className="text-3xl font-bold text-green-600">{analytics.publishedArticles || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Tekshiruvda</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.pendingArticles || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Jami yozuvchilar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalWriters || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Jami ko'rishlar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalViews || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Jami alkishlar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalClaps || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Jami javoblar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalResponses || 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Faol teglar</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalTags || 0}</p>
              </Card>
            </div>
          ) : (
            <Card>
              <p className="text-gray-500 text-center py-8">Statistika mavjud emas</p>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
