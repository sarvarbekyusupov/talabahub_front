'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTagBySlug, useArticles } from '@/lib/hooks';
import { Article, Tag } from '@/types';

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { tag, isLoading: tagLoading, error: tagError } = useTagBySlug(slug);
  const [page, setPage] = useState(1);

  const { articles, meta, isLoading: articlesLoading } = useArticles({
    page,
    limit: 12,
    status: 'published',
    tag: slug,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = meta?.totalPages || 1;

  // Loading state
  if (tagLoading) {
    return (
      <Container className="py-8">
        <Card className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </Card>
      </Container>
    );
  }

  // Error state
  if (tagError || !tag) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Teg topilmadi</h2>
          <p className="text-gray-600 mb-6">Bu teg mavjud emas</p>
          <button
            onClick={() => router.push('/tags')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Barcha teglar
          </button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Tag Header */}
      <Card className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">#{tag.name}</h1>
            {tag.description && (
              <p className="text-gray-600 mb-4">{tag.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {tag.articlesCount || 0} ta maqola
            </p>
          </div>
        </div>
      </Card>

      {/* Articles */}
      {articlesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 mb-4" />
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4 mb-4" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <EmptyState
            title="Maqolalar yo'q"
            message={`"${tag.name}" tegi bo'yicha hali maqola yo'q`}
            actionText="Barcha maqolalar"
            onAction={() => router.push('/blog')}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article: Article) => (
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
                      {article.tags?.slice(0, 2).map((t: Tag) => (
                        <Badge
                          key={t.id}
                          variant={t.slug === slug ? 'info' : 'default'}
                          className="text-xs"
                        >
                          #{t.name}
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
                        <span>{article.stats?.clapsCount || 0}</span>
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
    </Container>
  );
}
