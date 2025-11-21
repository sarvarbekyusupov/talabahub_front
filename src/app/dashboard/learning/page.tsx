'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseImage: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  enrolledAt: string;
  completedAt?: string;
  certificate?: string;
  timeSpent: number; // in minutes
}

export default function LearningProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    streak: 0,
    certificates: 0,
  });

  useEffect(() => {
    loadLearningProgress();
  }, []);

  const loadLearningProgress = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch enrollments and streak data in parallel
      const [enrollmentsData, streakData] = await Promise.all([
        api.getMyEnrollments(token) as any,
        api.getLearningStreak(token) as any,
      ]);

      const enrollments = enrollmentsData.data || [];

      const progressData: CourseProgress[] = enrollments.map((enrollment: any) => ({
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        courseImage: enrollment.course.imageUrl,
        progress: enrollment.progress || 0,
        completedLessons: enrollment.completedLessons || 0,
        totalLessons: enrollment.course.totalLessons || 10,
        lastAccessed: enrollment.lastAccessedAt,
        enrolledAt: enrollment.createdAt,
        completedAt: enrollment.completedAt,
        certificate: enrollment.certificateUrl,
        timeSpent: enrollment.timeSpent || 0,
      }));

      setCourses(progressData);

      // Calculate stats
      const completed = progressData.filter((c) => c.progress === 100).length;
      const inProgress = progressData.filter((c) => c.progress > 0 && c.progress < 100).length;
      const totalTime = progressData.reduce((sum, c) => sum + c.timeSpent, 0);
      const avgProgress =
        progressData.length > 0
          ? progressData.reduce((sum, c) => sum + c.progress, 0) / progressData.length
          : 0;

      setStats({
        totalCourses: progressData.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        totalTimeSpent: totalTime,
        averageProgress: Math.round(avgProgress),
        streak: streakData?.streak || 0,
        certificates: progressData.filter((c) => c.certificate).length,
      });
    } catch (error) {
      console.error('Error loading learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'completed') return course.progress === 100;
    if (filter === 'in-progress') return course.progress > 0 && course.progress < 100;
    return true;
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} daqiqa`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} soat ${mins} daqiqa`;
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">O'qish jarayoni</h1>
          <p className="text-lg text-dark/60">Sizning o'qish statistikangiz va yutuqlaringiz</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Jami kurslar</p>
                <h3 className="text-3xl font-bold">{stats.totalCourses}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Yakunlangan</p>
                <h3 className="text-3xl font-bold">{stats.completedCourses}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-white/70">
              {stats.certificates} ta sertifikat
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">O'rtacha progress</p>
                <h3 className="text-3xl font-bold">{stats.averageProgress}%</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm mb-1">Jami vaqt</p>
                <h3 className="text-xl font-bold">{formatTime(stats.totalTimeSpent)}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-white/70">
              🔥 {stats.streak} kunlik streak
            </p>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Yutuqlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: 'Birinchi kurs',
                description: 'Birinchi kursga yozilding',
                icon: '🎯',
                achieved: stats.totalCourses > 0,
              },
              {
                name: 'Birinchi sertifikat',
                description: 'Birinchi kursni tugatding',
                icon: '🏆',
                achieved: stats.completedCourses > 0,
              },
              {
                name: 'Tezkor o\'quvchi',
                description: '10 soat o\'qiding',
                icon: '⚡',
                achieved: stats.totalTimeSpent >= 600,
              },
              {
                name: 'Doimiy talaba',
                description: '7 kunlik streak',
                icon: '🔥',
                achieved: stats.streak >= 7,
              },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.achieved
                    ? 'border-accent bg-accent-50'
                    : 'border-lavender-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-dark mb-1">{achievement.name}</h3>
                <p className="text-sm text-dark/60">{achievement.description}</p>
              </div>
            ))}
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
              Barchasi ({courses.length})
            </Button>
            <Button
              variant={filter === 'in-progress' ? 'primary' : 'ghost'}
              onClick={() => setFilter('in-progress')}
              size="sm"
            >
              Davom etmoqda ({stats.inProgressCourses})
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'ghost'}
              onClick={() => setFilter('completed')}
              size="sm"
            >
              Yakunlangan ({stats.completedCourses})
            </Button>
          </div>
        </Card>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-dark/60">
              {filter === 'all'
                ? 'Hali kursga yozilmagan'
                : filter === 'completed'
                ? 'Hali yakunlangan kurslar yo\'q'
                : 'Hali boshlangan kurslar yo\'q'}
            </p>
            <Button className="mt-4" onClick={() => router.push('/courses')}>
              Kurslarni ko'rish
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.courseId} className="hover:shadow-card-hover transition-shadow">
                <div className="flex items-start gap-6">
                  {course.courseImage && (
                    <Image
                      src={course.courseImage}
                      alt={course.courseTitle}
                      width={128}
                      height={128}
                      className="object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-dark mb-2">
                          {course.courseTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-dark/60 mb-3">
                          <span>
                            📚 {course.completedLessons}/{course.totalLessons} dars
                          </span>
                          <span>⏱️ {formatTime(course.timeSpent)}</span>
                          <span>
                            📅 Boshlangan:{' '}
                            {new Date(course.enrolledAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                      </div>
                      {course.progress === 100 && (
                        <Badge variant="success">✓ Yakunlangan</Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-dark">O'qish jarayoni</span>
                        <span className="text-sm font-semibold text-brand">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-lavender-100 rounded-full h-3">
                        <div
                          className="bg-brand h-3 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/courses/${course.courseId}`)}
                      >
                        {course.progress === 100 ? 'Qayta ko\'rish' : 'Davom ettirish'}
                      </Button>
                      {course.certificate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(course.certificate, '_blank')}
                        >
                          📜 Sertifikat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
