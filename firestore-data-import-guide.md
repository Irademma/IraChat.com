# 🔥 FIRESTORE SAMPLE DATA IMPORT GUIDE

## **📋 COMPLETE REALISTIC DATA FOR IRACHAT**

This guide provides **realistic sample data** for all Firestore collections based on your IraChat rules. This data will help you:

- ✅ **Test all app features** with realistic content
- ✅ **Understand data structure** for each collection
- ✅ **Debug permission issues** with proper data
- ✅ **Demo the app** with meaningful content

## **🎯 COLLECTIONS INCLUDED:**

### **👥 USER MANAGEMENT**
- **`users`** - User profiles with phone numbers, avatars, status
- **`contacts`** - Phone contacts with IraChat registration status
- **`onlineStatus`** - Real-time online/offline status
- **`lastSeen`** - Last seen timestamps and visibility
- **`phoneVerification`** - Phone number verification records

### **💬 MESSAGING**
- **`chats`** - Individual and group chat metadata
- **`chats/{chatId}/messages`** - Actual chat messages
- **`groups`** - Group chat settings and participants
- **`reactions`** - Message reactions (emojis)
- **`messageStatus`** - Message delivery and read status

### **📱 MEDIA & FILES**
- **`media`** - Photos, videos with metadata
- **`voiceMessages`** - Voice notes with waveforms
- **`documents`** - File uploads (PDFs, docs)
- **`sharedContent`** - Shared media with expiration

### **📺 UPDATES (TikTok-STYLE)**
- **`updates`** - Video/photo updates with engagement
- **`updateViews`** - View tracking for updates
- **`updateLikes`** - Like tracking for updates
- **`engagementMetrics`** - Detailed analytics

### **📞 CALLING**
- **`callLogs`** - Call history with duration/quality
- **`activeCalls`** - Real-time call management

### **🔔 NOTIFICATIONS & SETTINGS**
- **`notifications`** - Push notifications
- **`users/{userId}/settings/preferences`** - User preferences
- **`users/{userId}/blockedUsers`** - Blocked contacts
- **`users/{userId}/archivedChats`** - Archived conversations
- **`users/{userId}/mutedChats`** - Muted chats
- **`users/{userId}/starredMessages`** - Starred messages

### **🔒 SECURITY & PRIVACY**
- **`encryptionKeys`** - End-to-end encryption keys
- **`users/{userId}/chatLocks`** - Chat security locks
- **`userSessions`** - Device sessions and login tracking

### **🔍 SEARCH & NAVIGATION**
- **`users/{userId}/searchHistory`** - Search queries
- **`navigationState`** - App navigation state
- **`typing/{chatId}/users`** - Typing indicators

### **💾 BACKUP & EXPORT**
- **`downloads`** - Download tracking
- **`chatExports`** - Chat export records
- **`backups`** - User backup information

## **🚀 HOW TO IMPORT THIS DATA:**

### **METHOD 1: FIREBASE CONSOLE (MANUAL)**

1. **Go to Firebase Console** → **Firestore Database** → **Data**
2. **For each collection:**
   - Click "Start collection" or "Add collection"
   - Enter collection name (e.g., "users")
   - Add documents with the provided data
   - Use "Auto-ID" for document IDs or use the provided IDs

### **METHOD 2: FIREBASE CLI (BULK IMPORT)**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Import data (if you have the Firebase CLI tools)
firebase firestore:import firestore-sample-data.json
```

### **METHOD 3: USE YOUR APP'S COLLECTION CREATOR**

1. **Open your IraChat app**
2. **Go to "Find Your Contacts"**
3. **Tap "Create Collections"**
4. **This creates basic structure** - then manually add more data

## **📝 SAMPLE USER ACCOUNTS:**

### **User 1: Alice Johnson**
- **Phone**: +1234567890
- **UID**: user123
- **Status**: Available, Online
- **Role**: Regular user, Group admin

### **User 2: Bob Smith**
- **Phone**: +1234567891
- **UID**: user456
- **Status**: Busy, Offline
- **Role**: Regular user

### **User 3: Charlie Brown**
- **Phone**: +1234567892
- **UID**: user789
- **Status**: Available, Online
- **Role**: Regular user

## **💬 SAMPLE CONVERSATIONS:**

### **Chat 1: Alice & Bob (chat001)**
- 3 messages exchanged
- 1 image shared
- 1 voice message
- Message reactions
- Read receipts

### **Group 1: Family Group (group001)**
- 3 participants
- Alice is admin
- Group settings configured
- Unread message counts

## **📱 SAMPLE UPDATES:**

### **Update 1: Alice's Video**
- Sunset video (15 seconds)
- 25 views, 8 likes, 3 comments
- Location tagged

### **Update 2: Bob's Photo**
- Coffee photo
- 12 views, 5 likes, 1 comment

## **🔧 TESTING SCENARIOS:**

### **Authentication Testing:**
- Use phone numbers: +1234567890, +1234567891, +1234567892
- All are verified and ready to use

### **Chat Testing:**
- Send messages between users
- Test reactions, replies, media sharing
- Test group chat features

### **Updates Testing:**
- View updates feed
- Like and comment on updates
- Test engagement metrics

### **Calling Testing:**
- Test voice/video calls between users
- Check call logs and history

## **🎯 IMPORTANT NOTES:**

### **USER IDS:**
- Replace `user123`, `user456`, `user789` with actual Firebase Auth UIDs
- Use your real phone number for testing

### **TIMESTAMPS:**
- All timestamps are in ISO 8601 format
- Update to current dates for realistic testing

### **URLS:**
- Replace example.com URLs with real Firebase Storage URLs
- Upload actual media files for testing

### **PHONE NUMBERS:**
- Use real phone numbers for SMS verification testing
- Ensure phone numbers match your contacts

## **✅ VERIFICATION CHECKLIST:**

After importing data, verify:

- [ ] **Users collection** has 3 user documents
- [ ] **Chats collection** has 2 chat documents
- [ ] **Messages subcollection** has sample messages
- [ ] **Contacts collection** has contact mappings
- [ ] **Updates collection** has sample updates
- [ ] **All permissions work** with your Firestore rules
- [ ] **App loads data** without errors
- [ ] **Real-time updates** work properly

## **🚨 TROUBLESHOOTING:**

### **Permission Denied Errors:**
- Ensure Firestore rules are published
- Check user authentication status
- Verify document ownership matches rules

### **Missing Collections:**
- Create collections manually in Firebase Console
- Ensure collection names match exactly
- Check subcollection paths are correct

### **Data Not Appearing:**
- Refresh your app
- Check console logs for errors
- Verify network connectivity

**This realistic data will make your IraChat app feel alive and ready for production testing!** 🚀
