'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Job, JobApplicationExtended } from '@/types';

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const token = getToken();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplicationExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [token, jobId, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [jobData, applicationsData] = await Promise.all([
        api.getJob(jobId),
        api.getJobApplications(token, jobId),
      ]);
      setJob(jobData as Job);
      setApplications((applicationsData as any).data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    if (!token) return;
    setUpdatingId(applicationId);
    try {
      await api.updateJobApplicationStatus(token, applicationId, { status, feedback: notes });
      showToast('Ariza holati yangilandi', 'success');
      // Update local state
      setApplications(applications.map((app) =>
        app.id === applicationId ? { ...app, status: status as any } : app
      ));
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: any }> = {
      applied: { label: 'Yuborilgan', variant: 'warning' },
      reviewed: { label: 'Ko\'rib chiqildi', variant: 'info' },
      shortlisted: { label: 'Tanlandi', variant: 'primary' },
      rejected: { label: 'Rad etildi', variant: 'danger' },
      hired: { label: 'Qabul qilindi', variant: 'success' },
    };
    return statuses[status] || { label: status, variant: 'info' };
  };

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/employer/jobs" className="text-brand hover:underline mb-2 inline-block">
          ← Ish o&apos;rinlariga qaytish
        </Link>
        <h1 className="text-3xl font-bold text-dark">{job?.title} - Arizalar</h1>
        <p className="text-dark/60 mt-2">
          Jami {applications.length} ta ariza
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Barchasi ({applications.length})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'applied'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yuborilgan ({applications.filter((a) => a.status === 'applied').length})
          </button>
          <button
            onClick={() => setStatusFilter('shortlisted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'shortlisted'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tanlangan ({applications.filter((a) => a.status === 'shortlisted').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rad etilgan ({applications.filter((a) => a.status === 'rejected').length})
          </button>
        </div>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Arizalar yo&apos;q</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? 'Bu ish o\'rniga hali ariza kelib tushmagan'
                : `"${getStatusBadge(statusFilter).label}" holatidagi arizalar yo'q`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusBadge = getStatusBadge(application.status);
            return (
              <Card key={application.id}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-dark">
                          {application.user?.firstName} {application.user?.lastName}
                        </h3>
                        <p className="text-sm text-dark/60">{application.user?.email}</p>
                      </div>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Qo&apos;shimcha xat:</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{application.coverLetter}</p>
                      </div>
                    )}

                    {/* Resume Info */}
                    {application.resume && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Rezyume:</p>
                        <p className="text-sm text-brand">{application.resume.title}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-dark/60">
                      <span>
                        Yuborilgan: {new Date(application.appliedAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {application.status === 'applied' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                          loading={updatingId === application.id}
                        >
                          Tanlash
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                          loading={updatingId === application.id}
                        >
                          Ko&apos;rildi
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          loading={updatingId === application.id}
                        >
                          Rad etish
                        </Button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                          loading={updatingId === application.id}
                        >
                          Tanlash
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          loading={updatingId === application.id}
                        >
                          Rad etish
                        </Button>
                      </>
                    )}
                    {application.status === 'shortlisted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'hired')}
                          loading={updatingId === application.id}
                        >
                          Qabul qilish
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          loading={updatingId === application.id}
                        >
                          Rad etish
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
