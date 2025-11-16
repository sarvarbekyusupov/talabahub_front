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

export default function PartnerCreateDiscountPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    promoCode: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    brandId: '',
    categoryId: '',
    terms: '',
  });

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  const loadCategoriesAndBrands = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [categoriesData, brandsData] = await Promise.all([
        api.getCategories({ type: 'discount', limit: 100 }) as Promise<any>,
        api.getBrands({ limit: 100 }) as Promise<any>,
      ]);
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
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

      const discountData = {
        title: formData.title,
        description: formData.description,
        discount: parseFloat(formData.discount),
        discountType: formData.discountType,
        promoCode: formData.promoCode || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        imageUrl: imageUrl || undefined,
        brandId: formData.brandId,
        categoryId: formData.categoryId || undefined,
        terms: formData.terms || undefined,
        isActive: false, // Partners create as inactive, admin approves
      };

      await api.createDiscount(token, discountData);
      showToast('Chegirma muvaffaqiyatli yaratildi! Admin tasdiqlashini kuting.', 'success');
      router.push('/partner/dashboard');
    } catch (error: any) {
      console.error('Error creating discount:', error);
      showToast(error.message || 'Chegirmani yaratishda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yangi chegirma yaratish</h1>
            <p className="text-gray-600 mt-1">Talabalar uchun chegirma e'lon qiling</p>
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
                    Chegirma nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 20% chegirma barcha mahsulotlarga"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batafsil tavsif *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Chegirma shartlari va batafsil ma'lumot..."
                  />
                </div>
              </div>
            </div>

            {/* Discount Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chegirma tafsilotlari</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brend *
                  </label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Brendni tanlang</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya *
                  </label>
                  <select
                    required
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
                    Chegirma turi *
                  </label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Foiz (%)</option>
                    <option value="fixed">Qat'iy summa (so'm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chegirma miqdori *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.discountType === 'percentage' ? '20' : '50000'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.discountType === 'percentage' ? 'Foizda kiriting (0-100)' : 'So\'mda kiriting'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo kod
                  </label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="STUDENT2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foydalanish limiti
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Bo'sh qoldiring cheklovga ega bo'lmaslik uchun</p>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amal qilish muddati</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tugash sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rasm</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chegirma rasmi
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

            {/* Terms */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Qo'shimcha ma'lumotlar</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shartlar va qoidalar
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="- Talaba guvohnomasi talab qilinadi&#10;- Bir kishiga bir marta&#10;- Boshqa chegirmalar bilan birlashtirilmaydi"
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
                    Yaratilgan chegirma admin tomonidan tasdiqlangandan so'ng faollashadi va platformada ko'rinadi.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Chegirma yaratish'}
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
