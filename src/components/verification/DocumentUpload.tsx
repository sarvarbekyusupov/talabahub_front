'use client';

import React, { useState, useCallback, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';

export interface UploadedDocument {
  id: string;
  documentType: string;
  file: File;
  url: string;
  publicId?: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface DocumentUploadProps {
  documentType: 'student_id_front' | 'student_id_back' | 'enrollment_certificate' | 'payment_receipt' | 'other';
  onUpload: (document: UploadedDocument) => void;
  onRemove: (documentId: string) => void;
  uploadedDocument?: UploadedDocument;
  className?: string;
}

const documentTypeConfig = {
  student_id_front: {
    title: 'Student ID (Front)',
    description: 'Clear photo of the front of your student ID card',
    icon: PhotoIcon,
    acceptedTypes: 'image/jpeg,image/jpg,image/png,image/webp',
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  student_id_back: {
    title: 'Student ID (Back)',
    description: 'Clear photo of the back of your student ID card',
    icon: PhotoIcon,
    acceptedTypes: 'image/jpeg,image/jpg,image/png,image/webp',
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  enrollment_certificate: {
    title: 'Enrollment Certificate',
    description: 'Official enrollment verification document (PDF or image)',
    icon: DocumentIcon,
    acceptedTypes: 'application/pdf,image/jpeg,image/jpg,image/png,image/webp',
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  payment_receipt: {
    title: 'Payment Receipt',
    description: 'Recent tuition payment receipt or scholarship document',
    icon: DocumentIcon,
    acceptedTypes: 'application/pdf,image/jpeg,image/jpg,image/png,image/webp',
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  other: {
    title: 'Other Document',
    description: 'Any additional verification document',
    icon: DocumentIcon,
    acceptedTypes: 'application/pdf,image/jpeg,image/jpg,image/png,image/webp',
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

export function DocumentUpload({
  documentType,
  onUpload,
  onRemove,
  uploadedDocument,
  className = '',
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = documentTypeConfig[documentType];
  const Icon = config.icon;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = config.acceptedTypes.split(',');
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a valid document.';
    }

    // Check file size
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      return `File size exceeds ${maxSizeMB}MB limit.`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    // Determine which endpoint to use
    const endpoint = file.type.startsWith('image/')
      ? '/upload/verification-image'
      : '/upload/verification-document';

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const uploadResult = await response.json();

    return {
      id: Date.now().toString(),
      documentType,
      file,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      originalFilename: uploadResult.originalFilename,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSize,
      uploadedAt: uploadResult.uploadedAt,
      dimensions: uploadResult.dimensions,
    };
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      const uploadedDoc = await uploadFile(file);
      onUpload(uploadedDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemove = () => {
    if (uploadedDocument) {
      onRemove(uploadedDocument.id);
    }
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = uploadedDocument?.mimeType?.startsWith('image/');

  if (uploadedDocument) {
    return (
      <div className={`border-2 border-green-200 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-green-900">{config.title}</h4>
              <p className="text-sm text-green-700 truncate max-w-xs">
                {uploadedDocument.originalFilename}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remove document"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isImage && uploadedDocument.url && (
          <div className="mt-3">
            <img
              src={uploadedDocument.url}
              alt={config.title}
              className="w-full h-48 object-cover rounded-md border border-green-200"
            />
          </div>
        )}

        <div className="mt-3 flex items-center text-xs text-green-600">
          <span>{formatFileSize(uploadedDocument.fileSize)}</span>
          {uploadedDocument.dimensions && (
            <>
              <span className="mx-2">•</span>
              <span>{uploadedDocument.dimensions.width} × {uploadedDocument.dimensions.height}px</span>
            </>
          )}
          <span className="mx-2">•</span>
          <span>{new Date(uploadedDocument.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-6 transition-colors ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="text-center"
      >
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-1">{config.title}</h4>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Choose File
              </>
            )}
          </button>

          <p className="text-xs text-gray-500">
            or drag and drop • Max {config.maxSize / (1024 * 1024)}MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={config.acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

// Component for displaying document requirements and tips
export function DocumentRequirements({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-blue-900 mb-3">📋 Document Requirements</h4>

      <div className="space-y-2 text-sm text-blue-800">
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>Clear, well-lit photos without glare or shadows</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>All text and photos must be clearly visible</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>Documents must be current and not expired</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>Ensure your name matches your TalabaHub profile</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>Files in JPEG, PNG, WebP, or PDF format</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">
          <strong>Privacy:</strong> Your documents are encrypted and only visible to our verification team.
          They are automatically deleted after verification is complete.
        </p>
      </div>
    </div>
  );
}