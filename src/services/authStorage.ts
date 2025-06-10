// DEPRECATED - DO NOT USE - USE authStorageSimple.ts INSTEAD
// This file is disabled to prevent conflicts with the new storage system
throw new Error('❌ authStorage.ts is deprecated! Use authStorageSimple.ts instead');

// Secure Authentication Storage Service
import { User } from '../types';

// Try to import storage mechanisms with better error handling
let SecureStore: any;
let AsyncStorage: any;

try {
  SecureStore = require('expo-secure-store');
  // Test if the methods exist
  if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
    console.log('✅ Using expo-secure-store for secure storage');
  } else {
    console.log('⚠️ expo-secure-store methods not available');
    SecureStore = null;
  }
} catch (error: any) {
  console.log('⚠️ expo-secure-store not available:', error?.message || 'Unknown error');
  SecureStore = null;
}

if (!SecureStore) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    console.log('✅ Using AsyncStorage as fallback');
  } catch (asyncError) {
    console.log('⚠️ AsyncStorage not available, using localStorage fallback');
  }
}

// Storage keys
const AUTH_TOKEN_KEY = 'iraChat_auth_token';
const USER_DATA_KEY = 'iraChat_user_data';
const AUTH_STATE_KEY = 'iraChat_auth_state';

export interface StoredAuthData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

// Storage abstraction layer
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    console.log(`🔧 Attempting to store: ${key}`);

    if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
      console.log('📱 Using SecureStore.setItemAsync');
      await SecureStore.setItemAsync(key, value);
    } else if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      console.log('📱 Using AsyncStorage.setItem');
      await AsyncStorage.setItem(key, value);
    } else if (typeof localStorage !== 'undefined') {
      console.log('📱 Using localStorage.setItem');
      localStorage.setItem(key, value);
    } else {
      throw new Error('No storage mechanism available');
    }

    console.log(`✅ Successfully stored: ${key}`);
  },

  async getItem(key: string): Promise<string | null> {
    console.log(`🔍 Attempting to retrieve: ${key}`);

    if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
      console.log('📱 Using SecureStore.getItemAsync');
      return await SecureStore.getItemAsync(key);
    } else if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      console.log('📱 Using AsyncStorage.getItem');
      return await AsyncStorage.getItem(key);
    } else if (typeof localStorage !== 'undefined') {
      console.log('📱 Using localStorage.getItem');
      return localStorage.getItem(key);
    } else {
      throw new Error('No storage mechanism available');
    }
  },

  async removeItem(key: string): Promise<void> {
    console.log(`🗑️ Attempting to remove: ${key}`);

    if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
      console.log('📱 Using SecureStore.deleteItemAsync');
      await SecureStore.deleteItemAsync(key);
    } else if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      console.log('📱 Using AsyncStorage.removeItem');
      await AsyncStorage.removeItem(key);
    } else if (typeof localStorage !== 'undefined') {
      console.log('📱 Using localStorage.removeItem');
      localStorage.removeItem(key);
    } else {
      throw new Error('No storage mechanism available');
    }

    console.log(`✅ Successfully removed: ${key}`);
  }
};

/**
 * Securely store authentication data
 */
export const storeAuthData = async (authData: StoredAuthData): Promise<void> => {
  try {
    console.log('🔐 Storing auth data securely...');

    // Store the complete auth data as JSON
    await storage.setItem(AUTH_TOKEN_KEY, JSON.stringify(authData));

    // Store authentication state flag
    await storage.setItem(AUTH_STATE_KEY, 'true');

    console.log('✅ Auth data stored successfully');
  } catch (error) {
    console.error('❌ Error storing auth data:', error);
    throw new Error(`Failed to store authentication data: ${error}`);
  }
};

/**
 * Retrieve stored authentication data
 */
export const getStoredAuthData = async (): Promise<StoredAuthData | null> => {
  try {
    console.log('🔍 Retrieving stored auth data...');

    const authDataString = await storage.getItem(AUTH_TOKEN_KEY);

    if (!authDataString) {
      console.log('📭 No stored auth data found');
      return null;
    }

    const authData: StoredAuthData = JSON.parse(authDataString);

    // Check if token is expired
    const now = Date.now();
    if (authData.expiresAt && now > authData.expiresAt) {
      console.log('⏰ Stored token has expired');
      await clearAuthData(); // Clean up expired data
      return null;
    }

    console.log('✅ Valid auth data retrieved');
    return authData;
  } catch (error) {
    console.error('❌ Error retrieving auth data:', error);
    await clearAuthData(); // Clean up corrupted data
    return null;
  }
};

/**
 * Check if user is authenticated (has valid stored token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authState = await storage.getItem(AUTH_STATE_KEY);
    const authData = await getStoredAuthData();

    return authState === 'true' && authData !== null;
  } catch (error) {
    console.error('❌ Error checking auth state:', error);
    return false;
  }
};

/**
 * Update stored user data
 */
export const updateStoredUserData = async (userData: Partial<User>): Promise<void> => {
  try {
    const existingAuthData = await getStoredAuthData();
    
    if (!existingAuthData) {
      throw new Error('No existing auth data to update');
    }
    
    const updatedAuthData: StoredAuthData = {
      ...existingAuthData,
      user: { ...existingAuthData.user, ...userData }
    };
    
    await storeAuthData(updatedAuthData);
    console.log('✅ User data updated successfully');
  } catch (error) {
    console.error('❌ Error updating user data:', error);
    throw error;
  }
};

/**
 * Clear all stored authentication data (logout)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing stored auth data...');

    await storage.removeItem(AUTH_TOKEN_KEY);
    await storage.removeItem(AUTH_STATE_KEY);

    console.log('✅ Auth data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    // Don't throw error here as we want logout to succeed even if clearing fails
  }
};

/**
 * Get stored user data only
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const authData = await getStoredAuthData();
    return authData?.user || null;
  } catch (error) {
    console.error('❌ Error getting stored user:', error);
    return null;
  }
};

/**
 * Check if stored token needs refresh (expires within 1 hour)
 */
export const shouldRefreshToken = async (): Promise<boolean> => {
  try {
    const authData = await getStoredAuthData();
    
    if (!authData || !authData.expiresAt) {
      return false;
    }
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    return (authData.expiresAt - now) < oneHour;
  } catch (error) {
    console.error('❌ Error checking token refresh need:', error);
    return false;
  }
};

/**
 * Create auth data object for storage
 */
export const createAuthData = (user: User, token?: string): StoredAuthData => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  return {
    token: token || `mock_token_${user.id}_${now}`,
    expiresAt: now + oneWeek, // Token expires in 1 week
    user: user
  };
};
