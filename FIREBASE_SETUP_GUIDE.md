# 🔥 Firebase Setup Guide for IraChat

This guide will help you properly configure Firebase for your IraChat application.

## 📋 Prerequisites

1. **Firebase Account**: Create a free account at [firebase.google.com](https://firebase.google.com)
2. **Node.js**: Ensure you have Node.js installed
3. **Expo CLI**: Install with `npm install -g @expo/cli`

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `irachat-[your-name]`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable these providers:
   - ✅ **Email/Password**
   - ✅ **Phone** (for phone number verification)
   - ✅ **Google** (optional)
   - ✅ **Anonymous** (for guest users)

#### Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click "Done"

#### Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose **Start in test mode**
4. Select same location as Firestore
5. Click "Done"

#### Cloud Messaging (Optional)

1. Go to **Cloud Messaging**
2. Click "Get started"
3. This enables push notifications

### 3. Add Web App to Firebase Project

1. In Firebase Console, click the **Web icon** (`</>`)
2. Enter app nickname: `IraChat Web`
3. ✅ Check "Also set up Firebase Hosting"
4. Click "Register app"
5. **Copy the configuration object** - you'll need this!

### 4. Configure Your App

#### Update .env File

Your `.env` file should already be created with your configuration. Verify it matches your Firebase config:

```env
# Firebase Configuration for IraChat
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Test Firebase Connection

Run the Firebase test page to verify everything is working:

```bash
# Start your development server
npm start

# Navigate to the Firebase test page in your app
# Go to: /firebase-test
```

### 5. Set Up Firestore Security Rules

Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat rules
    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    // Message rules
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }

    // Test messages (for development only - remove in production)
    match /test_messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Set Up Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /profile_images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat media
    match /chat_media/{chatId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Voice messages
    match /voice_messages/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing Your Setup

### 1. Run Firebase Tests

1. Start your app: `npm start`
2. Navigate to `/firebase-test` in your app
3. Run all tests to verify:
   - ✅ Configuration is valid
   - ✅ Authentication works
   - ✅ Firestore read/write works
   - ✅ Storage is accessible

### 2. Test Core Features

1. **Registration**: Create a new account
2. **Login**: Sign in with your account
3. **Profile**: Update your profile information
4. **Chats**: Create a new chat
5. **Messages**: Send a test message

## 🔧 Troubleshooting

### Common Issues

#### "Firebase not initialized"

- Check your `.env` file has all required variables
- Restart your development server
- Verify Firebase config in console

#### "Permission denied" errors

- Update Firestore security rules
- Ensure user is authenticated
- Check user permissions in Firebase Console

#### "Network request failed"

- Check internet connection
- Verify Firebase project is active
- Check Firebase service status

#### Authentication issues

- Enable Email/Password in Firebase Console
- Check authentication configuration
- Verify domain is authorized

### Debug Steps

1. **Check Firebase Console**:

   - Go to your Firebase project
   - Check Authentication → Users
   - Check Firestore → Data
   - Check Storage → Files

2. **Check App Logs**:

   ```bash
   # View logs in development
   npx expo start --clear
   ```

3. **Test Individual Services**:
   - Use the Firebase test page (`/firebase-test`)
   - Test each service individually
   - Check error messages in console

## 📱 Production Deployment

### 1. Update Security Rules

- Remove test collections
- Restrict permissions
- Add proper validation

### 2. Environment Variables

- Set production Firebase config
- Use environment-specific projects
- Secure API keys

### 3. Performance Optimization

- Enable offline persistence
- Set up proper indexing
- Configure caching

## 🎯 Next Steps

After Firebase is configured:

1. ✅ **Test all features** using the Firebase test page
2. ✅ **Create test accounts** and verify functionality
3. ✅ **Test on different devices** to ensure responsiveness
4. ✅ **Set up production environment** when ready to deploy

## 📞 Support

If you encounter issues:

1. Check the Firebase test page (`/firebase-test`)
2. Review Firebase Console for errors
3. Check the troubleshooting section above
4. Verify all environment variables are set correctly

Your Firebase setup should now be complete and ready for development! 🎉
