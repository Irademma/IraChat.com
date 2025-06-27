
// Optimized Firebase Configuration (saves ~20MB)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// DO NOT import the entire Firebase SDK
// This reduces bundle size significantly

const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only export what you need
export default app;
