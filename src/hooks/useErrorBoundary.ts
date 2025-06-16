import { useCallback, useEffect, useState } from "react";
import { useAnalytics } from "./useAnalytics";

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

export const useErrorBoundary = ({
  currentUserId,
  onError,
  fallback,
}: UseErrorBoundaryProps = {}) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const { trackError } = useAnalytics({ currentUserId, onError });

  const handleError = useCallback(
    (error: Error, componentStack: string = "") => {
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
    },
    [onError, trackError, currentUserId],
  );

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  // Mobile-only error handling - no web platform support needed
  useEffect(() => {
    // Mobile error handling is managed by React Native's built-in error boundaries
    // and the ErrorBoundary component. No additional global handlers needed.
  }, [handleError]);

  return {
    error,
    errorInfo,
    handleError,
    resetError,
    fallback,
  };
};
