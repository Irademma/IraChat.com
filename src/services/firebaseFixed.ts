// 🔥 BULLETPROOF Firebase Setup for irachat-4ebb8
// This will fix your "COMPONENT AUTH IS EMPTY" and initialization issues

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 🎯 EXACT Firebase Configuration for irachat-4ebb8
const firebaseConfig = {
  apiKey: "AIzaSyD47tXKiW9E7kAwMaJpAGJ8mFe-tSa5_Mw",
  authDomain: "irachat-4ebb8.firebaseapp.com",
  projectId: "irachat-4ebb8",
  storageBucket: "irachat-4ebb8.firebasestorage.app",
  messagingSenderId: "1068327830364",
  appId: "1:1068327830364:android:974f6551f046cb3f03b799",
  measurementId: "G-TEMP123456789"
};

console.log("🔥 Starting Firebase initialization for irachat-4ebb8...");

// Initialize Firebase App (SIMPLE AND CLEAN)
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");
  } else {
    app = getApp();
    console.log("✅ Using existing Firebase app");
  }
} catch (error) {
  console.error("❌ CRITICAL: Firebase app initialization failed:", error);
  throw new Error("Firebase initialization failed - check your configuration");
}

// Initialize Firebase Services (SIMPLE AND CLEAN)
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");
} catch (error) {
  console.error("❌ CRITICAL: Firebase Auth initialization failed:", error);
  throw new Error("Firebase Auth initialization failed");
}

try {
  db = getFirestore(app);
  console.log("✅ Firestore initialized");
} catch (error) {
  console.error("❌ CRITICAL: Firestore initialization failed:", error);
  throw new Error("Firestore initialization failed");
}

try {
  storage = getStorage(app);
  console.log("✅ Firebase Storage initialized");
} catch (error) {
  console.error("❌ CRITICAL: Firebase Storage initialization failed:", error);
  throw new Error("Firebase Storage initialization failed");
}

// 🎯 Auth State Monitoring (CRITICAL FOR DEBUGGING)
let currentUser: User | null = null;

const setupAuthStateListener = () => {
  console.log("🎯 Setting up auth state listener...");
  
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      console.log("✅ USER AUTHENTICATED:", {
        uid: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        isAnonymous: user.isAnonymous
      });
    } else {
      console.log("❌ NO USER AUTHENTICATED");
    }
  });
};

// Start monitoring auth state immediately
const unsubscribeAuth = setupAuthStateListener();

// 🔍 Debug Functions
export const debugFirebase = () => {
  console.log("🔍 FIREBASE DEBUG INFO:");
  console.log("- App initialized:", !!app);
  console.log("- Auth initialized:", !!auth);
  console.log("- Firestore initialized:", !!db);
  console.log("- Storage initialized:", !!storage);
  console.log("- Current user:", currentUser?.uid || "None");
  console.log("- Project ID:", app?.options?.projectId);
  console.log("- Auth domain:", app?.options?.authDomain);
};

// 🎯 Test Authentication Function
export const testAuth = async () => {
  try {
    console.log("🧪 Testing Firebase Auth...");
    const { signInAnonymously } = await import('firebase/auth');
    const result = await signInAnonymously(auth);
    console.log("✅ Anonymous sign-in successful:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("❌ Auth test failed:", error);
    throw error;
  }
};

// Export everything
export { app, auth, db, storage, currentUser, debugFirebase, testAuth };
export default app;

console.log("🎉 Firebase setup complete! Run debugFirebase() to check status.");
