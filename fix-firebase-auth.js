#!/usr/bin/env node
/**
 * Fix Firebase Authentication Issues
 * 
 * This script helps diagnose and fix common Firebase authentication problems
 */

const fs = require('fs');
const path = require('path');

function checkFirebaseConfig() {
  console.log('🔍 Checking Firebase Configuration...');
  
  const configPath = 'src/config/firebase.ts';
  if (!fs.existsSync(configPath)) {
    console.log('❌ Firebase config file not found');
    return false;
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  
  // Check for required fields
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 
    'messagingSenderId', 'appId'
  ];
  
  const missingFields = requiredFields.filter(field => 
    !content.includes(field) || content.includes(`${field}: ""`)
  );
  
  if (missingFields.length > 0) {
    console.log(`❌ Missing or empty Firebase config fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  console.log('✅ Firebase config appears complete');
  return true;
}

function checkFirestoreRules() {
  console.log('🔍 Checking Firestore Rules...');
  
  const rulesPath = 'firestore.rules';
  if (!fs.existsSync(rulesPath)) {
    console.log('❌ Firestore rules file not found');
    return false;
  }
  
  const content = fs.readFileSync(rulesPath, 'utf8');
  
  // Check for messageReactions collection
  if (!content.includes('messageReactions')) {
    console.log('❌ messageReactions collection not found in rules');
    return false;
  }
  
  console.log('✅ Firestore rules include messageReactions collection');
  return true;
}

function createTestAuthRules() {
  console.log('🔧 Creating test authentication rules...');
  
  const testRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all authenticated users to read/write everything
    // This is for development/testing only - NOT for production!
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow unauthenticated read for testing (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read: if true;
    }
  }
}`;

  fs.writeFileSync('firestore-test.rules', testRules);
  console.log('✅ Created firestore-test.rules for development testing');
  console.log('⚠️  Remember to deploy proper rules for production!');
}

function createAuthTestUser() {
  console.log('🔧 Creating test authentication helper...');
  
  const authTestContent = `// Test Authentication Helper
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
};`;

  fs.writeFileSync('src/services/authTest.ts', authTestContent);
  console.log('✅ Created auth test helper at src/services/authTest.ts');
}

function updateFirebaseSimple() {
  console.log('🔧 Updating Firebase service to handle auth better...');
  
  const firebaseSimplePath = 'src/services/firebaseSimple.ts';
  if (!fs.existsSync(firebaseSimplePath)) {
    console.log('❌ Firebase service file not found');
    return false;
  }
  
  let content = fs.readFileSync(firebaseSimplePath, 'utf8');
  
  // Add better error handling for auth
  const authErrorHandling = `
// Enhanced auth error handling
export const getAuthInstance = () => {
  if (!authInstance) {
    console.warn('⚠️ Auth instance is null, Firebase auth may not be properly initialized');
    return null;
  }
  return authInstance;
};

export const isAuthReady = () => {
  return authInstance !== null;
};

export const getCurrentUser = () => {
  if (!authInstance) {
    console.warn('⚠️ Auth instance is null');
    return null;
  }
  return authInstance.currentUser;
};`;

  // Add the enhanced functions if they don't exist
  if (!content.includes('getAuthInstance')) {
    content += authErrorHandling;
    fs.writeFileSync(firebaseSimplePath, content);
    console.log('✅ Enhanced Firebase service with better auth handling');
  } else {
    console.log('✅ Firebase service already has auth helpers');
  }
  
  return true;
}

function showAuthSolutions() {
  console.log(`
🔧 Firebase Authentication Solutions:

1. **Deploy Test Rules** (for development):
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   (Use firestore-test.rules for permissive testing)

2. **Enable Anonymous Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Anonymous" authentication
   - This allows testing without user registration

3. **Test Authentication in App**:
   - Import: import { signInTestUser } from '../services/authTest';
   - Call: await signInTestUser(); before Firebase operations

4. **Check Auth Status**:
   - Import: import { checkAuthStatus } from '../services/authTest';
   - Call: checkAuthStatus(); to verify authentication

5. **Production Setup**:
   - Replace test rules with proper security rules
   - Implement proper user registration/login
   - Remove anonymous auth if not needed

📱 Quick Fix for Current Errors:
   1. Enable Anonymous Auth in Firebase Console
   2. Deploy test rules: firebase deploy --only firestore:rules
   3. Add auth check before Firebase operations
   4. Use signInTestUser() for development testing

⚠️  Remember: Test rules are permissive and NOT for production!
`);
}

function main() {
  console.log('🔥 Firebase Authentication Fixer\n');
  
  const configOk = checkFirebaseConfig();
  const rulesOk = checkFirestoreRules();
  
  if (!configOk) {
    console.log('\n❌ Firebase configuration issues found');
    console.log('Please check your src/config/firebase.ts file');
    return;
  }
  
  if (!rulesOk) {
    console.log('\n❌ Firestore rules issues found');
  }
  
  // Create helpful files
  createTestAuthRules();
  createAuthTestUser();
  updateFirebaseSimple();
  
  console.log('\n✅ Firebase auth fixes applied!');
  showAuthSolutions();
}

if (require.main === module) {
  main();
}
