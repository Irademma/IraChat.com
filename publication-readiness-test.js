#!/usr/bin/env node

/**
 * IraChat Publication Readiness Test
 * Comprehensive check for Android and iOS publication readiness
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 IRACHAT PUBLICATION READINESS TEST");
console.log("=".repeat(60));
console.log("📱 Checking Android & iOS publication readiness");
console.log("🏪 Verifying app store submission requirements");
console.log("=".repeat(60));

// Test results tracking
const testResults = {
  android: { passed: 0, failed: 0, total: 0, ready: false },
  ios: { passed: 0, failed: 0, total: 0, ready: false },
  overall: { passed: 0, failed: 0, total: 0 },
};

function runTest(platform, testName, testFunction) {
  testResults[platform].total++;
  testResults.overall.total++;

  try {
    const result = testFunction();
    if (result === true) {
      console.log(`✅ ${testName}: READY`);
      testResults[platform].passed++;
      testResults.overall.passed++;
    } else {
      console.log(`❌ ${testName}: NOT READY`);
      testResults[platform].failed++;
      testResults.overall.failed++;
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    testResults[platform].failed++;
    testResults.overall.failed++;
  }
}

async function testPublicationReadiness() {
  console.log("\n🤖 ANDROID PUBLICATION READINESS:");
  console.log("-".repeat(50));

  // Android Tests
  runTest("android", "Android Package Configuration", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const android = appJson.expo.android;
    return android && android.package && android.versionCode;
  });

  runTest("android", "Android Firebase Configuration", () => {
    return fs.existsSync("google-services.json");
  });

  runTest("android", "Android Permissions", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const permissions = appJson.expo.android?.permissions || [];
    return permissions.length > 0;
  });

  runTest("android", "Android Icon & Assets", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    return (
      appJson.expo.android?.adaptiveIcon &&
      fs.existsSync("assets/images/adaptive-icon.png")
    );
  });

  runTest("android", "Mobile-Only Platform Setup", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const platforms = appJson.expo.platforms || [];
    return platforms.includes("android") && !platforms.includes("web");
  });

  console.log("\n🍎 iOS PUBLICATION READINESS:");
  console.log("-".repeat(50));

  // iOS Tests
  runTest("ios", "iOS Bundle Configuration", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const ios = appJson.expo.ios;
    return ios && ios.bundleIdentifier && ios.buildNumber;
  });

  runTest("ios", "iOS Firebase Configuration", () => {
    return fs.existsSync("GoogleService-Info.plist");
  });

  runTest("ios", "iOS Permissions (Info.plist)", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const infoPlist = appJson.expo.ios?.infoPlist || {};
    const requiredPermissions = [
      "NSCameraUsageDescription",
      "NSMicrophoneUsageDescription",
      "NSPhotoLibraryUsageDescription",
    ];
    return requiredPermissions.every((permission) => infoPlist[permission]);
  });

  runTest("ios", "iOS Firebase Plugins", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const plugins = appJson.expo.plugins || [];
    return plugins.some(
      (p) => typeof p === "string" && p === "@react-native-firebase/app",
    );
  });

  runTest("ios", "iOS App Store IDs (Optional)", () => {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const ios = appJson.expo.ios;
    // This is optional for development, but shows status
    if (ios.teamId && ios.appStoreId) {
      return true;
    } else {
      console.log(
        "    ⚠️ Team ID & App Store ID missing (needed for App Store submission)",
      );
      return "optional";
    }
  });

  console.log("\n🔧 TECHNICAL REQUIREMENTS:");
  console.log("-".repeat(50));

  // Technical Tests
  runTest("android", "Firebase Dependencies", () => {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return deps.firebase && deps["@react-native-firebase/app"];
  });

  runTest("android", "Mobile Dependencies", () => {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return deps["react-native"] && deps["expo"];
  });

  runTest("android", "No Web Dependencies", () => {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const webDeps = ["react-dom", "react-native-web", "webpack"];
    return !webDeps.some((dep) => deps[dep]);
  });

  runTest("android", "App Structure", () => {
    return (
      fs.existsSync("app") && fs.existsSync("src") && fs.existsSync("assets")
    );
  });

  // Calculate readiness
  testResults.android.ready = testResults.android.failed === 0;
  testResults.ios.ready = testResults.ios.passed >= 4; // iOS can be ready without App Store IDs

  // Generate final report
  console.log("\n" + "=".repeat(60));
  console.log("📊 PUBLICATION READINESS RESULTS");
  console.log("=".repeat(60));

  console.log("\n🤖 ANDROID READINESS:");
  const androidRate = Math.round(
    (testResults.android.passed / testResults.android.total) * 100,
  );
  console.log(`📊 Success Rate: ${androidRate}%`);
  console.log(
    `✅ Passed: ${testResults.android.passed}/${testResults.android.total}`,
  );
  console.log(`❌ Failed: ${testResults.android.failed}`);
  console.log(
    `🚀 Ready for Google Play Store: ${testResults.android.ready ? "YES" : "NO"}`,
  );

  console.log("\n🍎 iOS READINESS:");
  const iosRate = Math.round(
    (testResults.ios.passed / testResults.ios.total) * 100,
  );
  console.log(`📊 Success Rate: ${iosRate}%`);
  console.log(`✅ Passed: ${testResults.ios.passed}/${testResults.ios.total}`);
  console.log(`❌ Failed: ${testResults.ios.failed}`);
  console.log(
    `🚀 Ready for Development/TestFlight: ${testResults.ios.ready ? "YES" : "NO"}`,
  );
  console.log(
    `🏪 Ready for App Store: ${testResults.ios.passed === testResults.ios.total ? "YES" : "NO (needs Apple Developer Account)"}`,
  );

  console.log("\n🎯 PUBLICATION STRATEGY:");
  if (testResults.android.ready && testResults.ios.ready) {
    console.log("🎉 PERFECT! Both platforms ready for publication");
    console.log(
      "🚀 Recommended: Publish Android first, iOS when you get Apple Developer Account",
    );
  } else if (testResults.android.ready) {
    console.log("🤖 Android is READY for immediate publication!");
    console.log(
      "🍎 iOS needs Apple Developer Account for App Store submission",
    );
    console.log("💡 Strategy: Publish Android now, add iOS later");
  } else {
    console.log("🔧 Some issues need to be fixed before publication");
  }

  console.log("\n🚀 NEXT STEPS:");
  if (testResults.android.ready) {
    console.log("📱 ANDROID (Ready for publication):");
    console.log("1. eas build --platform android --profile production");
    console.log("2. eas submit --platform android");
    console.log("3. Upload to Google Play Store");
    console.log("4. Start getting Android users!");
  }

  if (testResults.ios.ready) {
    console.log("\n📱 iOS (Ready for development):");
    console.log("1. Continue testing with Expo Go");
    console.log("2. eas build --platform ios (for TestFlight)");
    console.log("3. Get Apple Developer Account when ready for App Store");
    console.log("4. Add Team ID and App Store ID");
    console.log("5. Submit to Apple App Store");
  }

  console.log("\n🎉 Publication Readiness Check Complete!");
}

// Run the publication readiness test
testPublicationReadiness().catch(console.error);
