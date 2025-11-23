'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Event, EventRegistrationExtended, EventWaitlistEntry } from '@/types';

export default function EventAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const token = getToken();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventRegistrationExtended[]>([]);
  const [waitlist, setWaitlist] = useState<EventWaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [generatingCertificates, setGeneratingCertificates] = useState(false);
  const [processingWaitlist, setProcessingWaitlist] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [token, eventId, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [eventData, attendeesData, waitlistData] = await Promise.all([
        api.getEvent(eventId),
        api.getEventAttendees(token, eventId),
        api.getEventWaitlist(token, eventId),
      ]);
      setEvent(eventData as Event);
      setAttendees((attendeesData as any).data || []);
      setWaitlist((waitlistData as any).data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (registrationId: string, confirmationCode: string) => {
    if (!token || !confirmationCode) return;
    setCheckingInId(registrationId);
    try {
      await api.checkInAttendee(token, eventId, { confirmationCode, method: 'manual' });
      showToast('Ishtirokchi muvaffaqiyatli qayd etildi', 'success');
      // Update local state
      setAttendees(attendees.map((a) =>
        a.id === registrationId ? { ...a, checkedInAt: new Date().toISOString() } : a
      ));
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setCheckingInId(null);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!token) return;
    setGeneratingCertificates(true);
    try {
      await api.generateEventCertificates(token, eventId);
      showToast('Sertifikatlar muvaffaqiyatli yaratildi', 'success');
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setGeneratingCertificates(false);
    }
  };

  const handleProcessWaitlist = async () => {
    if (!token) return;
    setProcessingWaitlist(true);
    try {
      const result = await api.processEventWaitlist(token, eventId, 5) as any;
      showToast(`${result.processed || 0} ta ishtirokchi kutish ro'yxatidan qo'shildi`, 'success');
      loadData();
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setProcessingWaitlist(false);
    }
  };

  const getStatusBadge = (registration: EventRegistrationExtended) => {
    if (registration.checkedInAt) {
      return { label: 'Qayd etildi', variant: 'success' };
    }
    if (registration.status === 'registered') {
      return { label: 'Ro\'yxatdan o\'tgan', variant: 'primary' };
    }
    if (registration.status === 'attended') {
      return { label: 'Qatnashgan', variant: 'success' };
    }
    if (registration.status === 'cancelled') {
      return { label: 'Bekor qilingan', variant: 'danger' };
    }
    if (registration.status === 'waitlisted') {
      return { label: 'Kutish ro\'yxatida', variant: 'warning' };
    }
    return { label: registration.status, variant: 'info' };
  };

  const filteredAttendees = attendees.filter((attendee) => {
    // Apply search filter
    const searchMatch = !searchQuery ||
      attendee.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.confirmationCode?.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'checked_in' && attendee.checkedInAt) ||
      (statusFilter === 'not_checked_in' && !attendee.checkedInAt && attendee.status === 'registered') ||
      (statusFilter === 'cancelled' && attendee.status === 'cancelled');

    return searchMatch && statusMatch;
  });

  const checkedInCount = attendees.filter((a) => a.checkedInAt).length;
  const registeredCount = attendees.filter((a) => a.status === 'registered' || a.status === 'attended').length;

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/organizer/events" className="text-brand hover:underline mb-2 inline-block">
          ← Tadbirlarga qaytish
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark">{event?.title} - Ishtirokchilar</h1>
            <p className="text-dark/60 mt-2">
              {checkedInCount} / {registeredCount} ishtirokchi qayd etilgan
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateCertificates}
              loading={generatingCertificates}
            >
              Sertifikat yaratish
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-sm text-gray-600">Jami ro&apos;yxatdan o&apos;tgan</p>
          <p className="text-2xl font-bold text-dark">{attendees.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Tasdiqlangan</p>
          <p className="text-2xl font-bold text-green-600">{registeredCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Qayd etilgan</p>
          <p className="text-2xl font-bold text-brand">{checkedInCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Kutish ro&apos;yxati</p>
          <p className="text-2xl font-bold text-yellow-600">{waitlist.length}</p>
        </Card>
      </div>

      {/* Waitlist Section */}
      {waitlist.length > 0 && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-yellow-800">Kutish ro&apos;yxati</h3>
              <p className="text-sm text-yellow-700">{waitlist.length} ta odam kutish ro&apos;yxatida</p>
            </div>
            <Button
              size="sm"
              onClick={handleProcessWaitlist}
              loading={processingWaitlist}
            >
              5 tani qo&apos;shish
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ism, email yoki kod bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setStatusFilter('checked_in')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'checked_in'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Qayd etilgan
            </button>
            <button
              onClick={() => setStatusFilter('not_checked_in')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'not_checked_in'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Qayd etilmagan
            </button>
          </div>
        </div>
      </Card>

      {/* Attendees List */}
      {filteredAttendees.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ishtirokchilar topilmadi</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Qidiruv natijasi topilmadi'
                : 'Bu tadbirga hali hech kim ro\'yxatdan o\'tmagan'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAttendees.map((registration) => {
            const statusBadge = getStatusBadge(registration);
            return (
              <Card key={registration.id}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-dark">
                        {registration.user?.firstName} {registration.user?.lastName}
                      </h3>
                      <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-dark/60">
                      <p>{registration.user?.email}</p>
                      {registration.confirmationCode && (
                        <p>Tasdiqlash kodi: <span className="font-mono font-medium">{registration.confirmationCode}</span></p>
                      )}
                      {registration.ticketType && (
                        <p>Chipta: {registration.ticketType.name}</p>
                      )}
                      <p>Ro&apos;yxatdan o&apos;tgan: {new Date(registration.registeredAt).toLocaleString('uz-UZ')}</p>
                      {registration.checkedInAt && (
                        <p className="text-green-600">
                          Qayd etilgan: {new Date(registration.checkedInAt).toLocaleString('uz-UZ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!registration.checkedInAt && registration.status === 'registered' && registration.confirmationCode && (
                      <Button
                        onClick={() => handleCheckIn(registration.id, registration.confirmationCode)}
                        loading={checkingInId === registration.id}
                      >
                        Qayd etish
                      </Button>
                    )}
                    {registration.checkedInAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Qayd etilgan</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
