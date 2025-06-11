#!/usr/bin/env node

/**
 * iOS Firebase Setup Guide and Configuration Checker
 * Comprehensive guide to configure Firebase for iOS in IraChat
 */

const fs = require('fs');
const path = require('path');

console.log('🍎 IRACHAT iOS FIREBASE SETUP GUIDE');
console.log('=' .repeat(60));
console.log('🔥 Complete Firebase iOS Configuration Guide');
console.log('📱 Ensuring perfect iOS Firebase integration');
console.log('=' .repeat(60));

// Configuration status tracking
const configStatus = {
  hasGoogleServicesPlist: false,
  hasFirebasePlugin: false,
  hasIOSConfig: false,
  hasFirebaseSDK: false,
  issues: [],
  recommendations: []
};

function checkCurrentConfiguration() {
  console.log('\n🔍 CHECKING CURRENT iOS FIREBASE CONFIGURATION:');
  console.log('-'.repeat(50));

  // Check for GoogleService-Info.plist
  const plistPaths = [
    'GoogleService-Info.plist',
    'ios/GoogleService-Info.plist',
    'assets/GoogleService-Info.plist'
  ];

  let plistFound = false;
  plistPaths.forEach(plistPath => {
    if (fs.existsSync(plistPath)) {
      console.log(`✅ GoogleService-Info.plist found at: ${plistPath}`);
      configStatus.hasGoogleServicesPlist = true;
      plistFound = true;
    }
  });

  if (!plistFound) {
    console.log('❌ GoogleService-Info.plist NOT FOUND');
    configStatus.issues.push('Missing GoogleService-Info.plist file');
  }

  // Check app.json for Firebase plugin
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const plugins = appJson.expo.plugins || [];
    
    const hasFirebasePlugin = plugins.some(plugin => 
      typeof plugin === 'string' ? 
        plugin.includes('firebase') : 
        (Array.isArray(plugin) && plugin[0].includes('firebase'))
    );

    if (hasFirebasePlugin) {
      console.log('✅ Firebase plugin found in app.json');
      configStatus.hasFirebasePlugin = true;
    } else {
      console.log('❌ Firebase plugin NOT FOUND in app.json');
      configStatus.issues.push('Missing Firebase plugin in app.json');
    }

    // Check iOS configuration
    if (appJson.expo.ios) {
      console.log('✅ iOS configuration found in app.json');
      console.log(`    Bundle ID: ${appJson.expo.ios.bundleIdentifier}`);
      configStatus.hasIOSConfig = true;
    } else {
      console.log('❌ iOS configuration missing in app.json');
      configStatus.issues.push('Missing iOS configuration in app.json');
    }

  } catch (error) {
    console.log('❌ Error reading app.json:', error.message);
    configStatus.issues.push('Cannot read app.json file');
  }

  // Check Firebase SDK
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const firebaseDeps = [
      'firebase',
      '@react-native-firebase/app',
      '@react-native-firebase/auth'
    ];

    let firebaseSDKFound = false;
    firebaseDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`✅ ${dep}: ${dependencies[dep]}`);
        firebaseSDKFound = true;
      }
    });

    if (firebaseSDKFound) {
      configStatus.hasFirebaseSDK = true;
    } else {
      console.log('❌ Firebase SDK not found');
      configStatus.issues.push('Missing Firebase SDK dependencies');
    }

  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
}

function generateSetupInstructions() {
  console.log('\n🔥 iOS FIREBASE SETUP INSTRUCTIONS:');
  console.log('=' .repeat(60));

  console.log('\n📋 STEP 1: REGISTER iOS APP IN FIREBASE CONSOLE');
  console.log('-'.repeat(50));
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project: irachat-c172f');
  console.log('3. Click "Add app" and select iOS');
  console.log('4. Enter iOS bundle ID: com.irachat.app');
  console.log('5. Enter App nickname: IraChat iOS');
  console.log('6. Download GoogleService-Info.plist file');

  console.log('\n📁 STEP 2: ADD GoogleService-Info.plist TO PROJECT');
  console.log('-'.repeat(50));
  console.log('1. Place GoogleService-Info.plist in your project root');
  console.log('2. The file should be at: ./GoogleService-Info.plist');
  console.log('3. Make sure the file contains your iOS app configuration');

  console.log('\n⚙️ STEP 3: UPDATE APP.JSON CONFIGURATION');
  console.log('-'.repeat(50));
  console.log('Add Firebase plugin to your app.json plugins array:');
  console.log(`
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      [
        "@react-native-firebase/auth",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}`);

  console.log('\n📦 STEP 4: INSTALL iOS FIREBASE DEPENDENCIES');
  console.log('-'.repeat(50));
  console.log('Run these commands:');
  console.log('npm install @react-native-firebase/app');
  console.log('npm install @react-native-firebase/auth');
  console.log('npm install @react-native-firebase/firestore');
  console.log('npm install @react-native-firebase/storage');

  console.log('\n🏗️ STEP 5: PREBUILD FOR iOS');
  console.log('-'.repeat(50));
  console.log('After adding the plist file and updating configuration:');
  console.log('npx expo prebuild --platform ios --clean');
  console.log('npx expo run:ios');

  console.log('\n🧪 STEP 6: TEST iOS FIREBASE CONNECTION');
  console.log('-'.repeat(50));
  console.log('Run the iOS Firebase test:');
  console.log('node ios-firebase-test.js');
}

function generateConfigurationStatus() {
  console.log('\n📊 CURRENT iOS FIREBASE STATUS:');
  console.log('=' .repeat(60));

  const totalChecks = 4;
  const passedChecks = [
    configStatus.hasGoogleServicesPlist,
    configStatus.hasFirebasePlugin,
    configStatus.hasIOSConfig,
    configStatus.hasFirebaseSDK
  ].filter(Boolean).length;

  const completionRate = Math.round((passedChecks / totalChecks) * 100);

  console.log(`📱 iOS Firebase Configuration: ${completionRate}% Complete`);
  console.log(`✅ Passed: ${passedChecks}/${totalChecks}`);
  console.log(`❌ Issues: ${configStatus.issues.length}`);

  if (configStatus.issues.length > 0) {
    console.log('\n❌ ISSUES TO FIX:');
    configStatus.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('\n🎯 NEXT STEPS:');
  if (completionRate === 100) {
    console.log('🎉 iOS Firebase is fully configured!');
    console.log('✅ Ready for iOS development and testing');
  } else if (completionRate >= 75) {
    console.log('⚠️ Almost ready - fix remaining issues');
    console.log('🔧 Follow the setup instructions above');
  } else if (completionRate >= 50) {
    console.log('🔄 Partial configuration - more work needed');
    console.log('📋 Complete the setup steps above');
  } else {
    console.log('🚨 iOS Firebase setup required');
    console.log('📋 Follow all setup instructions above');
  }

  console.log('\n🔗 HELPFUL LINKS:');
  console.log('📚 Firebase iOS Setup: https://firebase.google.com/docs/ios/setup');
  console.log('📱 Expo Firebase: https://docs.expo.dev/guides/using-firebase/');
  console.log('🔥 React Native Firebase: https://rnfirebase.io/');
}

// Run the iOS Firebase configuration check
async function runIOSFirebaseCheck() {
  try {
    checkCurrentConfiguration();
    generateSetupInstructions();
    generateConfigurationStatus();
  } catch (error) {
    console.error('❌ iOS Firebase check failed:', error.message);
  }
}

runIOSFirebaseCheck().catch(console.error);
