# 🧪 IraChat Mock Data System

## Overview

The IraChat Mock Data System provides realistic test data for all app features without replacing live functionality. It's designed to be **additive** - mock data appears alongside real data to help test and demonstrate the app's capabilities.

## 🎯 Purpose

- **Testing**: Verify all features work correctly with realistic data
- **Demonstration**: Show app capabilities without requiring real users
- **Development**: Speed up development by having immediate data available
- **Quality Assurance**: Ensure UI handles various data scenarios

## 📊 Available Mock Data

### 👥 Users (16 realistic profiles)
- Names, phone numbers, avatars
- Online status and last seen timestamps
- Bio descriptions and status messages
- Profile pictures from avatar service

### 💬 Chats (10 conversations)
- Individual conversations with recent messages
- Unread message counts
- Pinned and muted chat states
- Realistic message timestamps

### 👥 Groups (8 group chats)
- Group names, descriptions, and avatars
- Member lists with admin roles
- Activity percentages and last activity
- Public/private group settings

### 📞 Calls (8 call history entries)
- Voice and video calls
- Incoming, outgoing, and missed calls
- Call durations and timestamps
- Group call support

### 📱 Updates (8 social updates)
- Images and videos with captions
- Like, comment, and view counts
- User interactions and timestamps
- Media from placeholder services

### 📋 Contacts (22 contacts)
- IraChat users and regular contacts
- Phone numbers and avatars
- Online status for IraChat users
- Blocked contact states

### 🔔 Notifications (5 notifications)
- Message, call, group, and system notifications
- Read/unread states
- Action data for navigation
- Realistic timestamps

### 💬 Messages (20+ per chat)
- Text, image, audio, and video messages
- Message reactions and replies
- Read receipts and timestamps
- Sender information

## 🚀 Quick Start

### Enable Mock Data
```bash
# Enable mock data for testing
node enable-mock-data.js enable

# Restart your Expo server
npx expo start
```

### Disable Mock Data
```bash
# Disable mock data (live data only)
node enable-mock-data.js disable

# Restart your Expo server
npx expo start
```

### Check Status
```bash
# Check current mock data status
node enable-mock-data.js status
```

## 🔧 Technical Implementation

### Core Components

1. **MockDataService** (`src/services/mockDataService.ts`)
   - Generates and manages all mock data
   - Singleton pattern for consistent data
   - Realistic data relationships

2. **useMockData Hook** (`src/hooks/useMockData.ts`)
   - React hook for easy data access
   - Loading states and error handling
   - Specific hooks for each data type

3. **MockDataIndicator** (`src/components/MockDataIndicator.tsx`)
   - Visual indicator when mock data is active
   - Toggle functionality for testing
   - Information modal with details

### Page Integration

Mock data is integrated into all main pages:

- **Chats Page**: Shows mock conversations alongside real chats
- **Groups Page**: Displays mock groups with real groups
- **Updates Page**: Includes mock social updates with live updates
- **Calls Page**: Shows mock call history with real call logs

### Environment Control

Mock data can be controlled via environment variable:

```env
# Enable mock data
EXPO_PUBLIC_USE_MOCK_DATA=true

# Disable mock data
EXPO_PUBLIC_USE_MOCK_DATA=false
```

## 🎨 Visual Indicators

When mock data is active, you'll see:

- 🧪 **Green indicator** at bottom of screens showing "Mock Data Active"
- **Info button** to view mock data details
- **Toggle button** to enable/disable mock data
- **Loading states** during mock data generation

## 🧪 Testing Features

### What You Can Test

1. **Chat Functionality**
   - Message lists with various message types
   - Search across conversations
   - Unread message handling
   - Pinned and archived chats

2. **Group Management**
   - Group member lists
   - Admin permissions
   - Group activity tracking
   - Search and filtering

3. **Social Updates**
   - Vertical scrolling feed
   - Like and comment interactions
   - Media viewing and sharing
   - User profile navigation

4. **Call Features**
   - Call history display
   - Different call types and states
   - Contact integration
   - Call initiation flows

5. **Search Functionality**
   - Global search across all data types
   - Real-time search results
   - Contact and user discovery
   - Message content search

6. **Notifications**
   - Various notification types
   - Read/unread states
   - Action handling
   - Timestamp formatting

## 🔍 Verification

Run the test script to verify everything is working:

```bash
node test-mock-data.js
```

This will check:
- ✅ Mock data service configuration
- ✅ React hook implementation
- ✅ Component integration
- ✅ Page integrations
- ✅ Environment setup

## 🎯 Best Practices

### For Developers

1. **Always use hooks** - Use `useMockData` hooks instead of direct service access
2. **Check availability** - Always check `shouldUseMockData` before using mock data
3. **Additive approach** - Combine mock data with live data, don't replace
4. **Loading states** - Handle loading states for realistic testing
5. **Type safety** - Use proper TypeScript types for all mock data

### For Testing

1. **Enable during development** - Keep mock data enabled while building features
2. **Test both states** - Test with and without mock data
3. **Verify interactions** - Ensure all user interactions work with mock data
4. **Check edge cases** - Use mock data to test various scenarios
5. **Performance testing** - Verify app performance with large mock datasets

## 🚨 Important Notes

- **Mock data is additive** - It doesn't replace live functionality
- **Development only** - Mock data is primarily for development and testing
- **Restart required** - Changes to mock data settings require app restart
- **No persistence** - Mock data is regenerated on each app launch
- **Safe for production** - Mock data is automatically disabled in production builds

## 🆘 Troubleshooting

### Mock Data Not Showing
1. Check environment variable: `EXPO_PUBLIC_USE_MOCK_DATA=true`
2. Restart Expo development server
3. Clear app cache and reload
4. Check console for mock data loading messages

### Performance Issues
1. Mock data generates realistic amounts of data
2. Use pagination for large lists
3. Implement proper loading states
4. Consider reducing mock data size if needed

### Integration Issues
1. Ensure proper TypeScript types
2. Check hook usage in components
3. Verify data format compatibility
4. Run test script to identify issues

## 📈 Future Enhancements

- **Custom mock data** - Allow users to define custom mock scenarios
- **Data persistence** - Option to persist mock data across sessions
- **Advanced scenarios** - More complex user interaction patterns
- **Performance metrics** - Track app performance with mock data
- **Export functionality** - Export mock data for external testing

---

**Happy Testing! 🎉**

The mock data system makes IraChat development and testing much more efficient by providing realistic data for all features while preserving live functionality.
