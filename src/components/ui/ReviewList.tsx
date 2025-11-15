'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import { Review } from '@/types';
import { getToken } from '@/lib/auth';

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => Promise<void>;
  loading?: boolean;
}

export function ReviewList({
  reviews,
  currentUserId,
  onEdit,
  onDelete,
  loading = false,
}: ReviewListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!onDelete) return;

    if (!confirm('Sharhni o\'chirmoqchimisiz?')) return;

    setDeletingId(reviewId);
    try {
      await onDelete(reviewId);
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>Hali sharhlar yo'q</p>
        <p className="text-sm mt-2">Birinchi sharh qoldiring!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isOwnReview = currentUserId === review.user.id;
        const isDeleting = deletingId === review.id;

        return (
          <div
            key={review.id}
            className="border-b pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {review.user.avatarUrl ? (
                  <img
                    src={review.user.avatarUrl}
                    alt={`${review.user.firstName} ${review.user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.user.firstName[0]}
                      {review.user.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {review.user.firstName} {review.user.lastName}
                  </p>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {isOwnReview && (
                  <div className="flex gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(review)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Tahrirlash
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        {isDeleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Tahrirlangan:{' '}
                {new Date(review.updatedAt).toLocaleDateString('uz-UZ')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
