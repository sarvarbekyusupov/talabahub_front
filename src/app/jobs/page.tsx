'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { Job, PaginatedResponse } from '@/types';

type SortOption = 'newest' | 'deadline' | 'salary_high';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, searchQuery, sortBy, selectedJobType, selectedLocation]);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs({ limit: 100 }) as PaginatedResponse<Job>;
      setJobs(data.data);
    } catch (err: any) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...jobs];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply job type filter
    if (selectedJobType !== 'all') {
      result = result.filter((job) => job.jobType === selectedJobType);
    }

    // Apply location filter
    if (selectedLocation !== 'all') {
      result = result.filter((job) => job.location === selectedLocation);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());
        break;
      case 'salary_high':
        result.sort((a, b) => {
          const salaryA = parseFloat(a.salary || '0');
          const salaryB = parseFloat(b.salary || '0');
          return salaryB - salaryA;
        });
        break;
    }

    setFilteredJobs(result);
  };

  const getUniqueLocations = (): string[] => {
    const locations = jobs.map((j) => j.location);
    return Array.from(new Set(locations));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setSelectedJobType('all');
    setSelectedLocation('all');
  };

  const getJobTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      full_time: { label: 'To\'liq vaqt', variant: 'primary' },
      part_time: { label: 'Qisman vaqt', variant: 'info' },
      internship: { label: 'Amaliyot', variant: 'warning' },
      contract: { label: 'Kontrakt', variant: 'success' },
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

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center text-red-600">{error}</div>
      </Container>
    );
  }

  const locations = getUniqueLocations();
  const hasActiveFilters = searchQuery || sortBy !== 'newest' || selectedJobType !== 'all' || selectedLocation !== 'all';

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ish o'rinlari</h1>
        <p className="text-lg text-gray-600">
          Talabalar uchun part-time va full-time ish imkoniyatlari
        </p>
      </div>

      {/* Filters and Sort */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Job Type Filter */}
          <div>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha turlar</option>
              <option value="full_time">To'liq vaqt</option>
              <option value="part_time">Qisman vaqt</option>
              <option value="internship">Amaliyot</option>
              <option value="contract">Kontrakt</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha joylar</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Eng yangi</option>
              <option value="deadline">Muddat yaqin</option>
              <option value="salary_high">Yuqori maosh</option>
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
        <p className="text-gray-600">
          {filteredJobs.length} ta ish o'rni topildi
        </p>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-600">
            {jobs.length === 0
              ? 'Hozircha ish o\'rinlari mavjud emas'
              : 'Hech narsa topilmadi. Boshqa so\'z bilan qidiring yoki filtrlarni o\'zgartiring.'}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const typeBadge = getJobTypeBadge(job.jobType);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card hover>
                  <div className="flex flex-col md:flex-row gap-6">
                    {job.company.logoUrl && (
                      <img
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        className="w-24 h-24 object-contain rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-lg text-gray-600">{job.company.name}</p>
                        </div>
                        <Badge variant={typeBadge.variant}>
                          {typeBadge.label}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Joylashuv</div>
                          <div className="font-medium">{job.location}</div>
                        </div>
                        {job.salary && (
                          <div>
                            <div className="text-gray-500">Maosh</div>
                            <div className="font-medium">{job.salary} so'm</div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-500">Muddat</div>
                          <div className="font-medium">
                            {new Date(job.applicationDeadline).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
