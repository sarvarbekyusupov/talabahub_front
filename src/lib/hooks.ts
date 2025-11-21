import useSWR from 'swr';
import { api } from './api';
import { Discount, Job, Event, Course, PaginatedResponse } from '@/types';
import { getToken as getAuthToken } from './auth';

// Helper to get token from localStorage
const getToken = () => {
  return getAuthToken();
};

// Fetchers for different endpoints
const discountsFetcher = async (params: Record<string, any>) => {
  const data = await api.getDiscounts(params) as PaginatedResponse<Discount>;
  return data.data;
};

const jobsFetcher = async (params: Record<string, any>) => {
  const data = await api.getJobs(params) as PaginatedResponse<Job>;
  return data.data;
};

const eventsFetcher = async (params: Record<string, any>) => {
  const data = await api.getEvents(params) as PaginatedResponse<Event>;
  return data.data;
};

const coursesFetcher = async (params: Record<string, any>) => {
  const data = await api.getCourses(params) as PaginatedResponse<Course>;
  return data.data;
};

// Custom hooks with SWR
export function useDiscounts(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['discounts', params],
    () => discountsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    discounts: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJobs(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['jobs', params],
    () => jobsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    jobs: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useEvents(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['events', params],
    () => eventsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    events: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useCourses(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['courses', params],
    () => coursesFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    courses: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook for single item fetching
export function useDiscount(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['discount', id] : null,
    () => api.getDiscount(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    discount: data,
    isLoading,
    error,
  };
}

export function useJob(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['job', id] : null,
    () => api.getJob(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    job: data,
    isLoading,
    error,
  };
}

export function useEvent(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['event', id] : null,
    () => api.getEvent(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    event: data,
    isLoading,
    error,
  };
}

export function useCourse(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['course', id] : null,
    () => api.getCourse(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    course: data,
    isLoading,
    error,
  };
}

// User-specific hooks (requires authentication)
export function useProfile() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['profile', token] : null,
    () => api.getProfile(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}

export function useUserStats() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['userStats', token] : null,
    () => api.getUserStats(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}

export function useLearningStreak() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['learningStreak', token] : null,
    () => api.getLearningStreak(token!),
    {
      revalidateOnFocus: true, // Revalidate on focus for fresh streak data
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    streak: data,
    isLoading,
    error,
  };
}

// Analytics hooks
export function usePartnerAnalytics(period: string = 'month') {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerAnalytics', period, token] : null,
    () => api.getPartnerAnalytics(token!, { period }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

export function useApplicationAnalytics() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['applicationAnalytics', token] : null,
    () => api.getApplicationAnalytics(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
  };
}

// Notifications hook
export function useNotifications() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['notifications', token] : null,
    () => api.getNotifications(token!),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    notifications: data,
    isLoading,
    error,
    mutate,
  };
}

export function useUnreadCount() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['unreadCount', token] : null,
    () => api.getUnreadNotificationCount(token!),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    count: (data as any)?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
