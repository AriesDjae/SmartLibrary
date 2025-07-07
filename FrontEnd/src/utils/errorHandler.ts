export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: Error | AppError, context?: string) => {
  console.error(`Error in ${context || 'Unknown context'}:`, error);
  
  // In production, you would send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Sentry, LogRocket)
  }

  return {
    message: error.message,
    statusCode: error instanceof AppError ? error.statusCode : 500,
    timestamp: new Date().toISOString(),
    context
  };
};

export const asyncHandler = (fn: Function) => {
  return (...args: any[]) => {
    Promise.resolve(fn(...args)).catch((error) => {
      handleError(error, fn.name);
    });
  };
}; 