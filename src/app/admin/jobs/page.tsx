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
import { Job, PaginatedResponse } from '@/types';
import { exportJobsToCSV } from '@/lib/export';

export default function AdminJobsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
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
    isActive: true,
  });

  useEffect(() => {
    loadJobs();
    loadCompaniesAndCategories();
  }, [page, searchQuery, filterJobType, filterStatus, filterCompany]);

  const loadJobs = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const params: any = { page, limit: 20 };

      // Add search query if provided
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Add filters
      if (filterJobType) {
        params.jobType = filterJobType;
      }
      if (filterStatus) {
        params.isActive = filterStatus === 'active';
      }
      if (filterCompany) {
        params.companyId = filterCompany;
      }

      const data = await api.getJobs(params) as PaginatedResponse<Job>;
      setJobs(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      showToast(error.message || 'Ish o\'rinlarini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCompaniesAndCategories = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [companiesData, categoriesData] = await Promise.all([
        api.getCompanies({ limit: 100 }) as Promise<any>,
        api.getCategories({ type: 'job', limit: 100 }) as Promise<any>,
      ]);
      setCompanies(companiesData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading companies and categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

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
        isActive: formData.isActive,
      };

      if (editingJob) {
        await api.updateJob(token, editingJob.id, jobData);
        showToast('Ish o\'rni muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createJob(token, jobData);
        showToast('Ish o\'rni muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadJobs();
    } catch (error: any) {
      console.error('Error saving job:', error);
      showToast(error.message || 'Ish o\'rnini saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      jobType: job.jobType,
      salary: job.salary || '',
      location: job.location,
      applicationDeadline: job.applicationDeadline.split('T')[0],
      companyId: job.company.id.toString(),
      categoryId: '',
      isActive: job.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham bu ish o\'rnini o\'chirmoqchimisiz?')) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteJob(token, id);
      showToast('Ish o\'rni muvaffaqiyatli o\'chirildi', 'success');
      loadJobs();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      showToast(error.message || 'Ish o\'rnini o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      jobType: 'full_time',
      salary: '',
      location: '',
      applicationDeadline: '',
      companyId: '',
      categoryId: '',
      isActive: true,
    });
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full_time': return 'To\'liq vaqt';
      case 'part_time': return 'Yarim vaqt';
      case 'internship': return 'Amaliyot';
      case 'contract': return 'Kontrakt';
      default: return type;
    }
  };

  const getJobTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'full_time': return 'success';
      case 'part_time': return 'info';
      case 'internship': return 'warning';
      case 'contract': return 'primary';
      default: return 'primary';
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterJobType('');
    setFilterStatus('');
    setFilterCompany('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterJobType || filterStatus || filterCompany;

  if (loading && jobs.length === 0) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ish o'rinlari boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha ish o'rinlarini ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => exportJobsToCSV(jobs)}
            disabled={jobs.length === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV Eksport
          </Button>
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi ish o'rni
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qidirish
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Lavozim nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
            </div>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ish turi
            </label>
            <select
              value={filterJobType}
              onChange={(e) => {
                setFilterJobType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha turlar</option>
              <option value="full_time">To'liq vaqt</option>
              <option value="part_time">Yarim vaqt</option>
              <option value="internship">Amaliyot</option>
              <option value="contract">Kontrakt</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holat
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kompaniya
            </label>
            <select
              value={filterCompany}
              onChange={(e) => {
                setFilterCompany(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha kompaniyalar</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Faol filtrlar:</span>
              {searchQuery && (
                <Badge variant="info">Qidiruv: {searchQuery}</Badge>
              )}
              {filterJobType && (
                <Badge variant="info">Tur: {getJobTypeLabel(filterJobType)}</Badge>
              )}
              {filterStatus && (
                <Badge variant="info">
                  Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              )}
              {filterCompany && (
                <Badge variant="info">
                  Kompaniya: {companies.find(c => c.id === filterCompany)?.name}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Tozalash
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Jami: <span className="font-semibold">{jobs.length}</span> ta ish o'rni topildi
          </p>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lavozim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kompaniya</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Turi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joylashuv</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Maosh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Muddat</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{job.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {job.company.logoUrl && (
                        <img
                          src={job.company.logoUrl}
                          alt={job.company.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="text-gray-700">{job.company.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getJobTypeBadgeVariant(job.jobType)}>
                      {getJobTypeLabel(job.jobType)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{job.location}</td>
                  <td className="py-3 px-4 text-gray-700">{job.salary || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(job.applicationDeadline).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={job.isActive ? 'success' : 'danger'}>
                      {job.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Ko'rish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="O'chirish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Oldingi
            </Button>
            <span className="text-gray-600">
              Sahifa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Keyingi
            </Button>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingJob ? 'Ish o\'rnini tahrirlash' : 'Yangi ish o\'rni'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lavozim nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Senior Frontend Developer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Ish o'rni haqida batafsil ma'lumot..."
                  />
                </div>

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
                    Maosh
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5,000,000 - 8,000,000 so'm"
                  />
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
                    Ariza topshirish muddati *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Talablar
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="- 3+ yillik tajriba&#10;- React, TypeScript bilishi&#10;- Ingliz tili bilishi (B2+)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mas'uliyatlar
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="- Frontend loyihalarni boshqarish&#10;- Kod sifatini ta'minlash&#10;- Jamoada ishlash"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Faol
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" fullWidth>
                  {editingJob ? 'Saqlash' : 'Yaratish'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Container>
  );
}
