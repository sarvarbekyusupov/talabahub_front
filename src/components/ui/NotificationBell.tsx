'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { getToken, removeTokens, isAuthenticated } from '@/lib/auth';

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadUnreadCount = async () => {
    const token = getToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const data: any = await api.getUnreadNotificationCount(token);
      setUnreadCount(data.count || 0);
    } catch (err: any) {
      // Handle 401 errors by clearing invalid tokens
      if (err?.statusCode === 401 || err?.status === 401 || err?.message?.includes('401')) {
        removeTokens();
        setUnreadCount(0);
        // Clear the polling interval since user is no longer authenticated
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Silently fail for other errors
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    // Only start polling if authenticated
    if (isAuthenticated()) {
      loadUnreadCount();
      // Poll every 30 seconds for new notifications
      intervalRef.current = setInterval(loadUnreadCount, 30000);
    }

    // Listen for auth changes to stop polling when logged out
    const handleAuthChange = () => {
      if (!isAuthenticated()) {
        setUnreadCount(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // User logged in, start polling
        loadUnreadCount();
        if (!intervalRef.current) {
          intervalRef.current = setInterval(loadUnreadCount, 30000);
        }
      }
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition"
      aria-label="Notifications"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
