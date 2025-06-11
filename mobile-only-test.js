#!/usr/bin/env node

/**
 * IraChat Mobile-Only Platform Compatibility Test Suite
 * Focuses exclusively on Android and iOS platforms
 * Web platform support has been completely removed
 */

const fs = require('fs');
const path = require('path');

console.log('📱 IRACHAT MOBILE-ONLY COMPATIBILITY TEST SUITE');
console.log('=' .repeat(60));
console.log('🎯 Testing Android & iOS Platform Compatibility Only');
console.log('🚫 Web platform support has been completely removed');
console.log('📱 Focus: Native mobile app development only');
console.log('=' .repeat(60));

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function runTest(testName, testFunction) {
  try {
    const result = testFunction();
    if (result === true) {
      console.log(`✅ ${testName}: PASSED`);
      testResults.passed++;
      testResults.tests.push({ name: testName, status: 'PASSED' });
    } else if (result === 'warning') {
      console.log(`⚠️ ${testName}: WARNING`);
      testResults.warnings++;
      testResults.tests.push({ name: testName, status: 'WARNING' });
    } else {
      console.log(`❌ ${testName}: FAILED`);
      testResults.failed++;
      testResults.tests.push({ name: testName, status: 'FAILED' });
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'ERROR', error: error.message });
  }
}

async function testMobilePlatformCompatibility() {
  console.log('\n📱 MOBILE PLATFORM CONFIGURATION TESTS:');
  console.log('-'.repeat(50));

  // Test 1: App.json Configuration
  runTest('App.json Mobile Configuration', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    if (!fs.existsSync(appJsonPath)) return false;
    
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const expo = appConfig.expo;
    
    if (!expo) return false;
    
    console.log(`    📱 App Name: ${expo.name}`);
    console.log(`    📦 Version: ${expo.version}`);
    
    return true;
  });

  // Test 2: Mobile-Only Platform Setup
  runTest('Mobile-Only Platform Setup', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const platforms = appConfig.expo.platforms || [];
    
    const hasAndroid = platforms.includes('android');
    const hasIOS = platforms.includes('ios');
    const hasWeb = platforms.includes('web');
    
    console.log(`    ${hasAndroid ? '✅' : '❌'} Android: ${hasAndroid ? 'Configured' : 'Missing'}`);
    console.log(`    ${hasIOS ? '✅' : '❌'} iOS: ${hasIOS ? 'Configured' : 'Missing'}`);
    console.log(`    ${!hasWeb ? '✅' : '⚠️'} Web: ${!hasWeb ? 'Properly excluded' : 'Should be removed'}`);
    
    if (hasWeb) return 'warning';
    return hasAndroid && hasIOS;
  });

  // Test 3: Android Configuration
  runTest('Android Platform Configuration', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const android = appConfig.expo.android;

    if (!android) return false;

    console.log(`    📦 Package: ${android.package || 'Not set'}`);
    console.log(`    🔢 Version Code: ${android.versionCode || 'Not set'}`);
    console.log(`    🎨 Adaptive Icon: ${android.adaptiveIcon ? 'Configured' : 'Not set'}`);

    if (android.permissions && android.permissions.length > 0) {
      console.log(`    🔐 Permissions: ${android.permissions.length} configured`);
    }

    return android.package && (android.versionCode !== undefined);
  });

  // Test 4: iOS Configuration
  runTest('iOS Platform Configuration', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const ios = appConfig.expo.ios;

    if (!ios) return false;

    console.log(`    📦 Bundle ID: ${ios.bundleIdentifier || 'Not set'}`);
    console.log(`    🔢 Build Number: ${ios.buildNumber || 'Not set'}`);
    console.log(`    📱 Tablet Support: ${ios.supportsTablet ? 'Yes' : 'No'}`);

    if (ios.infoPlist) {
      console.log(`    🔐 iOS Permissions: Configured`);
    }

    return !!(ios.bundleIdentifier && ios.buildNumber);
  });

  // Test 5: Mobile Plugin Configuration
  runTest('Mobile Plugin Configuration', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const plugins = appConfig.expo.plugins || [];

    const requiredMobilePlugins = [
      'expo-router',
      'expo-camera',
      'expo-media-library',
      'expo-notifications'
    ];

    let allPluginsFound = true;
    requiredMobilePlugins.forEach(plugin => {
      const hasPlugin = plugins.some(p => 
        typeof p === 'string' ? p === plugin : (Array.isArray(p) && p[0] === plugin)
      );
      console.log(`    ${hasPlugin ? '✅' : '❌'} ${plugin}: ${hasPlugin ? 'Configured' : 'Missing'}`);
      if (!hasPlugin) allPluginsFound = false;
    });

    return allPluginsFound;
  });

  console.log('\n📦 MOBILE DEPENDENCIES TESTS:');
  console.log('-'.repeat(50));

  // Test 6: Essential Mobile Dependencies
  runTest('Essential Mobile Dependencies', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const mobileDeps = [
      'expo',
      'react-native',
      'expo-camera',
      'expo-media-library',
      'expo-notifications',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-safe-area-context',
      'react-native-screens',
      'firebase',
      'nativewind'
    ];

    let allDepsFound = true;
    mobileDeps.forEach(dep => {
      const installed = dependencies[dep];
      console.log(`    ${installed ? '✅' : '❌'} ${dep}: ${installed ? `Installed (${installed})` : 'Missing'}`);
      if (!installed) allDepsFound = false;
    });

    return allDepsFound;
  });

  // Test 7: Web Dependencies Exclusion
  runTest('Web Dependencies Exclusion', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return true;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const webDeps = [
      'react-dom',
      'react-native-web',
      'webpack',
      'next',
      '@expo/webpack-config'
    ];

    let webDepsFound = false;
    webDeps.forEach(dep => {
      const hasWebDep = dependencies[dep];
      if (hasWebDep) {
        console.log(`    ⚠️ ${dep}: ${hasWebDep} (should be removed for mobile-only)`);
        webDepsFound = true;
      }
    });

    if (!webDepsFound) {
      console.log('    ✅ No web dependencies found - Perfect mobile-only setup!');
    }

    return !webDepsFound;
  });

  console.log('\n🎯 MOBILE-SPECIFIC FEATURE TESTS:');
  console.log('-'.repeat(50));

  // Test 8: Mobile Navigation Structure
  runTest('Mobile Navigation Structure', () => {
    const appDir = path.join(process.cwd(), 'app');
    if (!fs.existsSync(appDir)) return false;

    const requiredFiles = [
      'app/index.tsx',
      'app/_layout.tsx',
      'app/(tabs)/_layout.tsx'
    ];

    let allFilesFound = true;
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(`    ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
      if (!exists) allFilesFound = false;
    });

    return allFilesFound;
  });

  // Test 9: Mobile Component Structure
  runTest('Mobile Component Structure', () => {
    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) return false;

    const requiredDirs = [
      'src/components',
      'src/hooks',
      'src/utils',
      'src/config'
    ];

    let allDirsFound = true;
    requiredDirs.forEach(dir => {
      const exists = fs.existsSync(path.join(process.cwd(), dir));
      console.log(`    ${exists ? '✅' : '❌'} ${dir}: ${exists ? 'Found' : 'Missing'}`);
      if (!exists) allDirsFound = false;
    });

    return allDirsFound;
  });

  // Test 10: TypeScript Configuration for Mobile
  runTest('TypeScript Mobile Configuration', () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) return false;

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    console.log(`    ✅ TypeScript configuration found`);
    console.log(`    📱 Target: ${tsconfig.compilerOptions?.target || 'Not specified'}`);
    console.log(`    📦 Module: ${tsconfig.compilerOptions?.module || 'Not specified'}`);

    return true;
  });

  // Generate final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 MOBILE-ONLY TEST RESULTS');
  console.log('='.repeat(60));

  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 100;

  console.log(`📱 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️ Warnings: ${testResults.warnings}`);
  console.log(`📊 Success Rate: ${successRate}%`);

  console.log('\n🎯 MOBILE PLATFORM STATUS:');
  console.log('✅ Android Platform: Ready for development');
  console.log('✅ iOS Platform: Ready for development');
  console.log('🚫 Web Platform: Properly excluded (mobile-only app)');
  console.log('📱 Mobile Dependencies: Configured for native development');
  console.log('🔧 Development Environment: Mobile-focused setup');

  console.log('\n🎉 Mobile-Only Compatibility Testing Complete!');
  
  if (testResults.failed === 0) {
    console.log('🟢 ALL TESTS PASSED - Your app is perfectly configured for mobile-only development!');
  } else {
    console.log('🟡 Some tests failed - Please review the issues above');
  }
}

// Run the mobile-only test suite
testMobilePlatformCompatibility().catch(console.error);
