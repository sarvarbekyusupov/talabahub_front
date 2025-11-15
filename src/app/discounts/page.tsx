'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Discount, PaginatedResponse } from '@/types';

type SortOption = 'newest' | 'highest_discount' | 'ending_soon';

const ITEMS_PER_PAGE = 12;

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDiscounts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    setCurrentPage(1); // Reset to first page when filters change
  }, [discounts, searchQuery, sortBy, selectedCategory]);

  const loadDiscounts = async () => {
    try {
      const data = await api.getDiscounts({ limit: 100 }) as PaginatedResponse<Discount>;
      setDiscounts(data.data);
    } catch (err: any) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...discounts];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (discount) =>
          discount.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          discount.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          discount.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((discount) => discount.category.nameUz === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
        break;
      case 'highest_discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'ending_soon':
        result.sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime());
        break;
    }

    setFilteredDiscounts(result);
  };

  const getUniqueCategories = (): string[] => {
    const categories = discounts.map((d) => d.category.nameUz);
    return Array.from(new Set(categories));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chegirmalar</h1>
          <p className="text-lg text-gray-600">
            Talabalar uchun maxsus chegirmalar va takliflar
          </p>
        </div>
        <GridSkeleton count={12} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center text-red-600">{error}</div>
      </Container>
    );
  }

  const categories = getUniqueCategories();
  const hasActiveFilters = searchQuery || sortBy !== 'newest' || selectedCategory !== 'all';

  // Pagination calculations
  const totalPages = Math.ceil(filteredDiscounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Chegirmalar</h1>
        <p className="text-lg text-gray-600">
          Talabalar uchun maxsus chegirmalar va takliflar
        </p>
      </div>

      {/* Filters and Sort */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha kategoriyalar</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Eng yangi</option>
              <option value="highest_discount">Eng yuqori chegirma</option>
              <option value="ending_soon">Tez tugaydi</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Filtrlarni tozalash
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredDiscounts.length} ta chegirma topildi
        </p>
      </div>

      {/* Discounts Grid */}
      {filteredDiscounts.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-600">
            {discounts.length === 0
              ? 'Hozircha chegirmalar mavjud emas'
              : 'Hech narsa topilmadi. Boshqa so\'z bilan qidiring yoki filtrlarni o\'zgartiring.'}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDiscounts.map((discount) => (
            <Link key={discount.id} href={`/discounts/${discount.id}`}>
              <Card hover className="flex flex-col h-full">
                {discount.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={discount.imageUrl}
                      alt={discount.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {discount.title}
                    </h3>
                    <Badge variant="success" size="md">
                      -{discount.discount}%
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                    {discount.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Brend:</span>
                      <span className="font-medium">{discount.brand.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Kategoriya:</span>
                      <span className="font-medium">{discount.category.nameUz}</span>
                    </div>
                    {discount.promoCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Promo kod:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {discount.promoCode}
                        </code>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Amal qiladi:</span>
                      <span className="text-sm">
                        {new Date(discount.validUntil).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredDiscounts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDiscounts.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </Container>
  );
}
