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

interface University {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  logo?: string;
  website?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: University[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminUniversitiesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    logo: '',
    website: '',
    location: '',
    isActive: true,
  });

  useEffect(() => {
    loadUniversities();
  }, [page]);

  const loadUniversities = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getUniversities({ page, limit: 20 }) as PaginatedResponse;
      setUniversities(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading universities:', error);
      showToast(error.message || 'Universitetlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      // Upload logo if selected
      let logoUrl = formData.logo;
      if (logoFile) {
        const uploadResponse = await api.uploadLogo(logoFile, token) as { url: string };
        logoUrl = uploadResponse.url;
      }

      const universityData = {
        name: formData.name,
        shortName: formData.shortName || undefined,
        description: formData.description || undefined,
        logo: logoUrl,
        website: formData.website || undefined,
        location: formData.location || undefined,
        isActive: formData.isActive,
      };

      if (editingUniversity) {
        await api.updateUniversity(token, editingUniversity.id, universityData);
        showToast('Universitet muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createUniversity(token, universityData);
        showToast('Universitet muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadUniversities();
    } catch (error: any) {
      console.error('Error saving university:', error);
      showToast(error.message || 'Universitetni saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      shortName: university.shortName || '',
      description: university.description || '',
      logo: university.logo || '',
      website: university.website || '',
      location: university.location || '',
      isActive: university.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham bu universitetni o\'chirmoqchimisiz?')) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteUniversity(token, id);
      showToast('Universitet muvaffaqiyatli o\'chirildi', 'success');
      loadUniversities();
    } catch (error: any) {
      console.error('Error deleting university:', error);
      showToast(error.message || 'Universitetni o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingUniversity(null);
    setLogoFile(null);
    setFormData({
      name: '',
      shortName: '',
      description: '',
      logo: '',
      website: '',
      location: '',
      isActive: true,
    });
  };

  if (loading && universities.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Universitetlar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha universitetlarni ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi universitet
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Universitet</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Qisqa nomi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joylashuv</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Yaratilgan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((university) => (
                <tr key={university.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {university.logo ? (
                        <img
                          src={university.logo}
                          alt={university.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-lg">{university.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{university.name}</p>
                        {university.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{university.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{university.shortName || '-'}</td>
                  <td className="py-3 px-4 text-gray-700">{university.location || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={university.isActive ? 'success' : 'danger'}>
                      {university.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(university.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {university.website && (
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Veb-sayt"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(university)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(university.id)}
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
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUniversity ? 'Universitetni tahrirlash' : 'Yangi universitet'}
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
                    To'liq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toshkent Axborot Texnologiyalari Universiteti"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qisqa nomi
                  </label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="TATU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joylashuv
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toshkent, O'zbekiston"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Universitet haqida qisqacha ma'lumot..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.logo && !logoFile && (
                    <div className="mt-2">
                      <img src={formData.logo} alt="Current logo" className="h-20 rounded-lg object-contain" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veb-sayt
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://university.uz"
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
                  {editingUniversity ? 'Saqlash' : 'Yaratish'}
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
