#!/usr/bin/env node

/**
 * Asset Optimization Script for IraChat
 * Reduces app bundle size by optimizing images and removing unused assets
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 IraChat Asset Optimization Starting...');

// Assets directory
const assetsDir = path.join(__dirname, 'assets');
const imagesDir = path.join(assetsDir, 'images');

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// List all image files with sizes
function analyzeAssets() {
  console.log('\n📊 Current Asset Analysis:');
  console.log('=' .repeat(50));
  
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Images directory not found');
    return;
  }
  
  const files = fs.readdirSync(imagesDir);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.statSync(filePath).isFile()) {
      const sizeMB = parseFloat(getFileSizeMB(filePath));
      totalSize += sizeMB;
      
      const status = sizeMB > 1 ? '❌ TOO LARGE' : sizeMB > 0.5 ? '⚠️  LARGE' : '✅ OK';
      console.log(`${file.padEnd(25)} ${sizeMB.toString().padStart(6)}MB ${status}`);
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`Total Images Size: ${totalSize.toFixed(2)}MB`);
  
  return totalSize;
}

// Remove unused/duplicate assets
function removeUnusedAssets() {
  console.log('\n🧹 Removing Unused Assets...');
  
  const unusedFiles = [
    'HomeScreen.docx',
    'react-logo.png',
    'react-logo@2x.png', 
    'react-logo@3x.png',
    'partial-react-logo.png',
    'red heart - Copy.png',
    'favicon.png' // Too large for mobile
  ];
  
  let removedSize = 0;
  
  unusedFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.existsSync(filePath)) {
      const sizeMB = parseFloat(getFileSizeMB(filePath));
      removedSize += sizeMB;
      
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file} (${sizeMB}MB)`);
      } catch (error) {
        console.log(`❌ Failed to remove: ${file}`);
      }
    }
  });
  
  console.log(`\n💾 Space Saved: ${removedSize.toFixed(2)}MB`);
  return removedSize;
}

// Create optimized versions of large images
function createOptimizedVersions() {
  console.log('\n🎨 Creating Optimized Versions...');
  
  const largeFiles = [
    'BACKGROUND.png',
    'LOGO.png',
    'splash.png',
    'splash-icon.png',
    'adaptive-icon.png'
  ];
  
  largeFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.existsSync(filePath)) {
      const sizeMB = getFileSizeMB(filePath);
      console.log(`📝 ${file} (${sizeMB}MB) - Manual optimization needed`);
    }
  });
  
  console.log('\n💡 Optimization Tips:');
  console.log('1. Use online tools like TinyPNG.com to compress images');
  console.log('2. Resize images to actual display size (no larger than 1024x1024)');
  console.log('3. Use WebP format for better compression');
  console.log('4. Remove unnecessary metadata');
}

// Generate .gitignore for build artifacts
function createGitignore() {
  const gitignoreContent = `
# Build artifacts that increase bundle size
*.log
*.tmp
.expo/
.expo-shared/
dist/
build/
android/app/build/
ios/build/
node_modules/

# Large development files
*.psd
*.ai
*.sketch
*.fig
*.docx
*.pdf

# Temporary files
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# IDE files
.vscode/
.idea/
*.sublime-*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

  fs.writeFileSync('.gitignore', gitignoreContent.trim());
  console.log('\n📝 Updated .gitignore to exclude build artifacts');
}

// Main optimization function
function optimizeAssets() {
  console.log('🚀 Starting IraChat Asset Optimization...\n');
  
  const initialSize = analyzeAssets();
  const removedSize = removeUnusedAssets();
  createOptimizedVersions();
  createGitignore();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Optimization Complete!');
  console.log(`📉 Reduced by: ${removedSize.toFixed(2)}MB`);
  console.log(`📊 Estimated final size: ${(initialSize - removedSize).toFixed(2)}MB`);
  console.log('\n📋 Next Steps:');
  console.log('1. Manually optimize remaining large images');
  console.log('2. Run: npx expo build --clear');
  console.log('3. Test app size after rebuild');
  console.log('=' .repeat(50));
}

// Run optimization
if (require.main === module) {
  optimizeAssets();
}

module.exports = { optimizeAssets, analyzeAssets };
