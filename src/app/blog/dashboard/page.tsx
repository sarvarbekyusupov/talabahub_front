'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyDrafts, useStudentWriterAnalytics, useArticlesByAuthor } from '@/lib/hooks';
import { getToken } from '@/lib/auth';
import { Article, ArticleDraft } from '@/types';

export default function WriterDashboardPage() {
  const router = useRouter();
  const token = getToken();

  const { drafts, isLoading: draftsLoading } = useMyDrafts();
  const { analytics, isLoading: analyticsLoading } = useStudentWriterAnalytics();
  // TODO: Need to get current user's username for this
  const { articles, isLoading: articlesLoading } = useArticlesByAuthor('', {
    limit: 5,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Kirish talab qilinadi</h2>
          <p className="text-gray-600 mb-6">Yozuvchi panelini ko'rish uchun hisobingizga kiring</p>
          <Button onClick={() => router.push('/login')}>Kirish</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yozuvchi paneli</h1>
          <p className="text-gray-600 mt-1">Maqolalaringiz statistikasi</p>
        </div>
        <Link href="/blog/write">
          <Button>Yangi maqola</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Jami ko'rishlar</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.totalViews || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Jami alkishlar</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.totalClaps || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Jami javoblar</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.totalResponses || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Kuzatuvchilar</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.followersCount || 0)}
            </p>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Articles Performance */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Maqolalar statistikasi</h2>
              <Link href="/blog/drafts" className="text-blue-600 text-sm hover:underline">
                Barchasini ko'rish
              </Link>
            </div>

            {articlesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Siz hali maqola yozmadingiz</p>
                <Link href="/blog/write">
                  <Button size="sm">Birinchi maqolani yozish</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article: Article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="text-center">
                        <p className="font-semibold">{article.stats?.viewsCount || 0}</p>
                        <p className="text-xs text-gray-400">ko'rish</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{article.stats?.clapsCount || 0}</p>
                        <p className="text-xs text-gray-400">alkish</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{article.stats?.responsesCount || 0}</p>
                        <p className="text-xs text-gray-400">javob</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Article Status Overview */}
          {analytics && (
            <Card>
              <h2 className="text-lg font-bold mb-4">Maqolalar holati</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.publishedCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Nashr qilingan</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.pendingCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Tekshiruvda</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {drafts.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Qoralamalar</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.rejectedCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Rad etilgan</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="font-bold mb-4">Tezkor harakatlar</h3>
            <div className="space-y-2">
              <Link href="/blog/write" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yangi maqola
                </Button>
              </Link>
              <Link href="/blog/drafts" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Qoralamalar
                </Button>
              </Link>
              <Link href="/bookmarks" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saqlangan
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Drafts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Qoralamalar</h3>
              <Link href="/blog/drafts" className="text-blue-600 text-sm hover:underline">
                Barchasi
              </Link>
            </div>

            {draftsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Qoralamalar yo'q
              </p>
            ) : (
              <div className="space-y-3">
                {drafts.slice(0, 3).map((draft: ArticleDraft) => (
                  <Link key={draft.id} href={`/blog/edit/${draft.id}`}>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {draft.title || 'Sarlavhasiz qoralama'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(draft.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-100">
            <h3 className="font-bold mb-2">Maslahatlar</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Muntazam yozing - haftada kamida 1 maqola</li>
              <li>• Qiziqarli sarlavhalar yarating</li>
              <li>• Teglardan to'g'ri foydalaning</li>
              <li>• Boshqa mualliflarni o'qing va fikr bildiring</li>
            </ul>
          </Card>
        </div>
      </div>
    </Container>
  );
}
