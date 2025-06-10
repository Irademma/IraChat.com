# IraChat - React Native Messaging App 💬

A fully functional, modern React Native messaging application built with Expo, Firebase, and NativeWind (Tailwind CSS).

## ✨ Features

### 🔐 Authentication
- **Email/Password Registration & Login**
- **Secure Firebase Authentication**
- **Automatic session management**
- **User profile creation**

### 💬 Messaging
- **Real-time messaging** with Firebase Firestore
- **Individual and group chats**
- **Message timestamps** with smart formatting
- **Typing indicators** and online status
- **Message history** with infinite scroll

### 🎨 Modern UI/UX
- **Beautiful, responsive design** with NativeWind/Tailwind CSS
- **Tab navigation** with custom icons
- **Smooth animations** and transitions
- **Dark/Light theme support**
- **Cross-platform compatibility** (iOS, Android, Web)

### 📱 Navigation
- **Bottom tab navigation** for main screens
- **Stack navigation** for chat flows
- **Deep linking** support
- **Proper authentication flow**

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IraChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update `app/services/firebase.ts` with your Firebase config

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR code with Expo Go app

## 📁 Project Structure

```
IraChat/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   ├── EmptyState.tsx  # Empty state component
│   │   └── LoadingSpinner.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── redux/              # State management
│   │   ├── store.ts
│   │   ├── userSlice.ts
│   │   └── chatSlice.ts
│   ├── screens/            # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ChatsListScreen.tsx
│   │   ├── ChatRoomScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── NewChatScreen.tsx
│   │   └── CreateGroupScreen.tsx
│   ├── services/           # External services
│   │   └── firebase.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── dateUtils.ts
│   └── constants/          # App constants
├── assets/                 # Images, fonts, etc.
│   └── images/            # App icons and images
├── global.css             # Global styles
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation v7
- **State Management**: Redux Toolkit
- **Backend**: Firebase (Auth + Firestore)
- **Icons**: Custom PNG assets + Expo Vector Icons

## 🔧 Configuration

### Firebase Configuration
Update `app/services/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📱 App Screens

1. **Authentication Flow**
   - Login Screen
   - Registration Screen

2. **Main App (Tab Navigation)**
   - Chats List
   - Profile
   - Settings

3. **Chat Flow**
   - Chat Room
   - New Chat
   - Create Group

## 🎨 Design System

The app uses a consistent design system with:
- **Primary Color**: Blue (#3B82F6)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Components**: Reusable, accessible components

## 🚀 Deployment

### Building for Production

1. **Configure app.json**
   ```json
   {
     "expo": {
       "name": "IraChat",
       "slug": "irachat",
       "version": "1.0.0",
       "icon": "./assets/images/icon.png"
     }
   }
   ```

2. **Build for Android**
   ```bash
   expo build:android
   ```

3. **Build for iOS**
   ```bash
   expo build:ios
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact: support@irachat.com

---

Built with ❤️ using React Native and Firebase
