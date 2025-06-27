#!/usr/bin/env node
/**
 * Avatar System Testing and Validation Script for IraChat
 * 
 * Comprehensive testing script to ensure avatar system consistency
 * and identify any remaining manual implementations
 */

const fs = require('fs');
const path = require('path');

// Avatar system test configuration
const testConfig = {
  avatarComponent: 'Avatar',
  profileAvatarComponent: 'ProfileAvatar',
  manualImagePatterns: [
    /source=\{\{\s*uri:/g,
    /className=".*rounded-full.*"/g,
    /style=\{\{.*borderRadius.*\}\}/g,
  ],
  consistencyPatterns: {
    shouldUseAvatar: [
      /w-\d+\s+h-\d+.*rounded-full/g, // Tailwind circular images
      /width:\s*\d+.*height:\s*\d+.*borderRadius/g, // Style object circular images
    ],
    hasAvatarComponent: [
      /<Avatar\s/g,
      /Avatar\(/g,
      /require.*Avatar/g,
    ],
    hasProfileAvatar: [
      /<ProfileAvatar\s/g,
      /ProfileAvatar\(/g,
      /require.*ProfileAvatar/g,
    ],
  },
};

// Files to test
const testFiles = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/groups.tsx',
  'app/(tabs)/calls.tsx',
  'app/(tabs)/updates.tsx',
  'app/fast-contacts.tsx',
  'app/contacts.tsx',
  'app/profile.tsx',
  'app/chat/[id].tsx',
  'src/components/ChatRoom.tsx',
  'src/components/MainHeader.tsx',
  'src/screens/ProfileScreen.tsx',
  'src/screens/ChatsListScreen.tsx',
  'src/screens/GroupChatScreen.tsx',
  'src/screens/ContactsScreen.tsx',
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return '';
  }
}

function analyzeAvatarUsage(content, filePath) {
  const analysis = {
    file: filePath,
    hasManualImages: false,
    hasAvatarComponent: false,
    hasProfileAvatar: false,
    manualImageCount: 0,
    avatarComponentCount: 0,
    profileAvatarCount: 0,
    issues: [],
    suggestions: [],
  };

  // Check for manual image implementations
  testConfig.manualImagePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      analysis.hasManualImages = true;
      analysis.manualImageCount += matches.length;
    }
  });

  // Check for Avatar component usage
  testConfig.consistencyPatterns.hasAvatarComponent.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      analysis.hasAvatarComponent = true;
      analysis.avatarComponentCount += matches.length;
    }
  });

  // Check for ProfileAvatar component usage
  testConfig.consistencyPatterns.hasProfileAvatar.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      analysis.hasProfileAvatar = true;
      analysis.profileAvatarCount += matches.length;
    }
  });

  // Check for patterns that should use Avatar component
  testConfig.consistencyPatterns.shouldUseAvatar.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && !analysis.hasAvatarComponent) {
      analysis.issues.push('Circular images detected without Avatar component usage');
      analysis.suggestions.push('Replace manual circular images with Avatar component');
    }
  });

  // Specific checks
  if (analysis.hasManualImages && !analysis.hasAvatarComponent) {
    analysis.issues.push('Manual image implementation without Avatar component');
    analysis.suggestions.push('Use Avatar component from src/components/Avatar.tsx');
  }

  if (content.includes('onError') && content.includes('Image') && !analysis.hasAvatarComponent) {
    analysis.issues.push('Manual error handling for images detected');
    analysis.suggestions.push('Avatar component provides automatic error handling');
  }

  if (content.includes('rounded-full') && content.includes('Image') && !analysis.hasAvatarComponent) {
    analysis.issues.push('Manual circular image styling detected');
    analysis.suggestions.push('Use Avatar component for consistent circular styling');
  }

  // Profile-specific checks
  if (filePath.includes('profile') || filePath.includes('Profile')) {
    if (!analysis.hasProfileAvatar && analysis.hasManualImages) {
      analysis.issues.push('Profile screen without ProfileAvatar component');
      analysis.suggestions.push('Use ProfileAvatar component for profile screens');
    }
  }

  return analysis;
}

function generateConsistencyReport(analyses) {
  console.log('🎨 Avatar System Consistency Report\n');
  console.log('=' .repeat(60));

  let totalFiles = 0;
  let filesWithIssues = 0;
  let totalIssues = 0;
  let filesWithAvatarComponent = 0;
  let filesWithManualImages = 0;

  analyses.forEach(analysis => {
    totalFiles++;
    
    if (analysis.issues.length > 0) {
      filesWithIssues++;
      totalIssues += analysis.issues.length;
    }

    if (analysis.hasAvatarComponent) {
      filesWithAvatarComponent++;
    }

    if (analysis.hasManualImages) {
      filesWithManualImages++;
    }

    // Report file-specific issues
    if (analysis.issues.length > 0) {
      console.log(`\n📄 ${analysis.file}`);
      console.log(`   Avatar Components: ${analysis.avatarComponentCount}`);
      console.log(`   Manual Images: ${analysis.manualImageCount}`);
      console.log(`   Profile Avatars: ${analysis.profileAvatarCount}`);
      
      analysis.issues.forEach((issue, index) => {
        console.log(`   ❌ ${issue}`);
        if (analysis.suggestions[index]) {
          console.log(`      💡 ${analysis.suggestions[index]}`);
        }
      });
    }
  });

  // Summary statistics
  console.log('\n📊 Summary Statistics:');
  console.log(`   Total Files Analyzed: ${totalFiles}`);
  console.log(`   Files with Issues: ${filesWithIssues}`);
  console.log(`   Total Issues Found: ${totalIssues}`);
  console.log(`   Files using Avatar Component: ${filesWithAvatarComponent}`);
  console.log(`   Files with Manual Images: ${filesWithManualImages}`);
  
  const consistencyScore = ((totalFiles - filesWithIssues) / totalFiles) * 100;
  console.log(`   Consistency Score: ${consistencyScore.toFixed(1)}%`);

  // Recommendations
  console.log('\n🔧 Recommendations:');
  
  if (filesWithManualImages > 0) {
    console.log('   1. Replace manual Image components with Avatar component');
    console.log('   2. Use ProfileAvatar for profile screens with editing capabilities');
    console.log('   3. Ensure all avatars have proper fallback handling');
  }

  if (consistencyScore < 100) {
    console.log('   4. Review flagged files and implement suggested fixes');
    console.log('   5. Use AvatarManager for centralized avatar management');
  }

  if (consistencyScore === 100) {
    console.log('   ✅ Avatar system is fully consistent! Great job!');
  }

  return {
    totalFiles,
    filesWithIssues,
    totalIssues,
    consistencyScore,
  };
}

function generateFixScript(analyses) {
  const fixesNeeded = analyses.filter(a => a.issues.length > 0);
  
  if (fixesNeeded.length === 0) {
    console.log('\n✅ No fixes needed! Avatar system is consistent.');
    return;
  }

  console.log('\n🔧 Automated Fix Script:');
  console.log('=' .repeat(40));

  fixesNeeded.forEach(analysis => {
    console.log(`\n# Fix ${analysis.file}`);
    
    if (analysis.hasManualImages && !analysis.hasAvatarComponent) {
      console.log('# Replace manual Image with Avatar component:');
      console.log(`# 1. Import: const Avatar = require("path/to/Avatar").Avatar;`);
      console.log(`# 2. Replace Image components with Avatar component`);
      console.log(`# 3. Remove manual styling and error handling`);
    }

    if (analysis.file.includes('profile') && !analysis.hasProfileAvatar) {
      console.log('# Use ProfileAvatar for profile screens:');
      console.log(`# 1. Import: const ProfileAvatar = require("path/to/ProfileAvatar").ProfileAvatar;`);
      console.log(`# 2. Replace with ProfileAvatar component`);
      console.log(`# 3. Add editing capabilities if needed`);
    }
  });
}

function testAvatarComponents() {
  console.log('🧪 Testing Avatar Components...\n');

  // Test Avatar component exists
  const avatarPath = 'src/components/Avatar.tsx';
  if (!checkFileExists(avatarPath)) {
    console.error('❌ Avatar component not found at src/components/Avatar.tsx');
    return false;
  }

  // Test ProfileAvatar component exists
  const profileAvatarPath = 'src/components/ProfileAvatar.tsx';
  if (!checkFileExists(profileAvatarPath)) {
    console.error('❌ ProfileAvatar component not found at src/components/ProfileAvatar.tsx');
    return false;
  }

  // Test AvatarService exists
  const avatarServicePath = 'src/services/avatarService.ts';
  if (!checkFileExists(avatarServicePath)) {
    console.error('❌ AvatarService not found at src/services/avatarService.ts');
    return false;
  }

  console.log('✅ All avatar components found!');
  return true;
}

function main() {
  console.log('🚀 Starting Avatar System Testing...\n');

  // Test component existence
  if (!testAvatarComponents()) {
    console.error('❌ Avatar system components missing. Please ensure all components are created.');
    return;
  }

  // Analyze all files
  const analyses = testFiles.map(filePath => {
    if (!checkFileExists(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return null;
    }

    const content = readFileContent(filePath);
    return analyzeAvatarUsage(content, filePath);
  }).filter(Boolean);

  // Generate reports
  const summary = generateConsistencyReport(analyses);
  generateFixScript(analyses);

  // Final assessment
  console.log('\n🎯 Final Assessment:');
  if (summary.consistencyScore >= 90) {
    console.log('🎉 Excellent! Avatar system is highly consistent.');
  } else if (summary.consistencyScore >= 70) {
    console.log('👍 Good! Minor improvements needed for full consistency.');
  } else {
    console.log('⚠️ Needs improvement. Several consistency issues found.');
  }

  console.log('\n✅ Avatar system testing complete!');
  
  return summary.consistencyScore >= 90;
}

if (require.main === module) {
  main();
}
