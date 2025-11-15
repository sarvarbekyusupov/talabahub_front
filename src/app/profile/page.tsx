'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { getToken, removeTokens } from '@/lib/auth';
import { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await api.getProfile(token) as User;
      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
      });
    } catch (err) {
      removeTokens();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const updatedUser = await api.updateProfile(token, formData) as User;
      setUser(updatedUser);
      setEditing(false);
    } catch (err) {
      alert('Profilni yangilashda xatolik');
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profil</h1>
        <p className="text-lg text-gray-600">Shaxsiy ma'lumotlaringiz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white font-bold">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
            {user.isEmailVerified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                ✓ Tasdiqlangan
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                Tasdiqlanmagan
              </span>
            )}
          </div>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Ma'lumotlar</h3>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Tahrirlash
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input
                label="Ism"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <Input
                label="Familiya"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <Input
                label="Telefon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Saqlash</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phone: user.phone || '',
                    });
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ism</div>
                  <div className="font-medium">{user.firstName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Familiya</div>
                  <div className="font-medium">{user.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Telefon</div>
                  <div className="font-medium">{user.phone || 'Kiritilmagan'}</div>
                </div>
                {user.university && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500 mb-1">Universitet</div>
                    <div className="font-medium">{user.university.nameUz}</div>
                  </div>
                )}
                {user.faculty && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Fakultet</div>
                    <div className="font-medium">{user.faculty}</div>
                  </div>
                )}
                {user.courseYear && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Kurs</div>
                    <div className="font-medium">{user.courseYear}-kurs</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
