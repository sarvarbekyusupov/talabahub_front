'use client';

import React from 'react';
import { UserVerificationStatus } from '@/contexts/VerificationContext';

interface VerificationStatusBadgeProps {
  status: UserVerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerificationStatusBadge({
  status,
  size = 'md',
  showText = true,
  className = '',
}: VerificationStatusBadgeProps) {
  const statusConfig = {
    unverified: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      label: 'Unverified',
    },
    email_verified: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '✉️',
      label: 'Email Verified',
    },
    pending_verification: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '⏳',
      label: 'Pending Review',
    },
    verified: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      label: 'Verified Student',
    },
    verification_expired: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '⏰',
      label: 'Expired',
    },
    rejected: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      label: 'Rejected',
    },
    suspended: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '🚫',
      label: 'Suspended',
    },
    graduated: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🎓',
      label: 'Graduate',
    },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full ${config.color} ${sizeClasses[size]} ${className}`}
    >
      <span className={iconSize[size]}>{config.icon}</span>
      {showText && <span className="ml-1.5 font-medium">{config.label}</span>}
    </span>
  );
}

interface VerificationStatusProps {
  status: UserVerificationStatus;
  className?: string;
}

export function VerificationStatus({ status, className = '' }: VerificationStatusProps) {
  const isVerified = status === 'verified';
  const isPending = status === 'pending_verification';
  const needsAttention = ['unverified', 'email_verified', 'verification_expired', 'rejected', 'suspended'].includes(status);

  if (isVerified) {
    return (
      <div className={`flex items-center text-green-600 ${className}`}>
        <span className="text-lg mr-2">✅</span>
        <span className="font-medium">Verified Student</span>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`flex items-center text-blue-600 ${className}`}>
        <span className="text-lg mr-2">⏳</span>
        <span className="font-medium">Under Review</span>
      </div>
    );
  }

  if (needsAttention) {
    return (
      <div className={`flex items-center text-orange-600 ${className}`}>
        <span className="text-lg mr-2">⚠️</span>
        <span className="font-medium">Action Required</span>
      </div>
    );
  }

  return null;
}

// Special verified badge for profiles and cards
export function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm ${className}`}>
      <span className="mr-1.5">✓</span>
      <span>Verified Student</span>
    </div>
  );
}