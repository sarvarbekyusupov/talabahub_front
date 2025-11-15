'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useToast } from './Toast';

interface FileUploadProps {
  currentFile?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
  className?: string;
}

export const FileUpload = ({
  currentFile,
  onUpload,
  onRemove,
  maxSizeMB = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  label = 'Fayl yuklash',
  className = '',
}: FileUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(
    currentFile ? currentFile.split('/').pop() || null : null
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      showToast(
        `Faqat ${acceptedTypes.join(', ')} formatdagi fayllar qabul qilinadi`,
        'error'
      );
      return false;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      showToast(`Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak`, 'error');
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const fileUrl = await onUpload(file);

      clearInterval(progressInterval);
      setProgress(100);

      showToast('Fayl muvaffaqiyatli yuklandi', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Fayl yuklashda xatolik yuz berdi', 'error');
      setFileName(null);
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setFileName(null);
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {fileName ? (
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              {uploading && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Yuklanmoqda... {progress}%</p>
                </div>
              )}
            </div>
            {!uploading && (
              <button
                onClick={handleRemove}
                className="flex-shrink-0 text-red-600 hover:text-red-800 transition"
                title="Faylni o'chirish"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-xs text-gray-500">
            {acceptedTypes.join(', ')} (max {maxSizeMB}MB)
          </p>
        </button>
      )}
    </div>
  );
};
