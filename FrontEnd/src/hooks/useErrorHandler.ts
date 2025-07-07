import { useState, useCallback } from 'react';
import { handleError, AppError } from '../utils/errorHandler';

interface ErrorState {
  message: string;
  statusCode: number;
  timestamp: string;
  context?: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await operation();
      return result;
    } catch (err) {
      const errorInfo = handleError(err as Error, context);
      setError(errorInfo);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const throwError = useCallback((message: string, statusCode: number = 500) => {
    const errorInfo = handleError(new AppError(message, statusCode));
    setError(errorInfo);
  }, []);

  return {
    error,
    isLoading,
    clearError,
    handleAsyncOperation,
    throwError
  };
}; 