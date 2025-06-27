// Test Authentication Helper
// This helps bypass auth issues during development

import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebaseSimple';

export const signInTestUser = async () => {
  try {
    if (!auth) {
      console.log('❌ Auth not initialized');
      return null;
    }
    
    console.log('🔐 Signing in anonymously for testing...');
    const result = await signInAnonymously(auth);
    console.log('✅ Test user signed in:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('❌ Failed to sign in test user:', error);
    return null;
  }
};

export const checkAuthStatus = () => {
  if (!auth) {
    console.log('❌ Auth not initialized');
    return false;
  }
  
  const user = auth.currentUser;
  if (user) {
    console.log('✅ User is authenticated:', user.uid);
    return true;
  } else {
    console.log('❌ No user authenticated');
    return false;
  }
};