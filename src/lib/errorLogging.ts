/**
 * Error Logging and Monitoring Utilities
 * Centralized error handling and logging
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100;
  private enableConsole: boolean;
  private enableReporting: boolean;

  constructor() {
    this.enableConsole = process.env.NODE_ENV === 'development';
    this.enableReporting = process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true';
  }

  /**
   * Log an error
   */
  log(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      severity,
      timestamp: Date.now(),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Add to logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging in development
    if (this.enableConsole) {
      const consoleMethod = this.getConsoleMethod(severity);
      console[consoleMethod]('[ErrorLogger]', errorLog);
    }

    // Send to error reporting service if enabled
    if (this.enableReporting) {
      this.reportError(errorLog);
    }

    // Store in localStorage for persistence
    this.persistLogs();
  }

  /**
   * Get appropriate console method based on severity
   */
  private getConsoleMethod(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
    }
  }

  /**
   * Report error to external service (Sentry, LogRocket, etc.)
   */
  private async reportError(errorLog: ErrorLog): Promise<void> {
    try {
      // If Sentry DSN is configured, use it
      const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      if (sentryDsn && typeof window !== 'undefined') {
        // Implement Sentry reporting here
        // This is a placeholder for actual Sentry integration
        console.log('Would report to Sentry:', errorLog);
      }

      // Send to custom backend endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        await fetch(`${apiUrl}/errors/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
        }).catch(() => {
          // Silently fail to avoid infinite error loops
        });
      }
    } catch (error) {
      // Silently fail to avoid infinite error loops
      console.error('Failed to report error:', error);
    }
  }

  /**
   * Persist logs to localStorage
   */
  private persistLogs(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('errorLogs', JSON.stringify(this.logs.slice(-50)));
      } catch (error) {
        // Silently fail if localStorage is full or unavailable
      }
    }
  }

  /**
   * Load logs from localStorage
   */
  loadPersistedLogs(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('errorLogs');
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      } catch (error) {
        // Silently fail
      }
    }
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs');
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global error logger instance
const errorLogger = new ErrorLogger();

// Load persisted logs on initialization
if (typeof window !== 'undefined') {
  errorLogger.loadPersistedLogs();
}

/**
 * Log an error
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, any>
): void {
  errorLogger.log(error, severity, context);
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  errorLogger.log(message, ErrorSeverity.MEDIUM, context);
}

/**
 * Log critical error
 */
export function logCritical(error: Error | string, context?: Record<string, any>): void {
  errorLogger.log(error, ErrorSeverity.CRITICAL, context);
}

/**
 * Get the error logger instance
 */
export function getErrorLogger(): ErrorLogger {
  return errorLogger;
}

/**
 * Global error handler
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, ErrorSeverity.HIGH, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      ErrorSeverity.HIGH,
      {
        type: 'unhandledRejection',
      }
    );
  });
}

/**
 * Wrap async function with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        error instanceof Error ? error : String(error),
        ErrorSeverity.HIGH,
        context
      );
      throw error;
    }
  }) as T;
}
