'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function PartnerCreateJobPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    jobType: 'full_time' as 'full_time' | 'part_time' | 'internship' | 'contract',
    salary: '',
    location: '',
    applicationDeadline: '',
    companyId: '',
    categoryId: '',
  });

  useEffect(() => {
    loadCompaniesAndCategories();
  }, []);

  const loadCompaniesAndCategories = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [companiesData, categoriesData] = await Promise.all([
        api.getCompanies({ limit: 100 }) as Promise<any>,
        api.getCategories({ type: 'job', limit: 100 }) as Promise<any>,
      ]);
      setCompanies(companiesData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      showToast('Iltimos, tizimga kiring', 'error');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
        jobType: formData.jobType,
        salary: formData.salary || undefined,
        location: formData.location,
        applicationDeadline: formData.applicationDeadline,
        companyId: formData.companyId,
        categoryId: formData.categoryId || undefined,
        isActive: false, // Partners create as inactive, admin approves
      };

      await api.createJob(token, jobData);
      showToast('Ish o\'rni muvaffaqiyatli yaratildi! Admin tasdiqlashini kuting.', 'success');
      router.push('/partner/dashboard');
    } catch (error: any) {
      console.error('Error creating job:', error);
      showToast(error.message || 'Ish o\'rnini yaratishda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yangi ish o'rni e'lon qilish</h1>
            <p className="text-gray-600 mt-1">Talabalarga ish imkoniyatlarini taklif qiling</p>
          </div>
          <Link href="/partner/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Asosiy ma'lumotlar</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lavozim nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ish haqida batafsil *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="Ish haqida to'liq ma'lumot, kompaniya haqida qisqacha, jamoada ishlash sharoiti..."
                  />
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ish tafsilotlari</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kompaniya *
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Kompaniyani tanlang</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ish turi *
                  </label>
                  <select
                    required
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full_time">To'liq vaqt</option>
                    <option value="part_time">Yarim vaqt</option>
                    <option value="internship">Amaliyot</option>
                    <option value="contract">Kontrakt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joylashuv *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toshkent, O'zbekiston"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maosh (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5,000,000 - 8,000,000 so'm"
                  />
                  <p className="text-sm text-gray-500 mt-1">Ko'rsatmasangiz "Kelishiladi" deb chiqadi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ariza topshirish muddati *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Talablar</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomzodga qo'yiladigan talablar
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Har bir talabni yangi qatordan kiriting:&#10;&#10;- 2+ yillik React tajribasi&#10;- TypeScript bilishi&#10;- Git bilan ishlash ko'nikmalari&#10;- Ingliz tili (B2+)&#10;- Jamoa bilan ishlash qobiliyati"
                />
                <p className="text-sm text-gray-500 mt-1">Har bir talabni tire (-) bilan boshlang</p>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mas'uliyatlar</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vazifalar va mas'uliyatlar
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Har bir vazifani yangi qatordan kiriting:&#10;&#10;- Web ilovalarni ishlab chiqish&#10;- UI/UX dizaynlarni kodga aylantirish&#10;- API integratsiyasi&#10;- Kod sharhlash (Code Review)&#10;- Texnik hujjatlar tayyorlash"
                />
                <p className="text-sm text-gray-500 mt-1">Har bir vazifani tire (-) bilan boshlang</p>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-medium text-blue-900">Eslatma</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Yaratilgan ish o'rni admin tomonidan tasdiqlangandan so'ng faollashadi va platformada ko'rinadi. Arizalar sizning email manzilingizga yuboriladi.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Ish o\'rnini e\'lon qilish'}
              </Button>
              <Link href="/partner/dashboard" className="w-full">
                <Button type="button" variant="outline" fullWidth>
                  Bekor qilish
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
