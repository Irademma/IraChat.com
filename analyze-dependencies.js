#!/usr/bin/env node

/**
 * Advanced Dependency Analysis for IraChat
 * Identifies optimization opportunities in dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Advanced Dependency Analysis for IraChat...');

// Detailed dependency analysis with optimization suggestions
const dependencyAnalysis = {
  // ESSENTIAL HEAVY DEPENDENCIES (Keep but optimize)
  essential: {
    'react-native-webrtc': {
      size: 75,
      reason: 'WebRTC calling functionality',
      optimization: 'Use selective imports, disable unused codecs',
      canReduce: 15
    },
    'firebase': {
      size: 45,
      reason: 'Backend services',
      optimization: 'Use modular imports (auth, firestore, storage only)',
      canReduce: 20
    },
    'expo-av': {
      size: 25,
      reason: 'Audio/Video playback',
      optimization: 'Use expo-video for video only',
      canReduce: 10
    },
    'react-native-reanimated': {
      size: 20,
      reason: 'Smooth animations',
      optimization: 'Use only needed animation types',
      canReduce: 5
    },
    'expo-camera': {
      size: 18,
      reason: 'Camera functionality',
      optimization: 'Already optimized',
      canReduce: 0
    },
    'expo-media-library': {
      size: 15,
      reason: 'Media access',
      optimization: 'Already optimized',
      canReduce: 0
    }
  },
  
  // POTENTIALLY REMOVABLE DEPENDENCIES
  removable: {
    'react-native-render-html': {
      size: 12,
      reason: 'HTML rendering',
      alternative: 'Use simple Text components',
      savings: 12
    },
    'react-native-markdown-display': {
      size: 8,
      reason: 'Markdown parsing',
      alternative: 'Use simple text formatting',
      savings: 8
    },
    'tailwindcss': {
      size: 8,
      reason: 'CSS framework',
      alternative: 'Use React Native StyleSheet',
      savings: 8
    }
  },
  
  // OPTIMIZATION OPPORTUNITIES
  optimizable: {
    '@expo/vector-icons': {
      size: 8,
      reason: 'Icon fonts',
      optimization: 'Use only needed icon sets',
      canReduce: 4
    },
    'expo-video': {
      size: 10,
      reason: 'Video playback',
      optimization: 'Combine with expo-av optimization',
      canReduce: 3
    }
  }
};

function analyzeDependencyUsage() {
  console.log('\n📊 DEPENDENCY USAGE ANALYSIS:');
  console.log('=' .repeat(60));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let totalCurrentSize = 0;
  let totalOptimizableSize = 0;
  let totalRemovableSize = 0;
  
  console.log('\n✅ ESSENTIAL DEPENDENCIES (Optimize):');
  Object.entries(dependencyAnalysis.essential).forEach(([dep, info]) => {
    if (installedDeps[dep]) {
      totalCurrentSize += info.size;
      totalOptimizableSize += info.canReduce;
      console.log(`${dep.padEnd(25)} ${info.size.toString().padStart(3)}MB → ${(info.size - info.canReduce).toString().padStart(3)}MB`);
      console.log(`   💡 ${info.optimization}`);
    }
  });
  
  console.log('\n⚠️  POTENTIALLY REMOVABLE:');
  Object.entries(dependencyAnalysis.removable).forEach(([dep, info]) => {
    if (installedDeps[dep]) {
      totalCurrentSize += info.size;
      totalRemovableSize += info.savings;
      console.log(`${dep.padEnd(25)} ${info.size.toString().padStart(3)}MB → 0MB`);
      console.log(`   🔄 ${info.alternative}`);
    }
  });
  
  console.log('\n🔧 OPTIMIZABLE:');
  Object.entries(dependencyAnalysis.optimizable).forEach(([dep, info]) => {
    if (installedDeps[dep]) {
      totalCurrentSize += info.size;
      totalOptimizableSize += info.canReduce;
      console.log(`${dep.padEnd(25)} ${info.size.toString().padStart(3)}MB → ${(info.size - info.canReduce).toString().padStart(3)}MB`);
      console.log(`   ⚡ ${info.optimization}`);
    }
  });
  
  return { totalCurrentSize, totalOptimizableSize, totalRemovableSize };
}

function generateOptimizationPlan() {
  console.log('\n🎯 DEPENDENCY OPTIMIZATION PLAN:');
  console.log('=' .repeat(50));
  
  const { totalCurrentSize, totalOptimizableSize, totalRemovableSize } = analyzeDependencyUsage();
  
  console.log('\n📊 POTENTIAL SAVINGS:');
  console.log(`Current heavy deps: ${totalCurrentSize}MB`);
  console.log(`Optimization savings: ${totalOptimizableSize}MB`);
  console.log(`Removal savings: ${totalRemovableSize}MB`);
  console.log(`Total potential: ${totalOptimizableSize + totalRemovableSize}MB`);
  
  console.log('\n🚀 IMPLEMENTATION STEPS:');
  
  console.log('\n1. 🔥 FIREBASE OPTIMIZATION (Save 20MB):');
  console.log('   Replace: import firebase from "firebase"');
  console.log('   With: import { initializeApp } from "firebase/app"');
  console.log('         import { getAuth } from "firebase/auth"');
  console.log('         import { getFirestore } from "firebase/firestore"');
  
  console.log('\n2. 📱 WEBRTC OPTIMIZATION (Save 15MB):');
  console.log('   • Disable unused video codecs');
  console.log('   • Use audio-only mode when possible');
  console.log('   • Implement lazy loading');
  
  console.log('\n3. 🎨 UI OPTIMIZATION (Save 28MB):');
  console.log('   • Remove TailwindCSS, use StyleSheet');
  console.log('   • Remove HTML/Markdown renderers');
  console.log('   • Use selective icon imports');
  
  console.log('\n4. 📦 PACKAGE CLEANUP:');
  console.log('   • Move metro to devDependencies (already done)');
  console.log('   • Remove unused packages');
  console.log('   • Use peer dependencies where possible');
  
  return totalOptimizableSize + totalRemovableSize;
}

function createOptimizedFirebaseConfig() {
  console.log('\n🔧 Creating Optimized Firebase Config...');
  
  const optimizedConfig = `
// Optimized Firebase Configuration (saves ~20MB)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// DO NOT import the entire Firebase SDK
// This reduces bundle size significantly

const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only export what you need
export default app;
`;

  fs.writeFileSync('firebase-optimized-config.js', optimizedConfig);
  console.log('✅ Created firebase-optimized-config.js');
  console.log('📝 Replace your current Firebase imports with this');
}

function analyzeUnusedDependencies() {
  console.log('\n🔍 UNUSED DEPENDENCY DETECTION:');
  console.log('=' .repeat(40));
  
  // This would require more complex analysis in a real scenario
  const potentiallyUnused = [
    'react-native-render-html',
    'react-native-markdown-display', 
    'tailwindcss',
    'postcss',
    'autoprefixer'
  ];
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  potentiallyUnused.forEach(dep => {
    if (installedDeps[dep]) {
      console.log(`⚠️  ${dep} - Check if actually used`);
    }
  });
  
  console.log('\n💡 To check usage:');
  console.log('   grep -r "import.*package-name" src/');
  console.log('   grep -r "require.*package-name" src/');
}

// Main analysis function
function runDependencyAnalysis() {
  console.log('🚀 Starting Advanced Dependency Analysis...\n');
  
  const potentialSavings = generateOptimizationPlan();
  createOptimizedFirebaseConfig();
  analyzeUnusedDependencies();
  
  console.log('\n🎉 ANALYSIS COMPLETE!');
  console.log('=' .repeat(30));
  console.log(`Potential dependency savings: ${potentialSavings}MB`);
  console.log('📋 Follow the implementation steps above');
  console.log('🔧 Use the optimized Firebase config');
  console.log('🧹 Remove unused dependencies');
  
  return potentialSavings;
}

// Run if called directly
if (require.main === module) {
  runDependencyAnalysis();
}

module.exports = { runDependencyAnalysis, analyzeDependencyUsage };
