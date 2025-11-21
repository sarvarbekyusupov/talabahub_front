'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { FollowButton } from '@/components/blog';
import { useStudentByUsername, useArticlesByAuthor } from '@/lib/hooks';
import { Article, Tag } from '@/types';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { student: profile, isLoading: profileLoading, error: profileError } = useStudentByUsername(username);
  const [page, setPage] = useState(1);
  const { articles, meta, isLoading: articlesLoading } = useArticlesByAuthor(username, {
    page,
    limit: 10,
    status: 'published',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (profileLoading) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <div className="flex items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Profil topilmadi</h2>
          <p className="text-gray-600">Bu foydalanuvchi mavjud emas yoki profili yashirin</p>
        </Card>
      </Container>
    );
  }

  const totalPages = meta?.totalPages || 1;

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            {profile.user.avatarUrl ? (
              <Image
                src={profile.user.avatarUrl}
                alt={`${profile.user.firstName} ${profile.user.lastName}`}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-2xl font-bold">
                  {profile.user.firstName[0]}{profile.user.lastName[0]}
                </span>
              </div>
            )}

            <div className="flex-1">
              {/* Name & Username */}
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.user.firstName} {profile.user.lastName}
                </h1>
                <FollowButton
                  username={username}
                  initialFollowing={profile.isFollowing}
                />
              </div>

              <p className="text-gray-500 mb-4">@{profile.user.username}</p>

              {/* Bio */}
              {profile.profile.bio && (
                <p className="text-gray-700 mb-4">{profile.profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900">{profile.stats.totalArticles || 0}</span>
                  <span className="text-gray-500 ml-1">maqola</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{profile.stats.totalFollowers || 0}</span>
                  <span className="text-gray-500 ml-1">kuzatuvchi</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{profile.stats.totalFollowing || 0}</span>
                  <span className="text-gray-500 ml-1">kuzatilayotgan</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{profile.stats.totalClaps || 0}</span>
                  <span className="text-gray-500 ml-1">alkish</span>
                </div>
              </div>

              {/* Field of Study */}
              {profile.profile.fieldOfStudy && (
                <div className="mt-4 text-sm text-gray-500">
                  <span>{profile.profile.fieldOfStudy}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Articles */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Maqolalar</h2>
        </div>

        {articlesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <EmptyState
              title="Maqolalar yo'q"
              message={`${profile.user.firstName} hali hech qanday maqola yozmagan`}
              showAction={false}
            />
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {articles.map((article: Article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <Card hover>
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {article.featuredImageUrl && (
                        <div className="relative w-32 h-24 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={article.featuredImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex gap-2 mb-2">
                          {article.tags?.slice(0, 2).map((tag: Tag) => (
                            <Badge key={tag.id} variant="info" className="text-xs">
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition">
                          {article.title}
                        </h3>

                        {/* Subtitle */}
                        {article.subtitle && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {article.subtitle}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                          <span>{article.readingTimeMinutes} min o'qish</span>
                          <span>{article.stats?.clapsCount || 0} alkish</span>
                          <span>{article.stats?.responsesCount || 0} javob</span>
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
    </Container>
  );
}
