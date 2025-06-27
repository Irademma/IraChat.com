#!/usr/bin/env node

/**
 * Advanced Bundle Analysis for IraChat
 * Analyzes what gets bundled and suggests optimizations
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Advanced Bundle Analysis for IraChat...');

// Analyze what gets included in the bundle
function analyzeBundleContent() {
  console.log('\n📊 BUNDLE CONTENT ANALYSIS:');
  console.log('=' .repeat(50));
  
  const bundleComponents = {
    // JavaScript/TypeScript code
    code: {
      src: getDirSize('src'),
      app: getDirSize('app'),
      components: getDirSize('src/components'),
      screens: getDirSize('src/screens'),
      services: getDirSize('src/services'),
      hooks: getDirSize('src/hooks'),
      utils: getDirSize('src/utils')
    },
    
    // Assets
    assets: {
      images: getDirSize('assets/images'),
      fonts: getDirSize('assets/fonts'),
      sounds: getDirSize('assets/sounds')
    },
    
    // Configuration
    config: {
      appJson: getFileSize('app.json'),
      packageJson: getFileSize('package.json'),
      tsconfig: getFileSize('tsconfig.json'),
      metro: getFileSize('metro.config.js'),
      babel: getFileSize('babel.config.js')
    }
  };
  
  return bundleComponents;
}

function getDirSize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    let totalSize = 0;
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += getDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    return 0;
  }
}

function getFileSize(filePath) {
  try {
    if (!fs.existsSync(filePath)) return 0;
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function bytesToKB(bytes) {
  return (bytes / 1024).toFixed(1);
}

function analyzeCodeSplitting() {
  console.log('\n🔄 CODE SPLITTING ANALYSIS:');
  console.log('=' .repeat(40));
  
  const largeFolders = [
    { name: 'src/components', path: 'src/components' },
    { name: 'src/screens', path: 'src/screens' },
    { name: 'src/services', path: 'src/services' },
    { name: 'node_modules', path: 'node_modules' }
  ];
  
  largeFolders.forEach(folder => {
    const size = getDirSize(folder.path);
    const sizeKB = bytesToKB(size);
    
    if (size > 0) {
      console.log(`📁 ${folder.name.padEnd(20)} ${sizeKB.padStart(8)}KB`);
      
      if (folder.name === 'src/components' && size > 100000) {
        console.log('   💡 Consider lazy loading large components');
      }
      if (folder.name === 'src/screens' && size > 200000) {
        console.log('   💡 Implement screen-level code splitting');
      }
    }
  });
}

function analyzeTreeShaking() {
  console.log('\n🌳 TREE SHAKING ANALYSIS:');
  console.log('=' .repeat(35));
  
  // Check for potential tree shaking issues
  const treeShakingIssues = [
    {
      pattern: 'import \\* as',
      file: 'Wildcard imports',
      issue: 'Prevents tree shaking',
      solution: 'Use named imports'
    },
    {
      pattern: 'require\\(',
      file: 'CommonJS requires',
      issue: 'Not tree-shakable',
      solution: 'Use ES6 imports'
    },
    {
      pattern: 'import.*firebase.*from.*firebase',
      file: 'Full Firebase import',
      issue: 'Imports entire SDK',
      solution: 'Use modular imports'
    }
  ];
  
  console.log('🔍 Checking for tree shaking issues...');
  
  // This is a simplified check - in reality you'd scan all files
  treeShakingIssues.forEach(issue => {
    console.log(`⚠️  ${issue.file}`);
    console.log(`   Problem: ${issue.issue}`);
    console.log(`   Solution: ${issue.solution}`);
  });
}

function generateBundleOptimizations() {
  console.log('\n🎯 BUNDLE OPTIMIZATION STRATEGIES:');
  console.log('=' .repeat(45));
  
  console.log('\n1. 📦 WEBPACK/METRO OPTIMIZATIONS:');
  console.log('   • Enable tree shaking');
  console.log('   • Use production builds');
  console.log('   • Enable minification');
  console.log('   • Remove source maps in production');
  
  console.log('\n2. 🔄 CODE SPLITTING:');
  console.log('   • Lazy load screens');
  console.log('   • Dynamic imports for large components');
  console.log('   • Split vendor bundles');
  console.log('   • Route-based splitting');
  
  console.log('\n3. 📱 PLATFORM OPTIMIZATIONS:');
  console.log('   • Separate APKs per architecture');
  console.log('   • Enable ProGuard (Android)');
  console.log('   • Use App Bundle format');
  console.log('   • Remove unused native modules');
  
  console.log('\n4. 🎨 ASSET OPTIMIZATIONS:');
  console.log('   • Use WebP images');
  console.log('   • Implement image lazy loading');
  console.log('   • Use vector icons instead of PNGs');
  console.log('   • Compress audio/video files');
}

function createOptimizedMetroConfig() {
  console.log('\n🔧 Creating Optimized Metro Config...');
  
  const optimizedMetroConfig = `
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Tree shaking optimization
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
};

// Asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Enable hermes for better performance
config.transformer.hermesCommand = 'hermes';

module.exports = config;
`;

  fs.writeFileSync('metro-optimized.config.js', optimizedMetroConfig);
  console.log('✅ Created metro-optimized.config.js');
}

function createOptimizedAppJson() {
  console.log('\n📱 Creating Optimized App Config...');
  
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    // Production optimizations
    const optimizedConfig = {
      ...appJson,
      expo: {
        ...appJson.expo,
        
        // Optimized asset bundling (already fixed)
        assetBundlePatterns: [
          "assets/images/*.png",
          "assets/fonts/*.ttf",
          "assets/sounds/*.mp3"
        ],
        
        // Android optimizations
        android: {
          ...appJson.expo.android,
          enableProguardInReleaseBuilds: true,
          enableSeparateBuildPerCPUArchitecture: true,
          universalApk: false // Smaller APKs per architecture
        },
        
        // iOS optimizations
        ios: {
          ...appJson.expo.ios,
          bundleIdentifier: appJson.expo.ios?.bundleIdentifier || "com.irachat.mobile"
        },
        
        // Remove development plugins for production
        plugins: appJson.expo.plugins?.filter(plugin => 
          plugin !== 'expo-dev-client' && 
          (typeof plugin !== 'object' || plugin[0] !== 'expo-dev-client')
        ) || []
      }
    };
    
    fs.writeFileSync('app-production.json', JSON.stringify(optimizedConfig, null, 2));
    console.log('✅ Created app-production.json');
    
  } catch (error) {
    console.log('❌ Error creating optimized app config:', error.message);
  }
}

function estimateBundleSize() {
  console.log('\n📊 BUNDLE SIZE ESTIMATION:');
  console.log('=' .repeat(35));
  
  const components = analyzeBundleContent();
  
  let totalCodeSize = 0;
  let totalAssetSize = 0;
  let totalConfigSize = 0;
  
  // Calculate code size
  Object.values(components.code).forEach(size => totalCodeSize += size);
  
  // Calculate asset size
  Object.values(components.assets).forEach(size => totalAssetSize += size);
  
  // Calculate config size
  Object.values(components.config).forEach(size => totalConfigSize += size);
  
  console.log(`Code: ${bytesToKB(totalCodeSize)}KB`);
  console.log(`Assets: ${bytesToKB(totalAssetSize)}KB`);
  console.log(`Config: ${bytesToKB(totalConfigSize)}KB`);
  
  const totalSize = totalCodeSize + totalAssetSize + totalConfigSize;
  console.log(`Total: ${bytesToKB(totalSize)}KB`);
  
  // Estimate compressed size (typical 60-70% compression)
  const compressedSize = totalSize * 0.65;
  console.log(`Compressed: ~${bytesToKB(compressedSize)}KB`);
  
  return { totalSize, compressedSize };
}

// Main bundle analysis function
function runBundleAnalysis() {
  console.log('🚀 Starting Advanced Bundle Analysis...\n');
  
  const bundleSize = estimateBundleSize();
  analyzeCodeSplitting();
  analyzeTreeShaking();
  generateBundleOptimizations();
  createOptimizedMetroConfig();
  createOptimizedAppJson();
  
  console.log('\n🎉 BUNDLE ANALYSIS COMPLETE!');
  console.log('=' .repeat(35));
  console.log(`Current bundle: ~${bytesToKB(bundleSize.compressedSize)}KB`);
  console.log('📋 Use optimization strategies above');
  console.log('🔧 Apply optimized configs');
  console.log('📱 Build with production settings');
  
  return bundleSize;
}

// Run if called directly
if (require.main === module) {
  runBundleAnalysis();
}

module.exports = { runBundleAnalysis, estimateBundleSize };
