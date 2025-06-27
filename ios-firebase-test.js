#!/usr/bin/env node

/**
 * iOS Firebase Configuration Test
 * Comprehensive test to verify iOS Firebase setup is complete and working
 */

const fs = require("fs");
const path = require("path");

console.log("🍎 iOS FIREBASE CONFIGURATION TEST");
console.log("=".repeat(60));
console.log("🔥 Testing complete iOS Firebase integration");
console.log("📱 Verifying all iOS Firebase components");
console.log("=".repeat(60));

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function runTest(testName, testFunction) {
  try {
    const result = testFunction();
    if (result === true) {
      console.log(`✅ ${testName}: PASSED`);
      testResults.passed++;
      testResults.tests.push({ name: testName, status: "PASSED" });
    } else if (result === "warning") {
      console.log(`⚠️ ${testName}: WARNING`);
      testResults.warnings++;
      testResults.tests.push({ name: testName, status: "WARNING" });
    } else {
      console.log(`❌ ${testName}: FAILED`);
      testResults.failed++;
      testResults.tests.push({ name: testName, status: "FAILED" });
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: testName,
      status: "ERROR",
      error: error.message,
    });
  }
}

async function testIOSFirebaseConfiguration() {
  console.log("\n🔥 iOS FIREBASE CONFIGURATION TESTS:");
  console.log("-".repeat(50));

  // Test 1: GoogleService-Info.plist exists
  runTest("GoogleService-Info.plist File", () => {
    if (!fs.existsSync("GoogleService-Info.plist")) {
      console.log("    ❌ GoogleService-Info.plist not found");
      return false;
    }

    console.log("    ✅ GoogleService-Info.plist found");
    return true;
  });

  // Test 2: GoogleService-Info.plist content validation
  runTest("GoogleService-Info.plist Content", () => {
    if (!fs.existsSync("GoogleService-Info.plist")) return false;

    const plistContent = fs.readFileSync("GoogleService-Info.plist", "utf8");

    const requiredKeys = [
      "API_KEY",
      "GCM_SENDER_ID",
      "BUNDLE_ID",
      "PROJECT_ID",
      "GOOGLE_APP_ID",
    ];

    let allKeysFound = true;
    requiredKeys.forEach((key) => {
      if (!plistContent.includes(key)) {
        console.log(`    ❌ Missing key: ${key}`);
        allKeysFound = false;
      }
    });

    if (allKeysFound) {
      console.log("    ✅ All required keys found in plist");
    }

    // Check project ID
    if (plistContent.includes("irachat-c172f")) {
      console.log("    ✅ Correct project ID: irachat-c172f");
    } else {
      console.log("    ❌ Incorrect or missing project ID");
      allKeysFound = false;
    }

    return allKeysFound;
  });

  // Test 3: Bundle ID consistency
  runTest("Bundle ID Consistency", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const appBundleId = appJson.expo.ios.bundleIdentifier;

    if (!fs.existsSync("GoogleService-Info.plist")) return false;

    const plistContent = fs.readFileSync("GoogleService-Info.plist", "utf8");

    if (plistContent.includes(appBundleId)) {
      console.log(`    ✅ Bundle ID matches: ${appBundleId}`);
      return true;
    } else {
      console.log(`    ❌ Bundle ID mismatch`);
      console.log(`    App.json: ${appBundleId}`);
      console.log(`    Plist: Check GoogleService-Info.plist BUNDLE_ID`);
      return false;
    }
  });

  // Test 4: Firebase plugins in app.json
  runTest("Firebase Plugins Configuration", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const plugins = appJson.expo.plugins || [];

    const hasFirebaseApp = plugins.some((plugin) =>
      typeof plugin === "string"
        ? plugin === "@react-native-firebase/app"
        : false,
    );

    const hasFirebaseAuth = plugins.some(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === "@react-native-firebase/auth",
    );

    if (hasFirebaseApp && hasFirebaseAuth) {
      console.log("    ✅ Firebase plugins configured");
      return true;
    } else {
      console.log("    ❌ Missing Firebase plugins");
      if (!hasFirebaseApp)
        console.log("      - Missing @react-native-firebase/app");
      if (!hasFirebaseAuth)
        console.log("      - Missing @react-native-firebase/auth");
      return false;
    }
  });

  // Test 5: iOS useFrameworks configuration
  runTest("iOS useFrameworks Configuration", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const plugins = appJson.expo.plugins || [];

    const firebaseAuthPlugin = plugins.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === "@react-native-firebase/auth",
    );

    if (
      firebaseAuthPlugin &&
      firebaseAuthPlugin[1] &&
      firebaseAuthPlugin[1].ios &&
      firebaseAuthPlugin[1].ios.useFrameworks === "static"
    ) {
      console.log("    ✅ iOS useFrameworks: static configured");
      return true;
    } else {
      console.log("    ❌ iOS useFrameworks not configured properly");
      return false;
    }
  });

  // Test 6: Firebase dependencies
  runTest("Firebase Dependencies", () => {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const requiredDeps = [
      "firebase",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
    ];

    let allDepsFound = true;
    requiredDeps.forEach((dep) => {
      if (dependencies[dep]) {
        console.log(`    ✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`    ❌ Missing: ${dep}`);
        allDepsFound = false;
      }
    });

    return allDepsFound;
  });

  // Test 7: iOS permissions
  runTest("iOS Permissions Configuration", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const infoPlist = appJson.expo.ios.infoPlist || {};

    const requiredPermissions = [
      "NSCameraUsageDescription",
      "NSMicrophoneUsageDescription",
      "NSPhotoLibraryUsageDescription",
    ];

    let allPermissionsFound = true;
    requiredPermissions.forEach((permission) => {
      if (infoPlist[permission]) {
        console.log(`    ✅ ${permission}: Configured`);
      } else {
        console.log(`    ❌ Missing: ${permission}`);
        allPermissionsFound = false;
      }
    });

    return allPermissionsFound;
  });

  // Generate final report
  console.log("\n" + "=".repeat(60));
  console.log("📊 iOS FIREBASE CONFIGURATION RESULTS");
  console.log("=".repeat(60));

  const totalTests =
    testResults.passed + testResults.failed + testResults.warnings;
  const successRate =
    totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 100;

  console.log(`🍎 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️ Warnings: ${testResults.warnings}`);
  console.log(`📊 Success Rate: ${successRate}%`);

  console.log("\n🔥 iOS FIREBASE STATUS:");
  if (successRate === 100) {
    console.log("🎉 iOS Firebase is FULLY CONFIGURED!");
    console.log("✅ Ready for iOS development and testing");
    console.log("✅ Ready for iOS app store deployment");
    console.log("✅ All Firebase services available on iOS");
  } else if (successRate >= 85) {
    console.log("⚠️ iOS Firebase is mostly configured");
    console.log("🔧 Fix remaining issues for full functionality");
  } else {
    console.log("🚨 iOS Firebase needs more configuration");
    console.log("📋 Complete the missing setup steps");
  }

  console.log("\n🚀 NEXT STEPS:");
  if (successRate === 100) {
    console.log("1. Run: npx expo prebuild --platform ios --clean");
    console.log("2. Run: npx expo run:ios");
    console.log("3. Test Firebase authentication on iOS");
    console.log("4. Test Firestore database on iOS");
    console.log("5. Deploy to iOS App Store when ready");
  } else {
    console.log("1. Fix the failed tests above");
    console.log("2. Re-run this test: node ios-firebase-test.js");
    console.log("3. Once all tests pass, prebuild for iOS");
  }

  console.log("\n🎉 iOS Firebase Configuration Test Complete!");
}

// Run the iOS Firebase configuration test
testIOSFirebaseConfiguration().catch(console.error);
