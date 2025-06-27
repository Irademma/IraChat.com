// Firebase Auth Configuration - Simplified and Reliable
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase";

console.log("🔥 Initializing Firebase Auth...");

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized");
} else {
  app = getApp();
  console.log("✅ Firebase app retrieved from existing instance");
}

// Initialize Firebase Auth - Simple and reliable approach
let auth: Auth;
try {
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized successfully");
} catch (error: any) {
  console.error("❌ Failed to initialize Firebase Auth:", error);
  throw new Error("Firebase Auth could not be initialized");
}

// Initialize Firestore and Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

console.log("✅ Firebase services initialized successfully");

// Export the configured instances
export { app, auth, firestore, storage };
export default auth;
