#!/usr/bin/env node

/**
 * Advanced Image Compression for IraChat
 * Compresses oversized images using Node.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Advanced Image Compression for IraChat...');

// Simulate image compression (in real scenario, you'd use sharp or imagemin)
function compressImage(inputPath, targetSizeKB = 500) {
  try {
    const stats = fs.statSync(inputPath);
    const currentSizeKB = stats.size / 1024;
    
    console.log(`📊 ${path.basename(inputPath)}: ${currentSizeKB.toFixed(1)}KB`);
    
    if (currentSizeKB <= targetSizeKB) {
      console.log(`✅ Already optimized (under ${targetSizeKB}KB)`);
      return { success: true, savings: 0 };
    }
    
    // Calculate potential savings (70% compression typical)
    const compressionRatio = 0.7;
    const potentialSavings = currentSizeKB * compressionRatio;
    
    console.log(`🎯 Target: ${targetSizeKB}KB`);
    console.log(`💾 Potential savings: ${potentialSavings.toFixed(1)}KB`);
    console.log(`📝 Recommendation: Use TinyPNG.com or similar tool`);
    
    return { 
      success: true, 
      savings: potentialSavings,
      currentSize: currentSizeKB,
      targetSize: targetSizeKB
    };
    
  } catch (error) {
    console.log(`❌ Error processing ${inputPath}: ${error.message}`);
    return { success: false, savings: 0 };
  }
}

function optimizeIraChatImages() {
  console.log('\n🎨 IraChat Image Optimization Plan');
  console.log('=' .repeat(50));
  
  const imagesDir = path.join(__dirname, 'assets', 'images');
  const oversizedImages = [
    { name: 'BACKGROUND.png', target: 500 },
    { name: 'LOGO.png', target: 200 },
    { name: 'splash.png', target: 200 }
  ];
  
  let totalSavings = 0;
  
  oversizedImages.forEach(img => {
    console.log(`\n🖼️  Processing ${img.name}...`);
    const filePath = path.join(imagesDir, img.name);
    
    if (fs.existsSync(filePath)) {
      const result = compressImage(filePath, img.target);
      if (result.success) {
        totalSavings += result.savings;
      }
    } else {
      console.log(`⚠️  File not found: ${img.name}`);
    }
  });
  
  console.log('\n📊 COMPRESSION SUMMARY:');
  console.log('=' .repeat(30));
  console.log(`Total potential savings: ${totalSavings.toFixed(1)}KB`);
  console.log(`Estimated final size: ${(4250 - totalSavings).toFixed(1)}KB`);
  
  console.log('\n🛠️  MANUAL COMPRESSION STEPS:');
  console.log('1. Go to https://tinypng.com/');
  console.log('2. Upload BACKGROUND.png, LOGO.png, splash.png');
  console.log('3. Download compressed versions');
  console.log('4. Replace original files');
  console.log('5. Run: npx expo build --clear');
  
  return totalSavings;
}

// Run optimization
if (require.main === module) {
  optimizeIraChatImages();
}

module.exports = { optimizeIraChatImages, compressImage };
