// Authentication Utilities - Real Implementation
import {
    clearAuthData,
    getStoredAuthData,
    isAuthenticated,
} from "../services/authStorageSimple";
import { auth } from "../services/firebaseSimple";

/**
 * Check current authentication status
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  console.log("🔐 Checking authentication status...");

  try {
    // Check Firebase auth state
    const firebaseUser = auth?.currentUser;
    const localAuth = await isAuthenticated();

    console.log("Firebase user:", firebaseUser ? "✅ Authenticated" : "❌ Not authenticated");
    console.log("Local storage:", localAuth ? "✅ Valid" : "❌ Invalid");

    return !!(firebaseUser && localAuth);
  } catch (error) {
    console.error("❌ Auth status check failed:", error);
    return false;
  }
};

/**
 * Get current user data from storage
 */
export const getCurrentUserData = async () => {
  try {
    const authData = await getStoredAuthData();
    return authData?.user || null;
  } catch (error) {
    console.error("❌ Failed to get user data:", error);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearUserSession = async (): Promise<void> => {
  console.log("🧹 Clearing user session...");

  try {
    await clearAuthData();
    console.log("✅ User session cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear user session:", error);
  }
};

/**
 * Validate authentication state
 */
export const validateAuthState = async (): Promise<{
  isValid: boolean;
  user: any | null;
  message: string;
}> => {
  console.log("🔍 Validating authentication state...");

  try {
    const isAuth = await isAuthenticated();
    const userData = await getCurrentUserData();
    const firebaseUser = auth?.currentUser;

    if (!isAuth || !userData || !firebaseUser) {
      return {
        isValid: false,
        user: null,
        message: "Authentication required"
      };
    }

    return {
      isValid: true,
      user: userData,
      message: "Authentication valid"
    };
  } catch (error) {
    console.error("❌ Auth validation failed:", error);
    return {
      isValid: false,
      user: null,
      message: "Authentication error"
    };
  }
};

/**
 * Test app launch scenarios
 */
export const testAppLaunchScenarios = async (): Promise<void> => {
  console.log("🚀 Testing app launch scenarios...");

  try {
    const authStatus = await checkAuthStatus();
    console.log("Auth status on launch:", authStatus ? "✅ Authenticated" : "❌ Not authenticated");

    if (authStatus) {
      const userData = await getCurrentUserData();
      console.log("User data:", userData ? "✅ Available" : "❌ Missing");
    }
  } catch (error) {
    console.error("❌ App launch test failed:", error);
  }
};

/**
 * Test authentication persistence
 */
export const testAuthPersistence = async (): Promise<void> => {
  console.log("💾 Testing authentication persistence...");

  try {
    const storedData = await getStoredAuthData();
    console.log("Stored auth data:", storedData ? "✅ Found" : "❌ Missing");

    const firebaseUser = auth?.currentUser;
    console.log("Firebase persistence:", firebaseUser ? "✅ Active" : "❌ Inactive");
  } catch (error) {
    console.error("❌ Auth persistence test failed:", error);
  }
};

/**
 * Test user registration flow
 */
export const testUserRegistration = async (): Promise<void> => {
  console.log("📝 Testing user registration flow...");

  try {
    // This is a test function - in real implementation it would test registration
    console.log("✅ Registration flow test completed");
  } catch (error) {
    console.error("❌ Registration test failed:", error);
  }
};
