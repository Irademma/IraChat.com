// 🔥 FIXED Firebase Configuration for irachat-4ebb8
// This will solve your "COMPONENT AUTH IS EMPTY" and initialization issues

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { Platform } from "react-native";

console.log("🔥 Starting Firebase initialization for irachat-4ebb8...");
console.log(`📱 Platform: ${Platform.OS}`);

// Import configuration from config file
import { firebaseConfig } from "../config/firebase";

// Validate Firebase configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    console.error("❌ Missing Firebase config:", missing);
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }

  console.log("✅ Firebase configuration validated");
  return true;
};

// Initialize Firebase App
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Validate configuration first
  validateConfig();

  // Initialize Firebase App
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");
  } else {
    firebaseApp = getApp();
    console.log("✅ Using existing Firebase app");
  }

  // Initialize Firebase Auth
  auth = getAuth(firebaseApp);
  console.log("✅ Firebase Auth initialized");

  // Initialize Firestore
  db = getFirestore(firebaseApp);
  console.log("✅ Firestore initialized");

  // Initialize Storage
  storage = getStorage(firebaseApp);
  console.log("✅ Firebase Storage initialized");

  console.log("🎉 All Firebase services initialized successfully!");

} catch (error: any) {
  console.error("❌ CRITICAL: Firebase initialization failed:", error);
  console.error("❌ Error details:", error.message);

  // This will help you debug the exact issue
  if (error.message.includes('API key')) {
    console.error("🔑 API Key issue - check your .env file and Firebase console");
  } else if (error.message.includes('project')) {
    console.error("🏗️ Project ID issue - verify project ID in Firebase console");
  } else if (error.message.includes('auth')) {
    console.error("🔐 Auth domain issue - check authDomain in Firebase console");
  }

  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Export Firebase services
export { firebaseApp as app, auth, db, storage };

// Auth helper functions
export const getAuthInstance = (): Auth => {
  if (!auth) {
    throw new Error("Firebase Auth not initialized");
  }
  return auth;
};

export const getCurrentUserSafely = () => {
  try {
    return auth?.currentUser || null;
  } catch (error: any) {
    console.warn("⚠️ Error getting current user:", error.message);
    return null;
  }
};

export const isAuthReady = (): boolean => {
  return !!auth;
};

// Auth state management
export const waitForAuth = async (timeoutMs: number = 5000): Promise<Auth> => {
  return new Promise((resolve, reject) => {
    if (auth) {
      resolve(auth);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error(`Auth initialization timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    // Check periodically for auth
    const checkAuth = () => {
      if (auth) {
        clearTimeout(timeout);
        resolve(auth);
      } else {
        setTimeout(checkAuth, 100);
      }
    };

    checkAuth();
  });
};

// Platform info
export const getPlatformInfo = () => {
  return {
    platform: Platform.OS,
    authReady: isAuthReady(),
    persistence: Platform.OS === "web" ? "IndexedDB" : "AsyncStorage",
    appName: firebaseApp?.name || "Unknown",
  };
};

console.log("🎉 Firebase initialization complete!");
console.log("📊 Firebase Status:", {
  platform: Platform.OS,
  app: firebaseApp?.name || "Unknown",
  auth: auth ? "✅ Ready" : "❌ Failed",
  firestore: db ? "✅ Ready" : "❌ Failed",
  storage: storage ? "✅ Ready" : "❌ Failed",
});
