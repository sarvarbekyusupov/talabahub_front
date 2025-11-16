'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  PaginatedResponse,
  Job,
  Event,
  Course,
  Discount
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
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'registration':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'enrollment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'saved':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-500 text-white';
      case 'registration':
        return 'bg-purple-500 text-white';
      case 'enrollment':
        return 'bg-green-500 text-white';
      case 'saved':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getApplicationStatusCounts = () => {
    const pending = applications.filter(a => a.status === 'pending').length;
    const reviewed = applications.filter(a => a.status === 'reviewed').length;
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    return { pending, reviewed, accepted, rejected };
  };

  const getSavedDiscountsCount = () => {
    return savedItems.filter(item => item.itemType === 'discount').length;
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
      const [statsData, applicationsData, registrationsData, enrollmentsData, savedItemsData, jobsData, eventsData, coursesData] = await Promise.all([
        api.getUserStats(token) as Promise<UserStats>,
        api.getMyApplications(token, { limit: 50 }) as Promise<PaginatedResponse<JobApplication>>,
        api.getMyRegistrations(token, { limit: 50 }) as Promise<PaginatedResponse<EventRegistration>>,
        api.getMyEnrollments(token, { limit: 50 }) as Promise<PaginatedResponse<CourseEnrollment>>,
        api.getSavedItems(token, { limit: 50 }) as Promise<PaginatedResponse<SavedItem>>,
        api.getJobs({ limit: 6, page: 1 }) as Promise<PaginatedResponse<Job>>,
        api.getEvents({ limit: 6, page: 1 }) as Promise<PaginatedResponse<Event>>,
        api.getCourses({ limit: 6, page: 1 }) as Promise<PaginatedResponse<Course>>,
      ]);

      setStats(statsData);
      setApplications(applicationsData.data);
      setRegistrations(registrationsData.data);
      setEnrollments(enrollmentsData.data);
      setSavedItems(savedItemsData.data);
      setRecommendedJobs(jobsData.data);
      setUpcomingEvents(eventsData.data.filter(e => new Date(e.eventDate) > new Date()));
      setPopularCourses(coursesData.data);

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
        ...savedItemsData.data.slice(0, 2).map((saved: SavedItem) => ({
          type: 'saved',
          title: `${(saved.item as any).title} saqlandi`,
          time: new Date(saved.savedAt),
        })),
      ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

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
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mening panelim</h1>
        <p className="text-gray-600">Shaxsiy kabinetingizga xush kelibsiz</p>
      </div>

      {/* Enhanced Stats Grid with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Applications Card */}
        <div
          onClick={() => setActiveTab('applications')}
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.applications}</p>
              <p className="text-blue-100 text-sm mb-3">Ish arizalari</p>
              <div className="flex gap-2 text-xs">
                {(() => {
                  const statusCounts = getApplicationStatusCounts();
                  return (
                    <>
                      {statusCounts.pending > 0 && (
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                          {statusCounts.pending} kutilmoqda
                        </span>
                      )}
                      {statusCounts.accepted > 0 && (
                        <span className="bg-green-500 bg-opacity-50 px-2 py-1 rounded">
                          {statusCounts.accepted} qabul
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Card */}
        <div
          onClick={() => setActiveTab('registrations')}
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.registrations}</p>
              <p className="text-purple-100 text-sm mb-3">Tadbirlarga ro'yxat</p>
              <div className="text-xs">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  {registrations.filter(r => new Date(r.event.eventDate) > new Date()).length} yaqinlashayotgan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Card */}
        <div
          onClick={() => setActiveTab('courses')}
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.courses}</p>
              <p className="text-green-100 text-sm mb-3">Aktiv kurslar</p>
              {enrollments.length > 0 && (
                <div className="text-xs">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    {getAverageCourseProgress()}% o'rtacha
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Items Card */}
        <div
          onClick={() => setActiveTab('saved')}
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.saved}</p>
              <p className="text-orange-100 text-sm mb-3">Saqlangan</p>
              <div className="text-xs">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  {getSavedDiscountsCount()} chegirma
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Umumiy
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Arizalar ({stats.applications})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Saqlangan ({stats.saved})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'registrations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tadbirlar ({stats.registrations})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
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
          <div className="space-y-8">
            {/* Quick Actions Section */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tezkor harakatlar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/jobs" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 text-center transition-all transform hover:scale-105 hover:shadow-lg">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ish o'rinlari</h3>
                    <p className="text-sm text-gray-600">Yangi ish topish</p>
                  </div>
                </Link>

                <Link href="/events" className="group">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-6 text-center transition-all transform hover:scale-105 hover:shadow-lg">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Tadbirlar</h3>
                    <p className="text-sm text-gray-600">Tadbirlarga ro'yxat</p>
                  </div>
                </Link>

                <Link href="/courses" className="group">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 text-center transition-all transform hover:scale-105 hover:shadow-lg">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Kurslar</h3>
                    <p className="text-sm text-gray-600">O'rganish boshlash</p>
                  </div>
                </Link>

                <Link href="/discounts" className="group">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-6 text-center transition-all transform hover:scale-105 hover:shadow-lg">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Chegirmalar</h3>
                    <p className="text-sm text-gray-600">Chegirmalardan foydalanish</p>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Recent Activity Timeline and Progress Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Timeline */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">So'nggi faoliyat</h3>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{getTimeAgo(activity.time)}</p>
                            {activity.status && (
                              <Badge
                                variant={
                                  activity.status === 'accepted' ? 'success' :
                                  activity.status === 'rejected' ? 'danger' :
                                  activity.status === 'reviewed' ? 'info' : 'warning'
                                }
                              >
                                {activity.status === 'pending' ? 'Kutilmoqda' :
                                 activity.status === 'reviewed' ? 'Ko\'rib chiqildi' :
                                 activity.status === 'accepted' ? 'Qabul' :
                                 activity.status === 'rejected' ? 'Rad' : activity.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Hali faoliyat yo'q</p>
                  </div>
                )}
              </Card>

              {/* Course Progress Indicators */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Kurs jarayoni</h3>
                {enrollments.filter(e => e.status === 'active').length > 0 ? (
                  <div className="space-y-6">
                    {enrollments.filter(e => e.status === 'active').slice(0, 4).map((enrollment) => (
                      <div key={enrollment.id}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <Link href={`/courses/${enrollment.course.id}`}>
                              <h4 className="font-medium text-gray-900 hover:text-blue-600 transition line-clamp-1 text-sm">
                                {enrollment.course.title}
                              </h4>
                            </Link>
                            {enrollment.course.partner && (
                              <p className="text-xs text-gray-500 mt-1">{enrollment.course.partner.name}</p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-blue-600 ml-3">{enrollment.progress}%</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {enrollments.filter(e => e.status === 'active').length > 4 && (
                      <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab('courses'); }}>
                        <p className="text-sm text-blue-600 hover:text-blue-700 text-center">
                          Barcha kurslarni ko'rish ({enrollments.filter(e => e.status === 'active').length})
                        </p>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 text-sm mb-4">Aktiv kurslar yo'q</p>
                    <Link href="/courses">
                      <Button variant="outline" size="sm">Kurslarni ko'rish</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Personalized Recommendations */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sizga tavsiya etiladi</h2>

              {/* Recommended Jobs */}
              {recommendedJobs.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tavsiya etilgan ish o'rinlari</h3>
                    <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700">
                      Barchasini ko'rish
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedJobs.slice(0, 3).map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm flex-1">{job.title}</h4>
                            {job.company?.logoUrl && (
                              <Image src={job.company.logoUrl} alt={job.company.name} width={40} height={40} className="rounded object-cover ml-2" />
                            )}
                          </div>
                          {job.company && (
                            <p className="text-sm text-gray-600 mb-2">{job.company.name}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {job.jobType === 'full_time' ? 'To\'liq vaqt' :
                               job.jobType === 'part_time' ? 'Qisman vaqt' :
                               job.jobType === 'internship' ? 'Amaliyot' : 'Shartnoma'}
                            </span>
                          </div>
                          <Button size="sm" fullWidth>Batafsil</Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Yaqinlashayotgan tadbirlar</h3>
                    <Link href="/events" className="text-sm text-blue-600 hover:text-blue-700">
                      Barchasini ko'rish
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-500 hover:shadow-md transition-all">
                          {event.imageUrl && (
                            <div className="aspect-video bg-gray-100 relative">
                              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">{event.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(event.eventDate).toLocaleDateString('uz-UZ')}</span>
                            </div>
                            <Button size="sm" fullWidth variant="outline">Batafsil</Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Courses */}
              {popularCourses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ommabop kurslar</h3>
                    <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700">
                      Barchasini ko'rish
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularCourses.slice(0, 3).map((course) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-green-500 hover:shadow-md transition-all">
                          {course.imageUrl && (
                            <div className="aspect-video bg-gray-100 relative">
                              <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">{course.title}</h4>
                            {course.partner && (
                              <p className="text-xs text-gray-500 mb-2">{course.partner.name}</p>
                            )}
                            <div className="flex items-center justify-between mb-3">
                              {course.price > 0 ? (
                                <span className="text-sm font-semibold text-green-600">
                                  {course.price.toLocaleString()} so'm
                                </span>
                              ) : (
                                <span className="text-sm font-semibold text-green-600">Bepul</span>
                              )}
                              {course.duration && (
                                <span className="text-xs text-gray-500">{course.duration}</span>
                              )}
                            </div>
                            <Button size="sm" fullWidth variant="outline">Batafsil</Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="mb-4">Hozircha arizalar yo'q</p>
                <Link href="/jobs">
                  <Button variant="outline">Ish o'rinlarini ko'rish</Button>
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
                <p className="mb-2">Saqlangan e'lonlar yo'q</p>
                <p className="text-sm mb-4">E'lonlarni saqlab, keyinroq ko'ring</p>
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
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mb-4">Ro'yxatdan o'tgan tadbirlar yo'q</p>
                <Link href="/events">
                  <Button variant="outline">Tadbirlarni ko'rish</Button>
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
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
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
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mb-4">Yozilgan kurslar yo'q</p>
                <Link href="/courses">
                  <Button variant="outline">Kurslarni ko'rish</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </Container>
  );
}
