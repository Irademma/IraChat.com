#!/usr/bin/env node
/**
 * Test script to verify mock data functionality in IraChat
 */

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkMockDataService() {
  console.log('🔍 Checking Mock Data Service...');
  
  const servicePath = 'src/services/mockDataService.ts';
  if (!checkFileExists(servicePath)) {
    console.log('❌ Mock Data Service not found');
    return false;
  }
  
  const content = fs.readFileSync(servicePath, 'utf8');
  
  // Check for key interfaces
  const requiredInterfaces = [
    'MockUser', 'MockMessage', 'MockChat', 'MockGroup', 
    'MockCall', 'MockUpdate', 'MockContact', 'MockNotification'
  ];
  
  const missingInterfaces = requiredInterfaces.filter(interface => 
    !content.includes(`interface ${interface}`)
  );
  
  if (missingInterfaces.length > 0) {
    console.log(`❌ Missing interfaces: ${missingInterfaces.join(', ')}`);
    return false;
  }
  
  // Check for key methods
  const requiredMethods = [
    'getMockUsers', 'getMockChats', 'getMockGroups', 
    'getMockCalls', 'getMockUpdates', 'getMockContacts'
  ];
  
  const missingMethods = requiredMethods.filter(method => 
    !content.includes(method)
  );
  
  if (missingMethods.length > 0) {
    console.log(`❌ Missing methods: ${missingMethods.join(', ')}`);
    return false;
  }
  
  console.log('✅ Mock Data Service is properly configured');
  return true;
}

function checkMockDataHook() {
  console.log('🔍 Checking Mock Data Hook...');
  
  const hookPath = 'src/hooks/useMockData.ts';
  if (!checkFileExists(hookPath)) {
    console.log('❌ Mock Data Hook not found');
    return false;
  }
  
  const content = fs.readFileSync(hookPath, 'utf8');
  
  // Check for key hooks
  const requiredHooks = [
    'useMockData', 'useMockUsers', 'useMockChats', 
    'useMockGroups', 'useMockCalls', 'useMockUpdates'
  ];
  
  const missingHooks = requiredHooks.filter(hook => 
    !content.includes(`export const ${hook}`)
  );
  
  if (missingHooks.length > 0) {
    console.log(`❌ Missing hooks: ${missingHooks.join(', ')}`);
    return false;
  }
  
  console.log('✅ Mock Data Hook is properly configured');
  return true;
}

function checkMockDataIndicator() {
  console.log('🔍 Checking Mock Data Indicator...');
  
  const indicatorPath = 'src/components/MockDataIndicator.tsx';
  if (!checkFileExists(indicatorPath)) {
    console.log('❌ Mock Data Indicator not found');
    return false;
  }
  
  const content = fs.readFileSync(indicatorPath, 'utf8');
  
  if (!content.includes('MockDataIndicator')) {
    console.log('❌ MockDataIndicator component not properly exported');
    return false;
  }
  
  console.log('✅ Mock Data Indicator is properly configured');
  return true;
}

function checkPageIntegrations() {
  console.log('🔍 Checking Page Integrations...');
  
  const pages = [
    { path: 'app/(tabs)/index.tsx', name: 'Chats Page' },
    { path: 'app/(tabs)/groups.tsx', name: 'Groups Page' },
    { path: 'app/(tabs)/updates.tsx', name: 'Updates Page' },
    { path: 'app/(tabs)/calls.tsx', name: 'Calls Page' }
  ];
  
  let allPagesIntegrated = true;
  
  pages.forEach(page => {
    if (!checkFileExists(page.path)) {
      console.log(`❌ ${page.name} not found`);
      allPagesIntegrated = false;
      return;
    }
    
    const content = fs.readFileSync(page.path, 'utf8');
    
    // Check for mock data integration
    if (!content.includes('useMock') && !content.includes('mockData')) {
      console.log(`⚠️  ${page.name} may not have mock data integration`);
    } else {
      console.log(`✅ ${page.name} has mock data integration`);
    }
  });
  
  return allPagesIntegrated;
}

function checkEnvironmentSetup() {
  console.log('🔍 Checking Environment Setup...');
  
  const envPath = '.env';
  if (!checkFileExists(envPath)) {
    console.log('⚠️  No .env file found - mock data will use default settings');
    return true;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  
  if (content.includes('EXPO_PUBLIC_USE_MOCK_DATA=true')) {
    console.log('✅ Mock data is enabled in environment');
  } else if (content.includes('EXPO_PUBLIC_USE_MOCK_DATA=false')) {
    console.log('ℹ️  Mock data is disabled in environment');
  } else {
    console.log('ℹ️  Mock data setting not found in environment (will use default)');
  }
  
  return true;
}

function generateMockDataSummary() {
  console.log(`
📊 Mock Data Summary:

🧪 What's Available:
  • 16 realistic users with avatars and status
  • 10 chat conversations with recent messages
  • 8 group chats with member lists
  • 8 call history entries (voice/video, incoming/outgoing/missed)
  • 8 social updates with images/videos and captions
  • 22 contacts (IraChat users + regular contacts)
  • 5 notifications of various types
  • 20+ messages per chat conversation

🎯 Testing Coverage:
  • Chat lists and individual conversations
  • Group management and member interactions
  • Social media feed with likes/comments
  • Call history and contact discovery
  • Search functionality across all data types
  • Notification handling
  • Media sharing and viewing

⚡ Key Features:
  • Additive approach - doesn't replace live data
  • Realistic timestamps and user interactions
  • Proper data relationships (users, chats, messages)
  • Visual indicator when mock data is active
  • Easy enable/disable via environment variable

🔧 Usage:
  • Enable: node enable-mock-data.js enable
  • Disable: node enable-mock-data.js disable
  • Status: node enable-mock-data.js status
`);
}

function runTests() {
  console.log('🧪 Testing IraChat Mock Data Implementation\n');
  
  const tests = [
    checkMockDataService,
    checkMockDataHook,
    checkMockDataIndicator,
    checkPageIntegrations,
    checkEnvironmentSetup
  ];
  
  let allTestsPassed = true;
  
  tests.forEach(test => {
    try {
      const result = test();
      if (!result) {
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      allTestsPassed = false;
    }
    console.log(''); // Add spacing
  });
  
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Mock data system is ready.');
    generateMockDataSummary();
  } else {
    console.log('❌ Some tests failed. Please check the issues above.');
  }
  
  return allTestsPassed;
}

// Run the tests
if (require.main === module) {
  runTests();
}
