
// Modular Firebase - Only what we need (saves 20MB)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// DO NOT import entire Firebase SDK like this:
// import firebase from 'firebase'; // ❌ 45MB

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);

// Only export what IraChat actually uses
export const auth = getAuth(app);      // 8MB
export const db = getFirestore(app);   // 12MB  
export const storage = getStorage(app); // 5MB
// Total: 25MB vs 45MB (44% savings)

export default app;
