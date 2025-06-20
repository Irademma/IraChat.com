// Test Firebase connection
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
<<<<<<< HEAD
import { auth, db } from "../services/firebaseSimple";
=======
import { auth } from "../config/firebaseAuth";
import { db } from "../services/firebaseSimple";
>>>>>>> 0ea9978a491748beb593b9ca0ca18c2f10a53438

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");

    // Test Firestore connection
    const testCollection = collection(db, "test");
    await getDocs(testCollection);
    console.log("✅ Firestore connection successful");

    // Test Auth connection
    console.log("✅ Auth service initialized:", !!auth);
    console.log("✅ Firebase configuration loaded successfully");

    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return false;
  }
};

export const testAuthConfiguration = async () => {
  try {
    console.log("Testing Firebase Auth configuration...");

    // Try to create a test user to see if auth is properly configured
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "testpassword123";

    const userCred = await createUserWithEmailAndPassword(
      auth,
      testEmail,
      testPassword,
    );
    console.log("✅ Auth test successful - user created:", userCred.user.uid);

    // Clean up the test user
    await userCred.user.delete();
    console.log("✅ Test user cleaned up");

    return { success: true, message: "Auth configuration is working" };
  } catch (error: any) {
    console.error("❌ Auth test failed:", error);
    return {
      success: false,
      message: error.message,
      code: error.code,
    };
  }
};

// Export Firebase instances for debugging
export const getFirebaseInfo = () => {
  return {
    authDomain: auth.app.options.authDomain,
    projectId: auth.app.options.projectId,
    isConnected: !!db && !!auth,
  };
};
