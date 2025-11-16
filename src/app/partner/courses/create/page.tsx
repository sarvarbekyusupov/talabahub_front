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

export default function PartnerCreateCoursePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    loadPartnersAndCategories();
  }, []);

  const loadPartnersAndCategories = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [partnersData, categoriesData] = await Promise.all([
        api.getEducationPartners({ limit: 100 }) as Promise<any>,
        api.getCategories({ type: 'course', limit: 100 }) as Promise<any>,
      ]);
      setPartners(partnersData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
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

    setLoading(true);
    try {
      // Upload image if selected
      let imageUrl = '';
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
        isActive: false, // Partners create as inactive, admin approves
      };

      await api.createCourse(token, courseData);
      showToast('Kurs muvaffaqiyatli yaratildi! Admin tasdiqlashini kuting.', 'success');
      router.push('/partner/dashboard');
    } catch (error: any) {
      console.error('Error creating course:', error);
      showToast(error.message || 'Kursni yaratishda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yangi kurs yaratish</h1>
            <p className="text-gray-600 mt-1">Talabalarga ta'lim imkoniyatlarini taqdim eting</p>
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
                    Kurs nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: Full Stack Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurs haqida batafsil *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="Kurs nimalarni o'rgatadi, kimlar uchun mo'ljallangan, qanday natijalar kutiladi..."
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kurs tafsilotlari</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ta'lim hamkori *
                  </label>
                  <select
                    required
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Narx (so'm) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3 oy / 12 hafta / 48 soat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daraja
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Darajani tanlang</option>
                    <option value="beginner">Boshlang'ich</option>
                    <option value="intermediate">O'rta</option>
                    <option value="advanced">Yuqori</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Til *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="uz">O'zbek</option>
                    <option value="ru">Rus</option>
                    <option value="en">Ingliz</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kurs rasmi</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muqova rasmi
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">JPG, PNG yoki WebP format, maksimal 5MB</p>

                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Syllabus */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">O'quv dasturi</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kurs dasturi (Syllabus)
                </label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Har bir modulni yangi qatordan kiriting:&#10;&#10;1-modul: HTML/CSS asoslari (2 hafta)&#10;- HTML elementlari&#10;- CSS styling&#10;- Responsive dizayn&#10;&#10;2-modul: JavaScript (3 hafta)&#10;- JavaScript asoslari&#10;- DOM manipulation&#10;- ES6+ xususiyatlari"
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Talablar</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kursga kirish talablari
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={5}
                  placeholder="Har bir talabni yangi qatordan kiriting:&#10;&#10;- Kompyuter asoslarini bilish&#10;- Internet bilan ishlash ko'nikmalari&#10;- Ingliz tili (asosiy bilim)&#10;- Kuchli o'rganishga intilish"
                />
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
                    Yaratilgan kurs admin tomonidan tasdiqlangandan so'ng faollashadi va platformada ko'rinadi. Talabalar kursingizga yozilishi mumkin bo'ladi.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Kurs yaratish'}
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
