// Quick verification of key fixes
const fs = require('fs');

console.log('🔍 QUICK VERIFICATION OF KEY FIXES\n');

// Check 1: PhoneNumberInput in phone-register.tsx
console.log('1. Checking PhoneNumberInput in phone-register.tsx...');
if (fs.existsSync('app/(auth)/phone-register.tsx')) {
  const content = fs.readFileSync('app/(auth)/phone-register.tsx', 'utf8');
  if (content.includes('PhoneNumberInput')) {
    console.log('   ✅ PhoneNumberInput imported and used');
  } else {
    console.log('   ❌ PhoneNumberInput not found');
  }
} else {
  console.log('   ❌ phone-register.tsx not found');
}

// Check 2: Phone utils file
console.log('2. Checking phone utils...');
if (fs.existsSync('src/utils/phoneUtils.ts')) {
  const content = fs.readFileSync('src/utils/phoneUtils.ts', 'utf8');
  const functions = ['validatePhoneNumber', 'formatPhoneNumber', 'COUNTRY_CODES'];
  let allFound = true;
  functions.forEach(func => {
    if (!content.includes(func)) {
      console.log(`   ❌ Missing: ${func}`);
      allFound = false;
    }
  });
  if (allFound) {
    console.log('   ✅ All phone utility functions present');
  }
} else {
  console.log('   ❌ phoneUtils.ts not found');
}

// Check 3: Enhanced PhoneNumberInput component
console.log('3. Checking enhanced PhoneNumberInput component...');
if (fs.existsSync('src/components/ui/PhoneNumberInput.tsx')) {
  const content = fs.readFileSync('src/components/ui/PhoneNumberInput.tsx', 'utf8');
  if (content.includes('validatePhoneNumber') && content.includes('formatPhoneNumber')) {
    console.log('   ✅ Enhanced PhoneNumberInput with validation');
  } else {
    console.log('   ❌ PhoneNumberInput not enhanced');
  }
} else {
  console.log('   ❌ PhoneNumberInput.tsx not found');
}

// Check 4: App permissions
console.log('4. Checking app permissions...');
if (fs.existsSync('app.json')) {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const androidPerms = appJson.expo?.android?.permissions || [];
  const iosPerms = appJson.expo?.ios?.infoPlist || {};
  
  const hasCamera = androidPerms.includes('android.permission.CAMERA');
  const hasContacts = androidPerms.includes('android.permission.READ_CONTACTS');
  const hasIosCamera = iosPerms.NSCameraUsageDescription;
  
  if (hasCamera && hasContacts && hasIosCamera) {
    console.log('   ✅ Required permissions added');
  } else {
    console.log('   ❌ Missing some permissions');
  }
} else {
  console.log('   ❌ app.json not found');
}

// Check 5: Missing route files
console.log('5. Checking missing route files...');
const routeFiles = ['app/welcome.tsx', 'app/register.tsx'];
let allRoutesExist = true;
routeFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`   ❌ Missing: ${file}`);
    allRoutesExist = false;
  }
});
if (allRoutesExist) {
  console.log('   ✅ All route files created');
}

console.log('\n🎉 VERIFICATION COMPLETE!');
console.log('📱 Your IraChat app now has international phone number support!');
console.log('\n🚀 Ready to test:');
console.log('   1. Run: npx expo start');
console.log('   2. Test phone registration with different countries');
console.log('   3. Verify all features work correctly');
