// Comprehensive Error Diagnosis for IraChat
const fs = require('fs');
const path = require('path');

console.log('🔍 IraChat Error Diagnosis Report');
console.log('================================\n');

// 1. Check Firebase Configuration
console.log('1. 🔥 Firebase Configuration Check:');
try {
  const envPath = '.env';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'EXPO_PUBLIC_FIREBASE_APP_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length === 0) {
      console.log('   ✅ All Firebase environment variables are present');
    } else {
      console.log('   ❌ Missing Firebase variables:', missingVars);
    }
  } else {
    console.log('   ❌ .env file not found');
  }
} catch (error) {
  console.log('   ❌ Error checking .env file:', error.message);
}

// 2. Check AsyncStorage Installation
console.log('\n2. 📱 AsyncStorage Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasAsyncStorage = packageJson.dependencies['@react-native-async-storage/async-storage'];
  
  if (hasAsyncStorage) {
    console.log('   ✅ AsyncStorage is installed:', hasAsyncStorage);
  } else {
    console.log('   ❌ AsyncStorage is not installed');
  }
} catch (error) {
  console.log('   ❌ Error checking package.json:', error.message);
}

// 3. Check Firebase Auth Configuration
console.log('\n3. 🔐 Firebase Auth Configuration Check:');
try {
  const authConfigPath = 'src/config/firebaseAuth.ts';
  if (fs.existsSync(authConfigPath)) {
    const authConfig = fs.readFileSync(authConfigPath, 'utf8');
    
    if (authConfig.includes('initializeAuth') && authConfig.includes('getReactNativePersistence')) {
      console.log('   ✅ Firebase Auth configured with AsyncStorage persistence');
    } else {
      console.log('   ⚠️ Firebase Auth may not be configured with AsyncStorage persistence');
    }
    
    if (authConfig.includes('@react-native-async-storage/async-storage')) {
      console.log('   ✅ AsyncStorage import found in auth config');
    } else {
      console.log('   ❌ AsyncStorage import missing in auth config');
    }
  } else {
    console.log('   ❌ Firebase auth config file not found');
  }
} catch (error) {
  console.log('   ❌ Error checking auth config:', error.message);
}

// 4. Check Splash Screen Assets
console.log('\n4. 🎨 Splash Screen Assets Check:');
try {
  const splashPath = 'assets/images/splash.png';
  if (fs.existsSync(splashPath)) {
    console.log('   ✅ Splash screen image exists');
  } else {
    console.log('   ❌ Splash screen image missing');
  }
} catch (error) {
  console.log('   ❌ Error checking splash screen:', error.message);
}

// 5. Check App.json Configuration
console.log('\n5. ⚙️ App.json Configuration Check:');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  if (appJson.expo.splash && appJson.expo.splash.backgroundColor === '#87CEEB') {
    console.log('   ✅ Splash screen color set to sky blue');
  } else {
    console.log('   ⚠️ Splash screen color may not be sky blue');
  }
  
  if (appJson.expo.splash && appJson.expo.splash.image) {
    console.log('   ✅ Splash screen image path configured');
  } else {
    console.log('   ❌ Splash screen image path not configured');
  }
} catch (error) {
  console.log('   ❌ Error checking app.json:', error.message);
}

// 6. Check for Common Issues
console.log('\n6. 🚨 Common Issues Check:');

// Check for duplicate Firebase initializations
try {
  const firebaseSimplePath = 'src/services/firebaseSimple.ts';
  const firebaseAuthPath = 'src/config/firebaseAuth.ts';
  
  if (fs.existsSync(firebaseSimplePath) && fs.existsSync(firebaseAuthPath)) {
    console.log('   ⚠️ Multiple Firebase configuration files detected');
    console.log('     This may cause "Component auth has not been registered yet" errors');
  }
} catch (error) {
  console.log('   ❌ Error checking Firebase configs:', error.message);
}

console.log('\n🎯 Recommendations:');
console.log('==================');
console.log('1. Ensure all Firebase environment variables are set in .env file');
console.log('2. Make sure AsyncStorage is properly configured with Firebase Auth');
console.log('3. Avoid duplicate Firebase initializations');
console.log('4. Check that splash screen assets exist');
console.log('5. Consider creating a development build for full Firebase functionality');
console.log('\n✨ Run this diagnosis after making changes to verify fixes');
