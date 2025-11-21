import useSWR from 'swr';
import { api } from './api';
import { Discount, Job, Event, Course, PaginatedResponse, DiscountClaim, StudentSavingsAnalytics, PartnerDiscountAnalytics, PlatformAnalytics, FraudAlert } from '@/types';
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

// ========== DISCOUNT SYSTEM HOOKS ==========

// Student Claims Hook
export function useMyClaims(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['myClaims', params, token] : null,
    () => api.getMyClaims(token!, params) as Promise<PaginatedResponse<DiscountClaim>>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    claims: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Student Savings Analytics Hook
export function useStudentSavingsAnalytics() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['studentSavingsAnalytics', token] : null,
    () => api.getStudentSavingsAnalytics(token!) as Promise<StudentSavingsAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// Partner Discount Analytics Hook
export function usePartnerDiscountAnalytics(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerDiscountAnalytics', params, token] : null,
    () => api.getPartnerDiscountAnalytics(token!, params) as Promise<PartnerDiscountAnalytics>,
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

// Partner Pending Verifications Hook
export function usePartnerPendingVerifications(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerPendingVerifications', params, token] : null,
    () => api.getPartnerPendingVerifications(token!, params) as Promise<PaginatedResponse<DiscountClaim>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    claims: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Admin Pending Approvals Hook
export function usePendingApprovalDiscounts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['pendingApprovalDiscounts', params, token] : null,
    () => api.getPendingApprovalDiscounts(token!, params) as Promise<PaginatedResponse<Discount>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    discounts: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Platform Analytics Hook
export function usePlatformDiscountAnalytics(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['platformDiscountAnalytics', params, token] : null,
    () => api.getPlatformDiscountAnalytics(token!, params) as Promise<PlatformAnalytics>,
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

// Fraud Alerts Hook
export function useFraudAlerts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['fraudAlerts', params, token] : null,
    () => api.getFraudAlerts(token!, params) as Promise<PaginatedResponse<FraudAlert>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    alerts: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Recommended Discounts Hook
export function useRecommendedDiscounts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['recommendedDiscounts', params, token] : null,
    () => api.getRecommendedDiscounts(token!, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    discounts: (data as any)?.data || [],
    isLoading,
    error,
    mutate,
  };
}
