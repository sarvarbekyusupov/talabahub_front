'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function PartnerEditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    partnerId: '',
    categoryId: '',
    level: '',
    language: 'uz',
    syllabus: '',
    requirements: '',
    existingImageUrl: '',
  });

  useEffect(() => {
    loadCourseData();
    loadPartnersAndCategories();
  }, [courseId]);

  const loadCourseData = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const course = await api.getCourse(courseId) as any;

      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price?.toString() || '',
        duration: course.duration || '',
        partnerId: course.partnerId || '',
        categoryId: course.categoryId || '',
        level: course.level || '',
        language: course.language || 'uz',
        syllabus: course.syllabus || '',
        requirements: course.requirements || '',
        existingImageUrl: course.imageUrl || '',
      });

      if (course.imageUrl) {
        setImagePreview(course.imageUrl);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showToast('Kursni yuklashda xatolik', 'error');
      router.push('/partner/courses');
    } finally {
      setLoading(false);
    }
  };

  const loadPartnersAndCategories = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [partnersData, categoriesData] = await Promise.all([
        api.getEducationPartners({ limit: 100 }) as Promise<any>,
        api.getCategories({ type: 'course', limit: 100 }) as Promise<any>,
      ]);
      setPartners(partnersData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    setSaving(true);
    try {
      // Upload new image if selected
      let imageUrl = formData.existingImageUrl;
      if (imageFile) {
        const uploadResponse = await api.uploadImage(imageFile, token) as { url: string };
        imageUrl = uploadResponse.url;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration || undefined,
        imageUrl: imageUrl || undefined,
        partnerId: formData.partnerId,
        categoryId: formData.categoryId || undefined,
        level: formData.level || undefined,
        language: formData.language,
        syllabus: formData.syllabus || undefined,
        requirements: formData.requirements || undefined,
      };

      await api.updateCourse(token, courseId, courseData);
      showToast('Kurs yangilandi', 'success');
      router.push('/partner/courses');
    } catch (error: any) {
      console.error('Error updating course:', error);
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
          <Button variant="ghost" onClick={() => router.push('/partner/courses')} className="mb-4">
            ← Kurslarga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">Kursni tahrirlash</h1>
          <p className="text-lg text-dark/60">Kurs ma'lumotlarini yangilang</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Asosiy ma'lumotlar</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Kurs nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Full Stack Web Development"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Kurs haqida <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Kurs haqida batafsil ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Narx (so'm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="1500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="3 oy / 12 hafta / 48 soat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Ta'lim hamkori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Hamkorni tanlang</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Daraja</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Darajani tanlang</option>
                    <option value="beginner">Boshlang'ich</option>
                    <option value="intermediate">O'rta</option>
                    <option value="advanced">Yuqori</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Til <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="uz">O'zbek</option>
                    <option value="ru">Rus</option>
                    <option value="en">Ingliz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Kurs rasmi</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <p className="text-sm text-dark/60 mt-1">JPG, PNG yoki WebP format, maksimal 5MB</p>

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-lg object-cover border border-lavender-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Kurs dasturi (Syllabus)
                </label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                  placeholder="Har bir modulni yangi qatordan kiriting:&#10;&#10;1-modul: HTML/CSS asoslari (2 hafta)&#10;- HTML elementlari&#10;- CSS styling&#10;- Responsive dizayn"
                />
                <p className="text-sm text-dark/60 mt-1">
                  Kurs dasturini batafsil yozing
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Kursga kirish talablari
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                  placeholder="Har bir talabni yangi qatordan kiriting:&#10;- Kompyuter asoslarini bilish&#10;- Internet bilan ishlash ko'nikmalari&#10;- Ingliz tili (asosiy bilim)"
                />
                <p className="text-sm text-dark/60 mt-1">
                  Kursga kirish uchun zarur talablar
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/partner/courses')}
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
