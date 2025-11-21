'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Course } from '@/types';

export default function PartnerCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await api.getPartnerContent(token, 'courses') as any;
      setCourses(data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu kursni o\'chirishni tasdiqlaysizmi?')) return;

    const token = getToken();
    if (!token) return;

    try {
      setDeleteId(id);
      await api.deleteCourse(token, id);
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Kursni o\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/partner/courses/${id}/edit`);
  };

  const handleViewEnrollments = (id: string) => {
    router.push(`/partner/courses/${id}/enrollments`);
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-dark mb-2">Mening kurslarim</h1>
          <p className="text-lg text-dark/60">
            Siz yaratgan barcha kurslar ro'yxati
          </p>
        </div>
        <Button onClick={() => router.push('/partner/courses/create')}>
          Yangi kurs qo'shish
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-3">Hali kurslar yo'q</h2>
            <p className="text-dark/60 mb-6">
              Talabalar uchun birinchi kursingizni yarating
            </p>
            <Button onClick={() => router.push('/partner/courses/create')}>
              Yangi kurs qo'shish
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-6">
                {course.imageUrl && (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-40 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-2">{course.title}</h3>
                      <p className="text-dark/70 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="primary">{course.level}</Badge>
                        <Badge variant="success">
                          {course.price?.toLocaleString()} so'm
                        </Badge>
                        {course.duration && (
                          <Badge variant="info">{course.duration}</Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant={course.isActive ? 'success' : 'warning'}>
                      {course.isActive ? 'Faol' : 'Kutilmoqda'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Talabalar</p>
                      <p className="font-bold text-brand text-xl">{course.enrolledCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Daromad</p>
                      <p className="font-semibold text-dark">
                        {((course.price || 0) * (course.enrolledCount || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Ko'rildi</p>
                      <p className="font-semibold text-dark">{course.views || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Saqlangan</p>
                      <p className="font-semibold text-dark">{course.savedCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Reyting</p>
                      <p className="font-semibold text-dark">
                        {course.averageRating ? `${course.averageRating.toFixed(1)} ⭐` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewEnrollments(course.id)}
                    >
                      Talabalar ({course.enrolledCount || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(course.id)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                      disabled={deleteId === course.id}
                    >
                      {deleteId === course.id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      Ko'rish
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
