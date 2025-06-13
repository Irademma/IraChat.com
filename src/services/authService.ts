// Cross-Platform Authentication Service
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { User } from '../types';
import {
    isAuthenticated as checkStoredAuth,
    clearAuthData,
    createAuthData,
    getStoredAuthData,
    storeAuthData
} from './authStorageSimple';
import {
    db,
    getAuthInstance,
    getCurrentUserSafely,
    getPlatformInfo,
    isAuthReady
} from './firebaseSimple';

console.log('🔐 Cross-Platform Auth Service initialized for:', Platform.OS);

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * Cross-platform user authentication check
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const platformInfo = getPlatformInfo();
    console.log('🔍 Cross-platform auth check:', platformInfo);

    // Check stored auth data first (most reliable across all platforms)
    const storedAuth = await checkStoredAuth();

    // Check Firebase auth state safely
    const firebaseUser = await getCurrentUserSafely();

    console.log('🔍 Auth status:', {
      platform: Platform.OS,
      firebaseUser: !!firebaseUser,
      storedAuth,
      authReady: isAuthReady()
    });

    return firebaseUser !== null || storedAuth;
  } catch (error) {
    console.error(`❌ Error checking auth state on ${Platform.OS}:`, error);
    // Fallback to stored auth only
    try {
      const fallbackAuth = await checkStoredAuth();
      console.log(`🔄 Fallback auth check on ${Platform.OS}:`, fallbackAuth);
      return fallbackAuth;
    } catch (fallbackError) {
      console.error(`❌ Fallback auth check failed on ${Platform.OS}:`, fallbackError);
      return false;
    }
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First try to get from stored auth data (most reliable)
    const storedAuthData = await getStoredAuthData();
    if (storedAuthData) {
      console.log('✅ Retrieved user from stored auth data');
      return storedAuthData.user;
    }

    // Fallback to Firebase user if available
    const firebaseUser = await getCurrentUserSafely();

    if (firebaseUser) {
      console.log('🔥 Retrieved user from Firebase auth');

      try {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const user: User = {
          id: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || userData.name || '',
          name: userData.name || '',
          username: userData.username || '',
          avatar: userData.avatar || '',
          status: userData.status || userData.bio || 'I Love IraChat',
          isOnline: true,
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0,
          likesCount: userData.likesCount || 0,
        };

        // Store this user data for future use
        const authData = createAuthData(user, await firebaseUser.getIdToken());
        await storeAuthData(authData);

        return user;
      } catch (firestoreError) {
        console.error('❌ Error fetching user data from Firestore:', firestoreError);
        // Return basic user data without Firestore data
        const user: User = {
          id: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || '',
          name: firebaseUser.displayName || '',
          username: '',
          avatar: '',
          status: 'I Love IraChat',
          bio: 'I Love IraChat',
          isOnline: true,
          followersCount: 0,
          followingCount: 0,
          likesCount: 0,
        };
        return user;
      }
    }

    console.log('📭 No authenticated user found');
    return null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

/**
 * Create a new user account (development mode)
 */
export const createUserAccount = async (userData: {
  name: string;
  username: string;
  phoneNumber: string;
  bio?: string;
  avatar?: string;
}): Promise<AuthResult> => {
  try {
    console.log('🚀 Creating new user account...');
    console.log('📝 User data:', {
      name: userData.name,
      username: userData.username,
      phoneNumber: userData.phoneNumber
    });

    // Validate input data
    if (!userData.name || !userData.name.trim()) {
      throw new Error('Name is required');
    }
    if (!userData.username || !userData.username.trim()) {
      throw new Error('Username is required');
    }
    if (!userData.phoneNumber || !userData.phoneNumber.trim()) {
      throw new Error('Phone number is required');
    }

    // 🔒 SECURITY: Check if phone number already exists
    console.log('🔍 Checking phone number uniqueness...');
    try {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const phoneQuery = query(
        collection(db, 'users'),
        where('phoneNumber', '==', userData.phoneNumber)
      );
      const existingUsers = await getDocs(phoneQuery);

      if (!existingUsers.empty) {
        console.log('❌ Phone number already exists:', userData.phoneNumber);
        throw new Error('This phone number is already registered. Each phone number can only have one account for security reasons.');
      }
      console.log('✅ Phone number is unique');
    } catch (phoneCheckError: any) {
      if (phoneCheckError.message.includes('already registered')) {
        throw phoneCheckError; // Re-throw our custom error
      }
      console.warn('⚠️ Could not verify phone uniqueness (continuing anyway):', phoneCheckError);
      // Continue with account creation if Firestore is not available
    }

    // 🔒 SECURITY: Check if username already exists
    console.log('🔍 Checking username uniqueness...');
    try {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '==', userData.username.trim())
      );
      const existingUsernames = await getDocs(usernameQuery);

      if (!existingUsernames.empty) {
        console.log('❌ Username already exists:', userData.username);
        throw new Error('This username is already taken. Please choose a different username.');
      }
      console.log('✅ Username is unique');
    } catch (usernameCheckError: any) {
      if (usernameCheckError.message.includes('already taken')) {
        throw usernameCheckError; // Re-throw our custom error
      }
      console.warn('⚠️ Could not verify username uniqueness (continuing anyway):', usernameCheckError);
      // Continue with account creation if Firestore is not available
    }

    // Debug the username before creating user object
    console.log('🔍 Username from userData:', userData.username);
    console.log('🔍 Username trimmed:', userData.username.trim());

    // Create user object
    const newUser: User = {
      id: `user_${Date.now()}`,
      phoneNumber: userData.phoneNumber,
      displayName: userData.name.trim(),
      name: userData.name.trim(),
      username: userData.username.trim(),
      avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.username}`,
      status: userData.bio?.trim() || 'I Love IraChat',
      bio: userData.bio?.trim() || 'I Love IraChat',
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    // Debug the username after creating user object
    console.log('🔍 Username in newUser object:', newUser.username);

    console.log('👤 Created user object:', newUser);
    console.log('🔍 Username specifically:', newUser.username);

    // Store auth data securely
    console.log('💾 Storing auth data...');
    const authData = createAuthData(newUser);
    await storeAuthData(authData);

    console.log('✅ User account created successfully');

    return {
      success: true,
      message: 'Account created successfully!',
      user: newUser
    };
  } catch (error: any) {
    console.error('❌ Error creating user account:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    return {
      success: false,
      message: error.message || 'Failed to create account. Please try again.'
    };
  }
};

/**
 * Sign in user with Firebase (when Firebase auth is used)
 */
export const signInUser = async (firebaseUser: any): Promise<AuthResult> => {
  try {
    console.log('🔥 Signing in Firebase user...');

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const user: User = {
      id: firebaseUser.uid,
      phoneNumber: firebaseUser.phoneNumber || '',
      displayName: firebaseUser.displayName || userData.name || '',
      name: userData.name || '',
      username: userData.username || '',
      avatar: userData.avatar || '',
      status: userData.status || userData.bio || 'I Love IraChat',
      bio: userData.bio || 'I Love IraChat',
      isOnline: true,
      followersCount: userData.followersCount || 0,
      followingCount: userData.followingCount || 0,
      likesCount: userData.likesCount || 0,
    };

    // Update user's last login in Firestore
    await setDoc(doc(db, 'users', user.id), {
      lastLoginAt: new Date(),
      isOnline: true,
    }, { merge: true });

    // Store auth data securely
    const authData = createAuthData(user, await firebaseUser.getIdToken());
    await storeAuthData(authData);

    console.log('✅ User signed in successfully');
    
    return {
      success: true,
      message: 'Signed in successfully!',
      user: user
    };
  } catch (error) {
    console.error('❌ Error signing in user:', error);
    return {
      success: false,
      message: 'Failed to sign in. Please try again.'
    };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<AuthResult> => {
  try {
    console.log('🚪 Signing out user...');

    // Get current user before signing out
    const currentUser = await getCurrentUser();

    // Sign out from Firebase if authenticated
    try {
      const firebaseUser = await getCurrentUserSafely();
      if (firebaseUser) {
        const authInstance = getAuthInstance();
        if (authInstance) {
          await signOut(authInstance);
          console.log('🔥 Signed out from Firebase');
        } else {
          console.warn('⚠️ Auth instance not available for signout');
        }
      }
    } catch (authError) {
      console.warn('⚠️ Firebase auth not available for signout, continuing with local logout:', authError);
    }

    // Update user's online status in Firestore
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.id), {
          isOnline: false,
          lastSeenAt: new Date(),
        }, { merge: true });
        console.log('📱 Updated user offline status');
      } catch (error) {
        console.error('⚠️ Failed to update offline status:', error);
        // Don't fail the logout for this
      }
    }

    // Clear stored auth data
    await clearAuthData();

    console.log('✅ User signed out successfully');
    
    return {
      success: true,
      message: 'Signed out successfully!'
    };
  } catch (error) {
    console.error('❌ Error signing out user:', error);
    
    // Force clear stored data even if Firebase signout fails
    await clearAuthData();
    
    return {
      success: false,
      message: 'Logout completed with some errors.'
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: Partial<User>): Promise<AuthResult> => {
  try {
    console.log('🔄 Updating user profile...');

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const updatedUser: User = { ...currentUser, ...updates };

    // Update in Firestore if user exists there
    try {
      await setDoc(doc(db, 'users', currentUser.id), updates, { merge: true });
      console.log('🔥 Updated user in Firestore');
    } catch (error) {
      console.error('⚠️ Failed to update Firestore:', error);
      // Continue with local update
    }

    // Update stored auth data
    const authData = createAuthData(updatedUser);
    await storeAuthData(authData);

    console.log('✅ User profile updated successfully');
    
    return {
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return {
      success: false,
      message: 'Failed to update profile. Please try again.'
    };
  }
};
