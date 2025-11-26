'use client';

import React from 'react';
import { useVerificationPermissions } from '@/contexts/VerificationContext';

interface VerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  requireEmailVerification?: boolean;
  feature?: 'jobs' | 'discounts' | 'events' | 'all';
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export function VerificationGuard({
  children,
  requireVerification = true,
  requireEmailVerification = true,
  feature = 'all',
  fallback,
  showMessage = true,
}: VerificationGuardProps) {
  const permissions = useVerificationPermissions();

  // Check email verification first
  if (requireEmailVerification && !permissions.isEmailVerified) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Email Verification Required
        </h3>
        <p className="text-red-600 mb-4">
          Please verify your email address to access this feature.
        </p>
        <button
          onClick={() => window.location.href = '/verification'}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Verify Email
        </button>
      </div>
    );
  }

  // Check specific feature permissions
  if (requireVerification) {
    switch (feature) {
      case 'jobs':
        if (!permissions.canApplyForJobs) {
          return fallback || <LockedFeature feature="job applications" />;
        }
        break;
      case 'discounts':
        if (!permissions.canUseDiscounts) {
          return fallback || <LockedFeature feature="student discounts" />;
        }
        break;
      case 'events':
        if (!permissions.canRegisterEvents) {
          return fallback || <LockedFeature feature="event registration" />;
        }
        break;
      case 'all':
      default:
        if (!permissions.isVerified) {
          return fallback || <LockedFeature feature="exclusive features" showMessage={showMessage} />;
        }
        break;
    }
  }

  return <>{children}</>;
}

interface LockedFeatureProps {
  feature: string;
  className?: string;
  showMessage?: boolean;
}

function LockedFeature({ feature, className = '', showMessage = false }: LockedFeatureProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Student Verification Required
      </h3>
      <p className="text-yellow-600 mb-4">
        Access to {feature} is limited to verified students only.
      </p>
      <div className="space-y-2">
        <button
          onClick={() => window.location.href = '/verification'}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors block w-full"
        >
          Complete Verification
        </button>
        {showMessage && (
          <p className="text-sm text-yellow-700">
            Join 10,000+ verified students and unlock exclusive benefits!
          </p>
        )}
      </div>
    </div>
  );
}

// Hook for easy usage in components
export function useFeatureGuard() {
  const permissions = useVerificationPermissions();

  const canAccess = (feature: 'jobs' | 'discounts' | 'events' | 'all' = 'all') => {
    switch (feature) {
      case 'jobs':
        return permissions.canApplyForJobs;
      case 'discounts':
        return permissions.canUseDiscounts;
      case 'events':
        return permissions.canRegisterEvents;
      case 'all':
        return permissions.isVerified;
      default:
        return false;
    }
  };

  const getGuardComponent = (
    children: React.ReactNode,
    feature: 'jobs' | 'discounts' | 'events' | 'all' = 'all',
    options?: Omit<VerificationGuardProps, 'children' | 'feature'>
  ) => (
    <VerificationGuard feature={feature} {...options}>
      {children}
    </VerificationGuard>
  );

  return { canAccess, getGuardComponent };
}