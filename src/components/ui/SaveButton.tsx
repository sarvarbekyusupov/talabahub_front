'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface SaveButtonProps {
  itemType: 'discount' | 'job' | 'event' | 'course';
  itemId: string;
  initialSaved?: boolean;
  savedItemId?: string;
  onSaveChange?: (saved: boolean) => void;
  className?: string;
}

export function SaveButton({
  itemType,
  itemId,
  initialSaved = false,
  savedItemId: initialSavedItemId,
  onSaveChange,
  className = '',
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [savedItemId, setSavedItemId] = useState(initialSavedItemId);
  const [loading, setLoading] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      alert('Saqlash uchun tizimga kiring');
      return;
    }

    setLoading(true);
    try {
      if (isSaved && savedItemId) {
        // Unsave
        await api.unsaveItem(token, savedItemId);
        setIsSaved(false);
        setSavedItemId(undefined);
        onSaveChange?.(false);
      } else {
        // Save
        const response: any = await api.saveItem(token, itemType, itemId);
        setIsSaved(true);
        setSavedItemId(response.id);
        onSaveChange?.(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`p-2 rounded-lg transition ${
        isSaved
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={isSaved ? 'Saqlangandan olib tashlash' : 'Saqlash'}
    >
      <svg
        className="w-5 h-5"
        fill={isSaved ? 'currentColor' : 'none'}
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
    </button>
  );
}
