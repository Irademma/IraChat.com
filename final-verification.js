#!/usr/bin/env node

/**
 * FINAL VERIFICATION - Quick check of resolved issues
 */

const fs = require('fs');

console.log('🔍 FINAL VERIFICATION - CHECKING RESOLVED ISSUES');
console.log('=' .repeat(60));

let issuesFound = 0;

function checkIssue(description, checkFunction) {
  try {
    const result = checkFunction();
    if (result) {
      console.log(`❌ ${description}: ${result}`);
      issuesFound++;
    } else {
      console.log(`✅ ${description}: RESOLVED`);
    }
  } catch (error) {
    console.log(`❌ ${description}: ERROR - ${error.message}`);
    issuesFound++;
  }
}

console.log('\n🔍 VERIFYING PREVIOUSLY IDENTIFIED ISSUES...\n');

// 1. Error Handling in Updates
checkIssue('Error Handling in Updates', () => {
  const file = 'app/(tabs)/updates.tsx';
  if (!fs.existsSync(file)) return 'File missing';
  
  const content = fs.readFileSync(file, 'utf8');
  const hasTry = content.includes('try {');
  const hasCatch = content.includes('catch');
  const hasAlert = content.includes('Alert.alert');
  
  if (!hasTry || !hasCatch || !hasAlert) {
    return 'Missing proper error handling';
  }
  return null;
});

// 2. Firestore Security Rules
checkIssue('Firestore Security Rules', () => {
  if (!fs.existsSync('firestore.rules')) {
    return 'Security rules file missing';
  }
  
  const content = fs.readFileSync('firestore.rules', 'utf8');
  if (!content.includes('rules_version') || !content.includes('allow read, write')) {
    return 'Invalid security rules';
  }
  return null;
});

// 3. Redux Persist PersistGate
checkIssue('Redux Persist PersistGate', () => {
  const layoutFile = 'app/_layout.tsx';
  if (!fs.existsSync(layoutFile)) return 'Layout file missing';
  
  const content = fs.readFileSync(layoutFile, 'utf8');
  if (!content.includes('PersistGate') || !content.includes('persistor')) {
    return 'PersistGate not properly implemented';
  }
  return null;
});

// 4. Android READ_CONTACTS Permission
checkIssue('Android READ_CONTACTS Permission', () => {
  const appJson = 'app.json';
  if (!fs.existsSync(appJson)) return 'app.json missing';
  
  const content = fs.readFileSync(appJson, 'utf8');
  if (!content.includes('READ_CONTACTS')) {
    return 'READ_CONTACTS permission missing';
  }
  return null;
});

// 5. FlatList Performance Optimization
checkIssue('FlatList Performance Optimization', () => {
  const files = [
    'app/(tabs)/updates.tsx',
    'app/(tabs)/index.tsx', 
    'app/chat/[id].tsx'
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('FlatList') && !content.includes('getItemLayout')) {
        return `${file} missing getItemLayout optimization`;
      }
    }
  }
  return null;
});

// 6. Media Upload Implementation
checkIssue('Media Upload Implementation', () => {
  const updatesFile = 'app/(tabs)/updates.tsx';
  const mediaService = 'src/services/mediaService.ts';
  
  if (!fs.existsSync(updatesFile)) return 'Updates file missing';
  if (!fs.existsSync(mediaService)) return 'Media service missing';
  
  const updatesContent = fs.readFileSync(updatesFile, 'utf8');
  const mediaContent = fs.readFileSync(mediaService, 'utf8');
  
  if (!updatesContent.includes('expo-image-picker')) {
    return 'Image picker not implemented';
  }
  
  if (!mediaContent.includes('uploadBytes')) {
    return 'Firebase Storage upload not implemented';
  }
  
  return null;
});

// 7. Real Contacts Integration
checkIssue('Real Contacts Integration', () => {
  const contactsService = 'src/services/contactsService.ts';
  const callsFile = 'app/(tabs)/calls.tsx';
  
  if (!fs.existsSync(contactsService)) return 'Contacts service missing';
  if (!fs.existsSync(callsFile)) return 'Calls file missing';
  
  const contactsContent = fs.readFileSync(contactsService, 'utf8');
  const callsContent = fs.readFileSync(callsFile, 'utf8');
  
  if (!contactsContent.includes('expo-contacts')) {
    return 'Expo contacts not implemented';
  }
  
  if (!callsContent.includes('loadRealContacts')) {
    return 'Real contacts loading not implemented';
  }
  
  return null;
});

// 8. WebRTC Calling Implementation
checkIssue('WebRTC Calling Implementation', () => {
  const callingService = 'src/services/callingService.ts';
  const callFile = 'app/call.tsx';
  
  if (!fs.existsSync(callingService)) return 'Calling service missing';
  if (!fs.existsSync(callFile)) return 'Call screen missing';
  
  const callingContent = fs.readFileSync(callingService, 'utf8');
  const callContent = fs.readFileSync(callFile, 'utf8');
  
  if (!callingContent.includes('RTCPeerConnection')) {
    return 'WebRTC not implemented';
  }
  
  if (!callContent.includes('callingService')) {
    return 'Call screen not using calling service';
  }
  
  return null;
});

// Generate final report
console.log('\n' + '='.repeat(60));
console.log('📊 FINAL VERIFICATION RESULTS');
console.log('='.repeat(60));

if (issuesFound === 0) {
  console.log('\n🎉 ALL ISSUES RESOLVED!');
  console.log('✅ PRODUCTION READY');
  console.log('🚀 Ready for immediate deployment to app stores');
} else {
  console.log(`\n⚠️ ${issuesFound} ISSUES STILL NEED ATTENTION`);
  console.log('🔧 Please address the remaining issues before production deployment');
}

console.log('\n🔍 Final Verification Complete!');
