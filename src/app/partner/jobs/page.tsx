'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Job } from '@/types';

export default function PartnerJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await api.getPartnerContent(token, 'jobs') as any;
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu ish o\'rnini o\'chirishni tasdiqlaysizmi?')) return;

    const token = getToken();
    if (!token) return;

    try {
      setDeleteId(id);
      await api.deleteJob(token, id);
      await loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Ish o\'rnini o\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/partner/jobs/${id}/edit`);
  };

  const handleViewApplications = (id: string) => {
    router.push(`/partner/jobs/${id}/applications`);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-dark mb-2">Mening ish o'rinlarim</h1>
          <p className="text-lg text-dark/60">
            Siz e'lon qilgan barcha ish o'rinlari ro'yxati
          </p>
        </div>
        <Button onClick={() => router.push('/partner/jobs/create')}>
          Yangi ish o'rni qo'shish
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-3">Hali ish o'rinlari yo'q</h2>
            <p className="text-dark/60 mb-6">
              Talabalar uchun birinchi ish o'rningizni e'lon qiling
            </p>
            <Button onClick={() => router.push('/partner/jobs/create')}>
              Yangi ish o'rni qo'shish
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-6">
                {job.companyLogo && (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-20 h-20 object-contain rounded-lg border border-lavender-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-1">{job.title}</h3>
                      <p className="text-dark/70 mb-2">{job.companyName}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="primary">{job.type}</Badge>
                        <Badge variant="info">{job.location}</Badge>
                        {job.salary && <Badge variant="success">{job.salary}</Badge>}
                      </div>
                    </div>
                    <Badge variant={job.isActive ? 'success' : 'warning'}>
                      {job.isActive ? 'Faol' : 'Kutilmoqda'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Arizalar</p>
                      <p className="font-bold text-brand text-xl">{job.applicationsCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Ko'rildi</p>
                      <p className="font-semibold text-dark">{job.views || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Saqlangan</p>
                      <p className="font-semibold text-dark">{job.savedCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-dark/60 mb-1">Muddat</p>
                      <p className="font-semibold text-dark">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString('uz-UZ') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewApplications(job.id)}
                    >
                      Arizalarni ko'rish ({job.applicationsCount || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(job.id)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleteId === job.id}
                    >
                      {deleteId === job.id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      Ko'rish
                    </Button>
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
