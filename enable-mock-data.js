#!/usr/bin/env node
/**
 * Script to enable/disable mock data for IraChat testing
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = '.env';

function updateEnvFile(enableMockData) {
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  }
  
  // Remove existing EXPO_PUBLIC_USE_MOCK_DATA line
  envContent = envContent.replace(/^EXPO_PUBLIC_USE_MOCK_DATA=.*$/gm, '');
  
  // Add new line
  const mockDataLine = `EXPO_PUBLIC_USE_MOCK_DATA=${enableMockData ? 'true' : 'false'}`;
  
  // Add to end of file
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += mockDataLine + '\n';
  
  // Write back to file
  fs.writeFileSync(ENV_FILE, envContent);
  
  console.log(`✅ Mock data ${enableMockData ? 'ENABLED' : 'DISABLED'} in ${ENV_FILE}`);
}

function showUsage() {
  console.log(`
🧪 IraChat Mock Data Manager

Usage:
  node enable-mock-data.js [enable|disable|status]

Commands:
  enable   - Enable mock data for testing
  disable  - Disable mock data (use live data only)
  status   - Show current mock data status

Examples:
  node enable-mock-data.js enable
  node enable-mock-data.js disable
  node enable-mock-data.js status

What Mock Data Includes:
  📊 16 realistic users with avatars
  💬 10 chat conversations with messages
  👥 8 group chats with members
  📞 8 call history entries
  📱 8 social updates with media
  📋 22 contacts (IraChat + regular)
  🔔 5 notifications

Note: Mock data is additive - it doesn't replace live functionality!
`);
}

function showStatus() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('📄 No .env file found - mock data disabled by default');
    return;
  }
  
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const mockDataMatch = envContent.match(/^EXPO_PUBLIC_USE_MOCK_DATA=(.*)$/m);
  
  if (mockDataMatch) {
    const isEnabled = mockDataMatch[1].trim() === 'true';
    console.log(`🧪 Mock data is currently ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    
    if (isEnabled) {
      console.log(`
📊 Mock Data Available:
  • 16 users with realistic profiles
  • 10 chat conversations
  • 8 group chats
  • 8 call history entries
  • 8 social updates
  • 22 contacts
  • 5 notifications
  
💡 Mock data appears alongside live data for comprehensive testing.
`);
    }
  } else {
    console.log('📄 EXPO_PUBLIC_USE_MOCK_DATA not set - mock data disabled by default');
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'enable':
    updateEnvFile(true);
    console.log(`
🎉 Mock data enabled! 

Next steps:
1. Restart your Expo development server
2. Reload the app to see mock data
3. Look for the mock data indicator at the bottom of screens

The mock data includes realistic users, chats, groups, calls, and updates
that will appear alongside any live data you have.
`);
    break;
    
  case 'disable':
    updateEnvFile(false);
    console.log(`
✅ Mock data disabled!

Next steps:
1. Restart your Expo development server  
2. Reload the app to use live data only

The app will now only show real data from Firebase and device contacts.
`);
    break;
    
  case 'status':
    showStatus();
    break;
    
  default:
    showUsage();
    break;
}
