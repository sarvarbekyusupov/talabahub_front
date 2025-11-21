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
import { Discount, PaginatedResponse, DiscountTypeExtended } from '@/types';
import { exportDiscountsToCSV } from '@/lib/export';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminDiscountsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDiscountType, setFilterDiscountType] = useState('');

  // Delete confirmation states
  const [deleteDiscountId, setDeleteDiscountId] = useState<string | null>(null);
  const [deleteDiscountTitle, setDeleteDiscountTitle] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage' as DiscountTypeExtended,
    promoCode: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    imageUrl: '',
    brandId: '',
    categoryId: '',
    terms: '',
    isActive: true,
  });

  useEffect(() => {
    loadDiscounts();
    loadCategoriesAndBrands();
  }, [page, debouncedSearch, filterBrand, filterStatus, filterDiscountType]);

  const loadDiscounts = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 20 };

      // Add search query if provided
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      // Add filters
      if (filterBrand) {
        params.brandId = filterBrand;
      }
      if (filterStatus) {
        params.isActive = filterStatus === 'active';
      }
      if (filterDiscountType) {
        params.discountType = filterDiscountType;
      }

      const data = await api.getDiscounts(params) as PaginatedResponse<Discount>;
      setDiscounts(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading discounts:', error);
      const errorMessage = error.message || 'Chegirmalarni yuklashda xatolik';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [categoriesData, brandsData] = await Promise.all([
        api.getCategories({ type: 'discount', limit: 100 }) as Promise<any>,
        api.getBrands({ limit: 100 }) as Promise<any>,
      ]);
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
    } catch (error) {
      console.error('Error loading categories and brands:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResponse = await api.uploadImage(imageFile, token) as { url: string };
        imageUrl = uploadResponse.url;
      }

      const discountData = {
        title: formData.title,
        description: formData.description,
        discount: parseFloat(formData.discount),
        discountType: formData.discountType,
        promoCode: formData.promoCode || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        imageUrl,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        terms: formData.terms || undefined,
        isActive: formData.isActive,
      };

      if (editingDiscount) {
        await api.updateDiscount(token, editingDiscount.id, discountData);
        showToast('Chegirma muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createDiscount(token, discountData);
        showToast('Chegirma muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadDiscounts();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      showToast(error.message || 'Chegirmani saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      title: discount.title,
      description: discount.description,
      discount: discount.discount.toString(),
      discountType: discount.discountType,
      promoCode: discount.promoCode || '',
      validFrom: discount.validFrom.split('T')[0],
      validUntil: discount.validUntil.split('T')[0],
      usageLimit: discount.usageLimit?.toString() || '',
      imageUrl: discount.imageUrl || '',
      brandId: discount.brand.id.toString(),
      categoryId: discount.category.id.toString(),
      terms: '',
      isActive: discount.isActive,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDiscountId(id);
    setDeleteDiscountTitle(title);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDiscountId) return;

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteDiscount(token, deleteDiscountId);
      showToast('Chegirma muvaffaqiyatli o\'chirildi', 'success');
      setDeleteDiscountId(null);
      setDeleteDiscountTitle('');
      loadDiscounts();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      showToast(error.message || 'Chegirmani o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      promoCode: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      imageUrl: '',
      brandId: '',
      categoryId: '',
      terms: '',
      isActive: true,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterBrand('');
    setFilterStatus('');
    setFilterDiscountType('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterBrand || filterStatus || filterDiscountType;

  if (loading && discounts.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <TableSkeleton rows={10} columns={7} />
        </Card>
      </Container>
    );
  }

  if (error && discounts.length === 0) {
    return (
      <Container className="py-12">
        <Card>
          <ErrorDisplay
            message={error}
            onRetry={loadDiscounts}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chegirmalar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha chegirmalarni ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi chegirma
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qidirish
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Chegirma nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brend
            </label>
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha brendlar</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holat
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          {/* Discount Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chegirma turi
            </label>
            <select
              value={filterDiscountType}
              onChange={(e) => {
                setFilterDiscountType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha turlar</option>
              <option value="percentage">Foiz</option>
              <option value="fixed">Qat'iy miqdor</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Faol filtrlar:</span>
              {searchQuery && (
                <Badge variant="info">Qidiruv: {searchQuery}</Badge>
              )}
              {filterBrand && (
                <Badge variant="info">Brend: {brands.find(b => b.id === filterBrand)?.name}</Badge>
              )}
              {filterStatus && (
                <Badge variant="info">
                  Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              )}
              {filterDiscountType && (
                <Badge variant="info">
                  Tur: {filterDiscountType === 'percentage' ? 'Foiz' : 'Qat\'iy miqdor'}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Tozalash
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Jami: <span className="font-semibold">{discounts.length}</span> ta chegirma topildi
          </p>
        </div>
      </Card>

      <Card>
        {discounts.length === 0 ? (
          <EmptyState
            title="Chegirmalar yo'q"
            message="Hozircha hech qanday chegirma qo'shilmagan."
            actionLabel="Yangi chegirma qo'shish"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Chegirma</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Brend</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategoriya</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Miqdori</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amal qilish muddati</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => (
                <tr key={discount.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {discount.imageUrl && (
                        <img
                          src={discount.imageUrl}
                          alt={discount.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{discount.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{discount.description}</p>
                        {discount.promoCode && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-brand/10 text-brand text-xs font-mono rounded">
                            {discount.promoCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{discount.brand.name}</td>
                  <td className="py-3 px-4 text-gray-700">{discount.category.nameUz}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600">
                      {discount.discountType === 'percentage' ? `${discount.discount}%` : `${discount.discount} so'm`}
                    </span>
                    {discount.usageLimit && (
                      <p className="text-xs text-gray-500">
                        {discount.usageCount || 0} / {discount.usageLimit}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="text-gray-700">{new Date(discount.validFrom).toLocaleDateString('uz-UZ')}</p>
                      <p className="text-gray-500">- {new Date(discount.validUntil).toLocaleDateString('uz-UZ')}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={discount.isActive ? 'success' : 'danger'}>
                      {discount.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/discounts/${discount.id}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Ko'rish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(discount.id, discount.title)}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && discounts.length > 0 && (
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
                {editingDiscount ? 'Chegirmani tahrirlash' : 'Yangi chegirma'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sarlavha *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Chegirma sarlavhasi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Chegirma haqida batafsil..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brend *
                  </label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Brendni tanlang</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Kategoriyani tanlang</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chegirma turi *
                  </label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Foiz (%)</option>
                    <option value="fixed">Qat'iy summa (so'm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chegirma miqdori *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.discountType === 'percentage' ? '10' : '50000'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo kod
                  </label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="SUMMER2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foydalanish limiti
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tugash sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rasm
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imageUrl && !imageFile && (
                    <div className="mt-2">
                      <img src={formData.imageUrl} alt="Current image" className="h-32 rounded-lg object-cover" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shartlar
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Maxsus shartlar..."
                  />
                </div>
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
                  {editingDiscount ? 'Saqlash' : 'Yaratish'}
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
        isOpen={deleteDiscountId !== null}
        onClose={() => {
          setDeleteDiscountId(null);
          setDeleteDiscountTitle('');
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDiscountTitle}
      />
    </Container>
  );
}
