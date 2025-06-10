// Simple Authentication Storage Service (Web-Compatible)
import { User } from '../types';

// Storage keys
const AUTH_TOKEN_KEY = 'iraChat_auth_token';
const AUTH_STATE_KEY = 'iraChat_auth_state';
const FIRST_LAUNCH_KEY = 'iraChat_first_launch';

export interface StoredAuthData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

// Simple storage abstraction that works in web environments
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    console.log(`💾 Storing: ${key}`);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      console.log(`✅ Stored in localStorage: ${key}`);
    } else {
      // Fallback to in-memory storage for testing
      if (!global.memoryStorage) {
        global.memoryStorage = new Map();
      }
      global.memoryStorage.set(key, value);
      console.log(`✅ Stored in memory: ${key}`);
    }
  },

  async getItem(key: string): Promise<string | null> {
    console.log(`🔍 Retrieving: ${key}`);
    
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key);
      console.log(`📖 Retrieved from localStorage: ${key} = ${value ? 'Found' : 'Not found'}`);
      return value;
    } else {
      // Fallback to in-memory storage
      if (!global.memoryStorage) {
        global.memoryStorage = new Map();
      }
      const value = global.memoryStorage.get(key) || null;
      console.log(`📖 Retrieved from memory: ${key} = ${value ? 'Found' : 'Not found'}`);
      return value;
    }
  },

  async removeItem(key: string): Promise<void> {
    console.log(`🗑️ Removing: ${key}`);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      console.log(`✅ Removed from localStorage: ${key}`);
    } else {
      // Fallback to in-memory storage
      if (global.memoryStorage) {
        global.memoryStorage.delete(key);
      }
      console.log(`✅ Removed from memory: ${key}`);
    }
  }
};

/**
 * Securely store authentication data
 */
export const storeAuthData = async (authData: StoredAuthData): Promise<void> => {
  try {
    console.log('🔐 Storing auth data...');
    
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

    // Debug log to see what's actually stored
    console.log('🔍 Retrieved auth data user:', authData.user);
    console.log('🔍 Retrieved username specifically:', authData.user?.username);

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
 * Clear all stored authentication data (logout)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing stored auth data...');

    await storage.removeItem(AUTH_TOKEN_KEY);
    await storage.removeItem(AUTH_STATE_KEY);

    // Clear all possible memory caches
    if (typeof global !== 'undefined') {
      // Clear auth cache
      if ((global as any).__authCache) {
        delete (global as any).__authCache;
      }

      // Clear memory storage completely
      if (global.memoryStorage) {
        global.memoryStorage.clear();
        console.log('🧹 Cleared global memory storage');
      }
    }

    console.log('✅ Auth data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    // Don't throw error here as we want logout to succeed even if clearing fails
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
 * Check if this is the user's first time launching the app
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking if this is first launch...');
    const hasLaunchedBefore = await storage.getItem(FIRST_LAUNCH_KEY);
    const isFirst = hasLaunchedBefore !== 'true';
    console.log(`📱 First launch check: ${isFirst ? 'YES - New user' : 'NO - Returning user'}`);
    return isFirst;
  } catch (error) {
    console.error('❌ Error checking first launch:', error);
    return true; // Default to first launch if we can't check
  }
};

/**
 * Mark that the app has been launched (user has seen welcome screen)
 */
export const markAppLaunched = async (): Promise<void> => {
  try {
    console.log('📝 Marking app as launched...');
    await storage.setItem(FIRST_LAUNCH_KEY, 'true');
    console.log('✅ App marked as launched');
  } catch (error) {
    console.error('❌ Error marking app as launched:', error);
  }
};

/**
 * Reset first launch flag (for testing purposes)
 */
export const resetFirstLaunch = async (): Promise<void> => {
  try {
    console.log('🔄 Resetting first launch flag...');
    await storage.removeItem(FIRST_LAUNCH_KEY);
    console.log('✅ First launch flag reset');
  } catch (error) {
    console.error('❌ Error resetting first launch flag:', error);
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

// Declare global for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var memoryStorage: Map<string, string> | undefined;
}
