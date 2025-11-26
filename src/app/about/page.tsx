'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About TalabaHub</h1>
          <p className="text-xl text-gray-600">
            Connecting students with opportunities across Uzbekistan
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              TalabaHub is dedicated to helping university students in Uzbekistan discover and access
              exclusive discounts, job opportunities, and events tailored specifically for them.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>• Student-exclusive discounts from partner brands</li>
              <li>• Job and internship opportunities for students</li>
              <li>• Educational and networking events</li>
              <li>• Verified student status for exclusive benefits</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-600">
              Become part of thousands of students who are already using TalabaHub to enhance
              their university experience and jumpstart their careers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}