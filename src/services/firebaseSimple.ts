// Simple Firebase Configuration - Web SDK for All Platforms
import auth from '@react-native-firebase/auth';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

console.log('🔥 Initializing Firebase services...');
console.log(`📱 Platform detected: ${Platform.OS}`);

// Import configuration from config file
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase App
let app: FirebaseApp;
let authInstance: any;
let db: any;

const initializeFirebase = () => {
    try {
        console.log('Starting Firebase initialization...');
        
        // Initialize Firebase App first
        if (getApps().length === 0) {
            console.log('Initializing new Firebase app...');
            app = initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized:', app.name);
        } else {
            console.log('Retrieving existing Firebase app...');
            app = getApp();
            console.log('✅ Firebase app retrieved:', app.name);
        }

        // Initialize Firestore
        console.log('Initializing Firestore...');
        db = getFirestore(app);
        console.log('✅ Firestore initialized');

        // Initialize Auth
        console.log('Initializing Firebase Auth...');
        try {
            if (Platform.OS === 'web') {
                authInstance = getAuth(app);
                console.log('✅ Web Auth initialized');
            } else {
                // For React Native, use the native Firebase Auth
                authInstance = auth();
                console.log('✅ React Native Auth initialized');
            }
        } catch (authError: any) {
            console.error('Auth initialization error details:', {
                code: authError.code,
                message: authError.message,
                stack: authError.stack
            });

            if (authError.code === 'auth/already-initialized') {
                console.log('⚠️ Auth already initialized, retrieving instance');
                authInstance = Platform.OS === 'web' ? getAuth(app) : auth();
            } else {
                throw authError;
            }
        }

        return { app, auth: authInstance, db };
    } catch (error: any) {
        console.error('❌ Firebase initialization failed:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw new Error(`Firebase initialization failed: ${error.message}`);
    }
};

// Initialize Firebase and export instances
console.log('Starting Firebase service initialization...');
let firebaseApp: FirebaseApp;
let firestore: any;

try {
  const initialized = initializeFirebase();
  firebaseApp = initialized.app;
  authInstance = initialized.auth;
  firestore = initialized.db;
  console.log('✅ Firebase services initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase services:', error);
  // Set fallback values to prevent app crash
  firebaseApp = null as any;
  authInstance = null;
  firestore = null;
}

export { firebaseApp as app, authInstance as auth, firestore as db };

// Initialize Storage
let storage: any;
try {
  if (firebaseApp) {
    storage = getStorage(firebaseApp);
    console.log('✅ Storage initialized');
  } else {
    console.warn('⚠️ Storage not initialized - Firebase app not available');
    storage = null;
  }
} catch (error) {
  console.error('❌ Storage initialization failed:', error);
  storage = null;
}

export { storage };

console.log('🎉 Firebase initialization complete!');
console.log('📊 Status:', {
  platform: Platform.OS,
  app: firebaseApp?.name || 'Unknown',
  firestore: firestore ? 'Ready' : 'Disabled',
  storage: storage ? 'Ready' : 'Disabled',
  auth: authInstance ? 'Ready' : 'Disabled'
});

// Simple auth access functions
export const getAuthInstance = () => {
  // Return the current auth instance (may be null)
  if (!authInstance) {
    console.warn('⚠️ Auth instance is null - Firebase Auth not available');
  }
  return authInstance;
};

export const isAuthReady = () => {
  return authInstance !== null;
};

export const getCurrentUserSafely = () => {
  try {
    return authInstance?.currentUser || null;
  } catch (error: any) {
    console.warn(`⚠️ Auth not ready:`, error.message);
    return null;
  }
};

export const getPlatformInfo = () => {
  return {
    platform: Platform.OS,
    authReady: isAuthReady(),
    persistence: Platform.OS === 'web' ? 'IndexedDB' : 'AsyncStorage',
    appName: firebaseApp?.name || 'Unknown'
  };
};

// Add the missing waitForAuth function
export const waitForAuth = async (timeoutMs: number = 10000): Promise<any> => {
  return new Promise((resolve, reject) => {
    // If auth is already available, return it immediately
    if (authInstance) {
      console.log('✅ Auth instance already available');
      resolve(authInstance);
      return;
    }

    console.log(`⏳ Waiting for auth initialization (timeout: ${timeoutMs}ms)...`);

    // Set up a timeout
    const timeout = setTimeout(() => {
      console.warn(`⚠️ Auth initialization timeout after ${timeoutMs}ms`);
      console.log('🔄 Resolving with null - app will continue with stored auth only');
      resolve(null);
    }, timeoutMs);

    // Check for auth instance periodically
    const checkAuth = () => {
      if (authInstance) {
        clearTimeout(timeout);
        console.log('✅ Auth instance became available');
        resolve(authInstance);
      } else {
        // Just wait for the auth instance to be set, don't try to retrieve it
        // Check again in 100ms
        setTimeout(checkAuth, 100);
      }
    };

    checkAuth();
  });
};

// Auth state change listener for better auth management
let authStateUnsubscribe: (() => void) | null = null;

export const initializeAuthStateListener = () => {
  if (!authInstance) {
    console.warn('⚠️ Cannot initialize auth state listener: auth instance not available');
    return null;
  }

  if (authStateUnsubscribe) {
    console.log('🔄 Auth state listener already initialized');
    return authStateUnsubscribe;
  }

  console.log('🎯 Initializing Firebase auth state listener...');

  authStateUnsubscribe = onAuthStateChanged(authInstance, (user) => {
    if (user) {
      console.log('✅ User signed in:', user.uid);
    } else {
      console.log('👤 User signed out');
    }
  });

  return authStateUnsubscribe;
};

export const cleanupAuthStateListener = () => {
  if (authStateUnsubscribe) {
    authStateUnsubscribe();
    authStateUnsubscribe = null;
    console.log('🧹 Auth state listener cleaned up');
  }
};

// Mock data for individual chats
export const mockChatData = {
  currentUser: {
    id: 'user1',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: null
  },
  chatPartner: {
    id: 'user2',
    name: 'Emma Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isTyping: false
  },
  messages: [
    {
      id: 'msg1',
      senderId: 'user2',
      text: 'Hey! How are you doing? 😊',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'msg2',
      senderId: 'user1',
      text: 'I\'m doing great! Just working on some exciting projects. How about you?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 50 * 60 * 1000)
    },
    {
      id: 'msg3',
      senderId: 'user2',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        caption: 'Check out this amazing sunset! 🌅'
      },
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'msg4',
      senderId: 'user1',
      text: 'Wow! That\'s absolutely beautiful! 😍 Where was this taken?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: 'msg5',
      senderId: 'user2',
      file: {
        type: 'document',
        name: 'Travel_Guide_2024.pdf',
        size: '2.4 MB',
        url: '#',
        caption: 'Here\'s the travel guide I mentioned! 📖'
      },
      timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'msg6',
      senderId: 'user1',
      text: 'Thanks! This will be super helpful for my trip planning! 🎒',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      status: 'seen_replied',
      statusTime: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 'msg7',
      senderId: 'user2',
      media: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
        caption: 'Quick video from my morning hike! 🥾'
      },
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      status: 'seen_not_replied',
      statusTime: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'msg8',
      senderId: 'user1',
      text: 'Just sent you a message! Let me know what you think 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      status: 'delivered',
      statusTime: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: 'msg9',
      senderId: 'user1',
      text: 'This message was just sent!',
      timestamp: new Date(),
      status: 'sent',
      statusTime: new Date()
    }
  ]
};

// Mock chat list data for beautiful chat list display
export const mockChatList = [
  {
    id: 'chat1',
    name: 'Emma Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thanks! This will be super helpful for my trip planning! 🎒',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    unreadCount: 0,
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    isTyping: false,
    messageType: 'text',
    isGroup: false,
    participants: ['user1', 'user2']
  },
  {
    id: 'chat2',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Hey! Are we still on for the meeting tomorrow? 📅',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 3,
    isOnline: true,
    lastSeen: null,
    isTyping: false,
    messageType: 'text',
    isGroup: false,
    participants: ['user1', 'user3']
  },
  {
    id: 'chat3',
    name: 'Family Group',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=100&h=100&fit=crop',
    lastMessage: 'Mom: Don\'t forget about dinner this Sunday! 🍽️',
    lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    unreadCount: 7,
    isOnline: false,
    lastSeen: null,
    isTyping: false,
    messageType: 'text',
    isGroup: true,
    participants: ['user1', 'user4', 'user5', 'user6']
  },
  {
    id: 'chat4',
    name: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    lastMessage: '📸 Photo',
    lastMessageTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    unreadCount: 1,
    isOnline: true,
    lastSeen: null,
    isTyping: true,
    messageType: 'image',
    isGroup: false,
    participants: ['user1', 'user7']
  },
  {
    id: 'chat5',
    name: 'Work Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
    lastMessage: 'David: The project deadline has been moved to next Friday 📋',
    lastMessageTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    unreadCount: 12,
    isOnline: false,
    lastSeen: null,
    isTyping: false,
    messageType: 'text',
    isGroup: true,
    participants: ['user1', 'user8', 'user9', 'user10', 'user11']
  },
  {
    id: 'chat6',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastMessage: '🎵 Audio message',
    lastMessageTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    unreadCount: 0,
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isTyping: false,
    messageType: 'audio',
    isGroup: false,
    participants: ['user1', 'user12']
  },
  {
    id: 'chat7',
    name: 'Lisa Davis',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Perfect! See you at 3 PM ⏰',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 0,
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    isTyping: false,
    messageType: 'text',
    isGroup: false,
    participants: ['user1', 'user13']
  },
  {
    id: 'chat8',
    name: 'College Friends',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&h=100&fit=crop',
    lastMessage: 'Jennifer: Can\'t wait for the reunion! 🎉',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    unreadCount: 5,
    isOnline: false,
    lastSeen: null,
    isTyping: false,
    messageType: 'text',
    isGroup: true,
    participants: ['user1', 'user14', 'user15', 'user16', 'user17', 'user18']
  },
  {
    id: 'chat9',
    name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: '📄 Document: Project_Proposal.pdf',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unreadCount: 0,
    isOnline: true,
    lastSeen: null,
    isTyping: false,
    messageType: 'document',
    isGroup: false,
    participants: ['user1', 'user19']
  },
  {
    id: 'chat10',
    name: 'Jennifer Garcia',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thanks for the help! Really appreciate it 🙏',
    lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    unreadCount: 0,
    isOnline: false,
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isTyping: false,
    messageType: 'text',
    isGroup: false,
    participants: ['user1', 'user20']
  }
];
