'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyDrafts } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { ArticleDraft } from '@/types';

export default function DraftsPage() {
  const router = useRouter();
  const token = getToken();
  const { drafts, isLoading, error, mutate } = useMyDrafts();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !confirm('Qoralamani o\'chirmoqchimisiz?')) return;

    try {
      await api.deleteArticleDraft(token, draftId);
      mutate();
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Kirish talab qilinadi</h2>
          <p className="text-gray-600 mb-6">Qoralamalaringizni ko'rish uchun hisobingizga kiring</p>
          <Button onClick={() => router.push('/login')}>Kirish</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Qoralamalarim</h1>
          <p className="text-gray-600 mt-1">
            {drafts.length} ta qoralama
          </p>
        </div>
        <Link href="/blog/write">
          <Button>Yangi maqola</Button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-600">Xatolik yuz berdi: {error.message}</p>
        </Card>
      ) : drafts.length === 0 ? (
        <Card>
          <EmptyState
            title="Qoralamalar yo'q"
            message="Siz hali hech qanday qoralama yozmadingiz"
            actionText="Birinchi maqolani yozish"
            onAction={() => router.push('/blog/write')}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft: ArticleDraft) => (
            <Link key={draft.id} href={`/blog/edit/${draft.id}`}>
              <Card hover className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {draft.title || 'Sarlavhasiz qoralama'}
                  </h3>
                  {draft.subtitle && (
                    <p className="text-gray-600 mb-2 line-clamp-1">{draft.subtitle}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Oxirgi tahrir: {formatDate(draft.updatedAt)}</span>
                    {draft.wordCount && (
                      <span>{draft.wordCount} so'z</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDelete(draft.id, e)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    O'chirish
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
