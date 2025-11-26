'use client';

import React, { useState, useEffect } from 'react';
import { useVerification, VerificationProvider } from '@/contexts/VerificationContext';
import { VerificationRequest, VerificationStatus } from '@/contexts/VerificationContext';
import { VerificationStatusBadge } from '@/components/verification/VerificationStatusBadge';

// Import icons
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentIcon,
} from '@heroicons/react/outline';

interface VerificationManagementProps {}

function VerificationManagementContent() {
  const { state } = useVerification();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    requestType: '',
    universityId: '',
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.requestType) queryParams.append('requestType', filters.requestType);
      if (filters.universityId) queryParams.append('universityId', filters.universityId);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`${API_BASE}/verification/admin/pending?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: string) => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`${API_BASE}/verification/admin/review/${selectedRequest.id}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          rejectionReason: decision === 'reject' ? rejectionReason : undefined,
          rejectionMessage: reviewNotes,
          adminNotes: reviewNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review request');
      }

      // Refresh requests
      await fetchRequests();

      // Close modal and reset form
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewDecision('');
      setReviewNotes('');
      setRejectionReason('');

    } catch (error) {
      console.error('Review failed:', error);
      // Handle error (show toast message)
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'more_info_needed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    fetchRequests();
  }, [filters, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Management
          </h1>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-yellow-600">15</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Approved Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-600">Rejected Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">1,250</div>
                <div className="text-sm text-gray-600">Total Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="more_info_needed">More Info Needed</option>
              </select>
              <select
                value={filters.universityId}
                onChange={(e) => setFilters({ ...filters, universityId: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Universities</option>
                <option value="1">TUIT</option>
                <option value="2">WIUT</option>
                <option value="3">TSTU</option>
                <option value="4">UZSWLU</option>
                <option value="5">TSUE</option>
                <option value="6">NUUz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading verification requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.firstName} {request.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{request.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.user.universityName}</div>
                        {request.user.studentIdNumber && (
                          <div className="text-xs text-gray-500">ID: {request.user.studentIdNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.documents.length} document{request.documents.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.documents.map(doc => formatDocumentType(doc.documentType)).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowReviewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewDecision('approve');
                            setShowReviewModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewDecision('reject');
                            setShowReviewModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests</h3>
              <p className="text-gray-500">No verification requests match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Review Verification Request</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedRequest(null);
                    setReviewDecision('');
                    setReviewNotes('');
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">University</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.user.universityName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.user.studentIdNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Faculty</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.user.faculty || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course Year</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.user.courseYear || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {formatDocumentType(doc.documentType)}
                      </h4>
                      {doc.mimeType.startsWith('image/') ? (
                        <img
                          src={doc.fileUrl}
                          alt={formatDocumentType(doc.documentType)}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                          <DocumentIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 truncate">{doc.originalFilename}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review Decision</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setReviewDecision('approve')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                          reviewDecision === 'approve'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <CheckIcon className="w-5 h-5 inline mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setReviewDecision('reject')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                          reviewDecision === 'reject'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 text-gray-700 hover:border-red-300'
                        }`}
                      >
                        <XMarkIcon className="w-5 h-5 inline mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => setReviewDecision('request_more_info')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                          reviewDecision === 'request_more_info'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
                        Request More Info
                      </button>
                    </div>
                  </div>

                  {reviewDecision === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a reason</option>
                        <option value="id_not_clear">ID not clear</option>
                        <option value="id_expired">ID expired</option>
                        <option value="name_mismatch">Name mismatch</option>
                        <option value="university_not_recognized">University not recognized</option>
                        <option value="suspected_fraud">Suspected fraud</option>
                        <option value="incomplete_information">Incomplete information</option>
                        <option value="duplicate_account">Duplicate account</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes to Student</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={4}
                      placeholder="Provide additional feedback or instructions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                  setReviewDecision('');
                  setReviewNotes('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(reviewDecision)}
                disabled={!reviewDecision}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationManagement() {
  return (
    <VerificationProvider>
      <VerificationManagementContent />
    </VerificationProvider>
  );
}