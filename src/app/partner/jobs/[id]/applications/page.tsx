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

interface Application {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  coverLetter: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  createdAt: string;
}

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadJobAndApplications();
  }, [jobId]);

  const loadJobAndApplications = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [jobData, applicationsData] = await Promise.all([
        api.getJob(jobId) as Promise<any>,
        api.request(`/jobs/${jobId}/applications`, { token }) as Promise<any>,
      ]);

      setJob(jobData);
      setApplications(applicationsData.data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      showToast('Arizalarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await api.request(`/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });

      showToast('Ariza holati yangilandi', 'success');
      await loadJobAndApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      showToast('Ariza holatini yangilashda xatolik yuz berdi', 'error');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      reviewed: 'default',
      shortlisted: 'success',
      rejected: 'danger',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      reviewed: 'Ko\'rib chiqildi',
      shortlisted: 'Tanlandi',
      rejected: 'Rad etildi',
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

  if (!job) {
    return (
      <Container className="py-12">
        <div className="text-center">Ish o'rni topilmadi</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/partner/jobs')} className="mb-4">
          ← Ish o'rinlarimga qaytish
        </Button>
        <h1 className="text-4xl font-bold text-dark mb-2">
          {job.title} - Arizalar
        </h1>
        <p className="text-lg text-dark/60">
          Jami {applications.length} ta ariza topildi
        </p>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Barchasi ({applications.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'ghost'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Kutilmoqda ({applications.filter(a => a.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'reviewed' ? 'primary' : 'ghost'}
            onClick={() => setFilter('reviewed')}
            size="sm"
          >
            Ko'rib chiqildi ({applications.filter(a => a.status === 'reviewed').length})
          </Button>
          <Button
            variant={filter === 'shortlisted' ? 'primary' : 'ghost'}
            onClick={() => setFilter('shortlisted')}
            size="sm"
          >
            Tanlandi ({applications.filter(a => a.status === 'shortlisted').length})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'primary' : 'ghost'}
            onClick={() => setFilter('rejected')}
            size="sm"
          >
            Rad etildi ({applications.filter(a => a.status === 'rejected').length})
          </Button>
        </div>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-dark/60">Hech qanday ariza topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-6">
                {application.user.avatarUrl && (
                  <img
                    src={application.user.avatarUrl}
                    alt={`${application.user.firstName} ${application.user.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-1">
                        {application.user.firstName} {application.user.lastName}
                      </h3>
                      <p className="text-dark/70 mb-1">{application.user.email}</p>
                      {application.user.phone && (
                        <p className="text-dark/70 mb-2">{application.user.phone}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        <span className="text-sm text-dark/60">
                          {new Date(application.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-dark mb-1">Qo'shimcha xabar:</p>
                      <p className="text-dark/70 whitespace-pre-wrap">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {application.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.resumeUrl, '_blank')}
                      >
                        Resume yuklab olish
                      </Button>
                    )}
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                        >
                          Ko'rib chiqildi deb belgilash
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                        >
                          Tanlash
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          Rad etish
                        </Button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                        >
                          Tanlash
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          Rad etish
                        </Button>
                      </>
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
