// Custom hook for authentication persistence
import { useRouter } from "expo-router";
import {
    User as FirebaseUser,
    getAuth,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { logout, setLoading, setUser } from "../redux/userSlice";
import {
    clearAuthData,
    createAuthData,
    getStoredAuthData,
    storeAuthData,
} from "../services/authStorageSimple";
import { db, waitForAuth } from "../services/firebaseSimple";
import { User } from "../types";

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
    user: null,
  });

  // Removed problematic useSelector that was causing runtime errors

  useEffect(() => {
    let isMounted = true;
    let authCheckInterval: any = null;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing authentication...");
        dispatch(setLoading(true));

        // Ensure Firebase Auth is properly initialized before proceeding
        console.log("🔐 Ensuring Firebase Auth is initialized...");
        const authInstance = await waitForAuth(3000); // 3 second timeout (reduced from 15 seconds)
        console.log("✅ Firebase Auth is ready and initialized");

        // First, check for stored authentication data
        const storedAuthData = await getStoredAuthData();

        if (storedAuthData) {
          console.log("✅ Found stored auth data, auto-signing in...");

          // Set user in Redux store
          dispatch(setUser(storedAuthData.user));

          if (isMounted) {
            setAuthState({
              isInitializing: false,
              isAuthenticated: true,
              user: storedAuthData.user,
            });
          }

          console.log("🎉 Auto-sign in successful!");
        } else {
          console.log("📭 No stored auth data found");

          if (isMounted) {
            setAuthState({
              isInitializing: false,
              isAuthenticated: false,
              user: null,
            });
          }
        }

        // Set up Firebase auth state listener with the initialized auth instance
        console.log("👂 Setting up Firebase auth state listener...");

        // Check if auth instance is available
        if (!authInstance) {
          console.warn(
            "⚠️ Auth instance is null, skipping Firebase auth state listener setup",
          );
          // Continue without Firebase auth state listener - use stored auth only
          return null;
        }

        try {
          const unsubscribeAuth = onAuthStateChanged(
            authInstance,
            async (firebaseUser: FirebaseUser | null) => {
              if (!isMounted) return;

              try {
                if (firebaseUser) {
                  console.log("🔥 Firebase user detected:", firebaseUser.uid);

                  // Try to get additional user data from Firestore if available
                  let userData = {};
                  try {
                    if (db && typeof db === "object") {
                      const userDoc = await getDoc(
                        doc(db, "users", firebaseUser.uid),
                      );
                      userData = userDoc.exists() ? userDoc.data() : {};
                    } else {
                      console.warn(
                        "⚠️ Firestore not available, using basic user data",
                      );
                    }
                  } catch (firestoreError) {
                    console.warn(
                      "⚠️ Failed to get user data from Firestore:",
                      firestoreError,
                    );
                  }

                  const user: User = {
                    id: firebaseUser.uid,
                    phoneNumber: firebaseUser.phoneNumber || "",
                    displayName:
                      firebaseUser.displayName || (userData as any).name || "",
                    name: (userData as any).name || "",
                    username: (userData as any).username || "",
                    avatar: (userData as any).avatar || "",
                    status:
                      (userData as any).status ||
                      (userData as any).bio ||
                      "I Love IraChat",
                    bio: (userData as any).bio || "I Love IraChat",
                    isOnline: true,
                    followersCount: (userData as any).followersCount || 0,
                    followingCount: (userData as any).followingCount || 0,
                    likesCount: (userData as any).likesCount || 0,
                  };

                  // Store auth data securely
                  const authData = createAuthData(
                    user,
                    await firebaseUser.getIdToken(),
                  );
                  await storeAuthData(authData);

                  // Update Redux store
                  dispatch(setUser(user));

                  // Track user authentication in Analytics (with error handling)
                  try {
                    // TODO: Add analytics tracking when analytics service is available
                    console.log("📊 User authenticated:", {
                      user_id: user.id,
                      phone_number: user.phoneNumber,
                      display_name: user.displayName,
                      has_avatar: !!user.avatar,
                      signup_method: firebaseUser.phoneNumber
                        ? "phone"
                        : "email",
                    });
                  } catch (analyticsError) {
                    console.warn(
                      "⚠️ Analytics tracking failed:",
                      analyticsError,
                    );
                  }

                  setAuthState({
                    isInitializing: false,
                    isAuthenticated: true,
                    user: user,
                  });

                  console.log("✅ Firebase auth state updated and stored");
                } else {
                  console.log("🚪 Firebase user signed out");

                  // Clear stored data
                  await clearAuthData();
                  dispatch(logout());

                  setAuthState({
                    isInitializing: false,
                    isAuthenticated: false,
                    user: null,
                  });
                }
              } catch (error) {
                console.error(
                  "❌ Error handling Firebase auth state change:",
                  error,
                );

                await clearAuthData();
                dispatch(logout());

                setAuthState({
                  isInitializing: false,
                  isAuthenticated: false,
                  user: null,
                });
              }
            },
          );

          // Store the unsubscribe function for cleanup
          return unsubscribeAuth;
        } catch (authListenerError) {
          console.error(
            "❌ Failed to set up Firebase auth state listener:",
            authListenerError,
          );
          return null;
        }
      } catch (error) {
        console.error("❌ Error during auth initialization:", error);

        // Clear potentially corrupted data
        await clearAuthData();
        dispatch(logout());

        if (isMounted) {
          setAuthState({
            isInitializing: false,
            isAuthenticated: false,
            user: null,
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

    initializeAuth()
      .then((unsubscribe) => {
        if (unsubscribe && isMounted) {
          unsubscribeAuth = unsubscribe;
          console.log("✅ Auth state listener set up successfully");
        }
      })
      .catch((error) => {
        console.error("💥 Failed to initialize auth:", error);
      });

    // Set up periodic auth check for immediate registration detection
    authCheckInterval = setInterval(async () => {
      if (!isMounted) return;

      try {
        const currentStoredAuth = await getStoredAuthData();
        if (currentStoredAuth && !authState.isAuthenticated) {
          console.log("🔄 Detected new auth data - updating state immediately");

          dispatch(setUser(currentStoredAuth.user));

          setAuthState({
            isInitializing: false,
            isAuthenticated: true,
            user: currentStoredAuth.user,
          });

          // Clear interval once auth is detected
          if (authCheckInterval) {
            clearInterval(authCheckInterval);
            authCheckInterval = null;
          }
        }
      } catch (error) {
        console.warn("⚠️ Error in auth check interval:", error);
      }
    }, 200); // Check every 200ms for immediate registration detection

    // Cleanup function
    return () => {
      isMounted = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
        console.log("🧹 Auth state listener cleaned up");
      }
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
        console.log("🧹 Auth check interval cleared");
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
      console.log("🚪 Profile: Starting logout process...");

      // Update Redux store first to immediately update UI
      dispatch(logout());

      // Get the auth instance safely
      const authInstance = getAuth(); // Use the auth instance directly

      // Sign out from Firebase if auth instance is available
      if (authInstance && authInstance.signOut) {
        await authInstance.signOut();
        console.log("✅ Firebase signout successful");
      } else {
        console.warn(
          "⚠️ Auth instance not available, skipping Firebase signout",
        );
      }

      // Clear stored data
      await clearAuthData();

      // Force navigation to welcome screen
      console.log("🔄 Navigating to welcome screen...");

      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        try {
          // Use replace instead of dismissAll to avoid POP_TO_TOP error
          router.replace("/welcome");
          console.log("✅ Logout successful - redirected to welcome page");
        } catch (navError) {
          console.error("Navigation error during logout:", navError);
          // Fallback navigation
          router.push("/welcome");
        }
      }, 100);
    } catch (error) {
      console.error("❌ Error during logout:", error);

      // Force logout even if Firebase signout fails
      dispatch(logout());
      await clearAuthData();

      // Navigate to welcome screen even if logout had errors
      console.log("🔄 Force navigating to welcome screen...");
      setTimeout(() => {
        try {
          // Use replace instead of dismissAll to avoid POP_TO_TOP error
          router.replace("/welcome");
          console.log("✅ Force logout completed - redirected to welcome page");
        } catch (navError) {
          console.error("Force navigation error during logout:", navError);
          // Fallback navigation
          router.push("/welcome");
        }
      }, 100);
    }
  };
};
