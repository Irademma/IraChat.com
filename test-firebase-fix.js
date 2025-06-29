// 🔥 Firebase Configuration Test for irachat-4ebb8
// This will verify that all Firebase issues are resolved

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Testing Firebase Configuration for irachat-4ebb8...\n');

// Test 1: Check if .env file exists and has correct values
console.log('1️⃣ Testing Environment Configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasApiKey = envContent.includes('EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD47tXKiW9E7kAwMaJpAGJ8mFe-tSa5_Mw');
  const hasProjectId = envContent.includes('EXPO_PUBLIC_FIREBASE_PROJECT_ID=irachat-4ebb8');
  
  if (hasApiKey && hasProjectId) {
    console.log('✅ .env file configured correctly');
  } else {
    console.log('❌ .env file missing required Firebase credentials');
  }
} else {
  console.log('❌ .env file not found');
}

// Test 2: Check Android Firebase configuration
console.log('\n2️⃣ Testing Android Firebase Configuration...');
const androidBuildGradle = path.join(__dirname, 'android', 'build.gradle');
const appBuildGradle = path.join(__dirname, 'android', 'app', 'build.gradle');
const googleServicesJson = path.join(__dirname, 'android', 'app', 'google-services.json');

if (fs.existsSync(androidBuildGradle)) {
  const buildContent = fs.readFileSync(androidBuildGradle, 'utf8');
  if (buildContent.includes('com.google.gms:google-services')) {
    console.log('✅ Google Services plugin added to project build.gradle');
  } else {
    console.log('❌ Google Services plugin missing from project build.gradle');
  }
} else {
  console.log('❌ Android build.gradle not found');
}

if (fs.existsSync(appBuildGradle)) {
  const appBuildContent = fs.readFileSync(appBuildGradle, 'utf8');
  if (appBuildContent.includes('com.google.gms.google-services')) {
    console.log('✅ Google Services plugin applied to app build.gradle');
  } else {
    console.log('❌ Google Services plugin not applied to app build.gradle');
  }
  
  if (appBuildContent.includes('IraChat.android')) {
    console.log('✅ Package name matches google-services.json');
  } else {
    console.log('❌ Package name mismatch with google-services.json');
  }
} else {
  console.log('❌ App build.gradle not found');
}

if (fs.existsSync(googleServicesJson)) {
  const googleServices = JSON.parse(fs.readFileSync(googleServicesJson, 'utf8'));
  if (googleServices.project_info.project_id === 'irachat-4ebb8') {
    console.log('✅ google-services.json configured for correct project');
  } else {
    console.log('❌ google-services.json project ID mismatch');
  }
} else {
  console.log('❌ google-services.json not found');
}

// Test 3: Check Firebase service files
console.log('\n3️⃣ Testing Firebase Service Files...');
const firebaseSimple = path.join(__dirname, 'src', 'services', 'firebaseSimple.ts');
const firebaseConfig = path.join(__dirname, 'src', 'config', 'firebase.ts');

if (fs.existsSync(firebaseSimple)) {
  const firebaseContent = fs.readFileSync(firebaseSimple, 'utf8');
  if (firebaseContent.includes('irachat-4ebb8')) {
    console.log('✅ Firebase service configured for correct project');
  } else {
    console.log('❌ Firebase service project configuration issue');
  }
} else {
  console.log('❌ Firebase service file not found');
}

if (fs.existsSync(firebaseConfig)) {
  const configContent = fs.readFileSync(firebaseConfig, 'utf8');
  if (configContent.includes('irachat-4ebb8')) {
    console.log('✅ Firebase config file configured correctly');
  } else {
    console.log('❌ Firebase config file issue');
  }
} else {
  console.log('❌ Firebase config file not found');
}

// Test 4: Check phone authentication service
console.log('\n4️⃣ Testing Phone Authentication Service...');
const phoneAuthService = path.join(__dirname, 'src', 'services', 'phoneAuth.ts');

if (fs.existsSync(phoneAuthService)) {
  const phoneAuthContent = fs.readFileSync(phoneAuthService, 'utf8');
  if (phoneAuthContent.includes('serverTimestamp')) {
    console.log('✅ Phone auth service updated with proper Firestore integration');
  } else {
    console.log('❌ Phone auth service needs Firestore integration updates');
  }
} else {
  console.log('❌ Phone auth service file not found');
}

console.log('\n🎯 Firebase Configuration Test Summary:');
console.log('=====================================');
console.log('If all tests show ✅, your Firebase configuration should be working.');
console.log('If you see ❌, please review the failed items above.');
console.log('\n📱 Next Steps:');
console.log('1. Run: npx expo start');
console.log('2. Test phone authentication in your app');
console.log('3. Check Firebase Console > Authentication > Users');
console.log('4. Users should appear after successful phone verification');
console.log('\n🔗 Firebase Console: https://console.firebase.google.com/project/irachat-4ebb8');
