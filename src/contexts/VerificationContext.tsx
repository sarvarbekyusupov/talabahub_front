'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export type UserVerificationStatus =
  | 'unverified'
  | 'email_verified'
  | 'pending_verification'
  | 'verified'
  | 'verification_expired'
  | 'rejected'
  | 'suspended'
  | 'graduated';

export interface VerificationStatus {
  verificationStatus: UserVerificationStatus;
  isEmailVerified: boolean;
  verificationMethod?: string;
  verificationDate?: string;
  nextVerificationDue?: string;
  pendingRequestId?: string;
  rejectionReason?: string;
  canApplyForJobs: boolean;
  canUseDiscounts: boolean;
  canRegisterEvents: boolean;
  message: string;
}

export interface VerificationDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  originalFilename: string;
  uploadedAt: string;
  mimeType?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  requestType: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  userNotes?: string;
  priority: number;
  documents: VerificationDocument[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    avatarUrl?: string;
    phone?: string;
    studentIdNumber?: string;
    faculty?: string;
    courseYear?: number;
    graduationYear?: number;
    universityName?: string;
    createdAt: string;
    verificationAttempts: number;
  };
}

interface VerificationState {
  status: VerificationStatus | null;
  history: VerificationRequest[];
  loading: boolean;
  error: string | null;
}

type VerificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATUS'; payload: VerificationStatus }
  | { type: 'SET_HISTORY'; payload: VerificationRequest[] }
  | { type: 'UPDATE_STATUS'; payload: Partial<VerificationStatus> }
  | { type: 'RESET' };

const initialState: VerificationState = {
  status: null,
  history: [],
  loading: true,
  error: null,
};

function verificationReducer(state: VerificationState, action: VerificationAction): VerificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_STATUS':
      return { ...state, status: action.payload, loading: false, error: null };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'UPDATE_STATUS':
      return {
        ...state,
        status: state.status ? { ...state.status, ...action.payload } : null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface VerificationContextType {
  state: VerificationState;
  checkStatus: () => Promise<void>;
  getHistory: () => Promise<void>;
  submitVerification: (data: any) => Promise<void>;
  resendEmail: () => Promise<void>;
  clearError: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(verificationReducer, initialState);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const checkStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE}/verification/status`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data: VerificationStatus = await response.json();
      dispatch({ type: 'SET_STATUS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const getHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/verification/history`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification history');
      }

      const data: VerificationRequest[] = await response.json();
      dispatch({ type: 'SET_HISTORY', payload: data });
    } catch (error) {
      console.error('Failed to fetch verification history:', error);
    }
  };

  const submitVerification = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`${API_BASE}/verification/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit verification');
      }

      const result: VerificationRequest = await response.json();

      // Update status to pending_verification
      dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          verificationStatus: 'pending_verification',
          pendingRequestId: result.id,
          message: 'Your verification is under review. Usually takes 24-48 hours.'
        }
      });

      // Refresh history
      await getHistory();

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const resendEmail = async () => {
    try {
      const response = await fetch(`${API_BASE}/verification/resend-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification email');
      }

      return await response.json();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Check verification status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkStatus();
      getHistory();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value: VerificationContextType = {
    state,
    checkStatus,
    getHistory,
    submitVerification,
    resendEmail,
    clearError,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

// Hook for checking specific permissions
export function useVerificationPermissions() {
  const { state } = useVerification();

  if (!state.status) {
    return {
      canApplyForJobs: false,
      canUseDiscounts: false,
      canRegisterEvents: false,
      isVerified: false,
      isEmailVerified: false,
      isPending: false,
    };
  }

  return {
    canApplyForJobs: state.status.canApplyForJobs,
    canUseDiscounts: state.status.canUseDiscounts,
    canRegisterEvents: state.status.canRegisterEvents,
    isVerified: state.status.verificationStatus === 'verified',
    isEmailVerified: state.status.isEmailVerified,
    isPending: state.status.verificationStatus === 'pending_verification',
    needsVerification: !state.status.isEmailVerified || state.status.verificationStatus !== 'verified',
  };
}