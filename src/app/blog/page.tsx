'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { api } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
}

interface PaginatedResponse {
  data: BlogPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getBlogPosts({ page, limit: 12 }) as PaginatedResponse;
      setPosts(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      // Silently fail - blog endpoint may not be available yet
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter using useMemo
  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (post.author.firstName + ' ' + post.author.lastName).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (post.category?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [posts, debouncedSearch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-lg text-gray-600">
          Yangiliklar, maslahatlar va foydali maqolalar
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          type="text"
          placeholder="Maqola, muallif yoki kategoriya bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Clear Search */}
        {searchQuery && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Qidiruvni tozalash
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      {!loading && posts.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredPosts.length} ta maqola topildi
          </p>
        </div>
      )}

      {/* Blog Posts Grid */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 mb-4" />
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4 mb-4" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card hover className="h-full flex flex-col">
                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="relative h-48 mb-4 overflow-hidden rounded-t-lg">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    {/* Category & Date */}
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <Badge variant="info">{post.category.name}</Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author & Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {post.author.avatarUrl ? (
                          <Image
                            src={post.author.avatarUrl}
                            alt={post.author.firstName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-semibold">
                              {post.author.firstName[0]}
                              {post.author.lastName[0]}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-700">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-xs">{post.viewCount}</span>
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
