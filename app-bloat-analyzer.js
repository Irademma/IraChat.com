#!/usr/bin/env node

/**
 * Comprehensive App Bloat Analyzer for IraChat
 * Identifies all sources of unnecessary app size
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 IraChat Comprehensive Bloat Analysis...');

// Get directory size recursively
function getDirSize(dirPath) {
  let totalSize = 0;
  
  try {
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
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return totalSize;
}

// Convert bytes to MB
function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

// 1. ANALYZE OVERSIZED IMAGES
function analyzeImages() {
  console.log('\n🎨 IMAGE BLOAT ANALYSIS:');
  console.log('=' .repeat(50));
  
  const imagesDir = path.join(__dirname, 'assets', 'images');
  if (!fs.existsSync(imagesDir)) return;
  
  const files = fs.readdirSync(imagesDir);
  let totalImageSize = 0;
  const oversizedImages = [];
  
  files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = parseFloat(bytesToMB(stats.size));
    totalImageSize += sizeMB;
    
    // Flag images over 500KB as potentially oversized
    if (sizeMB > 0.5) {
      oversizedImages.push({ name: file, size: sizeMB });
    }
    
    const status = sizeMB > 1 ? '❌ TOO LARGE' : sizeMB > 0.5 ? '⚠️  LARGE' : '✅ OK';
    console.log(`${file.padEnd(20)} ${sizeMB.toString().padStart(6)}MB ${status}`);
  });
  
  console.log(`\nTotal Images: ${totalImageSize.toFixed(2)}MB`);
  
  if (oversizedImages.length > 0) {
    console.log('\n🚨 OVERSIZED IMAGES FOUND:');
    oversizedImages.forEach(img => {
      console.log(`❌ ${img.name} (${img.size}MB) - Should be <500KB`);
    });
  }
  
  return { totalImageSize, oversizedImages };
}

// 2. ANALYZE HEAVY DEPENDENCIES
function analyzeDependencies() {
  console.log('\n📦 DEPENDENCY BLOAT ANALYSIS:');
  console.log('=' .repeat(50));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Known heavy packages and their approximate sizes
  const heavyPackages = {
    'react-native-webrtc': { size: 75, essential: true, reason: 'WebRTC native libraries' },
    'firebase': { size: 45, essential: true, reason: 'Full Firebase SDK' },
    'expo-av': { size: 25, essential: true, reason: 'Audio/Video codecs' },
    'react-native-reanimated': { size: 20, essential: true, reason: 'Animation engine' },
    'expo-camera': { size: 18, essential: true, reason: 'Camera native code' },
    'expo-media-library': { size: 15, essential: true, reason: 'Media processing' },
    'react-native-render-html': { size: 12, essential: false, reason: 'HTML rendering' },
    'react-native-markdown-display': { size: 8, essential: false, reason: 'Markdown parsing' },
    '@expo/vector-icons': { size: 8, essential: true, reason: 'Icon fonts' },
    'expo-video': { size: 10, essential: true, reason: 'Video playback' },
    'tailwindcss': { size: 8, essential: false, reason: 'CSS framework' },
    'metro': { size: 15, essential: false, reason: 'Should be dev dependency' }
  };
  
  let totalHeavySize = 0;
  let removableSize = 0;
  
  Object.keys(deps).forEach(dep => {
    if (heavyPackages[dep]) {
      const pkg = heavyPackages[dep];
      totalHeavySize += pkg.size;
      
      const status = pkg.essential ? '✅ Essential' : '⚠️  Optional';
      console.log(`${dep.padEnd(30)} ${pkg.size.toString().padStart(3)}MB ${status} - ${pkg.reason}`);
      
      if (!pkg.essential) {
        removableSize += pkg.size;
      }
    }
  });
  
  console.log(`\nTotal Heavy Dependencies: ${totalHeavySize}MB`);
  console.log(`Potentially Removable: ${removableSize}MB`);
  
  return { totalHeavySize, removableSize };
}

// 3. ANALYZE NODE_MODULES SIZE
function analyzeNodeModules() {
  console.log('\n📁 NODE_MODULES ANALYSIS:');
  console.log('=' .repeat(50));
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules not found');
    return { totalSize: 0 };
  }
  
  const totalSize = getDirSize(nodeModulesPath);
  const sizeMB = bytesToMB(totalSize);
  
  console.log(`Total node_modules size: ${sizeMB}MB`);
  
  // Check for largest packages
  try {
    const packages = fs.readdirSync(nodeModulesPath);
    const packageSizes = [];
    
    packages.slice(0, 10).forEach(pkg => { // Check first 10 to avoid timeout
      try {
        const pkgPath = path.join(nodeModulesPath, pkg);
        const pkgSize = getDirSize(pkgPath);
        packageSizes.push({ name: pkg, size: bytesToMB(pkgSize) });
      } catch (error) {
        // Skip problematic packages
      }
    });
    
    packageSizes.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
    
    console.log('\nLargest packages (sample):');
    packageSizes.slice(0, 5).forEach(pkg => {
      console.log(`${pkg.name.padEnd(25)} ${pkg.size}MB`);
    });
    
  } catch (error) {
    console.log('Could not analyze individual packages');
  }
  
  return { totalSize: parseFloat(sizeMB) };
}

// 4. ANALYZE UNUSED FILES
function analyzeUnusedFiles() {
  console.log('\n🗑️  UNUSED FILES ANALYSIS:');
  console.log('=' .repeat(50));
  
  const potentiallyUnused = [
    'README.md',
    'IMPLEMENTATION_SUMMARY.md',
    'FIRESTORE-RULES-COMPLETE-SUMMARY.md',
    '.gitignore',
    'package-lock.json',
    'yarn.lock',
    'metro.config.js',
    'babel.config.js',
    'tsconfig.json',
    '.expo/',
    'android/app/build/',
    'ios/build/',
    '.vscode/',
    '.idea/',
    'optimize-assets.js',
    'optimize-dependencies.js',
    'safe-asset-cleanup.js',
    'remove-duplicates.js',
    'app-bloat-analyzer.js'
  ];
  
  let unusedSize = 0;
  const foundUnused = [];
  
  potentiallyUnused.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const stats = fs.statSync(file);
        const size = stats.isDirectory() ? getDirSize(file) : stats.size;
        const sizeMB = bytesToMB(size);
        unusedSize += parseFloat(sizeMB);
        foundUnused.push({ name: file, size: sizeMB });
        
        const type = stats.isDirectory() ? '📁' : '📄';
        console.log(`${type} ${file.padEnd(30)} ${sizeMB}MB`);
      } catch (error) {
        // Skip inaccessible files
      }
    }
  });
  
  console.log(`\nTotal unused files: ${unusedSize.toFixed(2)}MB`);
  return { unusedSize, foundUnused };
}

// 5. ANALYZE BUILD ARTIFACTS
function analyzeBuildArtifacts() {
  console.log('\n🏗️  BUILD ARTIFACTS ANALYSIS:');
  console.log('=' .repeat(50));
  
  const buildDirs = [
    'android/app/build',
    'ios/build',
    '.expo',
    'dist',
    'build',
    'node_modules/.cache'
  ];
  
  let totalBuildSize = 0;
  
  buildDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const size = getDirSize(dir);
      const sizeMB = bytesToMB(size);
      totalBuildSize += parseFloat(sizeMB);
      console.log(`📁 ${dir.padEnd(25)} ${sizeMB}MB`);
    }
  });
  
  console.log(`\nTotal build artifacts: ${totalBuildSize.toFixed(2)}MB`);
  return { totalBuildSize };
}

// 6. GENERATE OPTIMIZATION RECOMMENDATIONS
function generateRecommendations(analysis) {
  console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');
  console.log('=' .repeat(50));
  
  let totalPotentialSavings = 0;
  
  console.log('\n1. 🎨 IMAGE OPTIMIZATION:');
  if (analysis.images.oversizedImages.length > 0) {
    analysis.images.oversizedImages.forEach(img => {
      const potentialSaving = img.size * 0.7; // Assume 70% compression
      totalPotentialSavings += potentialSaving;
      console.log(`   • Compress ${img.name}: Save ~${potentialSaving.toFixed(2)}MB`);
    });
  } else {
    console.log('   ✅ Images are reasonably sized');
  }
  
  console.log('\n2. 📦 DEPENDENCY OPTIMIZATION:');
  if (analysis.dependencies.removableSize > 0) {
    totalPotentialSavings += analysis.dependencies.removableSize;
    console.log(`   • Remove optional dependencies: Save ${analysis.dependencies.removableSize}MB`);
  } else {
    console.log('   ✅ Dependencies are essential');
  }
  
  console.log('\n3. 🗑️  FILE CLEANUP:');
  if (analysis.unused.unusedSize > 0) {
    totalPotentialSavings += analysis.unused.unusedSize;
    console.log(`   • Remove unused files: Save ${analysis.unused.unusedSize.toFixed(2)}MB`);
  }
  
  console.log('\n4. 🏗️  BUILD OPTIMIZATION:');
  if (analysis.build.totalBuildSize > 0) {
    console.log(`   • Clear build artifacts: Save ${analysis.build.totalBuildSize.toFixed(2)}MB`);
    console.log('   • Use production builds only');
  }
  
  console.log('\n5. 📱 BUNDLE OPTIMIZATION:');
  console.log('   • Enable tree shaking');
  console.log('   • Use modular imports');
  console.log('   • Enable ProGuard (Android)');
  console.log('   • Use separate APKs per architecture');
  
  console.log(`\n💾 TOTAL POTENTIAL SAVINGS: ${totalPotentialSavings.toFixed(2)}MB`);
  
  return totalPotentialSavings;
}

// Main analysis function
function analyzeAppBloat() {
  console.log('🚀 Starting Comprehensive App Bloat Analysis...\n');
  
  const analysis = {
    images: analyzeImages(),
    dependencies: analyzeDependencies(),
    nodeModules: analyzeNodeModules(),
    unused: analyzeUnusedFiles(),
    build: analyzeBuildArtifacts()
  };
  
  const potentialSavings = generateRecommendations(analysis);
  
  console.log('\n📊 BLOAT SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`Images: ${analysis.images.totalImageSize.toFixed(2)}MB`);
  console.log(`Heavy Dependencies: ${analysis.dependencies.totalHeavySize}MB`);
  console.log(`Node Modules: ${analysis.nodeModules.totalSize}MB`);
  console.log(`Unused Files: ${analysis.unused.unusedSize.toFixed(2)}MB`);
  console.log(`Build Artifacts: ${analysis.build.totalBuildSize.toFixed(2)}MB`);
  console.log(`Potential Savings: ${potentialSavings.toFixed(2)}MB`);
  
  console.log('\n🎉 Analysis complete! Use recommendations above to optimize.');
}

// Run if called directly
if (require.main === module) {
  analyzeAppBloat();
}

module.exports = { analyzeAppBloat };
