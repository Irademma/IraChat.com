// Comprehensive Error Handling Service
import { Alert } from "react-native";

interface ErrorLog {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  userId?: string;
  stackTrace?: string;
}

class ErrorHandlingService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Handle and log errors with context
   */
  handleError(error: Error, context: string, userId?: string): void {
    console.error(`❌ [${context}] Error:`, error.message);
    console.error(`❌ [${context}] Stack:`, error.stack);

    // Create error log
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      error,
      context,
      userId,
      stackTrace: error.stack,
    };

    // Add to logs (keep only last 100)
    this.errorLogs.push(errorLog);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift();
    }

    // Show user-friendly error message
    this.showUserError(error, context);
  }

  /**
   * Show user-friendly error messages
   */
  private showUserError(error: Error, context: string): void {
    let userMessage = "Something went wrong. Please try again.";
    let title = "Error";

    // Customize messages based on context
    switch (context) {
      case "FIREBASE_CONNECTION":
        title = "Connection Error";
        userMessage = "Unable to connect to server. Please check your internet connection.";
        break;
      case "CONTACTS_PERMISSION":
        title = "Permission Required";
        userMessage = "Please allow access to contacts to use this feature.";
        break;
      case "CAMERA_PERMISSION":
        title = "Camera Permission";
        userMessage = "Please allow camera access to take photos.";
        break;
      case "MEDIA_UPLOAD":
        title = "Upload Failed";
        userMessage = "Failed to upload media. Please try again.";
        break;
      case "MESSAGE_SEND":
        title = "Message Failed";
        userMessage = "Failed to send message. Please check your connection.";
        break;
      case "CALL_FAILED":
        title = "Call Failed";
        userMessage = "Unable to make call. Please try again.";
        break;
      case "REGISTRATION":
        title = "Registration Error";
        userMessage = "Failed to create account. Please try again.";
        break;
      case "LOGIN":
        title = "Login Error";
        userMessage = "Failed to sign in. Please check your credentials.";
        break;
      default:
        // Use error message if it's user-friendly
        if (error.message && error.message.length < 100) {
          userMessage = error.message;
        }
    }

    // Show alert to user
    Alert.alert(title, userMessage, [{ text: "OK" }]);
  }

  /**
   * Wrap async functions with error handling
   */
  async wrapAsync<T>(
    asyncFn: () => Promise<T>,
    context: string,
    userId?: string
  ): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error as Error, context, userId);
      return null;
    }
  }

  /**
   * Wrap sync functions with error handling
   */
  wrapSync<T>(
    syncFn: () => T,
    context: string,
    userId?: string
  ): T | null {
    try {
      return syncFn();
    } catch (error) {
      this.handleError(error as Error, context, userId);
      return null;
    }
  }

  /**
   * Safe property access to prevent undefined errors
   */
  safeAccess<T>(obj: any, path: string, defaultValue: T): T {
    try {
      const keys = path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current == null || typeof current !== 'object') {
          return defaultValue;
        }
        current = current[key];
      }
      
      return current !== undefined ? current : defaultValue;
    } catch (error) {
      console.warn(`⚠️ Safe access failed for path: ${path}`, error);
      return defaultValue;
    }
  }

  /**
   * Validate required fields
   */
  validateRequired(data: Record<string, any>, requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        throw new Error(`${field} is required`);
      }
    }
    return true;
  }

  /**
   * Safe Firebase operation wrapper
   */
  async safeFirebaseOperation<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        console.error(`🚨 Firebase permission denied in ${context}`);
        Alert.alert(
          "Permission Error",
          "You don't have permission to perform this action. Please contact support."
        );
      } else if (error.code === 'unavailable') {
        console.error(`🚨 Firebase unavailable in ${context}`);
        Alert.alert(
          "Service Unavailable",
          "Service is temporarily unavailable. Please try again later."
        );
      } else if (error.code === 'unauthenticated') {
        console.error(`🚨 Firebase unauthenticated in ${context}`);
        Alert.alert(
          "Authentication Required",
          "Please sign in to continue."
        );
      } else {
        this.handleError(error, `FIREBASE_${context}`);
      }
      
      return fallbackValue || null;
    }
  }

  /**
   * Get error logs for debugging
   */
  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Check if error is network related
   */
  isNetworkError(error: Error): boolean {
    const networkKeywords = ['network', 'connection', 'timeout', 'offline', 'fetch'];
    const errorMessage = error.message.toLowerCase();
    return networkKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.handleError(error as Error, 'RETRY_FAILED');
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`🔄 Retrying operation (attempt ${attempt + 1}/${maxRetries})`);
      }
    }
    
    return null;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlingService();

// Export types
export type { ErrorLog };

// Utility functions for common error patterns
export const safeAsync = errorHandler.wrapAsync.bind(errorHandler);
export const safeSync = errorHandler.wrapSync.bind(errorHandler);
export const safeAccess = errorHandler.safeAccess.bind(errorHandler);
export const validateRequired = errorHandler.validateRequired.bind(errorHandler);
export const safeFirebaseOp = errorHandler.safeFirebaseOperation.bind(errorHandler);
