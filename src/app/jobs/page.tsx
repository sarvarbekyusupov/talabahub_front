'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Job, PaginatedResponse } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs({ limit: 20 }) as PaginatedResponse<Job>;
      setJobs(data.data);
    } catch (err: any) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
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

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ish o'rinlari</h1>
        <p className="text-lg text-gray-600">
          Talabalar uchun part-time va full-time ish imkoniyatlari
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-600">
            Hozircha ish o'rinlari mavjud emas
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const typeBadge = getJobTypeBadge(job.jobType);
            return (
              <Card key={job.id} hover>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
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

                    <Button variant="primary">Ariza topshirish</Button>
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
