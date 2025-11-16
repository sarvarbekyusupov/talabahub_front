'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
  updatedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await api.getBlogPostBySlug(slug) as BlogPost;
      setPost(data);
    } catch (err: any) {
      console.error('Error loading blog post:', err);
      setError('Maqola topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-6 mb-4" />
          <Skeleton className="h-6 mb-4" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Kechirasiz, bu maqola mavjud emas</p>
          <Link href="/blog">
            <Button>Blog sahifasiga qaytish</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Orqaga
          </Button>
        </Link>

        {/* Article Header */}
        <article>
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <Badge variant="info">{post.category.name}</Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Meta Info */}
          <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8">
            <div className="flex items-center gap-3">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.firstName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {post.author.firstName[0]}
                    {post.author.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5"
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
                <span className="text-sm">{post.viewCount} ko'rishlar</span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 py-6 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Teglar:</span>
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="info">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-4 py-6 border-t border-gray-200">
            <span className="text-gray-600 font-medium">Ulashish:</span>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <svg
                className="w-5 h-5 text-blue-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </Container>
  );
}
