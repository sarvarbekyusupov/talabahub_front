'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: 'student' | 'partner' | 'admin';
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: 'all',
    role: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  useEffect(() => {
    loadAuditLogs();
  }, [page, filters]);

  const loadAuditLogs = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Build query parameters from filters
      const params: Record<string, any> = {
        page: page.toString(),
        limit: '20',
      };

      if (filters.action !== 'all') {
        params.action = filters.action;
      }
      if (filters.role !== 'all') {
        params.role = filters.role;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response: any = await api.getAuditLogs(token, params);

      setLogs(response.data || []);
      setFilteredLogs(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      create_job: 'success',
      create_course: 'success',
      create_discount: 'success',
      approve_content: 'primary',
      reject_content: 'danger',
      delete_user: 'danger',
      delete_content: 'danger',
      login: 'default',
      logout: 'default',
      update_profile: 'default',
      apply_job: 'primary',
    };
    return actionColors[action] || 'default';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_job: 'Ish yaratildi',
      create_course: 'Kurs yaratildi',
      create_discount: 'Chegirma yaratildi',
      approve_content: 'Tasdiqlandi',
      reject_content: 'Rad etildi',
      delete_user: 'Foydalanuvchi o\'chirildi',
      delete_content: 'Kontent o\'chirildi',
      login: 'Kirish',
      logout: 'Chiqish',
      update_profile: 'Profil yangilandi',
      apply_job: 'Ariza topshirildi',
    };
    return labels[action] || action;
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Audit Logs</h1>
          <p className="text-lg text-dark/60">
            Tizimda amalga oshirilgan barcha harakatlar jurnali
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Qidirish</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Email, harakat..."
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Harakat</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">Barchasi</option>
                <option value="create_job">Ish yaratish</option>
                <option value="create_course">Kurs yaratish</option>
                <option value="approve_content">Tasdiqlash</option>
                <option value="reject_content">Rad etish</option>
                <option value="delete_user">Foydalanuvchi o'chirish</option>
                <option value="login">Kirish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Rol</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">Barchasi</option>
                <option value="admin">Admin</option>
                <option value="partner">Hamkor</option>
                <option value="student">Talaba</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Holat</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">Barchasi</option>
                <option value="success">Muvaffaqiyatli</option>
                <option value="failed">Xato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Dan</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Gacha</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-dark/60">
              {filteredLogs.length} ta yozuv topildi
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  action: 'all',
                  role: 'all',
                  status: 'all',
                  dateFrom: '',
                  dateTo: '',
                  search: '',
                })
              }
            >
              Filtrlarni tozalash
            </Button>
          </div>
        </Card>

        {/* Logs Table */}
        <Card>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-dark/60">
              Hech qanday yozuv topilmadi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-lavender-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Vaqt</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Foydalanuvchi</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Harakat</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Resurs</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">IP</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-lavender-100 hover:bg-lavender-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        {new Date(log.timestamp).toLocaleString('uz-UZ')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-dark text-sm">{log.userEmail}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {log.userRole === 'admin'
                              ? 'Admin'
                              : log.userRole === 'partner'
                              ? 'Hamkor'
                              : 'Talaba'}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getActionBadge(log.action) as any}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <p className="font-medium text-dark">{log.resource}</p>
                        {log.details?.title && (
                          <p className="text-dark/60 text-xs">{log.details.title}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-dark/70">{log.ipAddress}</td>
                      <td className="py-3 px-4">
                        <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                          {log.status === 'success' ? '✓ Muvaffaqiyat' : '✗ Xato'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Oldingi
              </Button>
              <span className="text-sm text-dark/70">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Keyingi →
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
