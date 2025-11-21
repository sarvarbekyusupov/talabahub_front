'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ClapButtonProps {
  articleId: string;
  initialClaps: number;
  onClap?: (newCount: number) => void;
}

export function ClapButton({ articleId, initialClaps, onClap }: ClapButtonProps) {
  const token = getToken();
  const [claps, setClaps] = useState(initialClaps);
  const [isClapping, setIsClapping] = useState(false);
  const [sessionClaps, setSessionClaps] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setClaps(initialClaps);
  }, [initialClaps]);

  const handleClap = async () => {
    if (!token || sessionClaps >= 50) return;

    setIsClapping(true);
    setShowAnimation(true);

    try {
      const result = await api.clapArticle(token, articleId, 1) as { totalClaps: number };
      const newClaps = result.totalClaps || claps + 1;
      setClaps(newClaps);
      setSessionClaps(prev => Math.min(prev + 1, 50));
      onClap?.(newClaps);
    } catch (err) {
      console.error('Clap failed:', err);
    } finally {
      setIsClapping(false);
      setTimeout(() => setShowAnimation(false), 600);
    }
  };

  // Allow holding for multiple claps
  const handleMouseDown = () => {
    handleClap();
  };

  return (
    <button
      onClick={handleClap}
      onMouseDown={handleMouseDown}
      disabled={isClapping || !token || sessionClaps >= 50}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
        sessionClaps > 0
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!token ? 'Kirish talab qilinadi' : sessionClaps >= 50 ? 'Maksimal alkish' : 'Alkish'}
    >
      <span className={`relative ${showAnimation ? 'animate-bounce' : ''}`}>
        <svg
          className={`w-5 h-5 ${sessionClaps > 0 ? 'fill-green-600' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </span>
      <span className="font-medium">{claps}</span>
      {sessionClaps > 0 && (
        <span className="text-xs text-green-600">+{sessionClaps}</span>
      )}
    </button>
  );
}
