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
import { exportCategoriesToCSV } from '@/lib/export';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  type: 'discount' | 'job' | 'event' | 'course';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    type: 'discount' as 'discount' | 'job' | 'event' | 'course',
    isActive: true,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingCategoryName, setDeletingCategoryName] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, [page, debouncedSearch, filterType, filterStatus]);

  const loadCategories = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 20 };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (filterType) {
        params.type = filterType;
      }
      if (filterStatus) {
        params.isActive = filterStatus === 'active';
      }

      const data = await api.getCategories(params) as PaginatedResponse;
      setCategories(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      const errorMessage = error.message || 'Kategoriyalarni yuklashda xatolik';
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
      if (editingCategory) {
        await api.updateCategory(token, editingCategory.id, formData);
        showToast('Kategoriya muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createCategory(token, formData);
        showToast('Kategoriya muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Kategoriyani saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      type: category.type,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategoryId(category.id);
    setDeletingCategoryName(category.name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteCategory(token, deletingCategoryId);
      showToast('Kategoriya muvaffaqiyatli o\'chirildi', 'success');
      setDeleteConfirmOpen(false);
      setDeletingCategoryId(null);
      setDeletingCategoryName('');
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showToast(error.message || 'Kategoriyani o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      type: 'discount',
      isActive: true,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount': return 'Chegirma';
      case 'job': return 'Ish';
      case 'event': return 'Tadbir';
      case 'course': return 'Kurs';
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'discount': return 'info';
      case 'job': return 'success';
      case 'event': return 'warning';
      case 'course': return 'primary';
      default: return 'primary';
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterStatus('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterType || filterStatus;

  if (loading && categories.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <TableSkeleton rows={10} columns={6} />
        </Card>
      </Container>
    );
  }

  if (error && categories.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <ErrorDisplay
            message={error}
            onRetry={loadCategories}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriyalar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha kategoriyalarni ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi kategoriya
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
                placeholder="Kategoriya nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turi
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">Barcha turlar</option>
                <option value="discount">Chegirma</option>
                <option value="job">Ish</option>
                <option value="event">Tadbir</option>
                <option value="course">Kurs</option>
              </select>
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
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
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
                {filterType && (
                  <Badge variant="info">
                    Turi: {getTypeLabel(filterType)}
                  </Badge>
                )}
                {filterStatus && (
                  <Badge variant="info">
                    Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
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
            Jami: <span className="font-semibold">{categories.length}</span> ta kategoriya
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <Card>
          <EmptyState
            title="Kategoriyalar yo'q"
            message="Hozircha hech qanday kategoriya qo'shilmagan."
            actionLabel="Yangi kategoriya"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        </Card>
      )}

      {/* Table */}
      {!loading && categories.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nomi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Turi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Yaratilgan</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {category.icon && <span className="text-xl">{category.icon}</span>}
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-mono text-sm">{category.slug}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getTypeBadgeVariant(category.type)}>
                      {getTypeLabel(category.type)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={category.isActive ? 'success' : 'danger'}>
                      {category.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(category.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
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
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
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
                  Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kategoriya nomi"
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
                  placeholder="kategoriya-slug"
                />
                <p className="text-sm text-gray-500 mt-1">URL uchun ishlatiladi (faqat lotin harflari va tire)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Kategoriya tavsifi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ikonka (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🎓"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turi *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="discount">Chegirma</option>
                  <option value="job">Ish</option>
                  <option value="event">Tadbir</option>
                  <option value="course">Kurs</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Faol
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" fullWidth>
                  {editingCategory ? 'Saqlash' : 'Yaratish'}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingCategoryId(null);
          setDeletingCategoryName('');
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCategoryName}
      />
    </Container>
  );
}
