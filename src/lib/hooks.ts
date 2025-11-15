import useSWR from 'swr';
import { api } from './api';
import { Discount, Job, Event, Course, PaginatedResponse } from '@/types';

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
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
export function useDiscounts(params: Record<string, any> = { limit: 100 }) {
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

export function useJobs(params: Record<string, any> = { limit: 100 }) {
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

export function useEvents(params: Record<string, any> = { limit: 20 }) {
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

export function useCourses(params: Record<string, any> = { limit: 20 }) {
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
