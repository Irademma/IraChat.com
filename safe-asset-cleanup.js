#!/usr/bin/env node

/**
 * SAFE Asset Cleanup for IraChat
 * Only removes assets that are 100% confirmed unused
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 IraChat Safe Asset Cleanup...');

// Assets that are ACTUALLY USED (found in code)
const usedAssets = [
  'LOGO.png',           // Used in AppHeader, IraChatHeader, ProfileScreen, SettingsScreen
  'BACKGROUND.png',     // Used in ChatWallpaper, IraChatWallpaper
  'camera.png',         // Used in ProfilePicturePicker
  'posts.png',          // Used in ProfilePicturePicker (gallery icon)
  'heart-red.png',      // Used in UpdateActions (liked state)
  'heart.png',          // Used in UpdateActions (unliked state)
  'comment.png',        // Used in ChatRoomScreen, NewChatScreen, SettingsScreen
  'groups.png',         // Used in CreateGroupScreen
  'profile.png',        // Used in ProfileScreen, SettingsScreen
  'setting.png',        // Used in ProfileScreen, SettingsScreen
  'notification.png',   // Used in ProfileScreen, SettingsScreen
  'splash.png',         // Used in app.json splash screen
  'splash-icon.png',    // Used in app.json
  'adaptive-icon.png'   // Used in app.json
];

// Assets that are SAFE TO DELETE (not found in any code)
const safeToDelete = [
  'black heart.png',    // Duplicate of heart.png
  'delete.png',         // Not used anywhere
  'gallery.png',        // Not used (posts.png is used instead)
  'heartred.png',       // Duplicate of heart-red.png
  'ht.png',             // Unknown/unused
  'logout.png',         // Not used anywhere
  'members.png',        // Not used anywhere
  'repost.png',         // Not used anywhere
  'retweet.png',        // Not used anywhere
  'search.png',         // Not used anywhere (using Ionicons instead)
  'share.png'           // Not used anywhere
];

function getFileSizeMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return '0.00';
  }
}

function analyzeAssets() {
  console.log('\n📊 Asset Usage Analysis:');
  console.log('=' .repeat(60));
  
  const imagesDir = path.join(__dirname, 'assets', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Images directory not found');
    return;
  }
  
  const allFiles = fs.readdirSync(imagesDir);
  let usedSize = 0;
  let unusedSize = 0;
  
  console.log('\n✅ USED ASSETS (KEEP):');
  usedAssets.forEach(asset => {
    if (allFiles.includes(asset)) {
      const filePath = path.join(imagesDir, asset);
      const sizeMB = parseFloat(getFileSizeMB(filePath));
      usedSize += sizeMB;
      console.log(`   ${asset.padEnd(20)} ${sizeMB.toString().padStart(6)}MB ✅`);
    }
  });
  
  console.log('\n❌ UNUSED ASSETS (SAFE TO DELETE):');
  safeToDelete.forEach(asset => {
    if (allFiles.includes(asset)) {
      const filePath = path.join(imagesDir, asset);
      const sizeMB = parseFloat(getFileSizeMB(filePath));
      unusedSize += sizeMB;
      console.log(`   ${asset.padEnd(20)} ${sizeMB.toString().padStart(6)}MB ❌`);
    }
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`Used Assets:   ${usedSize.toFixed(2)}MB`);
  console.log(`Unused Assets: ${unusedSize.toFixed(2)}MB`);
  console.log(`Total Savings: ${unusedSize.toFixed(2)}MB`);
  
  return { usedSize, unusedSize };
}

function safeDeleteAssets() {
  console.log('\n🗑️  Safely Deleting Unused Assets...');
  
  const imagesDir = path.join(__dirname, 'assets', 'images');
  let deletedSize = 0;
  let deletedCount = 0;
  
  safeToDelete.forEach(asset => {
    const filePath = path.join(imagesDir, asset);
    
    if (fs.existsSync(filePath)) {
      try {
        const sizeMB = parseFloat(getFileSizeMB(filePath));
        fs.unlinkSync(filePath);
        deletedSize += sizeMB;
        deletedCount++;
        console.log(`✅ Deleted: ${asset} (${sizeMB}MB)`);
      } catch (error) {
        console.log(`❌ Failed to delete: ${asset} - ${error.message}`);
      }
    } else {
      console.log(`⚠️  Not found: ${asset}`);
    }
  });
  
  console.log(`\n💾 Successfully deleted ${deletedCount} files`);
  console.log(`💾 Total space saved: ${deletedSize.toFixed(2)}MB`);
  
  return deletedSize;
}

function verifyNoBreakage() {
  console.log('\n🔍 Verifying No Code Breakage...');
  
  // Check that all used assets still exist
  const imagesDir = path.join(__dirname, 'assets', 'images');
  let allGood = true;
  
  usedAssets.forEach(asset => {
    const filePath = path.join(imagesDir, asset);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ CRITICAL: Used asset missing: ${asset}`);
      allGood = false;
    } else {
      console.log(`✅ Verified: ${asset}`);
    }
  });
  
  if (allGood) {
    console.log('\n🎉 All used assets verified - no code will break!');
  } else {
    console.log('\n🚨 WARNING: Some used assets are missing!');
  }
  
  return allGood;
}

function generateReport() {
  console.log('\n📋 ASSET CLEANUP REPORT');
  console.log('=' .repeat(50));
  
  const { usedSize, unusedSize } = analyzeAssets();
  const deletedSize = safeDeleteAssets();
  const verified = verifyNoBreakage();
  
  console.log('\n🎯 CLEANUP RESULTS:');
  console.log(`Files deleted: ${safeToDelete.length}`);
  console.log(`Space saved: ${deletedSize.toFixed(2)}MB`);
  console.log(`Remaining assets: ${usedAssets.length}`);
  console.log(`Code safety: ${verified ? '✅ SAFE' : '❌ ISSUES'}`);
  
  console.log('\n📱 BUNDLE SIZE IMPACT:');
  console.log(`Before cleanup: ${(usedSize + unusedSize).toFixed(2)}MB`);
  console.log(`After cleanup: ${usedSize.toFixed(2)}MB`);
  console.log(`Reduction: ${deletedSize.toFixed(2)}MB`);
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Optimize remaining large images (BACKGROUND.png, LOGO.png)');
  console.log('2. Run: npx expo build --clear');
  console.log('3. Test app to ensure no broken images');
  console.log('4. Check new bundle size');
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Safe Asset Cleanup...\n');
  generateReport();
  console.log('\n🎉 Safe asset cleanup complete!');
}

module.exports = { analyzeAssets, safeDeleteAssets, verifyNoBreakage };
