'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SaveButton } from '@/components/ui/SaveButton';
import { api } from '@/lib/api';
import { Event } from '@/types';
import { getToken } from '@/lib/auth';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await api.getEvent(id) as Event;
      setEvent(data);
    } catch (err: any) {
      setError('Tadbir topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setRegistering(true);
    try {
      await api.registerForEvent(token, id);
      alert('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
      loadEvent(); // Reload to update participant count
    } catch (err: any) {
      alert('Ro\'yxatdan o\'tishda xatolik: ' + (err.message || 'Qaytadan urinib ko\'ring'));
    } finally {
      setRegistering(false);
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
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container className="py-20">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tadbir topilmadi</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/events')}>
              Tadbirlarga qaytish
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const typeBadge = getEventTypeBadge(event.eventType);
  const isFull = event.maxParticipants && event.registeredCount && event.registeredCount >= event.maxParticipants;

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-t-lg mb-6"
              />
            )}

            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{event.title}</h1>
              <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Sana va vaqt</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(event.eventDate).toLocaleString('uz-UZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Joylashuv</p>
                  <p className="text-gray-900 font-medium">{event.location}</p>
                </div>
              </div>

              {event.maxParticipants && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Ishtirokchilar</p>
                    <p className="text-gray-900 font-medium">
                      {event.registeredCount || 0} / {event.maxParticipants}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Tadbir haqida</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Ro'yxatdan o'tish</h3>
            {isFull ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  Barcha o'rinlar band. Ro'yxatdan o'tish mumkin emas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleRegister}
                  loading={registering}
                >
                  Ro'yxatdan o'tish
                </Button>
                <div className="w-full">
                  <SaveButton
                    itemType="event"
                    itemId={event.id}
                    className="w-full h-10 rounded-lg font-medium"
                  />
                </div>
                <Button fullWidth variant="ghost">
                  Ulashish
                </Button>
              </div>
            )}

            {event.isActive && (
              <div className="mt-4">
                <Badge variant="success" size="md">Aktiv tadbir</Badge>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
