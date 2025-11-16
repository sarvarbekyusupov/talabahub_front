// Authentication utilities
export const AUTH_TOKEN_KEY = 'talabahub_access_token';
export const REFRESH_TOKEN_KEY = 'talabahub_refresh_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  // Dispatch custom event to notify components about auth change
  window.dispatchEvent(new Event('auth-change'));
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Dispatch custom event to notify components about auth change
  window.dispatchEvent(new Event('auth-change'));
};

export const clearAuth = (): void => {
  removeTokens();
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
