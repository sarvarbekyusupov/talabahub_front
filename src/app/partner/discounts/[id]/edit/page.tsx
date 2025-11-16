'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function PartnerEditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const discountId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    loadDiscountData();
    loadCategoriesAndBrands();
  }, [discountId]);

  const loadDiscountData = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const discount = await api.getDiscount(discountId) as any;

      setFormData({
        title: discount.title || '',
        description: discount.description || '',
        discount: discount.discount?.toString() || '',
        discountType: discount.discountType || 'percentage',
        promoCode: discount.promoCode || '',
        validFrom: discount.validFrom?.split('T')[0] || '',
        validUntil: discount.validUntil?.split('T')[0] || '',
        usageLimit: discount.usageLimit?.toString() || '',
        brandId: discount.brandId || '',
        categoryId: discount.categoryId || '',
        terms: discount.terms || '',
      });

      if (discount.imageUrl) {
        setImagePreview(discount.imageUrl);
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      showToast('Chegirmani yuklashda xatolik', 'error');
      router.push('/partner/discounts');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [categoriesData, brandsData] = await Promise.all([
        api.getCategories({ type: 'discount', limit: 100 }) as Promise<any>,
        api.getBrands({ limit: 100 }) as Promise<any>,
      ]);
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
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
      let imageUrl = imagePreview;
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
      };

      await api.updateDiscount(token, discountId, discountData);
      showToast('Chegirma yangilandi', 'success');
      router.push('/partner/discounts');
    } catch (error: any) {
      console.error('Error updating discount:', error);
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
          <Button variant="ghost" onClick={() => router.push('/partner/discounts')} className="mb-4">
            ← Chegirmalarga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">Chegirmani tahrirlash</h1>
          <p className="text-lg text-dark/60">Chegirma ma'lumotlarini yangilang</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Asosiy ma'lumotlar</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Sarlavha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="50% chegirma barcha mahsulotlarga"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Tavsif <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Chegirma haqida batafsil ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Chegirma miqdori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Chegirma turi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as any })
                    }
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="percentage">Foiz (%)</option>
                    <option value="fixed">Fix miqdor (so'm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Promo kod</label>
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="STUDENT50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Boshlanish sanasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Tugash sanasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Foydalanish cheklovi
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  min="0"
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="100 (bo'sh qoldiring agar cheklov bo'lmasa)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Brend <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
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

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Shartlar va qoidalar
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Chegirmadan foydalanish shartlari..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/partner/discounts')}
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
