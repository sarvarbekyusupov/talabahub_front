'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFeed, useTrendingArticles, useTags } from '@/lib/hooks';
import { getToken } from '@/lib/auth';
import { Article, Tag } from '@/types';

type FeedType = 'for-you' | 'following' | 'trending' | 'university';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = getToken();

  const initialTab = (searchParams.get('tab') as FeedType) || 'for-you';
  const [feedType, setFeedType] = useState<FeedType>(initialTab);
  const [page, setPage] = useState(1);

  // Fetch feed based on type
  const { articles: feed, nextOffset, isLoading, error } = useFeed({
    type: feedType,
    page,
    limit: 10,
  });
  const meta = { totalPages: nextOffset ? page + 1 : page };

  // Fetch trending for sidebar
  const { articles: trendingArticles } = useTrendingArticles({ limit: 5 });

  // Fetch tags for sidebar
  const { tags } = useTags({ popular: 'true', limit: 10 });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleTabChange = (tab: FeedType) => {
    setFeedType(tab);
    setPage(1);
    router.push(`/feed?tab=${tab}`, { scroll: false });
  };

  const totalPages = meta?.totalPages || 1;

  const tabs: { key: FeedType; label: string; requiresAuth: boolean }[] = [
    { key: 'for-you', label: 'Siz uchun', requiresAuth: true },
    { key: 'following', label: 'Kuzatilayotgan', requiresAuth: true },
    { key: 'trending', label: 'Trendda', requiresAuth: false },
    { key: 'university', label: 'Universitet', requiresAuth: true },
  ];

  return (
    <Container className="py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Lenta</h1>
            <p className="text-gray-600 mt-1">
              Sizga moslashtirilgan maqolalar
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const isDisabled = tab.requiresAuth && !token;
              return (
                <button
                  key={tab.key}
                  onClick={() => !isDisabled && handleTabChange(tab.key)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    feedType === tab.key
                      ? 'bg-blue-600 text-white'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isDisabled ? 'Kirish talab qilinadi' : ''}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Auth required message for certain feeds */}
          {!token && (feedType === 'for-you' || feedType === 'following' || feedType === 'university') && (
            <Card className="mb-6 bg-blue-50 border-blue-100">
              <div className="text-center py-4">
                <p className="text-blue-700 mb-4">
                  Bu lentani ko'rish uchun hisobingizga kiring
                </p>
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Kirish
                </Link>
              </div>
            </Card>
          )}

          {/* Articles */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 mb-4" />
                  <Skeleton className="h-6 mb-2" />
                  <Skeleton className="h-4 mb-4" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-600">Xatolik yuz berdi: {error.message}</p>
            </Card>
          ) : feed.length === 0 ? (
            <Card>
              <EmptyState
                title="Maqolalar yo'q"
                message={
                  feedType === 'following'
                    ? "Kuzatilayotgan mualliflar hali maqola yozmagan. Yangi mualliflarni kuzating!"
                    : "Hozircha hech qanday maqola yo'q"
                }
                actionText={feedType === 'following' ? "Mualliflarni topish" : "Blogga o'tish"}
                onAction={() => router.push(feedType === 'following' ? '/blog' : '/blog')}
              />
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {feed.map((article: Article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <Card hover className="flex flex-col">
                      {/* Cover Image */}
                      {article.featuredImageUrl && (
                        <div className="relative h-48 mb-4 overflow-hidden rounded-lg -mx-6 -mt-6">
                          <Image
                            src={article.featuredImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Tags & Date */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {article.tags?.slice(0, 2).map((tag: Tag) => (
                          <Badge key={tag.id} variant="info" className="text-xs">
                            #{tag.name}
                          </Badge>
                        ))}
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedAt || article.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
                        {article.title}
                      </h3>

                      {/* Subtitle */}
                      {article.subtitle && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.subtitle}
                        </p>
                      )}

                      {/* Author & Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          {article.author.avatarUrl ? (
                            <Image
                              src={article.author.avatarUrl}
                              alt={article.author.firstName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-semibold">
                                {article.author.firstName[0]}
                                {article.author.lastName[0]}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700">
                            {article.author.firstName} {article.author.lastName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{article.stats?.clapsCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{article.stats?.responsesCount || 0}</span>
                          </div>
                          <span>{article.readingTimeMinutes} min</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Oldingi
                  </button>
                  <span className="text-gray-600">
                    Sahifa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keyingi
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          {/* Trending Articles */}
          <Card className="mb-6">
            <h3 className="font-bold text-lg mb-4">Trendda</h3>
            <div className="space-y-4">
              {trendingArticles.slice(0, 5).map((article: Article, index: number) => (
                <Link key={article.id} href={`/blog/${article.slug}`} className="block group">
                  <div className="flex gap-3">
                    <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {article.author.firstName} {article.author.lastName}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Popular Tags */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Mashhur teglar</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: Tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
