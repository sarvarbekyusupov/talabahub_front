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
import { useToast } from '@/components/ui/Toast';
import { Event, PaginatedResponse } from '@/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEventType, setFilterEventType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'workshop' as 'workshop' | 'conference' | 'seminar' | 'webinar' | 'competition' | 'networking',
    eventDate: '',
    eventTime: '',
    location: '',
    imageUrl: '',
    maxParticipants: '',
    categoryId: '',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true,
  });

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [page, searchQuery, filterEventType, filterStatus, filterCategory]);

  const loadEvents = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const params: any = { page, limit: 20 };

      // Add search query if provided
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Add filters
      if (filterEventType) {
        params.eventType = filterEventType;
      }
      if (filterStatus) {
        params.isActive = filterStatus === 'active';
      }
      if (filterCategory) {
        params.categoryId = filterCategory;
      }

      const data = await api.getEvents(params) as PaginatedResponse<Event>;
      setEvents(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading events:', error);
      showToast(error.message || 'Tadbirlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const categoriesData = await api.getCategories({ type: 'event', limit: 100 }) as any;
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResponse = await api.uploadImage(imageFile, token) as { url: string };
        imageUrl = uploadResponse.url;
      }

      // Combine date and time
      const eventDateTime = formData.eventTime
        ? `${formData.eventDate}T${formData.eventTime}:00`
        : `${formData.eventDate}T09:00:00`;

      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        eventDate: eventDateTime,
        location: formData.location,
        imageUrl,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        categoryId: formData.categoryId || undefined,
        organizer: formData.organizer || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        isActive: formData.isActive,
      };

      if (editingEvent) {
        await api.updateEvent(token, editingEvent.id, eventData);
        showToast('Tadbir muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.createEvent(token, eventData);
        showToast('Tadbir muvaffaqiyatli yaratildi', 'success');
      }
      setShowModal(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      showToast(error.message || 'Tadbirni saqlashda xatolik', 'error');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const eventDateTime = new Date(event.eventDate);
    const dateStr = eventDateTime.toISOString().split('T')[0];
    const timeStr = eventDateTime.toTimeString().substring(0, 5);

    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      eventDate: dateStr,
      eventTime: timeStr,
      location: event.location,
      imageUrl: event.imageUrl || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      categoryId: '',
      organizer: '',
      contactEmail: '',
      contactPhone: '',
      isActive: event.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham bu tadbirni o\'chirmoqchimisiz?')) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await api.deleteEvent(token, id);
      showToast('Tadbir muvaffaqiyatli o\'chirildi', 'success');
      loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      showToast(error.message || 'Tadbirni o\'chirishda xatolik', 'error');
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      eventType: 'workshop',
      eventDate: '',
      eventTime: '',
      location: '',
      imageUrl: '',
      maxParticipants: '',
      categoryId: '',
      organizer: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true,
    });
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'workshop': return 'Ustaxona';
      case 'conference': return 'Konferensiya';
      case 'seminar': return 'Seminar';
      case 'webinar': return 'Vebinar';
      case 'competition': return 'Tanlov';
      case 'networking': return 'Networking';
      default: return type;
    }
  };

  const getEventTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'workshop': return 'primary';
      case 'conference': return 'success';
      case 'seminar': return 'info';
      case 'webinar': return 'warning';
      case 'competition': return 'danger';
      case 'networking': return 'info';
      default: return 'primary';
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterEventType('');
    setFilterStatus('');
    setFilterCategory('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterEventType || filterStatus || filterCategory;

  if (loading && events.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Tadbirlar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha tadbirlarni ko'rish va boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            Yangi tadbir
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qidirish
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tadbir nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tadbir turi
            </label>
            <select
              value={filterEventType}
              onChange={(e) => {
                setFilterEventType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha turlar</option>
              <option value="workshop">Ustaxona</option>
              <option value="conference">Konferensiya</option>
              <option value="seminar">Seminar</option>
              <option value="webinar">Vebinar</option>
              <option value="competition">Tanlov</option>
              <option value="networking">Networking</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holat
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriya
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Faol filtrlar:</span>
              {searchQuery && (
                <Badge variant="info">Qidiruv: {searchQuery}</Badge>
              )}
              {filterEventType && (
                <Badge variant="info">Tur: {getEventTypeLabel(filterEventType)}</Badge>
              )}
              {filterStatus && (
                <Badge variant="info">
                  Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              )}
              {filterCategory && (
                <Badge variant="info">
                  Kategoriya: {categories.find(c => c.id === filterCategory)?.name}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Tozalash
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Jami: <span className="font-semibold">{events.length}</span> ta tadbir topildi
          </p>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tadbir</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Turi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sana</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joylashuv</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ishtirokchilar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holat</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getEventTypeBadgeVariant(event.eventType)}>
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {new Date(event.eventDate).toLocaleDateString('uz-UZ')}
                      </p>
                      <p className="text-gray-500">
                        {new Date(event.eventDate).toLocaleTimeString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{event.location}</td>
                  <td className="py-3 px-4">
                    {event.maxParticipants ? (
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {event.registeredCount || 0}
                        </span>
                        <span className="text-gray-500"> / {event.maxParticipants}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={event.isActive ? 'success' : 'danger'}>
                      {event.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Ko'rish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Tahrirlash"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Tadbirni tahrirlash' : 'Yangi tadbir'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tadbir nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tech Conference 2025"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Tadbir haqida batafsil..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tadbir turi *
                  </label>
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="workshop">Ustaxona</option>
                    <option value="conference">Konferensiya</option>
                    <option value="seminar">Seminar</option>
                    <option value="webinar">Vebinar</option>
                    <option value="competition">Tanlov</option>
                    <option value="networking">Networking</option>
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
                    Sana *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vaqt
                  </label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joylashuv *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="INHA University, Toshkent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimal ishtirokchilar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tashkilotchi
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IT Park Uzbekistan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aloqa Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@event.uz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aloqa Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+998901234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rasm
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imageUrl && !imageFile && (
                    <div className="mt-2">
                      <img src={formData.imageUrl} alt="Current image" className="h-32 rounded-lg object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Faol
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" fullWidth>
                  {editingEvent ? 'Saqlash' : 'Yaratish'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Container>
  );
}
