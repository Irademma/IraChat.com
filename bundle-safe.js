#!/usr/bin/env node

/**
 * IraChat Safe Bundle Script
 * Ensures safe bundling with crash prevention and size optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 IraChat Safe Bundle Script Starting...\n');

// Pre-bundle checks
function preBundleChecks() {
  console.log('📋 Running pre-bundle checks...');
  
  // Check if required files exist
  const requiredFiles = [
    'app.json',
    'package.json',
    'assets/images/LOGO.png',
    'assets/images/BACKGROUND.png'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All required files present');
  
  // Check package.json for potential issues
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.main) {
    console.error('❌ package.json missing main entry point');
    process.exit(1);
  }
  
  console.log('✅ Package.json validated');
}

// Clean build artifacts
function cleanBuild() {
  console.log('🧹 Cleaning build artifacts...');
  
  try {
    if (fs.existsSync('android/app/build')) {
      execSync('rm -rf android/app/build', { stdio: 'inherit' });
    }
    if (fs.existsSync('.expo')) {
      execSync('rm -rf .expo', { stdio: 'inherit' });
    }
    console.log('✅ Build artifacts cleaned');
  } catch (error) {
    console.warn('⚠️ Warning: Could not clean all build artifacts');
  }
}

// Build the app
function buildApp() {
  console.log('🔨 Building IraChat app...');
  
  try {
    // Build for Android
    console.log('📱 Building Android APK...');
    execSync('npx expo build:android --type apk --release-channel production', { 
      stdio: 'inherit',
      timeout: 600000 // 10 minutes timeout
    });
    
    console.log('✅ Android build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Post-build verification
function postBuildVerification() {
  console.log('🔍 Running post-build verification...');
  
  // Check if APK was generated
  const buildDir = 'android/app/build/outputs/apk/release';
  if (fs.existsSync(buildDir)) {
    const apkFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.apk'));
    if (apkFiles.length > 0) {
      console.log('✅ APK generated successfully');
      console.log(`📦 APK location: ${buildDir}/${apkFiles[0]}`);
      
      // Check APK size
      const apkPath = path.join(buildDir, apkFiles[0]);
      const stats = fs.statSync(apkPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📏 APK size: ${sizeInMB} MB`);
      
      if (parseFloat(sizeInMB) > 100) {
        console.warn('⚠️ Warning: APK size is quite large. Consider optimizing.');
      }
    } else {
      console.error('❌ No APK files found in build directory');
      process.exit(1);
    }
  } else {
    console.error('❌ Build directory not found');
    process.exit(1);
  }
}

// Main execution
function main() {
  try {
    preBundleChecks();
    cleanBuild();
    buildApp();
    postBuildVerification();
    
    console.log('\n🎉 IraChat bundle completed successfully!');
    console.log('📱 Your app is ready for installation via USB');
    console.log('\n💡 Next steps:');
    console.log('1. Connect your Android device via USB');
    console.log('2. Enable USB debugging on your device');
    console.log('3. Install the APK using: adb install path/to/your.apk');
    
  } catch (error) {
    console.error('\n❌ Bundle process failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
