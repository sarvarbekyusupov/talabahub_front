'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface FollowButtonProps {
  username: string;
  initialFollowing?: boolean;
  onToggle?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({
  username,
  initialFollowing = false,
  onToggle,
  size = 'md'
}: FollowButtonProps) {
  const token = getToken();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleToggle = async () => {
    if (!token) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        await api.unfollowStudent(token, username);
        setIsFollowing(false);
        onToggle?.(false);
      } else {
        await api.followStudent(token, username);
        setIsFollowing(true);
        onToggle?.(true);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !token}
      className={`${sizeClasses[size]} rounded-full font-medium transition ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${!token ? 'opacity-50 cursor-not-allowed' : ''} ${isLoading ? 'opacity-50' : ''}`}
      title={!token ? 'Kirish talab qilinadi' : isFollowing ? 'Kuzatishni to\'xtatish' : 'Kuzatish'}
    >
      {isLoading ? (
        <span className="inline-block animate-spin">⟳</span>
      ) : isFollowing ? (
        'Kuzatilmoqda'
      ) : (
        'Kuzatish'
      )}
    </button>
  );
}
