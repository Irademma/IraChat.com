import { Alert, Animated, Platform, ToastAndroid } from 'react-native';
import { shake } from './animations';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'error' | 'warning' | 'info' = 'error'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (
  error: Error | AppError,
  shakeAnimation?: Animated.Value
) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    switch (error.severity) {
      case 'error':
        if (Platform.OS === 'android') {
          ToastAndroid.show(error.message, ToastAndroid.LONG);
        } else {
          Alert.alert('Error', error.message);
        }
        if (shakeAnimation) {
          shake(shakeAnimation).start();
        }
        break;
      case 'warning':
        if (Platform.OS === 'android') {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
          Alert.alert('Warning', error.message);
        }
        break;
      case 'info':
        if (Platform.OS === 'android') {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
          Alert.alert('Info', error.message);
        }
        break;
    }
  } else {
    // Handle unexpected errors
    const message = 'An unexpected error occurred. Please try again.';
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
    if (shakeAnimation) {
      shake(shakeAnimation).start();
    }
  }
};

export const createErrorBoundary = (error: Error) => {
  return new AppError(
    error.message || 'An unexpected error occurred',
    'UNEXPECTED_ERROR'
  );
};

export const validateGroupAction = (
  action: string,
  isAdmin: boolean,
  isBlocked: boolean
) => {
  if (isBlocked) {
    throw new AppError(
      'You are blocked from performing actions in this group',
      'BLOCKED_USER'
    );
  }

  if (!isAdmin && ['lock', 'unlock', 'block', 'unblock', 'deleteMessage'].includes(action)) {
    throw new AppError(
      'Only group admins can perform this action',
      'PERMISSION_DENIED'
    );
  }
};

export const validateMessage = (message: string) => {
  if (!message.trim()) {
    throw new AppError('Message cannot be empty', 'EMPTY_MESSAGE', 'warning');
  }

  if (message.length > 10000) {
    throw new AppError(
      'Message is too long. Maximum length is 10,000 characters',
      'MESSAGE_TOO_LONG',
      'warning'
    );
  }
};

export const validateMediaUpload = (file: any) => {
  if (!file) {
    throw new AppError('No file selected', 'NO_FILE', 'warning');
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new AppError(
      'File is too large. Maximum size is 100MB',
      'FILE_TOO_LARGE',
      'warning'
    );
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    throw new AppError(
      'Invalid file type. Allowed types: JPEG, PNG, GIF, MP4',
      'INVALID_FILE_TYPE',
      'warning'
    );
  }
};

export const validateGroupInvite = (inviteCode: string) => {
  if (!inviteCode) {
    throw new AppError('Invalid invite code', 'INVALID_INVITE', 'warning');
  }

  if (inviteCode.length !== 8) {
    throw new AppError('Invalid invite code format', 'INVALID_INVITE_FORMAT', 'warning');
  }
};

export const handleNetworkError = (error: Error) => {
  if (error.message.includes('network')) {
    throw new AppError(
      'Network error. Please check your connection and try again',
      'NETWORK_ERROR'
    );
  }
  throw error;
};

export const handleAuthError = (error: Error) => {
  if (error.message.includes('auth')) {
    throw new AppError(
      'Authentication error. Please log in again',
      'AUTH_ERROR'
    );
  }
  throw error;
};

export const handleStorageError = (error: Error) => {
  if (error.message.includes('storage')) {
    throw new AppError(
      'Storage error. Please try again or contact support',
      'STORAGE_ERROR'
    );
  }
  throw error;
}; 