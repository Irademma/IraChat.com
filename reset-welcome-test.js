#!/usr/bin/env node

/**
 * Reset Welcome Screen Test
 * This script resets the first launch flag so you can test the welcome screen
 */

const { exec } = require("child_process");
const fs = require("fs");

console.log("🔄 Resetting welcome screen test...\n");

// Clear AsyncStorage to reset first launch flag
const resetScript = `
import AsyncStorage from '@react-native-async-storage/async-storage';

const resetFirstLaunch = async () => {
  try {
    console.log('🔄 Clearing first launch flag...');
    await AsyncStorage.removeItem('hasLaunchedBefore');
    await AsyncStorage.removeItem('authData');
    await AsyncStorage.removeItem('userData');
    console.log('✅ First launch flag cleared - you should see welcome screen');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
};

resetFirstLaunch();
`;

// Write the reset script
fs.writeFileSync("temp-reset.js", resetScript);

console.log("📝 Instructions to test welcome screen:");
console.log("");
console.log('1. 🔄 Reload your app (press "r" in terminal)');
console.log("2. 👀 You should now see the welcome screen");
console.log("3. 🎯 If you still don't see it, check the console logs");
console.log("");
console.log("🔍 Look for these logs in your terminal:");
console.log('   - "🔍 Determining initial route..."');
console.log('   - "👋 First time user: true"');
console.log('   - "🎉 New user, redirecting to welcome"');
console.log("");
console.log("💡 If you want to manually clear storage, run this in your app:");
console.log("   AsyncStorage.clear()");

// Clean up
fs.unlinkSync("temp-reset.js");

console.log("\n✅ Reset complete! Reload your app to test.");
