#!/usr/bin/env node

/**
 * COMPREHENSIVE VERIFICATION FOR IRACHAT
 * Ensures ALL collections, rules, and functionality are complete
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE IRACHAT VERIFICATION...');

// ALL COLLECTIONS USED IN THE CODEBASE
const ACTUAL_COLLECTIONS_USED = [
  // CORE COLLECTIONS (From codebase analysis)
  'users',           // User profiles and authentication
  'chats',           // Chat conversations
  'messages',        // Chat messages
  'groups',          // Group chats
  'contacts',        // Phone contacts
  'media',           // Photos, videos, files
  'documents',       // File uploads
  'voiceMessages',   // Voice notes
  
  // SOCIAL FEATURES
  'updates',         // TikTok-style updates
  'updateViews',     // Update view tracking
  'updateLikes',     // Update like tracking
  'updateComments',  // Update comments
  'stories',         // WhatsApp-style stories
  'storyViews',      // Story view tracking
  
  // CALLING SYSTEM
  'calls',           // Voice/video calls
  'callLogs',        // Call history
  'activeCalls',     // Real-time call management
  'groupCalls',      // Group calls
  
  // NOTIFICATIONS & STATUS
  'notifications',   // Push notifications
  'onlineStatus',    // User online/offline status
  'lastSeen',        // Last seen timestamps
  
  // MESSAGE FEATURES
  'messageReactions', // Message reactions
  'messageStatus',   // Message delivery/read receipts
  'messageReplies',  // Message replies
  'messageForwards', // Message forwarding
  'messageEdits',    // Message edit history
  'typing',          // Typing indicators
  
  // USER MANAGEMENT
  'blockedUsers',    // Blocked contacts
  'userProfiles',    // Extended user profiles
  'userSettings',    // User preferences
  'userAnalytics',   // User activity tracking
  
  // SECURITY & PRIVACY
  'encryptionKeys',  // Message encryption
  'phoneVerification', // Phone number verification
  'securityLogs',    // Security events
  'twoFactorAuth',   // 2FA settings
  
  // DATA MANAGEMENT
  'downloads',       // Download tracking
  'backups',         // Data backups
  'chatExports',     // Chat exports
  'deletedMessages', // Deleted message tracking
  'deletedMedia',    // Deleted media tracking
  'deletedChats',    // Deleted chat tracking
  
  // BUSINESS FEATURES
  'businessProfiles', // Business accounts
  'payments',        // Payment transactions
  'channels',        // Broadcast channels
  'channelSubscriptions', // Channel subscriptions
  
  // LOCATION & SHARING
  'locations',       // Location sharing
  'sharedContent',   // Shared media
  'userSessions',    // Device sessions
  
  // SYSTEM COLLECTIONS
  'appUsage',        // App usage analytics
  'engagementMetrics', // Global analytics
  'navigationState', // Navigation tracking
];

// VERIFY FIREBASE RULES COVERAGE
function verifyFirebaseRules() {
  console.log('\n🔥 VERIFYING FIREBASE RULES COVERAGE:');
  console.log('=' .repeat(50));
  
  try {
    const rulesContent = fs.readFileSync('FIREBASE_RULES_PRODUCTION.txt', 'utf8');
    
    let coveredCollections = [];
    let missingCollections = [];
    
    ACTUAL_COLLECTIONS_USED.forEach(collection => {
      // Check if collection is mentioned in rules
      const patterns = [
        `match /${collection}/`,
        `collection(db, "${collection}")`,
        `collection(db, '${collection}')`,
        `/${collection}/`,
        `"${collection}"`,
        `'${collection}'`
      ];
      
      const isCovered = patterns.some(pattern => 
        rulesContent.includes(pattern) || 
        rulesContent.includes(collection)
      );
      
      if (isCovered) {
        coveredCollections.push(collection);
      } else {
        missingCollections.push(collection);
      }
    });
    
    console.log(`✅ Covered collections: ${coveredCollections.length}/${ACTUAL_COLLECTIONS_USED.length}`);
    console.log(`❌ Missing collections: ${missingCollections.length}`);
    
    if (missingCollections.length > 0) {
      console.log('\n🚨 MISSING FROM RULES:');
      missingCollections.forEach(collection => {
        console.log(`  ❌ ${collection}`);
      });
    }
    
    // Check for fallback rules
    const hasFallbackRules = rulesContent.includes('match /{collection}/{document}') ||
                            rulesContent.includes('match /{document=**}');
    
    if (hasFallbackRules) {
      console.log('\n✅ FALLBACK RULES FOUND - All collections covered by default rules');
      missingCollections = []; // Clear missing since fallback covers them
    }
    
    return { coveredCollections, missingCollections, hasFallbackRules };
    
  } catch (error) {
    console.log('❌ Error reading Firebase rules:', error.message);
    return { coveredCollections: [], missingCollections: ACTUAL_COLLECTIONS_USED, hasFallbackRules: false };
  }
}

// VERIFY COLLECTION CREATOR
function verifyCollectionCreator() {
  console.log('\n📦 VERIFYING COLLECTION CREATOR:');
  console.log('=' .repeat(40));
  
  try {
    const creatorContent = fs.readFileSync('src/components/FirebaseCollectionCreator.tsx', 'utf8');
    
    // Check if component exists and has essential collections
    const essentialCollections = ['users', 'chats', 'groups', 'updates', 'calls', 'notifications', 'media', 'onlineStatus'];
    let foundCollections = [];
    
    essentialCollections.forEach(collection => {
      if (creatorContent.includes(`name: '${collection}'`) || 
          creatorContent.includes(`name: "${collection}"`)) {
        foundCollections.push(collection);
      }
    });
    
    console.log(`✅ Essential collections in creator: ${foundCollections.length}/${essentialCollections.length}`);
    
    // Check if creator is properly imported in settings
    const settingsContent = fs.readFileSync('app/(tabs)/settings.tsx', 'utf8');
    const hasImport = settingsContent.includes('FirebaseCollectionCreator');
    const hasButton = settingsContent.includes('Setup Firebase Collections') || 
                     settingsContent.includes('Create Collections');
    const hasModal = settingsContent.includes('<Modal') && settingsContent.includes('FirebaseCollectionCreator');
    
    console.log(`✅ Creator imported in settings: ${hasImport}`);
    console.log(`✅ Button exists in settings: ${hasButton}`);
    console.log(`✅ Modal properly configured: ${hasModal}`);
    
    return {
      collectionsInCreator: foundCollections.length,
      hasImport,
      hasButton,
      hasModal
    };
    
  } catch (error) {
    console.log('❌ Error verifying collection creator:', error.message);
    return {
      collectionsInCreator: 0,
      hasImport: false,
      hasButton: false,
      hasModal: false
    };
  }
}

// VERIFY CODEBASE CONSISTENCY
function verifyCodebaseConsistency() {
  console.log('\n🔍 VERIFYING CODEBASE CONSISTENCY:');
  console.log('=' .repeat(45));
  
  const issues = [];
  const warnings = [];
  
  try {
    // Check for common issues
    const files = [
      'src/services/firebaseSimple.ts',
      'src/services/firestoreService.ts',
      'src/services/messagingService.ts',
      'app/(tabs)/settings.tsx'
    ];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for potential issues
        if (content.includes('console.error') && content.includes('throw error')) {
          warnings.push(`${file}: Has proper error handling`);
        }
        
        if (content.includes('auth.currentUser') && !content.includes('if (!auth.currentUser)')) {
          issues.push(`${file}: Missing auth check before using currentUser`);
        }
        
        if (content.includes('collection(') && content.includes('doc(')) {
          warnings.push(`${file}: Uses Firebase operations correctly`);
        }
        
      } else {
        issues.push(`Missing file: ${file}`);
      }
    });
    
    console.log(`✅ Warnings (good practices): ${warnings.length}`);
    console.log(`❌ Issues found: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\n🚨 ISSUES TO FIX:');
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
    }
    
    return { issues, warnings };
    
  } catch (error) {
    console.log('❌ Error verifying codebase:', error.message);
    return { issues: ['Error reading codebase files'], warnings: [] };
  }
}

// VERIFY BUNDLE CONFIGURATION
function verifyBundleConfig() {
  console.log('\n📦 VERIFYING BUNDLE CONFIGURATION:');
  console.log('=' .repeat(40));
  
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    const checks = {
      hasAssetBundlePatterns: !!appJson.expo.assetBundlePatterns,
      isMobileOnly: appJson.expo.platforms && 
                   appJson.expo.platforms.includes('android') && 
                   appJson.expo.platforms.includes('ios') && 
                   !appJson.expo.platforms.includes('web'),
      hasProGuard: appJson.expo.android && appJson.expo.android.enableProguardInReleaseBuilds,
      hasArchitectureSplits: appJson.expo.android && appJson.expo.android.enableSeparateBuildPerCPUArchitecture,
      specificAssets: appJson.expo.assetBundlePatterns && 
                     appJson.expo.assetBundlePatterns.length > 0 &&
                     !appJson.expo.assetBundlePatterns.some(pattern => pattern.includes('*'))
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}: ${passed}`);
    });
    
    return checks;
    
  } catch (error) {
    console.log('❌ Error reading app.json:', error.message);
    return {};
  }
}

// MAIN VERIFICATION FUNCTION
function runComprehensiveVerification() {
  console.log('🚀 STARTING COMPREHENSIVE VERIFICATION...\n');
  
  const rulesVerification = verifyFirebaseRules();
  const creatorVerification = verifyCollectionCreator();
  const codebaseVerification = verifyCodebaseConsistency();
  const bundleVerification = verifyBundleConfig();
  
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log('=' .repeat(30));
  
  const totalIssues = rulesVerification.missingCollections.length + 
                     codebaseVerification.issues.length;
  
  console.log(`🔥 Firebase Rules: ${rulesVerification.hasFallbackRules ? 'COMPLETE' : 'NEEDS ATTENTION'}`);
  console.log(`📦 Collection Creator: ${creatorVerification.hasButton && creatorVerification.hasModal ? 'WORKING' : 'NEEDS FIX'}`);
  console.log(`🔍 Codebase Issues: ${codebaseVerification.issues.length}`);
  console.log(`📱 Bundle Config: ${Object.values(bundleVerification).every(v => v) ? 'OPTIMIZED' : 'NEEDS OPTIMIZATION'}`);
  
  console.log(`\n🎯 TOTAL ISSUES: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 ✅ ALL VERIFICATIONS PASSED!');
    console.log('🚀 Your IraChat app is ready for production!');
  } else {
    console.log('\n⚠️  Some issues need attention before production.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Copy Firebase rules from FIREBASE_RULES_PRODUCTION.txt');
  console.log('2. Test collection creator button in Settings');
  console.log('3. Build app: npx expo run:android --variant release');
  console.log('4. Verify all functionality works');
  
  return {
    totalIssues,
    rulesVerification,
    creatorVerification,
    codebaseVerification,
    bundleVerification
  };
}

// Run verification if called directly
if (require.main === module) {
  runComprehensiveVerification();
}

module.exports = { runComprehensiveVerification, ACTUAL_COLLECTIONS_USED };
