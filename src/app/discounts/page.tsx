'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useDiscounts } from '@/lib/hooks';
import { Discount } from '@/types';

type SortOption = 'newest' | 'highest_discount' | 'ending_soon';

const ITEMS_PER_PAGE = 12;

export default function DiscountsPage() {
  const { discounts, isLoading, error } = useDiscounts();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters and sort using useMemo for performance
  const filteredDiscounts = useMemo(() => {
    let result = [...discounts];

    // Apply search filter with debounced search
    if (debouncedSearch) {
      result = result.filter(
        (discount) =>
          discount.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          discount.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          discount.brand.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((discount) => discount.category && discount.category.nameUz === selectedCategory);
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

    return result;
  }, [discounts, debouncedSearch, sortBy, selectedCategory]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, selectedCategory]);

  const getUniqueCategories = (): string[] => {
    const categories = discounts
      .filter((d: Discount) => d.category && d.category.nameUz)
      .map((d: Discount) => d.category.nameUz);
    return Array.from(new Set(categories));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setSelectedCategory('all');
  };

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-4">Chegirmalar</h1>
          <p className="text-lg text-dark/60">
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
        <div className="text-center text-red-600">Ma'lumotlarni yuklashda xatolik</div>
      </Container>
    );
  }

  const categories = getUniqueCategories();
  const hasActiveFilters = debouncedSearch || sortBy !== 'newest' || selectedCategory !== 'all';

  // Pagination calculations
  const totalPages = Math.ceil(filteredDiscounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark mb-4">Chegirmalar</h1>
        <p className="text-lg text-dark/60">
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
              className="w-full px-4 py-2 border-2 border-lavender-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
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
              className="w-full px-4 py-2 border-2 border-lavender-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
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
        <p className="text-dark/60">
          {filteredDiscounts.length} ta chegirma topildi
        </p>
      </div>

      {/* Discounts Grid */}
      {filteredDiscounts.length === 0 ? (
        <Card>
          {debouncedSearch ? (
            <NoSearchResults onClearSearch={() => setSearchQuery('')} />
          ) : hasActiveFilters ? (
            <NoFilterResults onClearFilters={clearFilters} />
          ) : (
            <EmptyState
              title="Chegirmalar yo'q"
              message="Hozircha hech qanday chegirma qo'shilmagan."
              showAction={false}
            />
          )}
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
                      className="object-cover rounded-t-2xl"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-dark flex-1">
                      {discount.title}
                    </h3>
                    <Badge variant="success" size="md">
                      -{discount.discount}%
                    </Badge>
                  </div>

                  <p className="text-dark/60 mb-4 flex-1 line-clamp-3">
                    {discount.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-dark/50">Brend:</span>
                      <span className="font-medium text-dark">{discount.brand.name}</span>
                    </div>
                    {discount.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-dark/50">Kategoriya:</span>
                        <span className="font-medium text-dark">{discount.category.nameUz}</span>
                      </div>
                    )}
                    {discount.promoCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-dark/50">Promo kod:</span>
                        <code className="bg-accent/10 text-accent-700 px-2 py-1 rounded-lg font-mono text-xs font-semibold">
                          {discount.promoCode}
                        </code>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-dark/50">Amal qiladi:</span>
                      <span className="text-sm text-dark">
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
