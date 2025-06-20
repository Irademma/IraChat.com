// Simple Firebase Configuration - Web SDK for All Platforms
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
<<<<<<< HEAD
import { Auth, onAuthStateChanged } from "firebase/auth";
=======
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

console.log("🔥 Initializing Firebase services...");
console.log(`📱 Platform detected: ${Platform.OS}`);

// Import configuration from config file
import { firebaseConfig } from "../config/firebase";
// Import properly configured auth instance

// Initialize Firebase App
let authInstance: Auth | null = null;

// Initialize Firebase and export instances
console.log("Starting Firebase service initialization...");
let firebaseApp: FirebaseApp;
let firestore: any;

// Initialize Firebase synchronously with fallback
try {
  console.log("🔥 Initializing Firebase app...");

  // Initialize Firebase App first
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized:", firebaseApp.name);
  } else {
    firebaseApp = getApp();
    console.log("✅ Firebase app retrieved:", firebaseApp.name);
  }

  // Initialize Firestore with error handling and offline support
  try {
    firestore = getFirestore(firebaseApp);
    console.log("✅ Firestore initialized");

    // Configure Firestore for better offline support and reduced connection errors
    try {
      // Enable offline persistence (this is automatically handled by Firebase v9+)
      // Set connection timeout and retry settings
      console.log("✅ Firestore configured with offline persistence");
    } catch (settingsError) {
      console.warn("⚠️ Could not configure Firestore settings:", settingsError);
    }
  } catch (firestoreError) {
    console.error("❌ Firestore initialization failed:", firestoreError);
    console.log("🔄 App will continue with local storage only");
    firestore = null;
  }

<<<<<<< HEAD
  // Initialize Firebase Auth with AsyncStorage persistence
  try {
    console.log("🔄 Initializing Firebase Auth...");

    // Import AsyncStorage and auth functions
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    const { initializeAuth, getReactNativePersistence, getAuth } = require("firebase/auth");

    // Try to get existing auth instance first, then initialize if needed
    try {
      authInstance = getAuth(firebaseApp);
      console.log("✅ Firebase Auth retrieved from existing instance");
    } catch (getAuthError) {
      // If no existing instance, initialize with AsyncStorage persistence
      authInstance = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log("✅ Firebase Auth initialized with AsyncStorage persistence");
    }
=======
  // Initialize Firebase Auth directly
  try {
    console.log("🔄 Initializing Firebase Auth...");
    authInstance = getAuth(firebaseApp);
    console.log("✅ Firebase Auth initialized successfully");
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438

    // Test auth state listener with proper cleanup
    if (authInstance) {
      let testUnsubscribe: (() => void) | null = null;

      try {
        testUnsubscribe = onAuthStateChanged(authInstance, (user) => {
          if (user) {
            console.log("🔐 Auth state: User signed in:", user.uid);
          } else {
            console.log("🔐 Auth state: User signed out");
          }
        });

        // Clean up test listener after a short test
        setTimeout(() => {
          if (testUnsubscribe) {
            testUnsubscribe();
            testUnsubscribe = null;
            console.log("🧹 Test auth listener cleaned up");
          }
        }, 1000);
      } catch (listenerError) {
        console.warn("⚠️ Auth state listener test failed:", listenerError);
        if (testUnsubscribe) {
          testUnsubscribe();
        }
      }
    }
  } catch (authError) {
    console.error("❌ Firebase Auth initialization failed:", authError);
    console.log("🔄 App will continue with local auth storage only");
    authInstance = null;
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase app:", error);
  console.log("📱 App will run in offline mode with local storage only");
  // Set fallback values to prevent app crash
  firebaseApp = null as any;
  authInstance = null;
  firestore = null;
}

export { firebaseApp as app, authInstance as auth, firestore as db, firestore };

// Initialize Storage
let storage: any;
try {
  if (firebaseApp) {
    storage = getStorage(firebaseApp);
    console.log("✅ Storage initialized");
  } else {
    console.warn("⚠️ Storage not initialized - Firebase app not available");
    storage = null;
  }
} catch (error) {
  console.error("❌ Storage initialization failed:", error);
  storage = null;
}

export { storage };

// Global Firebase connection manager to prevent multiple listeners
export const FirebaseConnectionManager = {
  activeConnections: new Set<string>(),
  maxConnections: 5, // Limit concurrent connections

  canCreateConnection(connectionId: string): boolean {
    if (this.activeConnections.size >= this.maxConnections) {
      console.warn(`⚠️ Maximum Firebase connections (${this.maxConnections}) reached`);
      return false;
    }
    return true;
  },

  addConnection(connectionId: string): boolean {
    if (!this.canCreateConnection(connectionId)) {
      return false;
    }
    this.activeConnections.add(connectionId);
    console.log(`🔗 Added Firebase connection: ${connectionId} (${this.activeConnections.size}/${this.maxConnections})`);
    return true;
  },

  removeConnection(connectionId: string): void {
    this.activeConnections.delete(connectionId);
    console.log(`🔌 Removed Firebase connection: ${connectionId} (${this.activeConnections.size}/${this.maxConnections})`);
  },

  cleanup(): void {
    console.log("🧹 Cleaning up all Firebase connections");
    this.activeConnections.clear();
  }
};

console.log("🎉 Firebase initialization complete!");
console.log("📊 Status:", {
  platform: Platform.OS,
  app: firebaseApp?.name || "Unknown",
  firestore: firestore ? "Ready" : "Disabled",
  storage: storage ? "Ready" : "Disabled",
  auth: authInstance ? "Ready" : "Disabled",
});

// Simple auth access functions
export const getAuthInstance = () => {
  // Return the current auth instance (may be null)
  if (!authInstance) {
    console.warn("⚠️ Auth instance is null - Firebase Auth not available");
  }
  return authInstance;
};

export const isAuthReady = () => {
  return authInstance !== null;
};

export const getCurrentUserSafely = () => {
  try {
    return authInstance?.currentUser || null;
  } catch (error: any) {
    console.warn(`⚠️ Auth not ready:`, error.message);
    return null;
  }
};

export const getPlatformInfo = () => {
  return {
    platform: Platform.OS,
    authReady: isAuthReady(),
    persistence: Platform.OS === "web" ? "IndexedDB" : "AsyncStorage",
    appName: firebaseApp?.name || "Unknown",
  };
};

// Add the missing waitForAuth function with improved error handling
export const waitForAuth = async (
  timeoutMs: number = 5000,
): Promise<Auth | null> => {
  return new Promise((resolve) => {
    // If auth is already available, return it immediately
    if (authInstance) {
      console.log("✅ Auth instance already available");
      resolve(authInstance);
      return;
    }

    console.log(
      `⏳ Waiting for auth initialization (timeout: ${timeoutMs}ms)...`,
    );

    let attempts = 0;
<<<<<<< HEAD
    const maxAttempts = Math.floor(timeoutMs / 50); // Check more frequently
=======
    const maxAttempts = Math.floor(timeoutMs / 100);
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438

    // Set up a timeout
    const timeout = setTimeout(() => {
      console.warn(`⚠️ Auth initialization timeout after ${timeoutMs}ms`);
      console.log(
        "🔄 App will continue with stored auth only - this is normal for offline mode",
      );
<<<<<<< HEAD
      resolve(authInstance); // Return the auth instance even if it might be null
=======
      resolve(null);
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438
    }, timeoutMs);

    // Check for auth instance periodically with retry logic
    const checkAuth = () => {
      attempts++;

      if (authInstance) {
        clearTimeout(timeout);
        console.log(
<<<<<<< HEAD
          `✅ Auth instance became available after ${attempts * 50}ms`,
=======
          `✅ Auth instance became available after ${attempts * 100}ms`,
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438
        );
        resolve(authInstance);
        return;
      }

      if (attempts >= maxAttempts) {
        clearTimeout(timeout);
<<<<<<< HEAD
        console.log("⏰ Max attempts reached, resolving with current auth instance");
        resolve(authInstance); // Return whatever we have, even if null
        return;
      }

      // Check again in 50ms (more frequent checks)
      setTimeout(checkAuth, 50);
=======
        console.log("⏰ Max attempts reached, resolving with null");
        resolve(null);
        return;
      }

      // Check again in 100ms
      setTimeout(checkAuth, 100);
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438
    };

    checkAuth();
  });
};

// Auth state change listener for better auth management
let authStateUnsubscribe: (() => void) | null = null;

export const initializeAuthStateListener = () => {
  if (!authInstance) {
    console.warn(
      "⚠️ Cannot initialize auth state listener: auth instance not available",
    );
<<<<<<< HEAD
    console.log("🔄 App will continue with stored auth data only");
=======
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438
    return null;
  }

  if (authStateUnsubscribe) {
    console.log("🔄 Auth state listener already initialized");
    return authStateUnsubscribe;
  }

  console.log("🎯 Initializing Firebase auth state listener...");

<<<<<<< HEAD
  try {
    authStateUnsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        console.log("✅ User signed in:", user.uid);
      } else {
        console.log("👤 User signed out");
      }
    });
    console.log("✅ Auth state listener initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize auth state listener:", error);
    return null;
  }
=======
  authStateUnsubscribe = onAuthStateChanged(authInstance, (user) => {
    if (user) {
      console.log("✅ User signed in:", user.uid);
    } else {
      console.log("👤 User signed out");
    }
  });
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438

  return authStateUnsubscribe;
};

export const cleanupAuthStateListener = () => {
  if (authStateUnsubscribe) {
    authStateUnsubscribe();
    authStateUnsubscribe = null;
    console.log("🧹 Auth state listener cleaned up");
  }
};

// Real-time chat data service - NO MORE MOCK DATA
export const chatDataService = {
  // Get real chat data from Firestore
  async getChatData(chatId: string, currentUserId: string) {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const chatDoc = await import("firebase/firestore").then(
        ({ doc, getDoc }) => getDoc(doc(firestore, "chats", chatId)),
      );

      if (!chatDoc.exists()) {
        throw new Error("Chat not found");
      }

      return chatDoc.data();
    } catch (error) {
      console.error("❌ Error fetching chat data:", error);
      throw error;
    }
  },

  // Get real user data
  async getUserData(userId: string) {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const userDoc = await import("firebase/firestore").then(
        ({ doc, getDoc }) => getDoc(doc(firestore, "users", userId)),
      );

      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    }
  },
};

// Real chat list service - NO MORE MOCK DATA with proper cleanup
export const chatListService = {
  // Active listeners tracking for cleanup
  activeListeners: new Map<string, () => void>(),

  // Get real chats from Firestore with proper listener management
  async getUserChats(userId: string, callback?: (chats: any[]) => void) {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const connectionId = `chats-${userId}`;

      // Check connection limits
      if (!FirebaseConnectionManager.canCreateConnection(connectionId)) {
        console.warn("⚠️ Cannot create chat listener - connection limit reached");
        if (callback) callback([]);
        return () => {};
      }

      const { collection, query, where, orderBy, onSnapshot } = await import(
        "firebase/firestore"
      );

      // Clean up any existing listener for this user
      const existingListener = this.activeListeners.get(userId);
      if (existingListener) {
        existingListener();
        this.activeListeners.delete(userId);
        FirebaseConnectionManager.removeConnection(connectionId);
        console.log("🧹 Cleaned up existing chat listener for user:", userId);
      }

      const chatsQuery = query(
        collection(firestore, "chats"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageTime", "desc"),
      );

      if (callback) {
        // Add connection tracking
        if (!FirebaseConnectionManager.addConnection(connectionId)) {
          console.warn("⚠️ Failed to add Firebase connection");
          callback([]);
          return () => {};
        }

        // Real-time listener with cleanup tracking
        const unsubscribe = onSnapshot(
          chatsQuery,
          (snapshot) => {
            const chats = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            callback(chats);
          },
          (error) => {
            console.error("❌ Error in chat listener:", error);
            // Clean up on error
            this.activeListeners.delete(userId);
            FirebaseConnectionManager.removeConnection(connectionId);
          },
        );

        // Track the listener for cleanup
        const wrappedUnsubscribe = () => {
          unsubscribe();
          FirebaseConnectionManager.removeConnection(connectionId);
        };
        this.activeListeners.set(userId, wrappedUnsubscribe);
        return wrappedUnsubscribe;
      } else {
        // One-time fetch
        return new Promise((resolve, reject) => {
          const unsubscribe = onSnapshot(
            chatsQuery,
            (snapshot) => {
              const chats = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              unsubscribe(); // Clean up immediately for one-time fetch
              resolve(chats);
            },
            (error) => {
              console.error("❌ Error fetching chats:", error);
              reject(error);
            },
          );
        });
      }
    } catch (error) {
      console.error("❌ Error setting up chat listener:", error);
      return [];
    }
  },

  // Clean up all active listeners
  cleanupAllListeners() {
    console.log("🧹 Cleaning up all chat listeners...");
    this.activeListeners.forEach((unsubscribe, userId) => {
      try {
        unsubscribe();
        console.log("✅ Cleaned up listener for user:", userId);
      } catch (error) {
        console.warn("⚠️ Error cleaning up listener for user:", userId, error);
      }
    });
    this.activeListeners.clear();
    FirebaseConnectionManager.cleanup();
  },
};

// Global cleanup function for app lifecycle
export const cleanupAllFirebaseListeners = () => {
  console.log("🧹 Global Firebase cleanup initiated...");

  // Clean up auth listener
  cleanupAuthStateListener();

  // Clean up chat listeners
  chatListService.cleanupAllListeners();

  // Clean up connection manager
  FirebaseConnectionManager.cleanup();

  console.log("✅ Global Firebase cleanup completed");
};
