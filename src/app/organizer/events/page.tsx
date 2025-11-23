'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Event, CreateEventRequest, EventAnalytics } from '@/types';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const token = getToken();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedEventAnalytics, setSelectedEventAnalytics] = useState<{ eventId: string; analytics: EventAnalytics } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isVirtual: false,
    capacity: 100,
  });


  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadOrganizerEvents();
  }, [token, router]);

  const loadOrganizerEvents = async () => {
    if (!token) return;
    try {
      const response = await api.getEvents({ organizer: 'me' }) as any;
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    try {
      await api.createEvent(token, formData);
      showToast('Tadbir muvaffaqiyatli yaratildi!', 'success');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        isVirtual: false,
        capacity: 100,
      });
      loadOrganizerEvents();
    } catch (err: any) {
      showToast('Xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const loadEventAnalytics = async (eventId: string) => {
    if (!token) return;
    setLoadingAnalytics(true);
    try {
      const analytics = await api.getEventAnalytics(token, eventId) as EventAnalytics;
      setSelectedEventAnalytics({ eventId, analytics });
    } catch (err) {
      showToast('Statistikani yuklashda xatolik', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const getEventTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      workshop: { label: 'Workshop', variant: 'primary' },
      conference: { label: 'Konferensiya', variant: 'success' },
      seminar: { label: 'Seminar', variant: 'info' },
      webinar: { label: 'Vebinar', variant: 'warning' },
      competition: { label: 'Musobaqa', variant: 'danger' },
      networking: { label: 'Networking', variant: 'info' },
    };
    return types[type] || { label: type, variant: 'info' };
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Tadbirlarni boshqarish</h1>
          <p className="text-dark/60 mt-2">Yaratgan tadbirlaringiz va ishtirokchilarni boshqaring</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Formani yopish' : '+ Yangi tadbir'}
        </Button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Yangi tadbir yaratish</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tadbir nomi *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Frontend Workshop"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boshlanish sanasi *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tugash sanasi *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joylashuv *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="IT Park, Toshkent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sig&apos;im (ishtirokchilar soni) *
                </label>
                <Input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={formData.isVirtual}
                onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isVirtual" className="text-sm text-gray-700">
                Onlayn tadbir
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tavsif *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Tadbir haqida batafsil ma'lumot..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" loading={creating}>
                Yaratish
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Bekor qilish
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tadbirlar yo&apos;q</h3>
            <p className="text-gray-600 mb-4">Siz hali tadbir yaratmagansiz</p>
            <Button onClick={() => setShowCreateForm(true)}>Birinchi tadbirni yaratish</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const typeBadge = getEventTypeBadge(event.eventType);
            const isPast = new Date(event.eventDate) < new Date();
            return (
              <Card key={event.id} hover>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-dark">{event.title}</h3>
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      {event.isActive ? (
                        <Badge variant="success">Aktiv</Badge>
                      ) : (
                        <Badge variant="danger">Nofaol</Badge>
                      )}
                      {isPast && <Badge variant="info">O&apos;tgan</Badge>}
                    </div>
                    <p className="text-dark/60 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-dark/60">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.eventDate).toLocaleString('uz-UZ', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </span>
                      {event.maxParticipants && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.registeredCount || 0} / {event.maxParticipants}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Link href={`/organizer/events/${event.id}/attendees`}>
                      <Button variant="outline" size="sm" fullWidth>
                        Ishtirokchilar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadEventAnalytics(event.id)}
                      loading={loadingAnalytics && selectedEventAnalytics?.eventId === event.id}
                    >
                      Statistika
                    </Button>
                  </div>
                </div>

                {/* Analytics Display */}
                {selectedEventAnalytics?.eventId === event.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-3">Statistika</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Jami ro&apos;yxatdan</p>
                        <p className="text-xl font-bold">{selectedEventAnalytics.analytics.registrations.total}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Check-in %</p>
                        <p className="text-xl font-bold">{selectedEventAnalytics.analytics.attendance.checkInRate}%</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">O&apos;rtacha baho</p>
                        <p className="text-xl font-bold">{selectedEventAnalytics.analytics.feedback.averageRating}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Fikrlar soni</p>
                        <p className="text-xl font-bold">{selectedEventAnalytics.analytics.feedback.totalResponses}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
