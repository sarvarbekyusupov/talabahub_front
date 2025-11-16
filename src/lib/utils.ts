import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Debounce function - delays execution until after wait milliseconds have elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - executes function at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * React hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) {
  const callbackRef = useRef(callback);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRan.current;

      if (timeSinceLastRun >= delay) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }
        throttleRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  );
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date, locale: string = 'uz-UZ'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to localized string
 */
export function formatDateTime(date: string | Date, locale: string = 'uz-UZ'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, locale: string = 'uz-UZ'): string {
  return num.toLocaleString(locale);
}

/**
 * Format currency (UZS)
 */
export function formatCurrency(amount: number, locale: string = 'uz-UZ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = ''): string {
  const randomPart = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${randomPart}` : randomPart;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Sleep/delay for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }
        await sleep(delay * Math.pow(backoff, attempt));
      }
    }
  }

  throw lastError!;
}

/**
 * Class name helper (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date, locale: string = 'uz-UZ'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} soniya oldin`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} daqiqa oldin`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} soat oldin`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} kun oldin`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} oy oldin`;
  return `${Math.floor(diffInSeconds / 31536000)} yil oldin`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (UZ format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+998)?[\s-]?\(?[0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
  return phoneRegex.test(phone);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
