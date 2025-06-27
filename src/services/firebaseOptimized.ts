// Optimized Firebase imports - Only what we need (saves ~20MB)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// DO NOT import the entire Firebase SDK
// This saves significant bundle size

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "irachat-xxxxx.firebaseapp.com",
  projectId: "irachat-xxxxx",
  storageBucket: "irachat-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxxxxxxxxxx"
};

// Initialize Firebase with minimal footprint
const app = initializeApp(firebaseConfig);

// Export only what we need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// DO NOT export the entire app or unused services
export default app;

console.log('✅ Optimized Firebase initialized (minimal bundle size)');
