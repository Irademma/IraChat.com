// 🚪 FIXED Logout Service - Properly clears Redux Persist
// This will ensure users actually log out instead of staying logged in

import { signOut } from "firebase/auth";
import { persistor } from "../redux/store";
import { logout, resetState } from "../redux/userSlice";
import { clearAuthData } from "./authStorageSimple";
import { auth } from "./firebaseSimple";

/**
 * Complete logout function that properly clears all authentication state
 * including Redux Persist store
 */
export const performCompleteLogout = async (dispatch: any, router: any) => {
  try {
    console.log("🚪 Starting complete logout process...");

    // Step 1: Sign out from Firebase Auth
    try {
      if (auth && auth.currentUser) {
        await signOut(auth);
        console.log("✅ Firebase signout successful");
      } else {
        console.log("ℹ️ No Firebase user to sign out");
      }
    } catch (firebaseError) {
      console.warn("⚠️ Firebase signout failed, continuing with local logout:", firebaseError);
    }

    // Step 2: Clear Redux state
    console.log("🔄 Clearing Redux state...");
    dispatch(resetState());
    dispatch(logout());

    // Step 3: Clear stored auth data
    console.log("🧹 Clearing stored auth data...");
    await clearAuthData();

    // Step 4: CRITICAL - Purge Redux Persist store
    console.log("🔥 Purging Redux Persist store...");
    await persistor.purge();
    
    // Step 5: Clear any additional storage
    try {
      // Clear AsyncStorage completely for auth-related keys
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('auth') || 
        key.includes('user') || 
        key.includes('persist') ||
        key.includes('redux')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log("🧹 Cleared auth-related AsyncStorage keys:", authKeys);
      }
    } catch (storageError) {
      console.warn("⚠️ Error clearing AsyncStorage:", storageError);
    }

    // Step 6: Force navigation to welcome screen
    console.log("🔄 Navigating to welcome screen...");
    
    // Use setTimeout to ensure all state updates are processed
    setTimeout(() => {
      try {
        router.replace("/welcome");
        console.log("✅ Complete logout successful - redirected to welcome");
      } catch (navError) {
        console.error("❌ Navigation error during logout:", navError);
        // Fallback navigation
        router.push("/welcome");
      }
    }, 100);

    return {
      success: true,
      message: "Logged out successfully!"
    };

  } catch (error) {
    console.error("❌ Error during complete logout:", error);

    // Force logout even if some steps fail
    try {
      dispatch(resetState());
      dispatch(logout());
      await persistor.purge();
      await clearAuthData();
      
      setTimeout(() => {
        router.replace("/welcome");
      }, 100);
    } catch (forceError) {
      console.error("❌ Force logout also failed:", forceError);
    }

    return {
      success: false,
      message: "Logout completed with some errors"
    };
  }
};

/**
 * Simple logout hook for use in components
 */
export const useCompleteLogout = () => {
  const { useDispatch } = require('react-redux');
  const { useRouter } = require('expo-router');
  
  const dispatch = useDispatch();
  const router = useRouter();

  return () => performCompleteLogout(dispatch, router);
};
