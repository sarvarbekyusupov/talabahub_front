'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface Enrollment {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    university?: {
      name: string;
    };
  };
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: number;
}

export default function CourseEnrollmentsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadCourseAndEnrollments();
  }, [courseId]);

  const loadCourseAndEnrollments = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [courseData, enrollmentsData] = await Promise.all([
        api.getCourse(courseId) as Promise<any>,
        api.request(`/courses/${courseId}/enrollments`, { token }) as Promise<any>,
      ]);

      setCourse(courseData);
      setEnrollments(enrollmentsData.data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showToast('Ro\'yxatni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === 'all') return true;
    return enrollment.status === filter;
  });

  const totalRevenue = enrollments
    .filter((e) => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.paymentAmount, 0);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      completed: 'default',
      cancelled: 'danger',
    };
    const labels: Record<string, string> = {
      active: 'Faol',
      completed: 'Yakunlangan',
      cancelled: 'Bekor qilingan',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      paid: 'success',
      refunded: 'danger',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      paid: 'To\'landi',
      refunded: 'Qaytarildi',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-12">
        <div className="text-center">Kurs topilmadi</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/partner/courses')} className="mb-4">
          ← Kurslarimga qaytish
        </Button>
        <h1 className="text-4xl font-bold text-dark mb-2">
          {course.title} - Talabalar
        </h1>
        <p className="text-lg text-dark/60">
          Jami {enrollments.length} ta talaba ro'yxatdan o'tgan
        </p>
      </div>

      {/* Revenue Card */}
      <Card className="mb-6 bg-gradient-to-br from-green-500 to-green-700 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">Jami Daromad</p>
            <h3 className="text-3xl font-bold">{totalRevenue.toLocaleString()} so'm</h3>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">To'langan talabalar</p>
            <h3 className="text-3xl font-bold">
              {enrollments.filter((e) => e.paymentStatus === 'paid').length}
            </h3>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">O'rtacha progress</p>
            <h3 className="text-3xl font-bold">
              {enrollments.length > 0
                ? Math.round(
                    enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
                  )
                : 0}
              %
            </h3>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Barchasi ({enrollments.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'ghost'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Faol ({enrollments.filter((e) => e.status === 'active').length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'ghost'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            Yakunlangan ({enrollments.filter((e) => e.status === 'completed').length})
          </Button>
        </div>
      </Card>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-dark/60">Hech qanday talaba topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-6">
                {enrollment.user.avatarUrl && (
                  <img
                    src={enrollment.user.avatarUrl}
                    alt={`${enrollment.user.firstName} ${enrollment.user.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-1">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </h3>
                      <p className="text-dark/70 mb-1">{enrollment.user.email}</p>
                      {enrollment.user.university && (
                        <p className="text-dark/60 text-sm mb-2">{enrollment.user.university.name}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusBadge(enrollment.status)}
                        {getPaymentBadge(enrollment.paymentStatus)}
                        <span className="text-sm text-dark/60">
                          {new Date(enrollment.enrolledAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-dark">O'rganish jarayoni</p>
                      <p className="text-sm font-semibold text-brand">{enrollment.progress}%</p>
                    </div>
                    <div className="w-full bg-lavender-100 rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-dark/60 mb-1">To'lov</p>
                      <p className="font-semibold text-dark">
                        {enrollment.paymentAmount.toLocaleString()} so'm
                      </p>
                    </div>
                    {enrollment.completedAt && (
                      <div>
                        <p className="text-sm text-dark/60 mb-1">Yakunlandi</p>
                        <p className="font-semibold text-dark">
                          {new Date(enrollment.completedAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    )}
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
