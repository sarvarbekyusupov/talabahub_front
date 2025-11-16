'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import {
  JobApplication,
  EventRegistration,
  CourseEnrollment,
  UserStats,
  SavedItem,
  PaginatedResponse
} from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'registrations' | 'courses'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    applications: 0,
    saved: 0,
    registrations: 0,
    courses: 0,
  });
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboard();
  }, []);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-600';
      case 'registration':
        return 'bg-purple-600';
      case 'enrollment':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getApplicationStatusCounts = () => {
    const pending = applications.filter(a => a.status === 'pending').length;
    const reviewed = applications.filter(a => a.status === 'reviewed').length;
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    return { pending, reviewed, accepted, rejected };
  };

  const getAverageCourseProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    return Math.round(totalProgress / enrollments.length);
  };

  const loadDashboard = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Load all dashboard data in parallel
      const [statsData, applicationsData, registrationsData, enrollmentsData, savedItemsData] = await Promise.all([
        api.getUserStats(token) as Promise<UserStats>,
        api.getMyApplications(token, { limit: 50 }) as Promise<PaginatedResponse<JobApplication>>,
        api.getMyRegistrations(token, { limit: 50 }) as Promise<PaginatedResponse<EventRegistration>>,
        api.getMyEnrollments(token, { limit: 50 }) as Promise<PaginatedResponse<CourseEnrollment>>,
        api.getSavedItems(token, { limit: 50 }) as Promise<PaginatedResponse<SavedItem>>,
      ]);

      setStats(statsData);
      setApplications(applicationsData.data);
      setRegistrations(registrationsData.data);
      setEnrollments(enrollmentsData.data);
      setSavedItems(savedItemsData.data);

      // Build recent activity from all data
      const activities = [
        ...applicationsData.data.slice(0, 3).map((app: JobApplication) => ({
          type: 'application',
          title: `${app.job.title} ishiga ariza topshirildi`,
          time: new Date(app.appliedAt),
          status: app.status,
        })),
        ...registrationsData.data.slice(0, 3).map((reg: EventRegistration) => ({
          type: 'registration',
          title: `${reg.event.title} tadbiriga ro'yxatdan o'tildi`,
          time: new Date(reg.registeredAt),
        })),
        ...enrollmentsData.data.slice(0, 3).map((enr: CourseEnrollment) => ({
          type: 'enrollment',
          title: `${enr.course.title} kursiga yozilindi`,
          time: new Date(enr.enrolledAt),
          progress: enr.progress,
        })),
      ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      // Set empty data on error
      setStats({
        applications: 0,
        saved: 0,
        registrations: 0,
        courses: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mening paneлim</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => setActiveTab('applications')} className="cursor-pointer">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Arizalar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div onClick={() => setActiveTab('saved')} className="cursor-pointer">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saqlangan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.saved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div onClick={() => setActiveTab('registrations')} className="cursor-pointer">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tadbirlar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.registrations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div onClick={() => setActiveTab('courses')} className="cursor-pointer">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Kurslar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.courses}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Umumiy
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Arizalar ({stats.applications})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Saqlangan ({stats.saved})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'registrations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tadbirlar ({stats.registrations})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'courses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Kurslar ({stats.courses})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Arizalar holati</h3>
                <div className="space-y-2">
                  {(() => {
                    const statusCounts = getApplicationStatusCounts();
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-600">● Kutilmoqda</span>
                          <span className="font-semibold">{statusCounts.pending}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">● Ko'rib chiqildi</span>
                          <span className="font-semibold">{statusCounts.reviewed}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600">● Qabul qilindi</span>
                          <span className="font-semibold">{statusCounts.accepted}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-red-600">● Rad etildi</span>
                          <span className="font-semibold">{statusCounts.rejected}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Kurslar jarayoni</h3>
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - getAverageCourseProgress() / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {getAverageCourseProgress()}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  O'rtacha tugallanish
                </p>
              </Card>

              <Card>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Yaqin tadbirlar</h3>
                <div className="space-y-3">
                  {registrations
                    .filter(r => new Date(r.event.eventDate) > new Date())
                    .slice(0, 3)
                    .map((reg) => (
                      <div key={reg.id} className="text-sm">
                        <p className="font-medium line-clamp-1">{reg.event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reg.event.eventDate).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    ))}
                  {registrations.filter(r => new Date(r.event.eventDate) > new Date()).length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      Yaqin tadbirlar yo'q
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">So'nggi faoliyat</h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 pb-3 ${
                          index < recentActivity.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-1.5`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                          <p className="text-xs text-gray-500">{getTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    Hali faoliyat yo'q
                  </p>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Tezkor havolalar</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/discounts">
                    <Button fullWidth variant="outline">Chegirmalar</Button>
                  </Link>
                  <Link href="/jobs">
                    <Button fullWidth variant="outline">Ish o'rinlari</Button>
                  </Link>
                  <Link href="/events">
                    <Button fullWidth variant="outline">Tadbirlar</Button>
                  </Link>
                  <Link href="/courses">
                    <Button fullWidth variant="outline">Kurslar</Button>
                  </Link>
                  <Link href="/saved">
                    <Button fullWidth variant="outline">Saqlangan</Button>
                  </Link>
                  <Link href="/applications">
                    <Button fullWidth variant="outline">Arizalarim</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Mening arizalarim</h3>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => {
                  const statusVariant = {
                    pending: 'warning',
                    reviewed: 'info',
                    accepted: 'success',
                    rejected: 'danger',
                  }[application.status] as any;

                  const statusLabel = {
                    pending: 'Ko\'rib chiqilmoqda',
                    reviewed: 'Ko\'rib chiqildi',
                    accepted: 'Qabul qilindi',
                    rejected: 'Rad etildi',
                  }[application.status];

                  return (
                    <div key={application.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/jobs/${application.job.id}`}>
                          <h4 className="font-semibold hover:text-blue-600 transition">
                            {application.job.title}
                          </h4>
                        </Link>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {application.job.company && application.job.company.name} {application.job.company && application.job.location && '-'} {application.job.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        Yuborilgan: {new Date(application.appliedAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>Hozircha arizalar yo'q</p>
                <Link href="/jobs">
                  <Button variant="outline" className="mt-4">Ish o'rinlarini ko'rish</Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'saved' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Saqlangan e'lonlar</h3>
            {savedItems.length > 0 ? (
              <div className="space-y-4">
                {savedItems.map((savedItem) => {
                  const item = savedItem.item as any;
                  const typeLabel = {
                    discount: 'Chegirma',
                    job: 'Ish',
                    event: 'Tadbir',
                    course: 'Kurs',
                  }[savedItem.itemType];

                  const linkPath = {
                    discount: `/discounts/${savedItem.itemId}`,
                    job: `/jobs/${savedItem.itemId}`,
                    event: `/events/${savedItem.itemId}`,
                    course: `/courses/${savedItem.itemId}`,
                  }[savedItem.itemType];

                  return (
                    <div key={savedItem.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={linkPath}>
                          <h4 className="font-semibold hover:text-blue-600 transition">
                            {item.title}
                          </h4>
                        </Link>
                        <Badge variant="info">{typeLabel}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Saqlangan: {new Date(savedItem.savedAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p>Saqlangan e'lonlar yo'q</p>
                <p className="text-sm mt-2">E'lonlarni saqlab, keyinroq ko'ring</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'registrations' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Ro'yxatdan o'tgan tadbirlar</h3>
            {registrations.length > 0 ? (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/events/${registration.event.id}`}>
                        <h4 className="font-semibold hover:text-blue-600 transition">
                          {registration.event.title}
                        </h4>
                      </Link>
                      {registration.attended !== undefined && (
                        <Badge variant={registration.attended ? 'success' : 'info'}>
                          {registration.attended ? 'Qatnashdi' : 'Kutilmoqda'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {registration.event.location} • {new Date(registration.event.eventDate).toLocaleDateString('uz-UZ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ro'yxatdan o'tgan: {new Date(registration.registeredAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>Ro'yxatdan o'tgan tadbirlar yo'q</p>
                <Link href="/events">
                  <Button variant="outline" className="mt-4">Tadbirlarni ko'rish</Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'courses' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Mening kurslarim</h3>
            {enrollments.length > 0 ? (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const statusVariant = {
                    active: 'info',
                    completed: 'success',
                    dropped: 'danger',
                  }[enrollment.status] as any;

                  const statusLabel = {
                    active: 'Aktiv',
                    completed: 'Tugatilgan',
                    dropped: 'To\'xtatilgan',
                  }[enrollment.status];

                  const handleProgressUpdate = async (enrollmentId: string, newProgress: number) => {
                    const token = getToken();
                    if (!token) return;

                    try {
                      await api.updateCourseProgress(token, enrollmentId, { progress: newProgress });
                      // Reload enrollments
                      const enrollmentsData = await api.getMyEnrollments(token, { limit: 50 }) as PaginatedResponse<CourseEnrollment>;
                      setEnrollments(enrollmentsData.data);
                    } catch (err) {
                      console.error('Error updating progress:', err);
                    }
                  };

                  return (
                    <div key={enrollment.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/courses/${enrollment.course.id}`}>
                          <h4 className="font-semibold hover:text-blue-600 transition">
                            {enrollment.course.title}
                          </h4>
                        </Link>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      {enrollment.course.partner && (
                        <p className="text-sm text-gray-600 mb-3">
                          {enrollment.course.partner.name}
                        </p>
                      )}
                      {enrollment.status === 'active' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Jarayon:</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex gap-2">
                            {enrollment.progress < 100 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProgressUpdate(enrollment.id, Math.min(enrollment.progress + 10, 100))}
                              >
                                +10% o'sish
                              </Button>
                            )}
                            {enrollment.progress < 100 && (
                              <Button
                                size="sm"
                                onClick={() => handleProgressUpdate(enrollment.id, 100)}
                              >
                                Tugatish
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Yozilgan: {new Date(enrollment.enrolledAt).toLocaleDateString('uz-UZ')}
                        {enrollment.completedAt && (
                          <> • Tugatilgan: {new Date(enrollment.completedAt).toLocaleDateString('uz-UZ')}</>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>Yozilgan kurslar yo'q</p>
                <Link href="/courses">
                  <Button variant="outline" className="mt-4">Kurslarni ko'rish</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </Container>
  );
}
