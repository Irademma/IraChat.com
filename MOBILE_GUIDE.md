# 📱 IraChat Mobile Development Guide

## 🚀 Quick Start

### For Android:
```bash
npm run android
# or
npm run dev:android
```

### For iOS:
```bash
npm run ios
# or  
npm run dev:ios
```

### For Both Platforms:
```bash
npm start
# Then scan QR code with Expo Go app
```

## 📋 Prerequisites

### Android Development:
1. **Android Studio** - Download from developer.android.com
2. **Android SDK** - Install via Android Studio
3. **Java Development Kit (JDK)** - Version 11 or higher
4. **Set Environment Variables:**
   - ANDROID_HOME: Path to Android SDK
   - Add platform-tools to PATH

### iOS Development (macOS only):
1. **Xcode** - Download from App Store
2. **Xcode Command Line Tools**
3. **iOS Simulator** - Included with Xcode
4. **CocoaPods** - `sudo gem install cocoapods`

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Android (Windows/Mac/Linux)
```bash
# Install Android Studio
# Set ANDROID_HOME environment variable
# Add platform-tools to PATH
```

### 3. Setup iOS (macOS only)
```bash
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios && pod install && cd ..
```

### 4. Start Development
```bash
# Start Metro bundler
npm start

# Or run directly on device/emulator
npm run android  # For Android
npm run ios      # For iOS
```

## 📱 Testing on Physical Devices

### Using Expo Go (Easiest):
1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code with Expo Go

### Using Development Build:
1. Run `npm run dev:android` or `npm run dev:ios`
2. Install development build on device
3. Better performance and native features

## 🎯 Features Optimized for Mobile:

- ✅ **Native Navigation** - Smooth transitions
- ✅ **Camera Integration** - Photo/video capture
- ✅ **Media Library** - Access device photos
- ✅ **Push Notifications** - Real-time alerts
- ✅ **Voice Messages** - Audio recording
- ✅ **Haptic Feedback** - Touch responses
- ✅ **Offline Support** - Works without internet
- ✅ **Background Sync** - Updates when app closed

## 🚀 Build for Production

### Android APK:
```bash
npm run build:android
```

### iOS IPA:
```bash
npm run build:ios
```

## 📊 Performance Tips

1. **Use Development Build** for better performance
2. **Enable Hermes** for faster JavaScript execution
3. **Optimize Images** - Use appropriate sizes
4. **Lazy Load** - Load components when needed
5. **Cache Data** - Reduce network requests

## 🐛 Troubleshooting

### Android Issues:
- **SDK not found**: Set ANDROID_HOME correctly
- **Build fails**: Clear cache with `npx expo start --clear`
- **Device not detected**: Enable USB debugging

### iOS Issues:
- **Build fails**: Run `pod install` in ios directory
- **Simulator not starting**: Restart Xcode
- **Certificate issues**: Check Apple Developer account

## 📞 Support

For issues specific to IraChat mobile development:
1. Check this guide first
2. Clear cache: `npx expo start --clear`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check Expo documentation: docs.expo.dev

---

**🎉 Happy Mobile Development with IraChat!**