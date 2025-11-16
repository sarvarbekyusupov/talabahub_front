interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} />
      ))}
    </div>
  );
}

// Specialized skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <Skeleton variant="rectangular" height="200px" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
      <div className="flex items-start gap-4">
        <Skeleton variant="rectangular" width="96px" height="96px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height="24px" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {Array.from({ length: columns }).map((_, index) => (
              <th key={`header-${index}`} className="text-left py-3 px-4">
                <Skeleton variant="text" width="80%" height="20px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="border-b border-gray-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={`cell-${rowIndex}-${colIndex}`} className="py-3 px-4">
                  <Skeleton variant="text" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
      <Skeleton variant="text" width="60%" height="32px" className="mb-2" />
      <Skeleton variant="text" width="50%" height="14px" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Skeleton variant="text" width="33%" height="24px" className="mb-4" />
          <ListSkeleton count={3} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Skeleton variant="text" width="33%" height="24px" className="mb-4" />
          <ListSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {[...Array(4)].map((_, index) => (
        <div key={index}>
          <Skeleton variant="text" width="25%" height="16px" className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton variant="rectangular" width="120px" height="44px" />
        <Skeleton variant="rectangular" width="120px" height="44px" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="200px" height="32px" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="80px" height="36px" />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Skeleton variant="text" width="40%" height="24px" className="mb-6" />
          <Skeleton variant="rectangular" width="100%" height="300px" />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Skeleton variant="text" width="40%" height="24px" className="mb-6" />
          <Skeleton variant="rectangular" width="100%" height="300px" />
        </div>
      </div>
    </div>
  );
}
