'use client';

import React from 'react';
import { useVerification } from '@/contexts/VerificationContext';
import { UserVerificationStatus } from '@/contexts/VerificationContext';

interface VerificationBannerProps {
  className?: string;
}

export function VerificationBanner({ className = '' }: VerificationBannerProps) {
  const { state } = useVerification();

  if (!state.status) {
    return null;
  }

  const bannerConfig = {
    unverified: {
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: '⚠️',
      title: 'Email Verification Required',
      message: 'Please verify your email address to continue using TalabaHub.',
      buttonText: 'Resend Email',
    },
    email_verified: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      icon: '📄',
      title: 'Complete Student Verification',
      message: 'Please upload your student ID to access all features and exclusive benefits.',
      buttonText: 'Verify Now',
    },
    pending_verification: {
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: '⏳',
      title: 'Verification Under Review',
      message: 'Your verification is being reviewed. Usually takes 24-48 hours.',
      buttonText: 'Check Status',
    },
    verification_expired: {
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      icon: '⏰',
      title: 'Verification Expired',
      message: 'Your student verification has expired. Please re-verify your student status.',
      buttonText: 'Re-verify Now',
    },
    rejected: {
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: '❌',
      title: 'Verification Rejected',
      message: state.status.rejectionReason || 'Your verification was rejected. Please re-submit with correct documents.',
      buttonText: 'Try Again',
    },
    suspended: {
      color: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-800',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      icon: '🚫',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support.',
      buttonText: 'Contact Support',
    },
    graduated: {
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: '🎓',
      title: 'Graduate Status',
      message: 'You are registered as a graduate. Student features are no longer available.',
      buttonText: 'Learn More',
    },
  };

  const status = state.status.verificationStatus;
  if (status === 'verified') return null;
  const config = bannerConfig[status];
  if (!config) return null;

  const handleAction = () => {
    if (!state.status) return;
    switch (state.status.verificationStatus) {
      case 'unverified':
        // Resend email logic
        break;
      case 'email_verified':
      case 'verification_expired':
      case 'rejected':
        window.location.href = '/verification';
        break;
      case 'pending_verification':
        window.location.reload();
        break;
      case 'suspended':
        window.location.href = '/support';
        break;
      case 'graduated':
        window.location.href = '/alumni';
        break;
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-6 ${config.color} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">{config.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-2 text-sm ${config.textColor}`}>
            <p>{config.message}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAction}
              className={`text-sm font-medium text-white px-4 py-2 rounded-md transition-colors ${config.buttonColor}`}
            >
              {config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}