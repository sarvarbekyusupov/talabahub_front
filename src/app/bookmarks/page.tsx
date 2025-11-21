'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBookmarks } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Bookmark, Tag } from '@/types';

export default function BookmarksPage() {
  const router = useRouter();
  const token = getToken();

  const { bookmarks, isLoading, error, mutate } = useBookmarks();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRemoveBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) return;

    try {
      await api.bookmarkArticle(token, articleId); // Toggle bookmark
      mutate();
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Kirish talab qilinadi</h2>
          <p className="text-gray-600 mb-6">Saqlangan maqolalarni ko'rish uchun hisobingizga kiring</p>
          <Button onClick={() => router.push('/login')}>Kirish</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Saqlangan maqolalar</h1>
        <p className="text-gray-600 mt-1">
          {bookmarks.length} ta maqola
        </p>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-600">Xatolik yuz berdi: {error.message}</p>
        </Card>
      ) : bookmarks.length === 0 ? (
        <Card>
          <EmptyState
            title="Saqlangan maqolalar yo'q"
            message="Siz hali hech qanday maqola saqlamadingiz"
            actionText="Maqolalarni ko'rish"
            onAction={() => router.push('/blog')}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark: Bookmark) => (
            <Link key={bookmark.id} href={`/blog/${bookmark.article.slug}`}>
              <Card hover className="flex gap-4">
                {/* Thumbnail */}
                {bookmark.article.featuredImageUrl && (
                  <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={bookmark.article.featuredImageUrl}
                      alt={bookmark.article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex gap-2 mb-2">
                    {bookmark.article.tags?.slice(0, 2).map((tag: Tag) => (
                      <Badge key={tag.id} variant="info" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                    {bookmark.article.title}
                  </h3>

                  {/* Subtitle */}
                  {bookmark.article.subtitle && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {bookmark.article.subtitle}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {bookmark.article.author.firstName} {bookmark.article.author.lastName}
                    </span>
                    <span>Saqlangan: {formatDate(bookmark.createdAt)}</span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveBookmark(bookmark.article.id, e)}
                  className="p-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                  title="Saqlangandan olib tashlash"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
