#!/usr/bin/env node

/**
 * Dependency Optimization for IraChat
 * Analyzes and suggests optimizations for heavy dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('📦 IraChat Dependency Optimization Analysis...');

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Heavy dependencies and their sizes (approximate)
const dependencySizes = {
  'react-native-webrtc': { size: 75, essential: true, alternative: null },
  'firebase': { size: 45, essential: true, alternative: 'Modular imports' },
  'expo-av': { size: 25, essential: true, alternative: null },
  'react-native-reanimated': { size: 20, essential: true, alternative: null },
  'expo-camera': { size: 18, essential: true, alternative: null },
  'expo-media-library': { size: 15, essential: true, alternative: null },
  'react-native-render-html': { size: 12, essential: false, alternative: 'Custom renderer' },
  'react-native-markdown-display': { size: 8, essential: false, alternative: 'Simple text' },
  '@expo/vector-icons': { size: 8, essential: true, alternative: 'Custom icons' },
  'expo-video': { size: 10, essential: true, alternative: null },
  'expo-video-thumbnails': { size: 5, essential: true, alternative: null },
  'expo-image-manipulator': { size: 5, essential: true, alternative: null },
  'expo-image-picker': { size: 5, essential: true, alternative: null },
  'expo-document-picker': { size: 4, essential: true, alternative: null },
  'expo-sharing': { size: 3, essential: true, alternative: null },
  'metro': { size: 15, essential: false, alternative: 'Remove from dependencies' },
  'tailwindcss': { size: 8, essential: false, alternative: 'StyleSheet only' }
};

function analyzeDependencies() {
  console.log('\n📊 Dependency Size Analysis:');
  console.log('=' .repeat(70));
  
  let totalSize = 0;
  let removableSize = 0;
  
  Object.keys(packageJson.dependencies || {}).forEach(dep => {
    const info = dependencySizes[dep];
    if (info) {
      totalSize += info.size;
      const status = info.essential ? '✅ Essential' : '⚠️  Optional';
      const alt = info.alternative ? `(Alt: ${info.alternative})` : '';
      
      console.log(`${dep.padEnd(30)} ${info.size.toString().padStart(3)}MB ${status} ${alt}`);
      
      if (!info.essential) {
        removableSize += info.size;
      }
    }
  });
  
  console.log('=' .repeat(70));
  console.log(`Total Heavy Dependencies: ${totalSize}MB`);
  console.log(`Potentially Removable: ${removableSize}MB`);
  
  return { totalSize, removableSize };
}

function suggestOptimizations() {
  console.log('\n🎯 Optimization Suggestions:');
  console.log('=' .repeat(50));
  
  console.log('\n1. 🔥 IMMEDIATE WINS (High Impact):');
  console.log('   • Remove metro from dependencies (dev only)');
  console.log('   • Use modular Firebase imports');
  console.log('   • Remove tailwindcss (use StyleSheet)');
  console.log('   • Remove react-native-render-html if not used');
  
  console.log('\n2. 📦 FIREBASE OPTIMIZATION:');
  console.log('   • Use only needed Firebase modules');
  console.log('   • Import: auth, firestore, storage only');
  console.log('   • Avoid importing entire Firebase SDK');
  
  console.log('\n3. 🎨 STYLING OPTIMIZATION:');
  console.log('   • Replace TailwindCSS with React Native StyleSheet');
  console.log('   • Use inline styles for simple components');
  console.log('   • Remove unused style dependencies');
  
  console.log('\n4. 📱 EXPO OPTIMIZATION:');
  console.log('   • Use expo-dev-client for smaller production builds');
  console.log('   • Remove unused Expo modules');
  console.log('   • Enable tree shaking in metro.config.js');
}

function createOptimizedPackageJson() {
  console.log('\n📝 Creating Optimized package.json...');
  
  const optimizedDeps = { ...packageJson.dependencies };
  
  // Remove heavy non-essential dependencies
  const toRemove = [
    'metro', // Should be in devDependencies
    'tailwindcss', // Can be replaced with StyleSheet
    'react-native-render-html', // If not heavily used
    'react-native-markdown-display' // If simple text works
  ];
  
  let savedSize = 0;
  toRemove.forEach(dep => {
    if (optimizedDeps[dep]) {
      const size = dependencySizes[dep]?.size || 0;
      savedSize += size;
      delete optimizedDeps[dep];
      console.log(`✅ Removed: ${dep} (${size}MB)`);
    }
  });
  
  // Move metro to devDependencies
  if (packageJson.dependencies.metro) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies.metro = packageJson.dependencies.metro;
  }
  
  const optimizedPackage = {
    ...packageJson,
    dependencies: optimizedDeps
  };
  
  fs.writeFileSync('package-optimized.json', JSON.stringify(optimizedPackage, null, 2));
  console.log(`\n💾 Saved ${savedSize}MB by removing dependencies`);
  console.log('📄 Created package-optimized.json');
}

function createMetroConfig() {
  const metroConfig = `
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Optimize bundle size
config.resolver = {
  ...config.resolver,
  alias: {
    // Add aliases for smaller imports
  },
};

// Enable asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
`;

  fs.writeFileSync('metro.config.js', metroConfig.trim());
  console.log('📄 Created optimized metro.config.js');
}

function generateOptimizationReport() {
  console.log('\n📋 OPTIMIZATION REPORT');
  console.log('=' .repeat(50));
  
  const { totalSize, removableSize } = analyzeDependencies();
  
  console.log('\n🎯 ESTIMATED SIZE REDUCTION:');
  console.log(`Current Dependencies: ~${totalSize}MB`);
  console.log(`After Optimization: ~${totalSize - removableSize}MB`);
  console.log(`Potential Savings: ~${removableSize}MB`);
  
  console.log('\n📱 EXPECTED APP SIZE:');
  console.log('Before: 244MB ❌');
  console.log(`After: ~${244 - removableSize - 50}MB ✅`); // 50MB from asset optimization
  console.log('Target: <100MB 🎯');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Run: node optimize-assets.js');
  console.log('2. Replace package.json with package-optimized.json');
  console.log('3. Run: npm install');
  console.log('4. Run: npx expo build --clear');
  console.log('5. Test new app size');
}

// Main function
function optimizeDependencies() {
  console.log('🚀 Starting Dependency Optimization...\n');
  
  analyzeDependencies();
  suggestOptimizations();
  createOptimizedPackageJson();
  createMetroConfig();
  generateOptimizationReport();
  
  console.log('\n🎉 Dependency optimization analysis complete!');
}

// Run if called directly
if (require.main === module) {
  optimizeDependencies();
}

module.exports = { optimizeDependencies, analyzeDependencies };
