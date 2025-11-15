'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Course, PaginatedResponse } from '@/types';

const ITEMS_PER_PAGE = 12;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses({ limit: 20 }) as PaginatedResponse<Course>;
      setCourses(data.data);
    } catch (err: any) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kurslar</h1>
          <p className="text-lg text-gray-600">
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
        <div className="text-center text-red-600">{error}</div>
      </Container>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kurslar</h1>
        <p className="text-lg text-gray-600">
          Kasbiy rivojlanish uchun o'quv kurslari va treninglar
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-600">
            Hozircha kurslar mavjud emas
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <Card key={course.id} hover className="flex flex-col">
              {course.imageUrl && (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ta'lim markazi:</span>
                    <span className="font-medium">{course.partner.name}</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Davomiyligi:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Narxi:</span>
                    <span className="font-bold text-blue-600">
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
      {courses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={courses.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </Container>
  );
}
