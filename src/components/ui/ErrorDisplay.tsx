'use client';

interface ErrorDisplayProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'default' | 'compact';
}

export function ErrorDisplay({
  message = 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
  title = 'Xatolik',
  onRetry,
  showRetry = true,
  variant = 'default',
}: ErrorDisplayProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline"
          >
            Qayta urinish
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <svg
          className="w-16 h-16 mx-auto text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Qayta urinish
          </button>
        )}
      </div>
    </div>
  );
}

// Specialized error displays for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Tarmoq xatosi"
      message="Internet aloqasi bilan bog'liq muammo yuz berdi. Iltimos, internet aloqangizni tekshiring va qayta urinib ko'ring."
      onRetry={onRetry}
    />
  );
}

export function NotFoundError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Topilmadi"
      message={message || "So'ralgan ma'lumot topilmadi"}
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function PermissionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Ruxsat berilmagan"
      message="Bu ma'lumotlarga kirish uchun sizda ruxsat yo'q. Iltimos, administrator bilan bog'laning."
      onRetry={onRetry}
      showRetry={false}
    />
  );
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Server xatosi"
      message="Server bilan bog'lanishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring."
      onRetry={onRetry}
    />
  );
}
