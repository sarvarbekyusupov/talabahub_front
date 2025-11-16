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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboard();
  }, []);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">So'nggi faoliyat</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Frontend Developer ishiga ariza topshirildi</p>
                    <p className="text-xs text-gray-500">2 soat oldin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">React kursiga yozilindi</p>
                    <p className="text-xs text-gray-500">1 kun oldin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tech Conference ga ro'yxatdan o'tildi</p>
                    <p className="text-xs text-gray-500">2 kun oldin</p>
                  </div>
                </div>
              </div>
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
              </div>
            </Card>
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
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
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
