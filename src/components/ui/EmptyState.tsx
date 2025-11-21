'use client';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'search' | 'database' | 'filter';
  actionLabel?: string;
  actionText?: string; // Alias for actionLabel
  onAction?: () => void;
  showAction?: boolean;
}

export function EmptyState({
  title = 'Hech narsa topilmadi',
  message = 'Hech qanday ma\'lumot topilmadi',
  icon = 'database',
  actionLabel,
  actionText,
  onAction,
  showAction = true,
}: EmptyStateProps) {
  const buttonLabel = actionText || actionLabel || 'Filtrlarni tozalash';
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return (
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      case 'filter':
        return (
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        {getIcon()}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {showAction && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Specialized empty states
export function NoSearchResults({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="Qidiruv natijalari topilmadi"
      message="Qidiruv so'rovi bo'yicha hech narsa topilmadi. Boshqa kalit so'zlar bilan qidiring yoki filtrlarni tozalang."
      actionLabel="Qidiruvni tozalash"
      onAction={onClearSearch}
    />
  );
}

export function NoFilterResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon="filter"
      title="Filtr natijalari topilmadi"
      message="Tanlangan filtrlar bo'yicha hech narsa topilmadi. Filtrlarni o'zgartiring yoki tozalang."
      actionLabel="Filtrlarni tozalash"
      onAction={onClearFilters}
    />
  );
}

export function NoData({ message }: { message?: string }) {
  return (
    <EmptyState
      icon="database"
      title="Ma'lumotlar yo'q"
      message={message || "Hozircha hech qanday ma'lumot yo'q. Yangi ma'lumot qo'shing."}
      showAction={false}
    />
  );
}
