// Custom hook for authentication persistence
import { useRouter } from 'expo-router';
import { User as FirebaseUser, getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { logout, setLoading, setUser } from '../redux/userSlice';
import {
    clearAuthData,
    createAuthData,
    getStoredAuthData,
    storeAuthData
} from '../services/authStorageSimple';
import { db, waitForAuth } from '../services/firebaseSimple';
import { User } from '../types';

export interface AuthPersistenceState {
  isInitializing: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

/**
 * Custom hook that handles authentication persistence
 * Automatically checks for stored auth data on app launch
 * Manages Firebase auth state changes
 */
export const useAuthPersistence = (): AuthPersistenceState => {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authState, setAuthState] = useState<AuthPersistenceState>({
    isInitializing: true,
    isAuthenticated: false,
    user: null
  });

  // Removed problematic useSelector that was causing runtime errors

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        dispatch(setLoading(true));

        // Ensure Firebase Auth is properly initialized before proceeding
        console.log('🔐 Ensuring Firebase Auth is initialized...');
        const authInstance = await waitForAuth(15000); // 15 second timeout
        console.log('✅ Firebase Auth is ready and initialized');

        // First, check for stored authentication data
        const storedAuthData = await getStoredAuthData();

        if (storedAuthData) {
          console.log('✅ Found stored auth data, auto-signing in...');

          // Set user in Redux store
          dispatch(setUser(storedAuthData.user));

          if (isMounted) {
            setAuthState({
              isInitializing: false,
              isAuthenticated: true,
              user: storedAuthData.user
            });
          }

          console.log('🎉 Auto-sign in successful!');
        } else {
          console.log('📭 No stored auth data found');

          if (isMounted) {
            setAuthState({
              isInitializing: false,
              isAuthenticated: false,
              user: null
            });
          }
        }

        // Set up Firebase auth state listener with the initialized auth instance
        console.log('👂 Setting up Firebase auth state listener...');

        // Check if auth instance is available
        if (!authInstance) {
          console.warn('⚠️ Auth instance is null, skipping Firebase auth state listener setup');
          // Continue without Firebase auth state listener - use stored auth only
          return null;
        }

        const unsubscribeAuth = onAuthStateChanged(authInstance, async (firebaseUser: FirebaseUser | null) => {
          if (!isMounted) return;

          try {
            if (firebaseUser) {
              console.log('🔥 Firebase user detected:', firebaseUser.uid);

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

              // Store auth data securely
              const authData = createAuthData(user, await firebaseUser.getIdToken());
              await storeAuthData(authData);

              // Update Redux store
              dispatch(setUser(user));

              // Track user authentication in Analytics
              trackUserAuth(user.id, firebaseUser.phoneNumber ? 'phone' : 'email');
              setUserAnalyticsProperties({
                user_id: user.id,
                phone_number: user.phoneNumber,
                display_name: user.displayName,
                has_avatar: !!user.avatar,
                signup_method: firebaseUser.phoneNumber ? 'phone' : 'email',
              });

              setAuthState({
                isInitializing: false,
                isAuthenticated: true,
                user: user
              });

              console.log('✅ Firebase auth state updated and stored');
            } else {
              console.log('🚪 Firebase user signed out');

              // Clear stored data
              await clearAuthData();
              dispatch(logout());

              setAuthState({
                isInitializing: false,
                isAuthenticated: false,
                user: null
              });
            }
          } catch (error) {
            console.error('❌ Error handling Firebase auth state change:', error);

            await clearAuthData();
            dispatch(logout());

            setAuthState({
              isInitializing: false,
              isAuthenticated: false,
              user: null
            });
          }
        });

        // Store the unsubscribe function for cleanup
        return unsubscribeAuth;

      } catch (error) {
        console.error('❌ Error during auth initialization:', error);

        // Clear potentially corrupted data
        await clearAuthData();
        dispatch(logout());

        if (isMounted) {
          setAuthState({
            isInitializing: false,
            isAuthenticated: false,
            user: null
          });
        }

        return null;
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          dispatch(setLoading(false));
        }
      }
    };

    // Initialize authentication and get unsubscribe function
    let unsubscribeAuth: (() => void) | null = null;

    initializeAuth().then((unsubscribe) => {
      if (unsubscribe && isMounted) {
        unsubscribeAuth = unsubscribe;
        console.log('✅ Auth state listener set up successfully');
      }
    }).catch((error) => {
      console.error('💥 Failed to initialize auth:', error);
    });

    // Cleanup function
    return () => {
      isMounted = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
        console.log('🧹 Auth state listener cleaned up');
      }
    };
  }, [dispatch]);

  return authState;
};

/**
 * Helper function to manually trigger logout
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  return async () => {
    try {
      console.log('🚪 Profile: Starting logout process...');

      // Update Redux store first to immediately update UI
      dispatch(logout());

      // Get the auth instance safely
      const authInstance = getAuth(); // Use the auth instance directly

      // Sign out from Firebase if auth instance is available
      if (authInstance && authInstance.signOut) {
        await authInstance.signOut();
        console.log('✅ Firebase signout successful');
      } else {
        console.warn('⚠️ Auth instance not available, skipping Firebase signout');
      }

      // Clear stored data
      await clearAuthData();

      // Force navigation to welcome screen
      console.log('🔄 Navigating to welcome screen...');

      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        router.dismissAll();
        router.replace('/welcome');
        console.log('✅ Logout successful - redirected to welcome page');
      }, 100);

    } catch (error) {
      console.error('❌ Error during logout:', error);

      // Force logout even if Firebase signout fails
      dispatch(logout());
      await clearAuthData();

      // Navigate to welcome screen even if logout had errors
      console.log('🔄 Force navigating to welcome screen...');
      setTimeout(() => {
        router.dismissAll();
        router.replace('/welcome');
        console.log('✅ Force logout completed - redirected to welcome page');
      }, 100);
    }
  };
};
