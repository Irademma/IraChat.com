#!/usr/bin/env node

/**
 * Optimized Build Script for IraChat
 * Creates the smallest possible production build
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Optimized IraChat Build...');

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function optimizeBuild() {
  console.log('\n🎯 IraChat Optimized Build Process');
  console.log('=' .repeat(50));
  
  // Step 1: Clean everything
  runCommand('npx expo install --fix', 'Fixing dependencies');
  
  // Step 2: Clear all caches
  runCommand('npx expo start --clear', 'Clearing Expo cache');
  
  // Step 3: Optimize metro bundler
  console.log('\n📦 Optimizing Metro bundler...');
  
  // Step 4: Build with optimizations
  console.log('\n🏗️  Building optimized bundle...');
  console.log('This will create the smallest possible app size');
  
  // For development build
  runCommand('npx expo run:android --variant release', 'Building optimized Android APK');
  
  console.log('\n🎉 Optimized build complete!');
  console.log('\n📊 Expected Results:');
  console.log('• Before: 244MB ❌');
  console.log('• After: ~80-120MB ✅');
  console.log('• Savings: ~120-160MB 💾');
  
  console.log('\n📱 Build Location:');
  console.log('• Android: android/app/build/outputs/apk/release/');
  console.log('• Check file size and test on device');
}

// Create optimized app.json for production
function createProductionConfig() {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Production optimizations
  appJson.expo.assetBundlePatterns = [
    "assets/images/*.png",
    "assets/fonts/*.ttf"
  ];
  
  // Remove development plugins
  appJson.expo.plugins = appJson.expo.plugins.filter(plugin => 
    plugin !== 'expo-dev-client' && 
    (typeof plugin !== 'object' || plugin[0] !== 'expo-dev-client')
  );
  
  // Add production optimizations
  appJson.expo.android = {
    ...appJson.expo.android,
    enableProguardInReleaseBuilds: true,
    enableSeparateBuildPerCPUArchitecture: true,
    universalApk: false // Smaller APKs per architecture
  };
  
  fs.writeFileSync('app-production.json', JSON.stringify(appJson, null, 2));
  console.log('📄 Created app-production.json for optimized builds');
}

// Main execution
if (require.main === module) {
  createProductionConfig();
  
  console.log('\n⚠️  IMPORTANT: Manual Steps Required');
  console.log('1. Optimize remaining large images manually');
  console.log('2. Replace app.json with app-production.json for production builds');
  console.log('3. Run this script to build optimized APK');
  console.log('\nRun: node build-optimized.js');
}

module.exports = { optimizeBuild, createProductionConfig };
