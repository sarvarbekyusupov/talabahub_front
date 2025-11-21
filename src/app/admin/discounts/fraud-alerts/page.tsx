'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useFraudAlerts } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { FraudAlert } from '@/types';

const severityLabels: Record<string, string> = {
  low: 'Past',
  medium: "O'rta",
  high: 'Yuqori',
  critical: 'Kritik',
};

const severityVariants: Record<string, 'info' | 'warning' | 'danger' | 'primary'> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const statusLabels: Record<string, string> = {
  new: 'Yangi',
  investigating: 'Tekshirilmoqda',
  resolved: 'Hal qilingan',
  dismissed: 'Bekor qilingan',
};

const typeLabels: Record<string, string> = {
  multiple_accounts: "Ko'p akkauntlar",
  unusual_pattern: "G'ayrioddiy harakat",
  location_mismatch: 'Joylashuv nomuvofiq',
  suspicious_activity: "Shubhali faoliyat",
};

export default function AdminFraudAlertsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState<{ id: string; status: string } | null>(null);

  const { alerts, meta, isLoading, error, mutate } = useFraudAlerts({
    page: currentPage,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleUpdateStatus = async (alertId: string, status: string) => {
    const token = getToken();
    if (!token) return;

    setProcessingId(alertId);
    try {
      await api.updateFraudAlertStatus(token, alertId, status, note || undefined);
      setNote('');
      setShowNoteModal(null);
      mutate();
    } catch (err) {
      console.error('Error updating alert status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xatolik</h3>
            <p className="text-gray-600">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Firibgarlik ogohlantirishlari</h1>
        <p className="text-gray-600">
          Shubhali harakatlarni ko'rib chiqing va tegishli choralar ko'ring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center bg-red-50 border-2 border-red-200">
          <div className="text-3xl font-bold text-red-600">
            {alerts.filter((a: FraudAlert) => a.status === 'new').length}
          </div>
          <div className="text-sm text-gray-600">Yangi</div>
        </Card>
        <Card className="text-center bg-orange-50">
          <div className="text-3xl font-bold text-orange-600">
            {alerts.filter((a: FraudAlert) => a.status === 'investigating').length}
          </div>
          <div className="text-sm text-gray-600">Tekshirilmoqda</div>
        </Card>
        <Card className="text-center bg-green-50">
          <div className="text-3xl font-bold text-green-600">
            {alerts.filter((a: FraudAlert) => a.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Hal qilingan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">{meta?.total || 0}</div>
          <div className="text-sm text-gray-600">Jami</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Holat</label>
          <div className="flex gap-1">
            {['all', 'new', 'investigating', 'resolved', 'dismissed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status === 'all' ? 'Barchasi' : statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Darajasi</label>
          <div className="flex gap-1">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <Button
                key={severity}
                variant={severityFilter === severity ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setSeverityFilter(severity);
                  setCurrentPage(1);
                }}
              >
                {severity === 'all' ? 'Barchasi' : severityLabels[severity]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ogohlantirishlar yo'q
            </h3>
            <p className="text-gray-600">
              Hozircha shubhali harakatlar aniqlanmadi
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert: FraudAlert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-600 bg-red-50' :
                alert.severity === 'high' ? 'border-l-red-500 bg-red-50/50' :
                alert.severity === 'medium' ? 'border-l-orange-500 bg-orange-50/50' :
                'border-l-blue-500'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Alert Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityVariants[alert.severity]}>
                        {severityLabels[alert.severity]}
                      </Badge>
                      <Badge variant="info">{typeLabels[alert.type]}</Badge>
                      <Badge variant={alert.status === 'new' ? 'warning' : alert.status === 'resolved' ? 'success' : 'info'}>
                        {statusLabels[alert.status]}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Foydalanuvchi:</div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">
                        {alert.user.firstName} {alert.user.lastName}
                      </div>
                      <span className="text-sm text-gray-500">({alert.user.email})</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Tavsif:</div>
                    <p className="text-gray-900">{alert.description}</p>
                  </div>

                  {/* Details */}
                  {alert.details && Object.keys(alert.details).length > 0 && (
                    <div className="mb-3 p-3 bg-white/50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Qo'shimcha ma'lumotlar:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(alert.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600">{key}: </span>
                            <span className="font-medium text-gray-900">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                    <div className="flex flex-wrap gap-2">
                      {alert.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                          loading={processingId === alert.id}
                        >
                          Tekshirishni boshlash
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowNoteModal({ id: alert.id, status: 'resolved' })}
                      >
                        Hal qilish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNoteModal({ id: alert.id, status: 'dismissed' })}
                      >
                        Bekor qilish
                      </Button>
                    </div>
                  )}

                  {/* Resolution Info */}
                  {(alert.status === 'resolved' || alert.status === 'dismissed') && alert.resolvedAt && (
                    <div className="text-sm text-gray-600 mt-2">
                      {alert.status === 'resolved' ? 'Hal qilingan' : 'Bekor qilingan'}:{' '}
                      {new Date(alert.resolvedAt).toLocaleString('uz-UZ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Note Modal */}
              {showNoteModal?.id === alert.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Izoh (ixtiyoriy)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      rows={2}
                      placeholder="Izoh kiriting..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={showNoteModal.status === 'resolved' ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(alert.id, showNoteModal.status)}
                      loading={processingId === alert.id}
                    >
                      {showNoteModal.status === 'resolved' ? 'Hal qilish' : 'Bekor qilish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowNoteModal(null);
                        setNote('');
                      }}
                    >
                      Orqaga
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/discounts')}>
          Barcha chegirmalar
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/analytics')}>
          Statistika
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/discounts/approvals')}>
          Tasdiqlash
        </Button>
      </div>
    </Container>
  );
}
