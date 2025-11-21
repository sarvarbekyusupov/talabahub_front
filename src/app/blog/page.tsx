'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, NoSearchResults } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useArticles, useTrendingArticles, useTags } from '@/lib/hooks';
import { Article, Tag } from '@/types';

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [feedType, setFeedType] = useState<'latest' | 'trending' | 'popular'>('latest');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch articles with filters
  const { articles, meta, isLoading, error } = useArticles({
    page,
    limit: 12,
    status: 'published',
    tag: selectedTag || undefined,
    sort: feedType,
  });

  // Fetch trending for sidebar
  const { articles: trendingArticles } = useTrendingArticles({ limit: 5 });

  // Fetch tags
  const { tags } = useTags({ popular: 'true', limit: 10 });

  // Filter by search (client-side for immediate feedback)
  const filteredArticles = debouncedSearch
    ? articles.filter(
        (article: Article) =>
          article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          article.subtitle?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          article.author.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          article.author.lastName.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : articles;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <Container className="py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
            <p className="text-lg text-gray-600">
              Talabalar tomonidan yozilgan maqolalar va tajribalar
            </p>
          </div>

          {/* Feed Type Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'latest', label: 'Yangi' },
              { key: 'trending', label: 'Trendda' },
              { key: 'popular', label: 'Mashhur' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFeedType(tab.key as typeof feedType);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  feedType === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <Card className="mb-6">
            <Input
              type="text"
              placeholder="Maqola yoki muallif bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  Qidiruvni tozalash
                </Button>
              </div>
            )}
          </Card>

          {/* Selected Tag */}
          {selectedTag && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-gray-600">Teg:</span>
              <Badge variant="info">#{selectedTag}</Badge>
              <button
                onClick={() => setSelectedTag('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && articles.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-600">
                {filteredArticles.length} ta maqola topildi
              </p>
            </div>
          )}

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 mb-4" />
                  <Skeleton className="h-6 mb-2" />
                  <Skeleton className="h-4 mb-4" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              {debouncedSearch ? (
                <NoSearchResults onClearSearch={() => setSearchQuery('')} />
              ) : (
                <EmptyState
                  title="Maqolalar yo'q"
                  message="Hozircha hech qanday maqola qo'shilmagan."
                  showAction={false}
                />
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article: Article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <Card hover className="h-full flex flex-col">
                      {/* Cover Image */}
                      {article.featuredImageUrl && (
                        <div className="relative h-48 mb-4 overflow-hidden rounded-t-lg -mx-6 -mt-6">
                          <Image
                            src={article.featuredImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex-1 flex flex-col">
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
                          <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                            {article.subtitle}
                          </p>
                        )}

                        {/* Author & Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
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
                            {/* Claps */}
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{article.stats?.clapsCount || 0}</span>
                            </div>
                            {/* Responses */}
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{article.stats?.responsesCount || 0}</span>
                            </div>
                            {/* Reading time */}
                            <span>{article.readingTimeMinutes} min</span>
                          </div>
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
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(tag.slug);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedTag === tag.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
