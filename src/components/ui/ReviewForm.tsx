'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import { Review } from '@/types';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
  existingReview?: Review;
  loading?: boolean;
}

export function ReviewForm({
  onSubmit,
  onCancel,
  existingReview,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Iltimos, baho bering');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Sharh kamida 10 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      await onSubmit({ rating, comment: comment.trim() });
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Baholash
        </label>
        <RatingStars
          rating={rating}
          interactive
          onChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Sharh
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tajribangiz haqida yozing..."
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Kamida 10 ta belgi ({comment.length}/10)
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} disabled={rating === 0}>
          {existingReview ? 'Yangilash' : 'Yuborish'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
      </div>
    </form>
  );
}
