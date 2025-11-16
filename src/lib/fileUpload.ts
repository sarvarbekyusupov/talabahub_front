/**
 * File Upload Utilities
 * Handles file validation, upload, and management
 */

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'); // 5MB default
const ALLOWED_FILE_TYPES = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx').split(',');

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fayl hajmi ${formatBytes(MAX_FILE_SIZE)} dan oshmasligi kerak`,
    };
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
    return {
      valid: false,
      error: `Faqat ${ALLOWED_FILE_TYPES.join(', ')} formatdagi fayllar qabul qilinadi`,
    };
  }

  return { valid: true };
}

/**
 * Upload file to server
 */
export async function uploadFile(
  file: File,
  endpoint: string,
  token: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    const promise = new Promise<UploadResult>((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.url,
          });
        } else {
          reject(new Error(xhr.responseText));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Fayl yuklashda xatolik'));
      });

      xhr.open('POST', endpoint);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });

    return await promise;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Fayl yuklashda xatolik',
    };
  }
}

/**
 * Convert bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  };

  return iconMap[extension || ''] || '📎';
}

/**
 * Download file from URL
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Faylni yuklashda xatolik');
  }
}
