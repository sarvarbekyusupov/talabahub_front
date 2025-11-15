'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Course } from '@/types';
import { getToken } from '@/lib/auth';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await api.getCourse(id) as Course;
      setCourse(data);
    } catch (err: any) {
      setError('Kurs topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.enrollInCourse(token, id);
      alert('Kursga muvaffaqiyatli yozildingiz!');
    } catch (err: any) {
      alert('Kursga yozilishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'));
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kurs topilmadi</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/courses')}>
              Kurslarga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {course.imageUrl && (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-64 object-cover rounded-t-lg mb-6"
              />
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Ta'lim markazi</h3>
                <p className="text-gray-900 font-medium">{course.partner.name}</p>
              </div>
              {course.duration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Davomiyligi</h3>
                  <p className="text-gray-900 font-medium">{course.duration}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Narxi</h3>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(course.price)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Kurs haqida</h2>
              <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatPrice(course.price)}
              </p>
              <p className="text-sm text-gray-500">Kurs narxi</p>
            </div>

            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleEnroll}
                loading={enrolling}
              >
                Kursga yozilish
              </Button>
              <Button fullWidth variant="outline">
                Saqlab qo'yish
              </Button>
              <Button fullWidth variant="ghost">
                Ulashish
              </Button>
            </div>

            {course.partner && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Ta'lim markazi haqida
                </h4>
                <div>
                  {course.partner.logoUrl && (
                    <img
                      src={course.partner.logoUrl}
                      alt={course.partner.name}
                      className="w-16 h-16 object-contain mb-3"
                    />
                  )}
                  <p className="font-medium text-gray-900">{course.partner.name}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
