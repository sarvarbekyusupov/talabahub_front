'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/outline';

export default function VerificationSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 5 seconds if user doesn't navigate
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Verification Submitted!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Your student verification has been successfully submitted for review.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <div className="text-left space-y-2 text-sm text-blue-800">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span>Our team will review your documents within 24-48 hours</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span>You'll receive an email with the verification result</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span>Once approved, you'll unlock all student benefits</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.location.href = '/jobs'}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Browse Jobs
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          You'll be redirected to your dashboard automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}