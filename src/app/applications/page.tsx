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

export default function ApplicationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);

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
        api.getJobApplications(token) as Promise<JobApplication[]>,
        api.getEventRegistrations(token) as Promise<EventRegistration[]>,
        api.getCourseEnrollments(token) as Promise<CourseEnrollment[]>,
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
        return 'default';
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

  const totalCount = jobApplications.length + eventRegistrations.length + courseEnrollments.length;

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mening arizalarim</h1>
        <p className="text-gray-600 mt-1">Barcha arizalar, ro'yxatlar va kurslar</p>
      </div>

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
      ) : (
        <div className="space-y-6">
          {/* Job Applications */}
          {(activeTab === 'all' || activeTab === 'jobs') && jobApplications.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ish arizalari</h2>
              )}
              <div className="grid grid-cols-1 gap-4">
                {jobApplications.map((application) => (
                  <Card key={application.id} hover>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(application.status)}>
                            {getStatusLabel(application.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(application.appliedAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                        <Link href={`/jobs/${application.jobId}`}>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                            {application.job.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mb-2">{application.job.company.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📍 {application.job.location}</span>
                          <span>💼 {getJobTypeLabel(application.job.jobType)}</span>
                        </div>
                      </div>
                      <Link href={`/jobs/${application.jobId}`}>
                        <Button variant="ghost" size="sm">
                          Ko'rish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Event Registrations */}
          {(activeTab === 'all' || activeTab === 'events') && eventRegistrations.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tadbir ro'yxatlari</h2>
              )}
              <div className="grid grid-cols-1 gap-4">
                {eventRegistrations.map((registration) => (
                  <Card key={registration.id} hover>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(registration.status)}>
                            {getStatusLabel(registration.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Ro'yxatdan o'tdi: {new Date(registration.registeredAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                        <Link href={`/events/${registration.eventId}`}>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                            {registration.event.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>🎯 {getEventTypeLabel(registration.event.eventType)}</span>
                          <span>📅 {new Date(registration.event.eventDate).toLocaleDateString('uz-UZ')}</span>
                          <span>📍 {registration.event.location}</span>
                        </div>
                      </div>
                      <Link href={`/events/${registration.eventId}`}>
                        <Button variant="ghost" size="sm">
                          Ko'rish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Course Enrollments */}
          {(activeTab === 'all' || activeTab === 'courses') && courseEnrollments.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kurslar</h2>
              )}
              <div className="grid grid-cols-1 gap-4">
                {courseEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} hover>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                            {getStatusLabel(enrollment.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Boshlandi: {new Date(enrollment.enrolledAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                        <Link href={`/courses/${enrollment.courseId}`}>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                            {enrollment.course.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mb-2">{enrollment.course.partner.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>⏱️ {enrollment.course.duration}</span>
                          <span>📊 {enrollment.course.level}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Progress: {enrollment.progress}%
                        </p>
                      </div>
                      <Link href={`/courses/${enrollment.courseId}`}>
                        <Button variant="ghost" size="sm">
                          Davom etish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for specific tabs */}
          {activeTab === 'jobs' && jobApplications.length === 0 && (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hali ish arizalari yo'q
              </h3>
              <p className="text-gray-600 mb-4">
                Qiziqarli ish o'rinlariga ariza topshiring
              </p>
              <Link href="/jobs">
                <Button>Ish topish</Button>
              </Link>
            </Card>
          )}

          {activeTab === 'events' && eventRegistrations.length === 0 && (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hali tadbir ro'yxatlari yo'q
              </h3>
              <p className="text-gray-600 mb-4">
                Qiziqarli tadbirlarga ro'yxatdan o'ting
              </p>
              <Link href="/events">
                <Button>Tadbirlarga qatnashish</Button>
              </Link>
            </Card>
          )}

          {activeTab === 'courses' && courseEnrollments.length === 0 && (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hali kurslar yo'q
              </h3>
              <p className="text-gray-600 mb-4">
                Yangi ko'nikmalar o'rganish uchun kurslarga yoziling
              </p>
              <Link href="/courses">
                <Button>Kurslarga yozilish</Button>
              </Link>
            </Card>
          )}
        </div>
      )}
    </Container>
  );
}
