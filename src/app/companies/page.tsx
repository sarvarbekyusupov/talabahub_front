'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  employeeCount?: string;
  foundedYear?: number;
  isVerified: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: Company[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCompanies();
  }, [page]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies({ page, limit: 12 }) as PaginatedResponse;
      setCompanies(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Kompaniyalar</h1>
        <p className="text-lg text-gray-600">
          Bizning hamkorlarimiz va ish beruvchilarimiz
        </p>
      </div>

      {/* Companies Grid */}
      {loading && companies.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-32 mb-4" />
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4 mb-4" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hozircha kompaniyalar yo'q
          </h3>
          <p className="text-gray-600">Tez orada yangi kompaniyalar qo'shiladi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} hover className="flex flex-col">
                {/* Logo */}
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-4">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {company.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {company.name}
                    </h3>
                    {company.isVerified && (
                      <Badge variant="success">Tasdiqlangan</Badge>
                    )}
                  </div>

                  {company.industry && (
                    <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                  )}

                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {company.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    {company.employeeCount && (
                      <div>
                        <p className="text-xs text-gray-500">Xodimlar soni</p>
                        <p className="font-semibold text-gray-900">{company.employeeCount}</p>
                      </div>
                    )}
                    {company.foundedYear && (
                      <div>
                        <p className="text-xs text-gray-500">Tashkil etilgan</p>
                        <p className="font-semibold text-gray-900">{company.foundedYear}</p>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 mt-4">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Veb-sayt →
                      </a>
                    )}
                    <Link
                      href={`/jobs?companyId=${company.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ish o'rinlari →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Oldingi
              </button>
              <span className="text-gray-600">
                Sahifa {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
