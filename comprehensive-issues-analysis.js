#!/usr/bin/env node

/**
 * COMPREHENSIVE ISSUES ANALYSIS - Finding ALL real problems
 * Deep dive into every aspect that could break in production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE ISSUES ANALYSIS - FINDING ALL REAL PROBLEMS');
console.log('=' .repeat(80));
console.log('🚨 Deep dive into every aspect that could break in production');
console.log('=' .repeat(80));

const criticalIssues = [];
const majorIssues = [];
const minorIssues = [];

function addIssue(severity, category, description, details) {
  const issue = { category, description, details };
  
  if (severity === 'critical') {
    criticalIssues.push(issue);
    console.log(`💀 CRITICAL: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
  } else if (severity === 'major') {
    majorIssues.push(issue);
    console.log(`🔥 MAJOR: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
  } else {
    minorIssues.push(issue);
    console.log(`⚠️ MINOR: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
  }
  console.log('');
}

console.log('\n🔍 ANALYZING ALL POSSIBLE ISSUES...\n');

// 1. RUNTIME ERRORS AND CRASHES
try {
  console.log('🔍 Checking for runtime errors...');
  
  // Check for missing imports
  const files = [
    'app/(tabs)/index.tsx',
    'app/(tabs)/groups.tsx', 
    'app/(tabs)/calls.tsx',
    'app/(tabs)/updates.tsx',
    'app/chat/[id].tsx',
    'app/call.tsx'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for undefined variables
      if (content.includes('setUpdates') && !content.includes('useState')) {
        addIssue('critical', 'Runtime Error', `${file} uses setUpdates without useState`, 'App will crash on load');
      }
      
      // Check for missing type definitions
      if (content.includes(': Update') && !content.includes('interface Update')) {
        const typesFile = 'src/types/index.ts';
        if (!fs.existsSync(typesFile)) {
          addIssue('critical', 'Type Error', `${file} uses Update type but types file missing`, 'TypeScript compilation will fail');
        }
      }
      
      // Check for async/await without try-catch
      const asyncMatches = content.match(/await\s+\w+/g);
      if (asyncMatches && asyncMatches.length > 0) {
        const tryMatches = content.match(/try\s*{/g);
        const catchMatches = content.match(/catch\s*\(/g);

        // If we have proper error handling (try-catch), it's good
        if (!tryMatches || !catchMatches ||
            tryMatches.length === 0 || catchMatches.length === 0) {
          addIssue('major', 'Error Handling', `${file} has unhandled async operations`, 'App may crash on network errors');
        }
      }
    }
  });
} catch (error) {
  addIssue('critical', 'Analysis Error', 'Failed to analyze runtime errors', error.message);
}

// 2. FIREBASE CONFIGURATION ISSUES
try {
  console.log('🔍 Checking Firebase configuration...');
  
  const firebaseConfig = 'src/services/firebaseSimple.ts';
  if (fs.existsSync(firebaseConfig)) {
    const content = fs.readFileSync(firebaseConfig, 'utf8');
    
    // Check for placeholder values
    if (content.includes('your-project-id') || content.includes('placeholder')) {
      addIssue('critical', 'Firebase Config', 'Firebase still has placeholder values', 'App cannot connect to backend');
    }
    
    // Check for missing environment variables
    if (content.includes('process.env') && !fs.existsSync('.env')) {
      addIssue('critical', 'Environment Variables', 'Missing .env file for Firebase config', 'Firebase will not initialize');
    }
    
    // Check for security rules
    if (!fs.existsSync('firestore.rules')) {
      addIssue('major', 'Security Rules', 'No Firestore security rules defined', 'Database is completely open to public');
    }
  }
} catch (error) {
  addIssue('critical', 'Firebase Analysis Error', 'Failed to analyze Firebase config', error.message);
}

// 3. NAVIGATION AND ROUTING ISSUES
try {
  console.log('🔍 Checking navigation and routing...');
  
  // Check for broken routes
  const routeFiles = [
    'app/welcome.tsx',
    'app/(auth)/index.tsx', 
    'app/register.tsx',
    'app/(tabs)/_layout.tsx',
    'app/chat/[id].tsx',
    'app/call.tsx',
    'app/new-chat.tsx',
    'app/create-group.tsx',
    'app/edit-profile.tsx',
    'app/notifications-settings.tsx'
  ];
  
  routeFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      addIssue('major', 'Missing Route', `Route ${file} is missing`, 'Navigation will break when trying to access this screen');
    }
  });
  
  // Check for circular navigation
  const tabLayout = 'app/(tabs)/_layout.tsx';
  if (fs.existsSync(tabLayout)) {
    const content = fs.readFileSync(tabLayout, 'utf8');
    if (!content.includes('Tabs.Screen')) {
      addIssue('critical', 'Tab Navigation', 'Tab layout has no screens defined', 'Tab navigation will not work');
    }
  }
} catch (error) {
  addIssue('critical', 'Navigation Analysis Error', 'Failed to analyze navigation', error.message);
}

// 4. STATE MANAGEMENT ISSUES
try {
  console.log('🔍 Checking state management...');
  
  const store = 'src/redux/store.ts';
  if (fs.existsSync(store)) {
    const content = fs.readFileSync(store, 'utf8');
    
    // Check for missing reducers
    if (!content.includes('userReducer') || !content.includes('chatReducer')) {
      addIssue('critical', 'Redux Store', 'Missing essential reducers', 'App state management will fail');
    }
    
    // Check for persistence issues - look in layout file for PersistGate
    if (content.includes('persistReducer')) {
      const layoutFile = 'app/_layout.tsx';
      if (fs.existsSync(layoutFile)) {
        const layoutContent = fs.readFileSync(layoutFile, 'utf8');
        if (!layoutContent.includes('PersistGate')) {
          addIssue('major', 'Redux Persist', 'Persist configured but PersistGate missing', 'App may not rehydrate state properly');
        }
      } else {
        addIssue('major', 'Redux Persist', 'Persist configured but PersistGate missing', 'App may not rehydrate state properly');
      }
    }
  }
  
  // Check slice files
  const slices = ['src/redux/userSlice.ts', 'src/redux/chatSlice.ts'];
  slices.forEach(slice => {
    if (!fs.existsSync(slice)) {
      addIssue('critical', 'Redux Slice', `${slice} is missing`, 'Redux store will fail to initialize');
    }
  });
} catch (error) {
  addIssue('critical', 'State Management Error', 'Failed to analyze state management', error.message);
}

// 5. PERMISSIONS AND PLATFORM ISSUES
try {
  console.log('🔍 Checking permissions and platform compatibility...');
  
  const appJson = 'app.json';
  if (fs.existsSync(appJson)) {
    const content = fs.readFileSync(appJson, 'utf8');
    const config = JSON.parse(content);
    
    // Check for missing permissions
    const requiredPermissions = [
      'CAMERA',
      'READ_EXTERNAL_STORAGE', 
      'WRITE_EXTERNAL_STORAGE',
      'RECORD_AUDIO',
      'READ_CONTACTS'
    ];
    
    if (!config.expo?.android?.permissions) {
      addIssue('critical', 'Android Permissions', 'No Android permissions defined', 'App features will not work on Android');
    } else {
      requiredPermissions.forEach(permission => {
        if (!config.expo.android.permissions.includes(permission)) {
          addIssue('major', 'Missing Permission', `Android permission ${permission} missing`, 'Related features will not work');
        }
      });
    }
    
    // Check iOS permissions
    if (!config.expo?.ios?.infoPlist) {
      addIssue('major', 'iOS Permissions', 'No iOS info.plist permissions defined', 'App features will not work on iOS');
    }
  }
} catch (error) {
  addIssue('critical', 'Permissions Analysis Error', 'Failed to analyze permissions', error.message);
}

// 6. PACKAGE DEPENDENCIES ISSUES
try {
  console.log('🔍 Checking package dependencies...');
  
  const packageJson = 'package.json';
  if (fs.existsSync(packageJson)) {
    const content = fs.readFileSync(packageJson, 'utf8');
    const pkg = JSON.parse(content);
    
    // Check for missing essential dependencies
    const requiredDeps = [
      'expo',
      'react',
      'react-native',
      'firebase',
      '@reduxjs/toolkit',
      'react-redux',
      'expo-router',
      'expo-image-picker',
      'expo-contacts',
      'react-native-webrtc'
    ];
    
    requiredDeps.forEach(dep => {
      if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
        addIssue('critical', 'Missing Dependency', `Required package ${dep} is missing`, 'App will fail to build or run');
      }
    });
    
    // Check for version conflicts
    if (pkg.dependencies?.['react-native'] && pkg.dependencies?.['expo']) {
      // This would need more complex version checking
      addIssue('minor', 'Version Check', 'Should verify React Native and Expo version compatibility', 'May cause build issues');
    }
  }
} catch (error) {
  addIssue('critical', 'Dependencies Analysis Error', 'Failed to analyze dependencies', error.message);
}

// 7. BUILD AND DEPLOYMENT ISSUES
try {
  console.log('🔍 Checking build and deployment configuration...');
  
  // Check EAS configuration
  if (!fs.existsSync('eas.json')) {
    addIssue('major', 'EAS Config', 'No eas.json file found', 'Cannot build for app stores');
  }
  
  // Check app.json for store requirements
  const appJson = 'app.json';
  if (fs.existsSync(appJson)) {
    const content = fs.readFileSync(appJson, 'utf8');
    const config = JSON.parse(content);
    
    if (!config.expo?.android?.package) {
      addIssue('major', 'Android Package', 'No Android package name defined', 'Cannot build Android app');
    }
    
    if (!config.expo?.ios?.bundleIdentifier) {
      addIssue('major', 'iOS Bundle ID', 'No iOS bundle identifier defined', 'Cannot build iOS app');
    }
    
    if (!config.expo?.version) {
      addIssue('minor', 'App Version', 'No app version defined', 'App store submission may fail');
    }
  }
} catch (error) {
  addIssue('critical', 'Build Analysis Error', 'Failed to analyze build config', error.message);
}

// 8. PERFORMANCE AND MEMORY ISSUES
try {
  console.log('🔍 Checking for potential performance issues...');
  
  // Check for large bundle size issues
  const files = [
    'app/(tabs)/updates.tsx',
    'app/(tabs)/index.tsx',
    'app/chat/[id].tsx'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for missing optimization
      if (content.includes('FlatList') && !content.includes('getItemLayout')) {
        addIssue('minor', 'Performance', `${file} FlatList missing getItemLayout`, 'May cause scroll performance issues');
      }
      
      // Check for memory leaks
      if (content.includes('useEffect') && !content.includes('return')) {
        addIssue('major', 'Memory Leak', `${file} useEffect missing cleanup`, 'May cause memory leaks');
      }
    }
  });
} catch (error) {
  addIssue('minor', 'Performance Analysis Error', 'Failed to analyze performance', error.message);
}

// Generate comprehensive report
console.log('\n' + '='.repeat(80));
console.log('📊 COMPREHENSIVE ISSUES ANALYSIS RESULTS');
console.log('='.repeat(80));

console.log(`\n💀 CRITICAL ISSUES (App Breaking): ${criticalIssues.length}`);
console.log(`🔥 MAJOR ISSUES (Feature Breaking): ${majorIssues.length}`);
console.log(`⚠️ MINOR ISSUES (Polish Needed): ${minorIssues.length}`);

const totalIssues = criticalIssues.length + majorIssues.length + minorIssues.length;
console.log(`\n📈 TOTAL ISSUES FOUND: ${totalIssues}`);

if (criticalIssues.length > 0) {
  console.log('\n💀 CRITICAL ISSUES THAT MUST BE FIXED:');
  criticalIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
    console.log(`   Details: ${issue.details}`);
    console.log('');
  });
}

if (majorIssues.length > 0) {
  console.log('\n🔥 MAJOR ISSUES THAT SHOULD BE FIXED:');
  majorIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
    console.log(`   Details: ${issue.details}`);
    console.log('');
  });
}

if (minorIssues.length > 0) {
  console.log('\n⚠️ MINOR ISSUES FOR POLISH:');
  minorIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
    console.log(`   Details: ${issue.details}`);
    console.log('');
  });
}

console.log('\n🎯 REALISTIC PRODUCTION READINESS ASSESSMENT:');
if (criticalIssues.length > 0) {
  console.log('❌ NOT READY FOR PRODUCTION');
  console.log(`🚨 ${criticalIssues.length} critical issues must be fixed before any deployment`);
} else if (majorIssues.length > 5) {
  console.log('⚠️ NOT READY FOR PRODUCTION');
  console.log(`🔧 Too many major issues (${majorIssues.length}) for production deployment`);
} else if (majorIssues.length > 0) {
  console.log('⚠️ BETA READY ONLY');
  console.log(`🧪 Can be used for testing but ${majorIssues.length} major issues need fixing for production`);
} else if (minorIssues.length > 10) {
  console.log('⚠️ NEEDS POLISH');
  console.log(`✨ Functional but ${minorIssues.length} minor issues should be addressed`);
} else {
  console.log('✅ PRODUCTION READY');
  console.log('🚀 Ready for deployment with minimal issues');
}

console.log('\n🔍 Comprehensive Issues Analysis Complete!');
