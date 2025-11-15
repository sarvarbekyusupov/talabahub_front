'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useToast } from './Toast';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUpload = ({
  currentImage,
  onUpload,
  onRemove,
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Faqat JPG, PNG yoki WebP formatdagi rasmlar qabul qilinadi', 'error');
      return false;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      showToast(`Rasm hajmi ${maxSizeMB}MB dan oshmasligi kerak`, 'error');
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
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

      const imageUrl = await onUpload(file);

      clearInterval(progressInterval);
      setProgress(100);

      showToast('Rasm muvaffaqiyatli yuklandi', 'success');
      setPreview(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Rasm yuklashda xatolik yuz berdi', 'error');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
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
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-sm">{progress}%</div>
                </div>
              </div>
            )}
          </div>
          {!uploading && (
            <div className="absolute bottom-0 right-0 flex gap-1">
              <button
                onClick={handleClick}
                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-lg"
                title="Rasmni o'zgartirish"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={handleRemove}
                className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg"
                title="Rasmni o'chirish"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xs text-gray-500 text-center px-2">
            Rasm yuklash
          </span>
        </button>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        JPG, PNG yoki WebP (max {maxSizeMB}MB)
      </p>
    </div>
  );
};
