'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useTags } from '@/lib/hooks';
import { Tag } from '@/types';

export default function TagsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { tags, isLoading, error } = useTags({ limit: 100 });

  // Filter tags by search
  const filteredTags = debouncedSearch
    ? tags.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : tags;

  // Group tags by category
  const groupedTags = filteredTags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
    const category = tag.category || 'Boshqa';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    technology: 'Texnologiya',
    science: 'Fan',
    lifestyle: 'Turmush',
    education: 'Ta\'lim',
    career: 'Karyera',
    other: 'Boshqa',
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teglar</h1>
        <p className="text-gray-600">
          Mavzular bo'yicha maqolalarni toping
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <Input
          type="text"
          placeholder="Teglarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-600">Xatolik yuz berdi: {error.message}</p>
        </Card>
      ) : filteredTags.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery ? 'Teglar topilmadi' : 'Hozircha teglar yo\'q'}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {categoryLabels[category.toLowerCase()] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categoryTags as Tag[]).map((tag: Tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Card hover className="h-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-blue-600">#{tag.name}</h3>
                        <span className="text-sm text-gray-500">
                          {tag.articleCount || 0} maqola
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
