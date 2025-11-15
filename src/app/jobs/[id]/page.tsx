'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Job } from '@/types';
import { getToken } from '@/lib/auth';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cvUrl: '',
    coverLetter: '',
  });

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await api.getJob(id) as Job;
      setJob(data);
    } catch (err: any) {
      setError('Ish o\'rni topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!applicationData.cvUrl) {
      showToast('Iltimos, CV faylini yuklang', 'error');
      return;
    }

    setApplying(true);
    try {
      await api.applyForJob(token, id, applicationData);
      showToast('Ariza muvaffaqiyatli yuborildi!', 'success');
      setShowApplyForm(false);
      setApplicationData({ cvUrl: '', coverLetter: '' });
    } catch (err: any) {
      showToast('Ariza yuborishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleResumeUpload = async (file: File): Promise<string> => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      throw new Error('Not authenticated');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('resume', file);

    // In a real implementation, this would upload to your backend
    // For now, we'll simulate it with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would be:
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/resume`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: formData
    // });
    // const data = await response.json();
    // return data.fileUrl;

    // For now, create a simulated URL
    const url = `https://example.com/resumes/${file.name}`;

    // Update application data with CV URL
    setApplicationData(prev => ({ ...prev, cvUrl: url }));

    return url;
  };

  const handleResumeRemove = () => {
    setApplicationData(prev => ({ ...prev, cvUrl: '' }));
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
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ish o'rni topilmadi
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/jobs')}>
              Ish o'rinlariga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const typeBadge = getJobTypeBadge(job.jobType);

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4 mb-6">
              {job.company.logoUrl && (
                <img
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  className="w-20 h-20 object-contain rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{job.company.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  {job.isActive && <Badge variant="success">Aktiv</Badge>}
                </div>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Joylashuv</h3>
                <p className="text-gray-900">{job.location}</p>
              </div>
              {job.salary && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Maosh</h3>
                  <p className="text-gray-900">{job.salary} so'm</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Muddat</h3>
                <p className="text-gray-900">
                  {new Date(job.applicationDeadline).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Tavsif</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Talablar</h2>
                <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Majburiyatlar</h2>
                <div className="text-gray-700 whitespace-pre-line">{job.responsibilities}</div>
              </div>
            )}
          </Card>

          {/* Application Form */}
          {showApplyForm && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Ariza topshirish</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV yuklash *
                  </label>
                  <FileUpload
                    currentFile={applicationData.cvUrl}
                    onUpload={handleResumeUpload}
                    onRemove={handleResumeRemove}
                    maxSizeMB={10}
                    acceptedTypes={['.pdf', '.doc', '.docx']}
                    label="CV faylini yuklang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qo'shimcha xat (ixtiyoriy)
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, coverLetter: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nega siz bu lavozimga mos kelishingiz haqida yozing..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={applying}>
                    Yuborish
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Harakatlar</h3>
            <div className="space-y-3">
              {!showApplyForm ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setShowApplyForm(true)}
                >
                  Ariza topshirish
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  variant="outline"
                  onClick={() => setShowApplyForm(false)}
                >
                  Formani yopish
                </Button>
              )}
              <Button fullWidth variant="outline">
                Saqlab qo'yish
              </Button>
              <Button fullWidth variant="ghost">
                Ulashish
              </Button>
            </div>

            {/* Company Info */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Kompaniya haqida
              </h4>
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  {job.company.name}
                </p>
                {job.company.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {job.company.description}
                  </p>
                )}
                {job.company.industry && (
                  <div className="text-sm">
                    <span className="text-gray-500">Soha: </span>
                    <span className="text-gray-900">{job.company.industry}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
