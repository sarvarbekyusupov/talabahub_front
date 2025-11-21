'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
  showText?: boolean;
}

export function BookmarkButton({
  articleId,
  initialBookmarked = false,
  onToggle,
  showText = false
}: BookmarkButtonProps) {
  const token = getToken();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleToggle = async () => {
    if (!token) return;

    setIsLoading(true);

    try {
      if (isBookmarked) {
        await api.unbookmarkArticle(token, articleId);
        setIsBookmarked(false);
        onToggle?.(false);
      } else {
        await api.bookmarkArticle(token, articleId);
        setIsBookmarked(true);
        onToggle?.(true);
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !token}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!token ? 'Kirish talab qilinadi' : isBookmarked ? 'Saqlangandan olib tashlash' : 'Saqlash'}
    >
      <svg
        className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-600' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {showText && (
        <span className="font-medium text-sm">
          {isBookmarked ? 'Saqlangan' : 'Saqlash'}
        </span>
      )}
    </button>
  );
}
