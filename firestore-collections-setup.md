# 🔧 COMPLETE FIRESTORE COLLECTIONS SETUP GUIDE

## **REQUIRED COLLECTIONS FOR IRACHAT**

Your IraChat app needs these 6 core collections in Firestore:

### **1. USERS COLLECTION**
```
Collection ID: users
Purpose: Store user profiles and authentication data
```

**Sample Document:**
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "phoneNumber": "+1234567890",
  "isOnline": true,
  "lastSeen": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T09:00:00Z",
  "avatar": "https://via.placeholder.com/150/87CEEB/FFFFFF?text=J"
}
```

### **2. CONTACTS COLLECTION**
```
Collection ID: contacts
Purpose: Store user's phone contacts and IraChat registration status
```

**Sample Document:**
```json
{
  "userId": "user123",
  "phoneNumber": "+1234567890",
  "displayName": "Alice Johnson",
  "isIraChatUser": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "avatar": "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A"
}
```

### **3. CHATS COLLECTION**
```
Collection ID: chats
Purpose: Store chat conversations and metadata
```

**Sample Document:**
```json
{
  "participants": ["user123", "user456"],
  "name": "Chat with Alice",
  "isGroup": false,
  "lastMessage": "Hello! How are you?",
  "lastMessageAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T09:00:00Z"
}
```

### **4. MESSAGES COLLECTION**
```
Collection ID: messages
Purpose: Store individual chat messages
```

**Sample Document:**
```json
{
  "chatId": "chat123",
  "senderId": "user123",
  "text": "Hello! How are you?",
  "type": "text",
  "timestamp": "2024-01-15T10:30:00Z",
  "readBy": ["user123"]
}
```

### **5. GROUPS COLLECTION**
```
Collection ID: groups
Purpose: Store group chat information and settings
```

**Sample Document:**
```json
{
  "name": "Family Group",
  "participants": ["user123", "user456", "user789"],
  "admins": ["user123"],
  "createdAt": "2024-01-15T09:00:00Z",
  "maxMembers": 1024
}
```

### **6. MEDIA COLLECTION**
```
Collection ID: media
Purpose: Store photos, videos, and voice messages
```

**Sample Document:**
```json
{
  "type": "image",
  "url": "https://storage.googleapis.com/...",
  "uploadedBy": "user123",
  "chatId": "chat123",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

## **🚀 QUICK SETUP METHODS**

### **METHOD 1: USE THE APP (EASIEST)**

1. **Open your IraChat app**
2. **Go to "Find Your Contacts"**
3. **Scroll down to "🔧 Fix Firestore Collections"**
4. **Tap "Create Collections"**
5. **Confirm** → All collections created automatically!

### **METHOD 2: MANUAL CREATION IN FIREBASE CONSOLE**

1. **Go to Firebase Console** → **Firestore Database** → **Data**
2. **For each collection above:**
   - Click "Start collection"
   - Enter Collection ID (e.g., "users")
   - Add sample document with fields above
   - Click "Save"
3. **Repeat for all 6 collections**

### **METHOD 3: IMPORT JSON DATA**

1. **Export this JSON structure** to Firebase:

```json
{
  "users": {
    "user123": {
      "uid": "user123",
      "email": "user@example.com",
      "displayName": "Test User",
      "phoneNumber": "+1234567890",
      "isOnline": true,
      "lastSeen": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  },
  "contacts": {
    "contact1": {
      "userId": "user123",
      "phoneNumber": "+1234567890",
      "displayName": "Alice Johnson",
      "isIraChatUser": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "chats": {
    "chat1": {
      "participants": ["user123", "user456"],
      "name": "Sample Chat",
      "isGroup": false,
      "lastMessage": "Hello!",
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  }
}
```

## **✅ VERIFICATION CHECKLIST**

After creating collections, verify in Firebase Console:

- [ ] **users** collection exists with at least 1 document
- [ ] **contacts** collection exists with sample contacts
- [ ] **chats** collection exists (can be empty initially)
- [ ] **messages** collection exists (can be empty initially)
- [ ] **groups** collection exists (can be empty initially)
- [ ] **media** collection exists (can be empty initially)

## **🔧 TROUBLESHOOTING**

### **If collections don't appear:**
1. **Refresh Firebase Console**
2. **Check Firestore rules** are published
3. **Verify authentication** is working
4. **Try creating manually** in console first

### **If permission errors persist:**
1. **Apply the complete Firestore rules** provided earlier
2. **Wait 2 minutes** for rule propagation
3. **Test with simple rules** temporarily:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **If app still crashes:**
1. **Collections must exist** before app can query them
2. **Use "Create Collections" button** in app
3. **Verify in Firebase Console** that collections appear
4. **Restart app** after creating collections

## **🎯 EXPECTED RESULTS**

After setup:
- ✅ **No permission errors**
- ✅ **Contacts load properly**
- ✅ **App doesn't crash**
- ✅ **All Firebase features work**
- ✅ **Ready for production use**

**Use METHOD 1 (app button) for fastest setup!** 🚀
