'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useCourses } from '@/lib/hooks';

const ITEMS_PER_PAGE = 12;

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters using useMemo for performance
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Apply search filter
    if (debouncedSearch) {
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          course.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (course.partner && course.partner.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    return result;
  }, [courses, debouncedSearch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const clearFilters = () => {
    setSearchQuery('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-4">Kurslar</h1>
          <p className="text-lg text-dark/60">
            Kasbiy rivojlanish uchun o'quv kurslari va treninglar
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

  const hasActiveFilters = debouncedSearch !== '';

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark mb-4">Kurslar</h1>
        <p className="text-lg text-dark/60">
          Kasbiy rivojlanish uchun o'quv kurslari va treninglar
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          type="text"
          placeholder="Kurs yoki ta'lim markazi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Qidiruvni tozalash
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-dark/60">
          {filteredCourses.length} ta kurs topildi
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <Card>
          {debouncedSearch ? (
            <NoSearchResults onClearSearch={() => setSearchQuery('')} />
          ) : (
            <EmptyState
              title="Kurslar yo'q"
              message="Hozircha hech qanday kurs qo'shilmagan."
              showAction={false}
            />
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <Card key={course.id} hover className="flex flex-col">
              {course.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-dark mb-2">
                  {course.title}
                </h3>

                <p className="text-dark/60 mb-4 flex-1 line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  {course.partner && (
                    <div className="flex items-center justify-between">
                      <span className="text-dark/50">Ta'lim markazi:</span>
                      <span className="font-medium text-dark">{course.partner.name}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-dark/50">Davomiyligi:</span>
                      <span className="font-medium text-dark">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-dark/50">Narxi:</span>
                    <span className="font-bold text-brand">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>

                <Button fullWidth>Yozilish</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredCourses.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </Container>
  );
}
