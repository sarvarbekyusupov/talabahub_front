'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Job, CreateJobRequest, JobAnalytics } from '@/types';

export default function EmployerJobsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const token = getToken();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedJobAnalytics, setSelectedJobAnalytics] = useState<{ jobId: string; analytics: JobAnalytics } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [formData, setFormData] = useState<CreateJobRequest>({
    title: '',
    description: '',
    companyName: '',
    location: '',
    employmentType: 'full_time',
    experienceLevel: 'entry',
    salaryMin: undefined,
    salaryMax: undefined,
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadEmployerJobs();
  }, [token, router]);

  const loadEmployerJobs = async () => {
    if (!token) return;
    try {
      // Get employer's jobs (assuming API filters by token)
      const response = await api.getJobs({ employer: 'me' }) as any;
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    try {
      await api.createJob(token, formData);
      showToast('Ish o\'rni muvaffaqiyatli yaratildi!', 'success');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        companyName: '',
        location: '',
        employmentType: 'full_time',
        experienceLevel: 'entry',
        salaryMin: undefined,
        salaryMax: undefined,
        skills: [],
      });
      loadEmployerJobs();
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const loadJobAnalytics = async (jobId: string) => {
    if (!token) return;
    setLoadingAnalytics(true);
    try {
      const analytics = await api.getJobAnalytics(token, jobId) as JobAnalytics;
      setSelectedJobAnalytics({ jobId, analytics });
    } catch (err) {
      showToast('Statistikani yuklashda xatolik', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter((s) => s !== skill) || [],
    });
  };

  const getJobTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      full_time: { label: 'To\'liq vaqt', variant: 'primary' },
      part_time: { label: 'Qisman vaqt', variant: 'info' },
      internship: { label: 'Amaliyot', variant: 'warning' },
      contract: { label: 'Kontrakt', variant: 'success' },
    };
    return types[type] || { label: type, variant: 'info' };
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Ish o&apos;rinlarini boshqarish</h1>
          <p className="text-dark/60 mt-2">Yaratgan ish o&apos;rinlaringiz va arizalarni boshqaring</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Formani yopish' : '+ Yangi ish o\'rni'}
        </Button>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Yangi ish o&apos;rni yaratish</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lavozim nomi *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joylashuv *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="Toshkent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kompaniya nomi *
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                placeholder="TechCorp LLC"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ish turi *
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="full_time">To&apos;liq vaqt</option>
                  <option value="part_time">Qisman vaqt</option>
                  <option value="internship">Amaliyot</option>
                  <option value="contract">Kontrakt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tajriba darajasi
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entry">Boshlang&apos;ich</option>
                  <option value="mid">O&apos;rta</option>
                  <option value="senior">Yuqori</option>
                  <option value="lead">Rahbar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimal maosh (so&apos;m)
                </label>
                <Input
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="3000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maksimal maosh (so&apos;m)
                </label>
                <Input
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="5000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tavsif *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Ish o'rni haqida batafsil ma'lumot..."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ko&apos;nikmalar
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="React, TypeScript..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Qo&apos;shish
                </Button>
              </div>
              {formData.skills && formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand rounded-full text-sm"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" loading={creating}>
                Yaratish
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Bekor qilish
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ish o&apos;rinlari yo&apos;q</h3>
            <p className="text-gray-600 mb-4">Siz hali ish o&apos;rni yaratmagansiz</p>
            <Button onClick={() => setShowCreateForm(true)}>Birinchi ish o&apos;rnini yaratish</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const typeBadge = getJobTypeBadge(job.jobType);
            return (
              <Card key={job.id} hover>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-dark">{job.title}</h3>
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      {job.isActive ? (
                        <Badge variant="success">Aktiv</Badge>
                      ) : (
                        <Badge variant="danger">Nofaol</Badge>
                      )}
                    </div>
                    <p className="text-dark/60 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-dark/60">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {job.salary} so&apos;m
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Muddat: {new Date(job.applicationDeadline).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/employer/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm" fullWidth>
                        Arizalar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadJobAnalytics(job.id)}
                      loading={loadingAnalytics && selectedJobAnalytics?.jobId === job.id}
                    >
                      Statistika
                    </Button>
                  </div>
                </div>

                {/* Analytics Display */}
                {selectedJobAnalytics?.jobId === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-3">Statistika</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Ko&apos;rishlar</p>
                        <p className="text-xl font-bold">{selectedJobAnalytics.analytics.views}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Arizalar</p>
                        <p className="text-xl font-bold">{selectedJobAnalytics.analytics.applications}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Konversiya</p>
                        <p className="text-xl font-bold">{selectedJobAnalytics.analytics.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
