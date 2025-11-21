'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  onExpire?: () => void;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onExpire,
  className = '',
  showLabels = true,
  size = 'md',
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        Muddati tugagan
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const boxSizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const labelSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Compact display for less than 1 day
  if (timeLeft.days === 0) {
    return (
      <div className={`flex items-center gap-1 ${sizeClasses[size]} font-mono font-bold ${className}`}>
        <span className="text-orange-600">
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        {showLabels && <span className="text-gray-500 font-normal text-sm ml-1">qoldi</span>}
      </div>
    );
  }

  // Full display with boxes
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className={`${boxSizeClasses[size]} bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold`}>
            {timeLeft.days}
          </div>
          {showLabels && <div className={`${labelSizeClasses[size]} text-gray-500 mt-1`}>kun</div>}
        </div>
      )}
      <div className="text-center">
        <div className={`${boxSizeClasses[size]} bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold`}>
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        {showLabels && <div className={`${labelSizeClasses[size]} text-gray-500 mt-1`}>soat</div>}
      </div>
      <div className="text-orange-400 font-bold">:</div>
      <div className="text-center">
        <div className={`${boxSizeClasses[size]} bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold`}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        {showLabels && <div className={`${labelSizeClasses[size]} text-gray-500 mt-1`}>daq</div>}
      </div>
      <div className="text-orange-400 font-bold">:</div>
      <div className="text-center">
        <div className={`${boxSizeClasses[size]} bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        {showLabels && <div className={`${labelSizeClasses[size]} text-gray-500 mt-1`}>son</div>}
      </div>
    </div>
  );
};
