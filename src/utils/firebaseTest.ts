// Test Firebase connection
import { db, auth } from '../services/firebaseSimple';
import { collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');

    // Test Firestore connection
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firestore connection successful');

    // Test Auth connection
    console.log('✅ Auth service initialized:', !!auth);
    console.log('✅ Firebase configuration loaded successfully');

    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

export const testAuthConfiguration = async () => {
  try {
    console.log('Testing Firebase Auth configuration...');

    // Try to create a test user to see if auth is properly configured
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    const userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Auth test successful - user created:', userCred.user.uid);

    // Clean up the test user
    await userCred.user.delete();
    console.log('✅ Test user cleaned up');

    return { success: true, message: 'Auth configuration is working' };
  } catch (error: any) {
    console.error('❌ Auth test failed:', error);
    return {
      success: false,
      message: error.message,
      code: error.code
    };
  }
};

// Export Firebase instances for debugging
export const getFirebaseInfo = () => {
  return {
    authDomain: auth.app.options.authDomain,
    projectId: auth.app.options.projectId,
    isConnected: !!db && !!auth
  };
};
