#!/usr/bin/env node

/**
 * QUICK ISSUES CHECK - Simple verification of critical files
 */

const fs = require('fs');

console.log('🔍 QUICK ISSUES CHECK');
console.log('=' .repeat(40));

let issuesFound = 0;

function checkFile(file, description) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${description}: EXISTS`);
    return true;
  } else {
    console.log(`❌ ${description}: MISSING`);
    issuesFound++;
    return false;
  }
}

function checkContent(file, searchText, description) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(searchText)) {
      console.log(`✅ ${description}: FOUND`);
      return true;
    } else {
      console.log(`❌ ${description}: MISSING`);
      issuesFound++;
      return false;
    }
  } else {
    console.log(`❌ ${description}: FILE MISSING`);
    issuesFound++;
    return false;
  }
}

console.log('\n🔍 Checking critical files...\n');

// Check essential files
checkFile('src/services/authService.ts', 'Auth Service');
checkFile('src/services/chatService.ts', 'Chat Service');
checkFile('src/services/mediaService.ts', 'Media Service');
checkFile('src/services/contactsService.ts', 'Contacts Service');
checkFile('src/services/callingService.ts', 'Calling Service');
checkFile('src/services/firebaseSimple.ts', 'Firebase Config');

// Check Redux files
checkFile('src/redux/store.ts', 'Redux Store');
checkFile('src/redux/userSlice.ts', 'User Slice');
checkFile('src/redux/chatSlice.ts', 'Chat Slice');

// Check types
checkFile('src/types/index.ts', 'Type Definitions');

// Check components
checkFile('src/components/ErrorBoundary.tsx', 'Error Boundary');
checkFile('src/components/ThemeProvider.tsx', 'Theme Provider');

// Check routes
checkFile('app/_layout.tsx', 'Root Layout');
checkFile('app/(tabs)/_layout.tsx', 'Tabs Layout');
checkFile('app/(tabs)/index.tsx', 'Chats Screen');
checkFile('app/(tabs)/groups.tsx', 'Groups Screen');
checkFile('app/(tabs)/calls.tsx', 'Calls Screen');
checkFile('app/(tabs)/updates.tsx', 'Updates Screen');
checkFile('app/chat/[id].tsx', 'Chat Screen');
checkFile('app/call.tsx', 'Call Screen');

// Check configuration files
checkFile('package.json', 'Package.json');
checkFile('app.json', 'App.json');
checkFile('firestore.rules', 'Firestore Rules');

console.log('\n🔍 Checking critical content...\n');

// Check Firebase config
checkContent('src/services/firebaseSimple.ts', 'initializeApp', 'Firebase Initialization');
checkContent('src/services/firebaseSimple.ts', 'getFirestore', 'Firestore Setup');
checkContent('src/services/firebaseSimple.ts', 'getStorage', 'Storage Setup');

// Check Redux Persist
checkContent('app/_layout.tsx', 'PersistGate', 'Redux Persist Gate');
checkContent('src/redux/store.ts', 'persistReducer', 'Redux Persist Config');

// Check permissions
checkContent('app.json', 'READ_CONTACTS', 'Contacts Permission');
checkContent('app.json', 'CAMERA', 'Camera Permission');

console.log('\n' + '='.repeat(40));
console.log('📊 QUICK CHECK RESULTS');
console.log('='.repeat(40));

if (issuesFound === 0) {
  console.log('\n🎉 NO CRITICAL ISSUES FOUND!');
  console.log('✅ All essential files and configurations are present');
} else {
  console.log(`\n⚠️ ${issuesFound} ISSUES FOUND`);
  console.log('🔧 Please address the missing files/configurations above');
}

console.log('\n🔍 Quick Check Complete!');
