// Validate Firebase environment variables
const validateFirebaseConfig = () => {
  const requiredVars = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn("⚠️ Missing Firebase environment variables:", missing);
    console.warn(
      "📝 Please check your .env file and ensure all Firebase variables are set",
    );
  }

  return missing.length === 0;
};

// Firebase configuration - Updated with project: irachat-4ebb8
export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD47tXKiW9E7kAwMaJpAGJ8mFe-tSa5_Mw",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "irachat-4ebb8.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "irachat-4ebb8",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "irachat-4ebb8.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1068327830364",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:1068327830364:android:974f6551f046cb3f03b799",
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-TEMP123456789",
};

// Validate configuration on import
export const isFirebaseConfigValid = validateFirebaseConfig();

// NOTE: Firebase services are initialized in src/services/firebaseSimple.ts
// This file only exports the configuration to avoid duplicate initialization
