export enum ErrorType {
  INITIALIZATION_ERROR = "initialization_error",
  CONFIGURATION_ERROR = "configuration_error",
  NETWORK_ERROR = "network_error",
  AUTHENTICATION_ERROR = "authentication_error",
  VALIDATION_ERROR = "validation_error",
  RENDER_ERROR = "render_error",
  API_ERROR = "api_error",
  UNKNOWN_ERROR = "unknown_error",
}

export interface SDKError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  embedId?: string;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorHistory: SDKError[] = [];
  private maxHistorySize = 50;
  private errorListeners: Set<(error: SDKError) => void> = new Set();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle and log errors
  handleError(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      details?: any;
      embedId?: string;
      originalError?: Error;
      apiKey?: string;
      brandId?: number;
    } = {}
  ): SDKError {
    const error: SDKError = {
      type,
      message,
      code: options.code,
      details: options.details,
      timestamp: Date.now(),
      embedId: options.embedId,
      stack: options.originalError?.stack,
    };

    // Add to history
    this.addToHistory(error);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Genuin SDK Error:", error);
      if (options.originalError) {
        console.error("Original Error:", options.originalError);
      }
    }

    // Notify listeners
    this.notifyListeners(error);

    // Emit event for external handling
    // Note: Event emission will be handled by the SDK main class to avoid circular dependencies

    return error;
  }

  // Subscribe to error events
  onError(listener: (error: SDKError) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  // Get error history
  getErrors(type?: ErrorType): SDKError[] {
    if (type) {
      return this.errorHistory.filter((error) => error.type === type);
    }
    return [...this.errorHistory];
  }

  // Clear error history
  clearErrors(): void {
    this.errorHistory = [];
  }

  // Get the last error
  getLastError(): SDKError | null {
    if (this.errorHistory.length === 0) {
      return null;
    }
    const lastError = this.errorHistory[this.errorHistory.length - 1];
    return lastError ?? null;
  }

  // Check if there are any errors of a specific type
  hasErrors(type?: ErrorType): boolean {
    if (type) {
      return this.errorHistory.some((error) => error.type === type);
    }
    return this.errorHistory.length > 0;
  }

  private addToHistory(error: SDKError): void {
    this.errorHistory.push(error);

    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  private notifyListeners(error: SDKError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error("Error in error listener:", err);
      }
    });
  }

  // Utility methods for common error types
  static initializationError(message: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.INITIALIZATION_ERROR, message, { details });
  }

  static configurationError(message: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.CONFIGURATION_ERROR, message, { details });
  }

  static networkError(message: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.NETWORK_ERROR, message, { details });
  }

  static authenticationError(message: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.AUTHENTICATION_ERROR, message, { details });
  }

  static validationError(message: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.VALIDATION_ERROR, message, { details });
  }

  static renderError(message: string, embedId?: string, originalError?: Error): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.RENDER_ERROR, message, { embedId, originalError });
  }

  static apiError(message: string, code?: string, details?: any): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.API_ERROR, message, { code, details });
  }

  static unknownError(message: string, originalError?: Error): SDKError {
    return ErrorHandler.getInstance().handleError(ErrorType.UNKNOWN_ERROR, message, { originalError });
  }
}
