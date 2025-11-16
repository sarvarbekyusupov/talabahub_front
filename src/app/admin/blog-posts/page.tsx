'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { exportBlogPostsToCSV } from '@/lib/export';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tags?: string[];
  categoryId?: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
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

export default function AdminBlogPostsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    categoryId: '',
    isPublished: false,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadPosts();
  }, [page, searchQuery, filterStatus, filterCategory]);

  const loadPosts = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 20 };

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (filterStatus) {
        params.isPublished = filterStatus === 'published';
      }
      if (filterCategory) {
        params.categoryId = filterCategory;
      }

      const data = await api.getBlogPosts(params) as PaginatedResponse;
      setPosts(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading blog posts:', error);
      const errorMessage = error.message || 'Postlarni yuklashda xatolik';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      // Upload cover image if selected
      let coverImageUrl = formData.coverImage;
      if (coverImageFile) {
        const uploadResponse = await api.uploadImage(coverImageFile, token) as { url: string };
        coverImageUrl = uploadResponse.url;
      }

      const postData = {
        ...formData,
        coverImage: coverImageUrl,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      };

      if (editingPost) {
        await api.updateBlogPost(token, editingPost.id, postData);
        showToast('Post muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createBlogPost(token, postData);
        showToast('Post muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadPosts();
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      showToast(error.message || 'Postni saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      coverImage: post.coverImage || '',
      tags: post.tags?.join(', ') || '',
      categoryId: post.categoryId || '',
      isPublished: post.isPublished,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham bu postni o\'chirmoqchimisiz?')) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteBlogPost(token, id);
      showToast('Post muvaffaqiyatli o\'chirildi', 'success');
      loadPosts();
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      showToast(error.message || 'Postni o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setCoverImageFile(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      tags: '',
      categoryId: '',
      isPublished: false,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterCategory('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterStatus || filterCategory;

  if (loading && posts.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <TableSkeleton rows={10} columns={6} />
        </Card>
      </Container>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <ErrorDisplay
            message={error}
            onRetry={loadPosts}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog postlari boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha blog postlarini ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi post
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qidiruv
              </label>
              <input
                type="text"
                placeholder="Post nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holat
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">Barcha holatlar</option>
                <option value="published">Nashr qilingan</option>
                <option value="draft">Qoralama</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriya
              </label>
              <input
                type="text"
                placeholder="Kategoriya ID..."
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          {/* Active Filters and Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Faol filtrlar:</span>
                {searchQuery && (
                  <Badge variant="info">
                    Qidiruv: {searchQuery}
                  </Badge>
                )}
                {filterStatus && (
                  <Badge variant="info">
                    Holat: {filterStatus === 'published' ? 'Nashr qilingan' : 'Qoralama'}
                  </Badge>
                )}
                {filterCategory && (
                  <Badge variant="info">
                    Kategoriya: {filterCategory}
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Tozalash
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Jami: <span className="font-semibold">{posts.length}</span> ta post
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Post</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Muallif</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ko'rishlar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sana</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {post.author.firstName} {post.author.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.viewCount}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={post.isPublished ? 'success' : 'warning'}>
                      {post.isPublished ? 'Nashr qilingan' : 'Qoralama'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Ko'rish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="O'chirish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Oldingi
            </Button>
            <span className="text-gray-600">
              Sahifa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Keyingi
            </Button>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPost ? 'Postni tahrirlash' : 'Yangi post'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sarlavha *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Post sarlavhasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="post-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qisqacha mazmuni
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Qisqacha tavsif..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontent *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={10}
                  placeholder="HTML kontent..."
                />
                <p className="text-sm text-gray-500 mt-1">HTML formatta</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muqova rasmi
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.coverImage && !coverImageFile && (
                  <div className="mt-2">
                    <img src={formData.coverImage} alt="Current cover" className="h-32 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teglar
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="texnologiya, dasturlash, web"
                />
                <p className="text-sm text-gray-500 mt-1">Vergul bilan ajratilgan</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Nashr qilish
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" fullWidth>
                  {editingPost ? 'Saqlash' : 'Yaratish'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Container>
  );
}
