'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface JobApplication {
  id: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  job: {
    title: string;
    company: {
      name: string;
    };
    location: string;
    jobType: string;
  };
}

interface EventRegistration {
  id: string;
  eventId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
  event: {
    title: string;
    eventType: string;
    eventDate: string;
    location: string;
  };
}

interface CourseEnrollment {
  id: string;
  courseId: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  enrolledAt: string;
  progress: number;
  course: {
    title: string;
    partner: {
      name: string;
    };
    duration: string;
    level: string;
  };
}

type TabType = 'all' | 'jobs' | 'events' | 'courses';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';
type SortOption = 'date_newest' | 'date_oldest' | 'status' | 'type';
type ViewMode = 'card' | 'timeline';

interface CombinedItem {
  id: string;
  type: 'job' | 'event' | 'course';
  title: string;
  subtitle: string;
  status: string;
  date: string;
  details: string[];
  link: string;
  originalItem: JobApplication | EventRegistration | CourseEnrollment;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_newest');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<CombinedItem | null>(null);

  useEffect(() => {
    loadAllApplications();
  }, []);

  const loadAllApplications = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const [jobsData, eventsData, coursesData] = await Promise.all([
        api.getMyApplications(token) as Promise<JobApplication[]>,
        api.getMyRegistrations(token) as Promise<EventRegistration[]>,
        api.getMyEnrollments(token) as Promise<CourseEnrollment[]>,
      ]);

      setJobApplications(jobsData);
      setEventRegistrations(eventsData);
      setCourseEnrollments(coursesData);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      showToast(error.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'attended':
      case 'completed':
        return 'success';
      case 'pending':
      case 'registered':
      case 'enrolled':
        return 'warning';
      case 'rejected':
      case 'cancelled':
      case 'dropped':
        return 'danger';
      case 'reviewed':
      case 'in_progress':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'attended':
      case 'completed':
        return '✓';
      case 'pending':
      case 'registered':
      case 'enrolled':
        return '⏳';
      case 'rejected':
      case 'cancelled':
      case 'dropped':
        return '✗';
      case 'reviewed':
        return '👁';
      case 'in_progress':
        return '📚';
      default:
        return '•';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      reviewed: 'Ko\'rib chiqildi',
      accepted: 'Qabul qilindi',
      rejected: 'Rad etildi',
      registered: 'Ro\'yxatdan o\'tdi',
      attended: 'Qatnashdi',
      cancelled: 'Bekor qilindi',
      enrolled: 'Ro\'yxatga olindi',
      in_progress: 'Jarayonda',
      completed: 'Yakunlandi',
      dropped: 'Tashlab ketildi',
    };
    return labels[status] || status;
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'To\'liq vaqt',
      part_time: 'Yarim vaqt',
      internship: 'Amaliyot',
      contract: 'Kontrakt',
    };
    return labels[type] || type;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      conference: 'Konferensiya',
      workshop: 'Seminar',
      webinar: 'Vebinar',
      meetup: 'Uchrashuv',
      hackathon: 'Hackathon',
      career_fair: 'Ish yarmarkasi',
    };
    return labels[type] || type;
  };

  // Convert all items to a unified format for filtering and sorting
  const getCombinedItems = (): CombinedItem[] => {
    const items: CombinedItem[] = [];

    if (activeTab === 'all' || activeTab === 'jobs') {
      jobApplications.forEach(app => {
        items.push({
          id: app.id,
          type: 'job',
          title: app.job.title,
          subtitle: app.job.company.name,
          status: app.status,
          date: app.appliedAt,
          details: [
            `📍 ${app.job.location}`,
            `💼 ${getJobTypeLabel(app.job.jobType)}`
          ],
          link: `/jobs/${app.jobId}`,
          originalItem: app,
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'events') {
      eventRegistrations.forEach(reg => {
        items.push({
          id: reg.id,
          type: 'event',
          title: reg.event.title,
          subtitle: getEventTypeLabel(reg.event.eventType),
          status: reg.status,
          date: reg.registeredAt,
          details: [
            `📅 ${new Date(reg.event.eventDate).toLocaleDateString('uz-UZ')}`,
            `📍 ${reg.event.location}`
          ],
          link: `/events/${reg.eventId}`,
          originalItem: reg,
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'courses') {
      courseEnrollments.forEach(enr => {
        items.push({
          id: enr.id,
          type: 'course',
          title: enr.course.title,
          subtitle: enr.course.partner.name,
          status: enr.status,
          date: enr.enrolledAt,
          details: [
            `⏱️ ${enr.course.duration}`,
            `📊 ${enr.course.level}`,
            `Progress: ${enr.progress}%`
          ],
          link: `/courses/${enr.courseId}`,
          originalItem: enr,
        });
      });
    }

    return items;
  };

  // Filter items by status
  const getFilteredItems = () => {
    let items = getCombinedItems();

    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => {
        if (statusFilter === 'pending') {
          return ['pending', 'registered', 'enrolled'].includes(item.status);
        } else if (statusFilter === 'accepted') {
          return ['accepted', 'attended', 'completed', 'in_progress', 'reviewed'].includes(item.status);
        } else if (statusFilter === 'rejected') {
          return ['rejected', 'cancelled', 'dropped'].includes(item.status);
        }
        return true;
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      switch (sortOption) {
        case 'date_newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return items;
  };

  // Calculate statistics
  const getStatistics = () => {
    const allItems = getCombinedItems();
    const total = allItems.length;
    const pending = allItems.filter(item =>
      ['pending', 'registered', 'enrolled'].includes(item.status)
    ).length;
    const accepted = allItems.filter(item =>
      ['accepted', 'attended', 'completed', 'in_progress', 'reviewed'].includes(item.status)
    ).length;
    const rejected = allItems.filter(item =>
      ['rejected', 'cancelled', 'dropped'].includes(item.status)
    ).length;

    return { total, pending, accepted, rejected };
  };

  const handleCancelItem = async () => {
    if (!itemToCancel) return;

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (itemToCancel.type === 'job') {
        // await api.cancelJobApplication(token, itemToCancel.id);
        showToast('Ariza bekor qilindi', 'success');
      } else if (itemToCancel.type === 'event') {
        // await api.cancelEventRegistration(token, itemToCancel.id);
        showToast('Ro\'yxat bekor qilindi', 'success');
      } else if (itemToCancel.type === 'course') {
        // await api.dropCourseEnrollment(token, itemToCancel.id);
        showToast('Kursdan chiqildi', 'success');
      }

      setShowCancelModal(false);
      setItemToCancel(null);
      await loadAllApplications();
    } catch (error: any) {
      showToast(error.message || 'Bekor qilishda xatolik', 'error');
    }
  };

  const canCancel = (item: CombinedItem) => {
    return ['pending', 'registered', 'enrolled'].includes(item.status);
  };

  const canReview = (item: CombinedItem) => {
    return ['attended', 'completed'].includes(item.status);
  };

  const stats = getStatistics();
  const filteredItems = getFilteredItems();
  const totalCount = jobApplications.length + eventRegistrations.length + courseEnrollments.length;

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mening arizalarim</h1>
        <p className="text-gray-600 mt-1">Barcha arizalar, ro'yxatlar va kurslar</p>
      </div>

      {/* Statistics Summary Bar */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Jami</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Kutilmoqda</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Qabul qilindi</p>
                <p className="text-2xl font-bold text-green-900">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rad etildi</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'all'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hammasi ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'jobs'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ish arizalari ({jobApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'events'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tadbir ro'yxatlari ({eventRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'courses'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Kurslar ({courseEnrollments.length})
        </button>
      </div>

      {/* Filters and Controls */}
      {totalCount > 0 && (
        <div className="mb-6 space-y-4">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              ⏳ Kutilmoqda
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === 'accepted'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              ✓ Qabul qilindi
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              ✗ Rad etildi
            </button>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Tartiblash:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="date_newest">Sana (yangi)</option>
                <option value="date_oldest">Sana (eski)</option>
                <option value="status">Status</option>
                <option value="type">Turi</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Ko'rinish:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'card'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {totalCount === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hali arizalar yo'q
          </h3>
          <p className="text-gray-600 mb-4">
            Ish, tadbir yoki kurslarga ariza topshiring
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/jobs">
              <Button variant="outline">Ish topish</Button>
            </Link>
            <Link href="/events">
              <Button variant="outline">Tadbirlarga qatnashish</Button>
            </Link>
            <Link href="/courses">
              <Button>Kurslarga yozilish</Button>
            </Link>
          </div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Natijalar topilmadi
          </h3>
          <p className="text-gray-600 mb-4">
            Tanlangan filtrlar bo'yicha hech narsa topilmadi
          </p>
          <Button onClick={() => {
            setStatusFilter('all');
            setActiveTab('all');
          }}>
            Barcha arizalarni ko'rish
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map((item) => (
                <Card key={`${item.type}-${item.id}`} hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                        </Badge>
                        <Badge variant="info">
                          {item.type === 'job' ? '💼 Ish' : item.type === 'event' ? '🎯 Tadbir' : '📚 Kurs'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                      <Link href={item.link}>
                        <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-2">{item.subtitle}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        {item.details.map((detail, idx) => (
                          <span key={idx}>{detail}</span>
                        ))}
                      </div>
                      {/* Progress Bar for Courses */}
                      {item.type === 'course' && 'progress' in item.originalItem && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand h-2 rounded-full transition-all"
                            style={{ width: `${(item.originalItem as CourseEnrollment).progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={item.link}>
                        <Button variant="ghost" size="sm">
                          {item.type === 'course' ? 'Davom etish' : 'Ko\'rish'}
                        </Button>
                      </Link>
                      {canCancel(item) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setItemToCancel(item);
                            setShowCancelModal(true);
                          }}
                        >
                          Bekor qilish
                        </Button>
                      )}
                      {canReview(item) && (
                        <Button variant="outline" size="sm">
                          Baholash
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-8">
                {filteredItems.map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${
                      getStatusBadgeVariant(item.status) === 'success' ? 'bg-green-500' :
                      getStatusBadgeVariant(item.status) === 'warning' ? 'bg-yellow-500' :
                      getStatusBadgeVariant(item.status) === 'danger' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>

                    {/* Date Label */}
                    <div className="absolute left-0 top-0 text-sm font-medium text-gray-500 w-16 text-right pr-4">
                      {new Date(item.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}
                    </div>

                    {/* Content Card */}
                    <Card hover className="ml-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadgeVariant(item.status)}>
                              {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                            </Badge>
                            <Badge variant="info">
                              {item.type === 'job' ? '💼 Ish' : item.type === 'event' ? '🎯 Tadbir' : '📚 Kurs'}
                            </Badge>
                          </div>
                          <Link href={item.link}>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-2">{item.subtitle}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {item.details.map((detail, idx) => (
                              <span key={idx}>{detail}</span>
                            ))}
                          </div>
                          {/* Progress Bar for Courses */}
                          {item.type === 'course' && 'progress' in item.originalItem && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                              <div
                                className="bg-brand h-2 rounded-full transition-all"
                                style={{ width: `${(item.originalItem as CourseEnrollment).progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href={item.link}>
                            <Button variant="ghost" size="sm">
                              {item.type === 'course' ? 'Davom etish' : 'Ko\'rish'}
                            </Button>
                          </Link>
                          {canCancel(item) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setItemToCancel(item);
                                setShowCancelModal(true);
                              }}
                            >
                              Bekor qilish
                            </Button>
                          )}
                          {canReview(item) && (
                            <Button variant="outline" size="sm">
                              Baholash
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && itemToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bekor qilishni tasdiqlang
              </h3>
              <p className="text-gray-600">
                Rostdan ham <span className="font-semibold">{itemToCancel.title}</span> ni bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setItemToCancel(null);
                }}
              >
                Yo'q, qaytish
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelItem}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Ha, bekor qilish
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}
