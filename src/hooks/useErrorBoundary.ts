import { useCallback, useEffect, useState } from 'react';
import { useAnalytics } from './useAnalytics';

interface ErrorInfo {
  error: Error;
  componentStack: string;
  timestamp: number;
}

interface UseErrorBoundaryProps {
  currentUserId?: string;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}

export const useErrorBoundary = ({ currentUserId, onError, fallback }: UseErrorBoundaryProps = {}) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const { trackError } = useAnalytics({ currentUserId, onError });

  const handleError = useCallback((error: Error, componentStack: string = '') => {
    const errorInfo: ErrorInfo = {
      error,
      componentStack,
      timestamp: Date.now(),
    };

    setError(error);
    setErrorInfo(errorInfo);

    if (currentUserId) {
      trackError(error, componentStack);
    }
    onError?.(error);
  }, [onError, trackError, currentUserId]);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  useEffect(() => {
    // Only set up global error handlers on web platform
    if (typeof window !== 'undefined') {
      const handleGlobalError = (event: ErrorEvent) => {
        handleError(event.error, event.error?.stack || '');
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        handleError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          event.reason?.stack || ''
        );
      };

      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [handleError]);

  return {
    error,
    errorInfo,
    handleError,
    resetError,
    fallback,
  };
}; 