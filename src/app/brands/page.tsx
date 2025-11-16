'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: Brand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBrands();
  }, [page]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await api.getBrands({ page, limit: 12 }) as PaginatedResponse;
      setBrands(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Brendlar</h1>
        <p className="text-lg text-gray-600">
          Talabalar uchun chegirmalar taklif qiluvchi brendlar
        </p>
      </div>

      {/* Brands Grid */}
      {loading && brands.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <Skeleton className="h-32 mb-4" />
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4" />
            </Card>
          ))}
        </div>
      ) : brands.length === 0 ? (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hozircha brendlar yo'q
          </h3>
          <p className="text-gray-600">Tez orada yangi brendlar qo'shiladi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id} hover className="flex flex-col items-center text-center">
                {/* Logo */}
                <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {brand.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {brand.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {brand.description}
                </p>

                {/* Social Links */}
                {brand.socialMedia && (
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {brand.socialMedia.facebook && (
                      <a
                        href={brand.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {brand.socialMedia.instagram && (
                      <a
                        href={brand.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {brand.socialMedia.telegram && (
                      <a
                        href={brand.socialMedia.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Website Link */}
                {brand.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Veb-sayt →
                  </a>
                ) : (
                  <Link
                    href={`/discounts?brandId=${brand.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Chegirmalar →
                  </Link>
                )}
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
