'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'discounts' | 'jobs' | 'events' | 'courses'>('all');

  useEffect(() => {
    if (query) {
      loadResults();
    }
  }, [query]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await api.search(query, 20);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (
      (results.discounts?.total || 0) +
      (results.jobs?.total || 0) +
      (results.events?.total || 0) +
      (results.courses?.total || 0)
    );
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">Qidirilmoqda...</div>
      </Container>
    );
  }

  if (!query) {
    return (
      <Container className="py-20">
        <div className="text-center text-gray-600">
          Qidiruv so'rovi kiritilmagan
        </div>
      </Container>
    );
  }

  const totalResults = getTotalResults();

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Qidiruv natijalari
        </h1>
        <p className="text-gray-600">
          "{query}" uchun {totalResults} ta natija topildi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={activeTab === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          Hammasi ({totalResults})
        </Button>
        {results?.discounts?.total > 0 && (
          <Button
            variant={activeTab === 'discounts' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('discounts')}
          >
            Chegirmalar ({results.discounts.total})
          </Button>
        )}
        {results?.jobs?.total > 0 && (
          <Button
            variant={activeTab === 'jobs' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('jobs')}
          >
            Ish o'rinlari ({results.jobs.total})
          </Button>
        )}
        {results?.events?.total > 0 && (
          <Button
            variant={activeTab === 'events' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('events')}
          >
            Tadbirlar ({results.events.total})
          </Button>
        )}
        {results?.courses?.total > 0 && (
          <Button
            variant={activeTab === 'courses' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('courses')}
          >
            Kurslar ({results.courses.total})
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-8">
        {/* Discounts */}
        {(activeTab === 'all' || activeTab === 'discounts') && results?.discounts?.results?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chegirmalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.discounts.results.map((item: any) => (
                <Link key={item.id} href={`/discounts/${item.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{item.title}</h3>
                      <Badge variant="success">-{item.discount}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                    <div className="text-xs text-gray-500">{item.brand_name}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Jobs */}
        {(activeTab === 'all' || activeTab === 'jobs') && results?.jobs?.results?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Ish o'rinlari</h2>
            <div className="space-y-3">
              {results.jobs.results.map((item: any) => (
                <Link key={item.id} href={`/jobs/${item.id}`}>
                  <Card hover>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{item.company_name}</span>
                      <span>{item.location}</span>
                      <Badge variant="primary" size="sm">{item.jobType}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {(activeTab === 'all' || activeTab === 'events') && results?.events?.results?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tadbirlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.events.results.map((item: any) => (
                <Link key={item.id} href={`/events/${item.id}`}>
                  <Card hover>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.location}</span>
                      <span>•</span>
                      <span>{new Date(item.eventDate).toLocaleDateString('uz-UZ')}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {(activeTab === 'all' || activeTab === 'courses') && results?.courses?.results?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Kurslar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.courses.results.map((item: any) => (
                <Link key={item.id} href={`/courses/${item.id}`}>
                  <Card hover className="h-full">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{item.partner_name}</span>
                      <span className="font-semibold text-blue-600">
                        {new Intl.NumberFormat('uz-UZ').format(item.price)} so'm
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {totalResults === 0 && (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hech narsa topilmadi
              </h3>
              <p className="text-gray-600">
                "{query}" uchun natija topilmadi. Boshqa so'z bilan qidiring.
              </p>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <Container className="py-20">
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      </Container>
    }>
      <SearchResults />
    </Suspense>
  );
}
