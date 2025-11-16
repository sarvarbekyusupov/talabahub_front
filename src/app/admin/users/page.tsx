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
import { User, PaginatedResponse } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getAllUsers(token, { page, limit: 20 }) as PaginatedResponse<User>;
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading users:', error);
      showToast(error.message || 'Foydalanuvchilarni yuklashda xatolik', 'error');
      if (error.status === 403) {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Haqiqatan ham bu foydalanuvchini o\'chirmoqchimisiz?')) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteUser(token, userId);
      showToast('Foydalanuvchi muvaffaqiyatli o\'chirildi', 'success');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(error.message || 'Foydalanuvchini o\'chirishda xatolik', 'error');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'partner':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'partner':
        return 'Hamkor';
      case 'student':
        return 'Talaba';
      default:
        return role;
    }
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Foydalanuvchilar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha foydalanuvchilarni ko'rish va boshqarish</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Orqaga</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ism</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Universitet</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ro'yxatdan o'tgan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {user.university?.nameUz || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
                      {user.isEmailVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Ko'rish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
    </Container>
  );
}
