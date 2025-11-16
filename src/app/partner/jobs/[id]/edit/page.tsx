'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function PartnerEditJobPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    type: 'full-time' as 'full-time' | 'part-time' | 'internship' | 'remote',
    location: '',
    salary: '',
    deadline: '',
    categoryId: '',
  });

  useEffect(() => {
    loadJobData();
    loadCategories();
  }, [jobId]);

  const loadJobData = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const job = await api.getJob(jobId) as any;

      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        type: job.type || 'full-time',
        location: job.location || '',
        salary: job.salary || '',
        deadline: job.deadline?.split('T')[0] || '',
        categoryId: job.categoryId || '',
      });
    } catch (error) {
      console.error('Error loading job:', error);
      showToast('Ish o\'rnini yuklashda xatolik', 'error');
      router.push('/partner/jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const categoriesData = await api.getCategories({ type: 'job', limit: 100 }) as any;
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleArrayInput = (field: 'requirements' | 'responsibilities', value: string) => {
    const items = value.split('\n').filter((item) => item.trim());
    setFormData({ ...formData, [field]: items });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      showToast('Iltimos, tizimga kiring', 'error');
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        type: formData.type,
        location: formData.location,
        salary: formData.salary || undefined,
        deadline: formData.deadline,
        categoryId: formData.categoryId || undefined,
      };

      await api.updateJob(token, jobId, jobData);
      showToast('Ish o\'rni yangilandi', 'success');
      router.push('/partner/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      showToast(error.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/partner/jobs')} className="mb-4">
            ← Ish o'rinlariga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">Ish o'rnini tahrirlash</h1>
          <p className="text-lg text-dark/60">Ish o'rni ma'lumotlarini yangilang</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Asosiy ma'lumotlar</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Lavozim nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Ish tavsifi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Ish haqida batafsil ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Ish turi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="full-time">To'liq vaqt</option>
                    <option value="part-time">Yarim stavka</option>
                    <option value="internship">Amaliyot</option>
                    <option value="remote">Masofaviy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Joylashuv <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Toshkent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Maosh (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="5,000,000 - 8,000,000 so'm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Ariza topshirish muddati <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Kategoriya</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Talablar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.requirements.join('\n')}
                  onChange={(e) => handleArrayInput('requirements', e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                  placeholder="Har bir talabni yangi qatordan yozing:&#10;React tajribasi&#10;TypeScript bilishi&#10;3+ yil tajriba"
                />
                <p className="text-sm text-dark/60 mt-1">
                  Har bir talabni yangi qatordan yozing
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Vazifalar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.responsibilities.join('\n')}
                  onChange={(e) => handleArrayInput('responsibilities', e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                  placeholder="Har bir vazifani yangi qatordan yozing:&#10;UI komponentlar yaratish&#10;API integratsiya qilish&#10;Code review o'tkazish"
                />
                <p className="text-sm text-dark/60 mt-1">
                  Har bir vazifani yangi qatordan yozing
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/partner/jobs')}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
