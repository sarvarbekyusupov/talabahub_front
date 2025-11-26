'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VerificationProvider, useVerification } from '@/contexts/VerificationContext';
import { DocumentUpload, UploadedDocument } from '@/components/verification/DocumentUpload';
import { DocumentRequirements } from '@/components/verification/DocumentUpload';

// Import icons
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

function VerificationPageContent() {
  const router = useRouter();
  const { state, submitVerification, clearError } = useVerification();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    universityId: '',
    studentIdNumber: '',
    faculty: '',
    courseYear: '',
    graduationYear: '',
    userNotes: '',
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if already verified
    if (state.status?.verificationStatus === 'verified') {
      router.push('/dashboard');
    }
  }, [state.status, router]);

  const handleDocumentUpload = (document: UploadedDocument) => {
    setUploadedDocuments(prev => [...prev.filter(d => d.documentType !== document.documentType), document]);
  };

  const handleDocumentRemove = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== documentId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.universityId && formData.studentIdNumber && formData.faculty);
      case 2:
        return uploadedDocuments.length >= 1;
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setSubmitting(true);
    clearError();

    try {
      const submissionData = {
        universityId: parseInt(formData.universityId),
        studentIdNumber: formData.studentIdNumber,
        faculty: formData.faculty,
        courseYear: parseInt(formData.courseYear) || undefined,
        graduationYear: parseInt(formData.graduationYear) || undefined,
        userNotes: formData.userNotes || undefined,
        documents: uploadedDocuments.map(doc => ({
          documentType: doc.documentType,
          fileUrl: doc.url,
          originalFilename: doc.originalFilename,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        })),
      };

      await submitVerification(submissionData);
      router.push('/verification/success');
    } catch (error) {
      // Error is handled by the context
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'University Info', icon: AcademicCapIcon },
    { id: 2, name: 'Documents', icon: PhotoIcon },
    { id: 3, name: 'Review', icon: CheckCircleIcon },
  ];

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (state.status?.verificationStatus === 'pending_verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Under Review
          </h1>
          <p className="text-gray-600 mb-6">
            Your verification is being reviewed by our team. This usually takes 24-48 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              We'll email you once your verification is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Student Verification
          </h1>
          <p className="text-lg text-gray-600">
            Complete your verification to unlock exclusive student benefits
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center">
              {steps.map((step, stepIdx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive
                          ? 'border-blue-600 bg-blue-600'
                          : isCompleted
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" />
                        ) : (
                          <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span className={`ml-3 text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Step 1: University Information */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                University Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University *
                  </label>
                  <select
                    name="universityId"
                    value={formData.universityId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select your university</option>
                    <option value="1">Tashkent University of Information Technologies (TUIT)</option>
                    <option value="2">Westminster International University in Tashkent (WIUT)</option>
                    <option value="3">Tashkent State Technical University (TSTU)</option>
                    <option value="4">Uzbekistan State University of World Languages (UZSWLU)</option>
                    <option value="5">Tashkent State University of Economics (TSUE)</option>
                    <option value="6">National University of Uzbekistan (NUUz)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID Number *
                  </label>
                  <input
                    type="text"
                    name="studentIdNumber"
                    value={formData.studentIdNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., A123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty/Department *
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Engineering"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Year
                  </label>
                  <select
                    name="courseYear"
                    value={formData.courseYear}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="6">6th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Graduation Year
                  </label>
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 8 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="userNotes"
                  value={formData.userNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information that might help with verification..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(1)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  Next: Documents
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Upload Documents
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <DocumentUpload
                    documentType="student_id_front"
                    onUpload={handleDocumentUpload}
                    onRemove={handleDocumentRemove}
                    uploadedDocument={uploadedDocuments.find(d => d.documentType === 'student_id_front')}
                  />

                  <DocumentUpload
                    documentType="student_id_back"
                    onUpload={handleDocumentUpload}
                    onRemove={handleDocumentRemove}
                    uploadedDocument={uploadedDocuments.find(d => d.documentType === 'student_id_back')}
                  />

                  <DocumentUpload
                    documentType="enrollment_certificate"
                    onUpload={handleDocumentUpload}
                    onRemove={handleDocumentRemove}
                    uploadedDocument={uploadedDocuments.find(d => d.documentType === 'enrollment_certificate')}
                  />

                  <DocumentUpload
                    documentType="payment_receipt"
                    onUpload={handleDocumentUpload}
                    onRemove={handleDocumentRemove}
                    uploadedDocument={uploadedDocuments.find(d => d.documentType === 'payment_receipt')}
                  />
                </div>

                <div className="lg:col-span-1">
                  <DocumentRequirements />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(2)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review & Submit
              </h2>

              <div className="space-y-6">
                {/* University Information Review */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    University Information
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">University</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formData.universityId ?
                          ['TUIT', 'WIUT', 'TSTU', 'UZSWLU', 'TSUE', 'NUUz'][parseInt(formData.universityId) - 1] ||
                          'Selected University' :
                          'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.studentIdNumber || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Faculty</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.faculty || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Course Year</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formData.courseYear ? `${formData.courseYear}${['st', 'nd', 'rd', 'th', 'th', 'th'][parseInt(formData.courseYear) - 1]} Year` : 'Not specified'}
                      </dd>
                    </div>
                    {formData.graduationYear && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Expected Graduation</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.graduationYear}</dd>
                      </div>
                    )}
                    {formData.userNotes && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.userNotes}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Documents Review */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Documents
                  </h3>
                  {uploadedDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{doc.originalFilename}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Terms & Conditions
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>I confirm that all information provided is accurate and truthful</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>I understand that providing false information may result in account suspension</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>I consent to having my documents reviewed for verification purposes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>I understand verification typically takes 24-48 hours</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !validateStep(2)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <VerificationProvider>
      <VerificationPageContent />
    </VerificationProvider>
  );
}