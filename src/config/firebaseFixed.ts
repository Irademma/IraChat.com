// FIXED Firebase Configuration for irachat-c172f
// This is a clean, working setup that will fix your "COMPONENT AUTH IS EMPTY" error

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ IMPORTANT: You MUST get these values from your Firebase Console
// Go to: https://console.firebase.google.com/project/irachat-c172f/settings/general
// Scroll down to "Your apps" and copy the config object

const firebaseConfig = {
  // 🔥 REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE CONSOLE
  apiKey: "YOUR_ACTUAL_API_KEY_FROM_FIREBASE_CONSOLE",
  authDomain: "irachat-c172f.firebaseapp.com",
  projectId: "irachat-c172f",
  storageBucket: "irachat-c172f.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID",
  measurementId: "YOUR_ACTUAL_MEASUREMENT_ID"
};

// Initialize Firebase App (only once)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized successfully");
} else {
  app = getApp();
  console.log("✅ Using existing Firebase app");
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For development/testing - connect to emulators if needed
if (__DEV__) {
  // Uncomment these lines if you want to use Firebase emulators for testing
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
}

console.log("✅ Firebase services initialized:");
console.log("- Auth:", auth ? "✅" : "❌");
console.log("- Firestore:", db ? "✅" : "❌");
console.log("- Storage:", storage ? "✅" : "❌");

export default app;
