// 🧪 Firebase Connection Test for irachat-4ebb8
// Run this to diagnose your Firebase issues

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Your exact Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD47tXKiW9E7kAwMaJpAGJ8mFe-tSa5_Mw",
  authDomain: "irachat-4ebb8.firebaseapp.com",
  projectId: "irachat-4ebb8",
  storageBucket: "irachat-4ebb8.firebasestorage.app",
  messagingSenderId: "1068327830364",
  appId: "1:1068327830364:android:974f6551f046cb3f03b799"
};

async function testFirebaseConnection() {
  console.log("🔥 Testing Firebase Connection for irachat-4ebb8...\n");

  try {
    // Test 1: Initialize Firebase
    console.log("1️⃣ Testing Firebase initialization...");
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");
    console.log("   Project ID:", app.options.projectId);
    console.log("   Auth Domain:", app.options.authDomain);

    // Test 2: Initialize Auth
    console.log("\n2️⃣ Testing Firebase Auth...");
    const auth = getAuth(app);
    console.log("✅ Firebase Auth initialized");

    // Test 3: Test Authentication
    console.log("\n3️⃣ Testing Authentication...");
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log("✅ Anonymous authentication successful!");
    console.log("   User ID:", user.uid);
    console.log("   Is Anonymous:", user.isAnonymous);

    // Test 4: Initialize Firestore
    console.log("\n4️⃣ Testing Firestore...");
    const db = getFirestore(app);
    console.log("✅ Firestore initialized");

    // Test 5: Test Firestore Write
    console.log("\n5️⃣ Testing Firestore Write...");
    const testDoc = doc(db, 'test', 'connection-test');
    await setDoc(testDoc, {
      message: 'Firebase connection test successful!',
      timestamp: new Date(),
      userId: user.uid
    });
    console.log("✅ Firestore write successful!");

    // Test 6: Test Firestore Read
    console.log("\n6️⃣ Testing Firestore Read...");
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log("✅ Firestore read successful!");
      console.log("   Data:", docSnap.data());
    } else {
      console.log("❌ Document not found");
    }

    console.log("\n🎉 ALL TESTS PASSED! Your Firebase is working correctly.");
    console.log("\n📋 Next Steps:");
    console.log("1. Update your app to use the firebaseFixed.ts file");
    console.log("2. Check your Firestore security rules");
    console.log("3. Test authentication in your app");

  } catch (error) {
    console.error("\n❌ FIREBASE TEST FAILED:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    
    if (error.code === 'auth/api-key-not-valid') {
      console.log("\n🔧 FIX: Your API key is invalid. Get the correct one from Firebase Console.");
    } else if (error.code === 'auth/project-not-found') {
      console.log("\n🔧 FIX: Project ID is wrong. Check your Firebase Console.");
    } else if (error.code === 'permission-denied') {
      console.log("\n🔧 FIX: Check your Firestore security rules.");
    }
  }
}

// Run the test
testFirebaseConnection();
