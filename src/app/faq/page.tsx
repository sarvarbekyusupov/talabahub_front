'use client';

import React, { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is TalabaHub?",
      answer: "TalabaHub is a platform designed specifically for university students in Uzbekistan, offering exclusive discounts, job opportunities, and events."
    },
    {
      question: "How do I verify my student status?",
      answer: "You can verify your student status by uploading your student ID and enrollment certificate through our verification page. The process usually takes 24-48 hours."
    },
    {
      question: "What kind of discounts can I get?",
      answer: "We partner with local and national brands to offer student discounts on food, clothing, technology, transportation, and more."
    },
    {
      question: "Is TalabaHub free to use?",
      answer: "Yes, TalabaHub is completely free for students. We believe every student should have access to these opportunities."
    },
    {
      question: "How do I post a job or discount?",
      answer: "Businesses and partners can sign up through our partner portal to post jobs and offer exclusive student discounts."
    },
    {
      question: "What universities are supported?",
      answer: "We support all accredited universities in Uzbekistan, including TUIT, WIUT, TSTU, and many more."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about TalabaHub
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Still have questions?</h2>
          <p className="text-blue-700 mb-6">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}