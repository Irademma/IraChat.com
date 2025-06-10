#!/usr/bin/env node

/**
 * Comprehensive IraChat App Testing Script
 * Tests all critical functionality and navigation paths
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive IraChat App Test...\n');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function logTest(name, status, message = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}${message ? ` - ${message}` : ''}`);
  
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') {
    testResults.failed++;
    testResults.issues.push(`${name}: ${message}`);
  } else {
    testResults.warnings++;
  }
}

// Test 1: Critical File Existence
console.log('📁 Testing Critical Files...');

const criticalFiles = [
  'app/_layout.tsx',
  'app/index.tsx',
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/groups.tsx',
  'app/(tabs)/updates.tsx',
  'app/(tabs)/calls.tsx',
  'app/chat/[id].tsx',
  'app/new-chat.tsx',
  'src/services/firebaseSimple.ts',
  'src/components/ErrorBoundary.tsx',
  'src/components/ThemeProvider.tsx',
  'src/redux/store.ts',
  'package.json'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    logTest(`File exists: ${file}`, 'PASS');
  } else {
    logTest(`File missing: ${file}`, 'FAIL', 'Required file not found');
  }
});

// Test 2: Import Dependencies
console.log('\n📦 Testing Import Dependencies...');

function checkImports(filePath, requiredImports) {
  if (!fs.existsSync(filePath)) {
    logTest(`Imports in ${filePath}`, 'FAIL', 'File not found');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const missingImports = requiredImports.filter(imp => !content.includes(imp));
  
  if (missingImports.length === 0) {
    logTest(`Imports in ${path.basename(filePath)}`, 'PASS');
  } else {
    logTest(`Imports in ${path.basename(filePath)}`, 'FAIL', `Missing: ${missingImports.join(', ')}`);
  }
}

// Check critical imports
checkImports('app/_layout.tsx', ['ErrorBoundary', 'ThemeProvider', 'Provider', 'store']);
checkImports('app/(tabs)/index.tsx', ['EmptyState', 'formatChatTime', 'Chat']);
checkImports('app/(tabs)/groups.tsx', ['useTabNavigation']);
checkImports('app/chat/[id].tsx', ['formatMessageTime', 'EmptyState']);

// Test 3: Component Structure
console.log('\n🧩 Testing Component Structure...');

function checkComponentStructure(filePath, expectedExports) {
  if (!fs.existsSync(filePath)) {
    logTest(`Component structure: ${filePath}`, 'FAIL', 'File not found');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasDefaultExport = content.includes('export default');
  
  if (hasDefaultExport) {
    logTest(`Component structure: ${path.basename(filePath)}`, 'PASS');
  } else {
    logTest(`Component structure: ${path.basename(filePath)}`, 'FAIL', 'No default export found');
  }
}

const componentFiles = [
  'src/components/ErrorBoundary.tsx',
  'src/components/ThemeProvider.tsx',
  'src/components/EmptyState.tsx',
  'src/components/ContactItem.tsx'
];

componentFiles.forEach(file => checkComponentStructure(file));

// Test 4: Navigation Structure
console.log('\n🧭 Testing Navigation Structure...');

function checkNavigationRoutes() {
  const tabsLayout = 'app/(tabs)/_layout.tsx';
  if (!fs.existsSync(tabsLayout)) {
    logTest('Navigation routes', 'FAIL', 'Tabs layout not found');
    return;
  }
  
  const content = fs.readFileSync(tabsLayout, 'utf8');
  const requiredTabs = ['index', 'groups', 'updates', 'calls'];
  const missingTabs = requiredTabs.filter(tab => !content.includes(`name="${tab}"`));
  
  if (missingTabs.length === 0) {
    logTest('Navigation routes', 'PASS');
  } else {
    logTest('Navigation routes', 'FAIL', `Missing tabs: ${missingTabs.join(', ')}`);
  }
}

checkNavigationRoutes();

// Test 5: Firebase Configuration
console.log('\n🔥 Testing Firebase Configuration...');

function checkFirebaseConfig() {
  const firebaseConfig = 'src/config/firebase.ts';
  if (!fs.existsSync(firebaseConfig)) {
    logTest('Firebase config', 'FAIL', 'Config file not found');
    return;
  }
  
  const content = fs.readFileSync(firebaseConfig, 'utf8');
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
  const hasAllFields = requiredFields.every(field => content.includes(field));
  
  if (hasAllFields) {
    logTest('Firebase config', 'PASS');
  } else {
    logTest('Firebase config', 'FAIL', 'Missing required configuration fields');
  }
}

checkFirebaseConfig();

// Test 6: Redux Store
console.log('\n🏪 Testing Redux Store...');

function checkReduxStore() {
  const storePath = 'src/redux/store.ts';
  if (!fs.existsSync(storePath)) {
    logTest('Redux store', 'FAIL', 'Store file not found');
    return;
  }
  
  const content = fs.readFileSync(storePath, 'utf8');
  const hasConfigureStore = content.includes('configureStore');
  const hasExport = content.includes('export const store');
  
  if (hasConfigureStore && hasExport) {
    logTest('Redux store', 'PASS');
  } else {
    logTest('Redux store', 'FAIL', 'Store not properly configured');
  }
}

checkReduxStore();

// Test 7: Package Dependencies
console.log('\n📋 Testing Package Dependencies...');

function checkPackageDependencies() {
  if (!fs.existsSync('package.json')) {
    logTest('Package dependencies', 'FAIL', 'package.json not found');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'expo-router',
    'react-native',
    'firebase',
    '@reduxjs/toolkit',
    'react-redux',
    'nativewind'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length === 0) {
    logTest('Package dependencies', 'PASS');
  } else {
    logTest('Package dependencies', 'FAIL', `Missing: ${missingDeps.join(', ')}`);
  }
}

checkPackageDependencies();

// Test 8: Asset Files
console.log('\n🖼️ Testing Asset Files...');

const requiredAssets = [
  'assets/images/LOGO.png',
  'assets/images/comment.png'
];

requiredAssets.forEach(asset => {
  if (fs.existsSync(asset)) {
    logTest(`Asset: ${path.basename(asset)}`, 'PASS');
  } else {
    logTest(`Asset: ${path.basename(asset)}`, 'WARN', 'Asset file not found');
  }
});

// Test 9: TypeScript Configuration
console.log('\n📝 Testing TypeScript Configuration...');

function checkTypeScriptConfig() {
  if (fs.existsSync('tsconfig.json')) {
    logTest('TypeScript config', 'PASS');
  } else {
    logTest('TypeScript config', 'WARN', 'tsconfig.json not found');
  }
}

checkTypeScriptConfig();

// Test 10: App Entry Points
console.log('\n🚪 Testing App Entry Points...');

function checkEntryPoints() {
  const appTsx = 'App.tsx';
  const indexTsx = 'app/index.tsx';
  
  if (fs.existsSync(appTsx) && fs.existsSync(indexTsx)) {
    logTest('App entry points', 'PASS');
  } else {
    logTest('App entry points', 'FAIL', 'Missing entry point files');
  }
}

checkEntryPoints();

// Final Results
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`⚠️ Warnings: ${testResults.warnings}`);

if (testResults.failed > 0) {
  console.log('\n🚨 CRITICAL ISSUES FOUND:');
  testResults.issues.forEach(issue => console.log(`   • ${issue}`));
}

if (testResults.failed === 0) {
  console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
  console.log('✨ Your IraChat app is ready for development and testing!');
  
  console.log('\n📱 NEXT STEPS:');
  console.log('1. Run: npm start (or expo start)');
  console.log('2. Test on device/simulator');
  console.log('3. Verify Firebase connection');
  console.log('4. Test all navigation flows');
  console.log('5. Test chat functionality');
} else {
  console.log('\n⚠️ Please fix the critical issues above before proceeding.');
}

console.log('\n' + '='.repeat(50));
