'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, NoSearchResults, NoFilterResults } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useEvents } from '@/lib/hooks';

const ITEMS_PER_PAGE = 12;

export default function EventsPage() {
  const { events, isLoading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters using useMemo for performance
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Apply search filter
    if (debouncedSearch) {
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          event.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          event.location.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply event type filter
    if (selectedEventType !== 'all') {
      result = result.filter((event) => event.eventType === selectedEventType);
    }

    return result;
  }, [events, debouncedSearch, selectedEventType]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedEventType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEventType('all');
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

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-4">Tadbirlar</h1>
          <p className="text-lg text-dark/60">
            Konferensiyalar, seminarlar va networking tadbirlari
          </p>
        </div>
        <GridSkeleton count={12} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center text-red-600">Ma'lumotlarni yuklashda xatolik</div>
      </Container>
    );
  }

  const hasActiveFilters = debouncedSearch || selectedEventType !== 'all';

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark mb-4">Tadbirlar</h1>
        <p className="text-lg text-dark/60">
          Konferensiyalar, seminarlar va networking tadbirlari
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-2 border-2 border-lavender-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            >
              <option value="all">Barcha turlar</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Konferensiya</option>
              <option value="seminar">Seminar</option>
              <option value="webinar">Vebinar</option>
              <option value="competition">Musobaqa</option>
              <option value="networking">Networking</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Filtrlarni tozalash
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-dark/60">
          {filteredEvents.length} ta tadbir topildi
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          {debouncedSearch ? (
            <NoSearchResults onClearSearch={() => setSearchQuery('')} />
          ) : hasActiveFilters ? (
            <NoFilterResults onClearFilters={clearFilters} />
          ) : (
            <EmptyState
              title="Tadbirlar yo'q"
              message="Hozircha hech qanday tadbir qo'shilmagan."
              showAction={false}
            />
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedEvents.map((event) => {
            const typeBadge = getEventTypeBadge(event.eventType);
            return (
              <Card key={event.id} hover className="flex flex-col">
                {event.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover rounded-t-2xl"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-dark flex-1">
                      {event.title}
                    </h3>
                    <Badge variant={typeBadge.variant}>
                      {typeBadge.label}
                    </Badge>
                  </div>

                  <p className="text-dark/60 mb-4 flex-1 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-dark/60">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.eventDate).toLocaleDateString('uz-UZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center text-dark/60">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center text-dark/60">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.registeredCount || 0} / {event.maxParticipants} ishtirokchi
                      </div>
                    )}
                  </div>

                  <Button fullWidth>Ro'yxatdan o'tish</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEvents.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </Container>
  );
}
