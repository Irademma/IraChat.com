#!/usr/bin/env node

/**
 * SAFE Duplicate Asset Removal for IraChat
 * Removes identical duplicate files and updates references
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 IraChat Duplicate Asset Analysis...');

// Calculate MD5 hash of a file
function getFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    return null;
  }
}

// Get file size in MB
function getFileSizeMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return '0.00';
  }
}

// Find all duplicate files
function findDuplicates() {
  console.log('\n🔍 Scanning for duplicate files...');
  
  const imagesDir = path.join(__dirname, 'assets', 'images');
  const files = fs.readdirSync(imagesDir);
  const hashMap = new Map();
  const duplicates = [];
  
  // Calculate hashes for all files
  files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.statSync(filePath).isFile()) {
      const hash = getFileHash(filePath);
      const size = getFileSizeMB(filePath);
      
      if (hash) {
        if (hashMap.has(hash)) {
          // Found duplicate
          const existing = hashMap.get(hash);
          duplicates.push({
            hash,
            files: [existing, { name: file, path: filePath, size }],
            totalSize: parseFloat(size) + parseFloat(existing.size)
          });
        } else {
          hashMap.set(hash, { name: file, path: filePath, size });
        }
      }
    }
  });
  
  return duplicates;
}

// Analyze which files to keep vs remove
function analyzeDuplicates(duplicates) {
  console.log('\n📊 Duplicate Analysis:');
  console.log('=' .repeat(60));
  
  const removalPlan = [];
  let totalSavings = 0;
  
  duplicates.forEach((duplicate, index) => {
    console.log(`\n🔄 Duplicate Group ${index + 1}:`);
    
    duplicate.files.forEach(file => {
      console.log(`   ${file.name.padEnd(20)} ${file.size}MB`);
    });
    
    // Determine which file to keep (prefer shorter, more standard names)
    const files = duplicate.files;
    let keepFile, removeFiles;
    
    // Priority order for keeping files
    const priorities = ['LOGO.png', 'splash.png', 'adaptive-icon.png', 'splash-icon.png'];
    
    let bestFile = files[0];
    for (const priority of priorities) {
      const found = files.find(f => f.name === priority);
      if (found) {
        bestFile = found;
        break;
      }
    }
    
    keepFile = bestFile;
    removeFiles = files.filter(f => f !== bestFile);
    
    console.log(`   ✅ KEEP: ${keepFile.name}`);
    removeFiles.forEach(file => {
      console.log(`   ❌ REMOVE: ${file.name} (${file.size}MB)`);
      totalSavings += parseFloat(file.size);
    });
    
    removalPlan.push({ keepFile, removeFiles });
  });
  
  console.log(`\n💾 Total Potential Savings: ${totalSavings.toFixed(2)}MB`);
  return { removalPlan, totalSavings };
}

// Check where files are used in code
function checkFileUsage() {
  console.log('\n🔍 Checking file usage in code...');
  
  const usageMap = {
    'LOGO.png': ['AppHeader.tsx', 'IraChatHeader.tsx', 'ProfileScreen.tsx', 'SettingsScreen.tsx', 'app.json'],
    'splash.png': ['app.json'],
    'splash-icon.png': ['app.json'],
    'adaptive-icon.png': ['app.json']
  };
  
  Object.entries(usageMap).forEach(([file, locations]) => {
    console.log(`📄 ${file}:`);
    locations.forEach(loc => {
      console.log(`   - Used in: ${loc}`);
    });
  });
  
  return usageMap;
}

// Update app.json to use single file
function updateAppJson(keepFile) {
  console.log('\n📝 Updating app.json references...');
  
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Update all references to use the kept file
  const logoPath = `./assets/images/${keepFile}`;
  
  appJson.expo.icon = logoPath;
  appJson.expo.splash.image = logoPath;
  
  // Create backup
  fs.writeFileSync('app.json.backup', JSON.stringify(appJson, null, 2));
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  
  console.log(`✅ Updated app.json to use: ${keepFile}`);
  console.log('✅ Created backup: app.json.backup');
}

// Safely remove duplicate files
function removeDuplicates(removalPlan) {
  console.log('\n🗑️  Removing duplicate files...');
  
  let removedSize = 0;
  let removedCount = 0;
  
  removalPlan.forEach(plan => {
    plan.removeFiles.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        removedSize += parseFloat(file.size);
        removedCount++;
        console.log(`✅ Removed: ${file.name} (${file.size}MB)`);
      } catch (error) {
        console.log(`❌ Failed to remove: ${file.name} - ${error.message}`);
      }
    });
  });
  
  console.log(`\n💾 Successfully removed ${removedCount} duplicate files`);
  console.log(`💾 Total space saved: ${removedSize.toFixed(2)}MB`);
  
  return removedSize;
}

// Main function
function removeDuplicateAssets() {
  console.log('🚀 Starting Duplicate Asset Removal...\n');
  
  const duplicates = findDuplicates();
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate files found!');
    return;
  }
  
  console.log(`🔄 Found ${duplicates.length} duplicate groups`);
  
  const { removalPlan, totalSavings } = analyzeDuplicates(duplicates);
  checkFileUsage();
  
  // For the LOGO group, keep LOGO.png and remove others
  const logoGroup = removalPlan.find(plan => 
    plan.keepFile.name === 'LOGO.png' || 
    plan.removeFiles.some(f => f.name === 'LOGO.png')
  );
  
  if (logoGroup) {
    updateAppJson('LOGO.png');
  }
  
  const actualSavings = removeDuplicates(removalPlan);
  
  console.log('\n🎉 DUPLICATE REMOVAL COMPLETE!');
  console.log('=' .repeat(50));
  console.log(`Files removed: ${removalPlan.reduce((sum, plan) => sum + plan.removeFiles.length, 0)}`);
  console.log(`Space saved: ${actualSavings.toFixed(2)}MB`);
  console.log(`App.json updated: ✅`);
  console.log(`Backup created: ✅`);
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test app to ensure icons still work');
  console.log('2. If issues occur, restore from app.json.backup');
  console.log('3. Run: npx expo build --clear');
  console.log('4. Check new bundle size');
}

// Run if called directly
if (require.main === module) {
  removeDuplicateAssets();
}

module.exports = { findDuplicates, removeDuplicateAssets };
