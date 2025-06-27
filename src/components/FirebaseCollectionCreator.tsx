import { Ionicons } from '@expo/vector-icons';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../services/firebase';

interface CollectionCreatorProps {
  visible?: boolean;
  onClose?: () => void;
}

const FirebaseCollectionCreator: React.FC<CollectionCreatorProps> = ({
  visible = true,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [createdCollections, setCreatedCollections] = useState<string[]>([]);

  // Essential collections for IraChat
  const collectionsToCreate = [
    {
      name: 'users',
      description: 'User profiles and authentication data',
      sampleData: {
        displayName: 'Sample User',
        email: 'user@example.com',
        avatar: '',
        status: 'I use IraChat',
        isOnline: false,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      },
    },
    {
      name: 'chats',
      description: 'Chat conversations between users',
      sampleData: {
        participants: [auth?.currentUser?.uid || 'user1', 'user2'],
        lastMessage: 'Hello!',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        type: 'individual',
      },
    },
    {
      name: 'groups',
      description: 'Group chat information',
      sampleData: {
        name: 'Sample Group',
        description: 'A sample group chat',
        members: [auth?.currentUser?.uid || 'user1'],
        admins: [auth?.currentUser?.uid || 'user1'],
        createdBy: auth?.currentUser?.uid || 'user1',
        createdAt: serverTimestamp(),
        avatar: '',
      },
    },
    {
      name: 'updates',
      description: 'TikTok-style social updates',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        mediaUrl: '',
        mediaType: 'image',
        caption: 'Sample update',
        likes: [],
        views: [],
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    },
    {
      name: 'calls',
      description: 'Voice and video call records',
      sampleData: {
        callerId: auth?.currentUser?.uid || 'user1',
        receiverId: 'user2',
        type: 'voice',
        status: 'completed',
        duration: 120,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
      },
    },
    {
      name: 'notifications',
      description: 'Push notifications for users',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        title: 'New Message',
        body: 'You have a new message',
        type: 'message',
        read: false,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'media',
      description: 'Uploaded media files',
      sampleData: {
        uploadedBy: auth?.currentUser?.uid || 'user1',
        url: '',
        type: 'image',
        size: 1024,
        filename: 'sample.jpg',
        uploadedAt: serverTimestamp(),
      },
    },
    {
      name: 'onlineStatus',
      description: 'User online/offline status',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        isOnline: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    },
    // ========================================
    // MESSAGING EXTENDED COLLECTIONS
    // ========================================
    {
      name: 'messageReactions',
      description: 'Reactions to messages (likes, hearts, etc.)',
      sampleData: {
        messageId: 'sample-message-id',
        userId: auth?.currentUser?.uid || 'user1',
        reaction: '❤️',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'messageReplies',
      description: 'Replies to specific messages',
      sampleData: {
        originalMessageId: 'sample-message-id',
        replyText: 'Sample reply',
        senderId: auth?.currentUser?.uid || 'user1',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'messageForwards',
      description: 'Forwarded messages tracking',
      sampleData: {
        originalMessageId: 'sample-message-id',
        forwardedBy: auth?.currentUser?.uid || 'user1',
        forwardedTo: 'user2',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'messageEdits',
      description: 'Message edit history',
      sampleData: {
        messageId: 'sample-message-id',
        originalText: 'Original message',
        editedText: 'Edited message',
        editedBy: auth?.currentUser?.uid || 'user1',
        editedAt: serverTimestamp(),
      },
    },
    {
      name: 'voiceMessages',
      description: 'Voice message metadata',
      sampleData: {
        senderId: auth?.currentUser?.uid || 'user1',
        audioUrl: '',
        duration: 30,
        waveform: [],
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'typing',
      description: 'Real-time typing indicators',
      sampleData: {
        chatId: 'sample-chat-id',
        userId: auth?.currentUser?.uid || 'user1',
        isTyping: true,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'archivedChats',
      description: 'User archived chat preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        archivedAt: serverTimestamp(),
      },
    },
    {
      name: 'pinnedChats',
      description: 'User pinned chat preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        pinnedAt: serverTimestamp(),
      },
    },
    {
      name: 'starredMessages',
      description: 'User starred messages',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        messageId: 'sample-message-id',
        starredAt: serverTimestamp(),
      },
    },
    // ========================================
    // SOCIAL FEATURES COLLECTIONS
    // ========================================
    {
      name: 'updateViews',
      description: 'Track who viewed updates',
      sampleData: {
        updateId: 'sample-update-id',
        viewerId: auth?.currentUser?.uid || 'user1',
        viewedAt: serverTimestamp(),
      },
    },
    {
      name: 'updateLikes',
      description: 'Track who liked updates',
      sampleData: {
        updateId: 'sample-update-id',
        userId: auth?.currentUser?.uid || 'user1',
        likedAt: serverTimestamp(),
      },
    },
    {
      name: 'updateComments',
      description: 'Comments on updates',
      sampleData: {
        updateId: 'sample-update-id',
        userId: auth?.currentUser?.uid || 'user1',
        comment: 'Great update!',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'stories',
      description: '24-hour story posts',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        mediaUrl: '',
        mediaType: 'image',
        caption: 'My story',
        views: [],
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    },
    {
      name: 'storyViews',
      description: 'Track who viewed stories',
      sampleData: {
        storyId: 'sample-story-id',
        viewerId: auth?.currentUser?.uid || 'user1',
        viewedAt: serverTimestamp(),
      },
    },
    {
      name: 'statusUpdates',
      description: 'User status messages',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        status: 'I use IraChat',
        emoji: '😊',
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'channels',
      description: 'Broadcast channels',
      sampleData: {
        name: 'Sample Channel',
        description: 'A sample broadcast channel',
        createdBy: auth?.currentUser?.uid || 'user1',
        subscribers: [],
        isPublic: true,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'channelSubscriptions',
      description: 'User channel subscriptions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        channelId: 'sample-channel-id',
        subscribedAt: serverTimestamp(),
      },
    },
    // ========================================
    // CALLING SYSTEM COLLECTIONS
    // ========================================
    {
      name: 'callLogs',
      description: 'Detailed call history',
      sampleData: {
        callerId: auth?.currentUser?.uid || 'user1',
        receiverId: 'user2',
        type: 'video',
        status: 'completed',
        duration: 300,
        quality: 'HD',
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
      },
    },
    {
      name: 'activeCalls',
      description: 'Currently active calls',
      sampleData: {
        callId: 'sample-call-id',
        participants: [auth?.currentUser?.uid || 'user1', 'user2'],
        type: 'group',
        status: 'ongoing',
        startedAt: serverTimestamp(),
      },
    },
    {
      name: 'groupCalls',
      description: 'Group video/voice calls',
      sampleData: {
        groupId: 'sample-group-id',
        initiatedBy: auth?.currentUser?.uid || 'user1',
        participants: [],
        type: 'video',
        status: 'active',
        startedAt: serverTimestamp(),
      },
    },
    {
      name: 'videoCalls',
      description: 'Video call specific data',
      sampleData: {
        callId: 'sample-call-id',
        resolution: '1080p',
        bandwidth: 'high',
        screenSharing: false,
        recordingEnabled: false,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'voiceCalls',
      description: 'Voice call specific data',
      sampleData: {
        callId: 'sample-call-id',
        audioQuality: 'high',
        noiseReduction: true,
        echoCancellation: true,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'callHistory',
      description: 'User call history preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        callId: 'sample-call-id',
        savedAt: serverTimestamp(),
      },
    },
    // ========================================
    // USER MANAGEMENT COLLECTIONS
    // ========================================
    {
      name: 'userProfiles',
      description: 'Extended user profile information',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        bio: 'Hello, I use IraChat!',
        location: 'Uganda',
        website: '',
        birthday: null,
        privacy: {
          showLastSeen: true,
          showOnlineStatus: true,
          allowCalls: true,
        },
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'contacts',
      description: 'User contact lists',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        contactId: 'user2',
        displayName: 'Contact Name',
        phoneNumber: '+256700000000',
        addedAt: serverTimestamp(),
      },
    },
    {
      name: 'blockedUsers',
      description: 'User block lists',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        blockedUserId: 'user2',
        reason: 'spam',
        blockedAt: serverTimestamp(),
      },
    },
    {
      name: 'userAnalytics',
      description: 'User activity analytics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        messagesCount: 100,
        callsCount: 20,
        updatesCount: 15,
        lastActive: serverTimestamp(),
        totalTimeSpent: 3600,
      },
    },
    {
      name: 'appUsage',
      description: 'App usage statistics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        sessionDuration: 1800,
        featuresUsed: ['chat', 'calls', 'updates'],
        screenTime: 3600,
        date: new Date().toISOString().split('T')[0],
      },
    },
    {
      name: 'loginSessions',
      description: 'User login session tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        deviceInfo: 'iPhone 14',
        ipAddress: '192.168.1.1',
        location: 'Kampala, Uganda',
        loginAt: serverTimestamp(),
        isActive: true,
      },
    },
    // ========================================
    // SECURITY & PRIVACY COLLECTIONS
    // ========================================
    {
      name: 'encryptionKeys',
      description: 'End-to-end encryption keys',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        publicKey: 'sample-public-key',
        keyVersion: 1,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    },
    {
      name: 'phoneVerification',
      description: 'Phone number verification records',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        phoneNumber: '+256700000000',
        verificationCode: '123456',
        isVerified: true,
        verifiedAt: serverTimestamp(),
      },
    },
    {
      name: 'reportedContent',
      description: 'User reports for content moderation',
      sampleData: {
        reporterId: auth?.currentUser?.uid || 'user1',
        reportedUserId: 'user2',
        contentType: 'message',
        contentId: 'sample-content-id',
        reason: 'inappropriate',
        description: 'Spam content',
        status: 'pending',
        reportedAt: serverTimestamp(),
      },
    },
    {
      name: 'securityLogs',
      description: 'Security event logging',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        eventType: 'login_attempt',
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'IraChat Mobile App',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'twoFactorAuth',
      description: 'Two-factor authentication settings',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        enabled: false,
        method: 'sms',
        backupCodes: [],
        setupAt: serverTimestamp(),
      },
    },
    // ========================================
    // MEDIA & FILES COLLECTIONS
    // ========================================
    {
      name: 'documents',
      description: 'Document uploads and metadata',
      sampleData: {
        uploadedBy: auth?.currentUser?.uid || 'user1',
        fileName: 'document.pdf',
        fileSize: 2048,
        fileType: 'application/pdf',
        downloadUrl: '',
        uploadedAt: serverTimestamp(),
      },
    },
    {
      name: 'downloads',
      description: 'User download history',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        fileId: 'sample-file-id',
        fileName: 'document.pdf',
        downloadedAt: serverTimestamp(),
      },
    },
    {
      name: 'mediaDownloads',
      description: 'Media download tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        mediaId: 'sample-media-id',
        mediaType: 'image',
        downloadedAt: serverTimestamp(),
      },
    },
    {
      name: 'documentDownloads',
      description: 'Document download tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        documentId: 'sample-doc-id',
        documentName: 'file.pdf',
        downloadedAt: serverTimestamp(),
      },
    },
    {
      name: 'voiceDownloads',
      description: 'Voice message download tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        voiceMessageId: 'sample-voice-id',
        duration: 30,
        downloadedAt: serverTimestamp(),
      },
    },
    {
      name: 'downloadProgress',
      description: 'Download progress tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        fileId: 'sample-file-id',
        progress: 75,
        status: 'downloading',
        startedAt: serverTimestamp(),
      },
    },
    {
      name: 'downloadStats',
      description: 'Download statistics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        totalDownloads: 50,
        totalSize: 1024000,
        lastDownload: serverTimestamp(),
      },
    },
    {
      name: 'downloadQueue',
      description: 'Queued downloads',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        fileId: 'sample-file-id',
        priority: 1,
        queuedAt: serverTimestamp(),
      },
    },
    // ========================================
    // ANALYTICS & TRACKING COLLECTIONS
    // ========================================
    {
      name: 'engagementMetrics',
      description: 'User engagement analytics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        feature: 'updates',
        action: 'view',
        duration: 30,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'usageStats',
      description: 'Detailed usage statistics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        feature: 'chat',
        timeSpent: 1800,
        interactions: 25,
        date: new Date().toISOString().split('T')[0],
      },
    },
    {
      name: 'errorLogs',
      description: 'Application error logging',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        errorType: 'network_error',
        errorMessage: 'Failed to send message',
        stackTrace: '',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'feedback',
      description: 'User feedback and suggestions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        type: 'suggestion',
        title: 'Feature Request',
        description: 'Add dark mode',
        rating: 5,
        submittedAt: serverTimestamp(),
      },
    },
    {
      name: 'userReports',
      description: 'User behavior reports',
      sampleData: {
        reporterId: auth?.currentUser?.uid || 'user1',
        reportedUserId: 'user2',
        category: 'harassment',
        description: 'Inappropriate behavior',
        evidence: [],
        status: 'pending',
        reportedAt: serverTimestamp(),
      },
    },
    {
      name: 'mutedUsers',
      description: 'User mute preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        mutedUserId: 'user2',
        reason: 'too_many_messages',
        mutedAt: serverTimestamp(),
        expiresAt: null,
      },
    },
    {
      name: 'cacheData',
      description: 'Application cache storage',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        cacheKey: 'user_preferences',
        cacheValue: {},
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: serverTimestamp(),
      },
    },
    // ========================================
    // BUSINESS & ENTERPRISE COLLECTIONS
    // ========================================
    {
      name: 'businessProfiles',
      description: 'Business account profiles',
      sampleData: {
        ownerId: auth?.currentUser?.uid || 'user1',
        businessName: 'Sample Business',
        category: 'Technology',
        description: 'A sample business',
        website: 'https://example.com',
        verified: false,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'payments',
      description: 'Payment transactions',
      sampleData: {
        senderId: auth?.currentUser?.uid || 'user1',
        receiverId: 'user2',
        amount: 10000,
        currency: 'UGX',
        status: 'completed',
        transactionId: 'txn_123456',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'wallets',
      description: 'User digital wallets',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        balance: 50000,
        currency: 'UGX',
        isActive: true,
        lastTransaction: serverTimestamp(),
      },
    },
    // ========================================
    // LOCATION & MAPS COLLECTIONS
    // ========================================
    {
      name: 'locations',
      description: 'Shared location data',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        latitude: 0.3476,
        longitude: 32.5825,
        address: 'Kampala, Uganda',
        sharedAt: serverTimestamp(),
      },
    },
    {
      name: 'liveLocations',
      description: 'Live location sharing',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        latitude: 0.3476,
        longitude: 32.5825,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        updatedAt: serverTimestamp(),
      },
    },
    // ========================================
    // MODERATION & ADMIN COLLECTIONS
    // ========================================
    {
      name: 'moderationActions',
      description: 'Content moderation actions',
      sampleData: {
        moderatorId: 'admin1',
        targetUserId: 'user2',
        action: 'warning',
        reason: 'inappropriate_content',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'bannedUsers',
      description: 'Banned user accounts',
      sampleData: {
        userId: 'user2',
        bannedBy: 'admin1',
        reason: 'spam',
        bannedAt: serverTimestamp(),
        expiresAt: null,
      },
    },
    {
      name: 'contentFlags',
      description: 'Flagged content reports',
      sampleData: {
        contentId: 'sample-content-id',
        flaggedBy: auth?.currentUser?.uid || 'user1',
        reason: 'spam',
        status: 'pending',
        flaggedAt: serverTimestamp(),
      },
    },
    {
      name: 'adminLogs',
      description: 'Administrative action logs',
      sampleData: {
        adminId: 'admin1',
        action: 'user_banned',
        targetId: 'user2',
        details: 'Banned for spam',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // SEARCH & DISCOVERY COLLECTIONS
    // ========================================
    {
      name: 'searchHistory',
      description: 'User search history',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        query: 'sample search',
        results: 5,
        searchedAt: serverTimestamp(),
      },
    },
    {
      name: 'searchSuggestions',
      description: 'Search suggestions',
      sampleData: {
        query: 'sample',
        suggestions: ['sample user', 'sample group'],
        popularity: 10,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'trending',
      description: 'Trending content',
      sampleData: {
        contentType: 'hashtag',
        content: '#trending',
        score: 100,
        region: 'Uganda',
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'hashtags',
      description: 'Hashtag tracking',
      sampleData: {
        tag: 'irachat',
        usageCount: 50,
        trending: true,
        createdAt: serverTimestamp(),
      },
    },
    // ========================================
    // NOTIFICATIONS EXTENDED COLLECTIONS
    // ========================================
    {
      name: 'pushNotifications',
      description: 'Push notification queue',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        title: 'New Message',
        body: 'You have a new message',
        data: {},
        sent: false,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'notificationSettings',
      description: 'User notification preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        messages: true,
        calls: true,
        updates: true,
        groups: true,
        quietHours: { start: '22:00', end: '07:00' },
      },
    },
    {
      name: 'deviceTokens',
      description: 'FCM device tokens',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        token: 'sample-fcm-token',
        platform: 'ios',
        isActive: true,
        registeredAt: serverTimestamp(),
      },
    },
    // ========================================
    // SETTINGS & PREFERENCES COLLECTIONS
    // ========================================
    {
      name: 'userSettings',
      description: 'User app settings',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        autoDownload: true,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'privacySettings',
      description: 'User privacy preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        showLastSeen: true,
        showOnlineStatus: true,
        allowCalls: true,
        readReceipts: true,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'chatSettings',
      description: 'Chat-specific settings',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        notifications: true,
        wallpaper: 'default',
        fontSize: 'medium',
        updatedAt: serverTimestamp(),
      },
    },
    // ========================================
    // BACKUP & SYNC COLLECTIONS
    // ========================================
    {
      name: 'backups',
      description: 'User data backups',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        backupType: 'full',
        size: 1024000,
        status: 'completed',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'syncStatus',
      description: 'Data synchronization status',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        lastSync: serverTimestamp(),
        status: 'synced',
        pendingChanges: 0,
      },
    },
    {
      name: 'cloudStorage',
      description: 'Cloud storage usage',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        usedSpace: 512000,
        totalSpace: 5120000,
        lastUpdated: serverTimestamp(),
      },
    },
    // ========================================
    // ADVANCED FEATURES COLLECTIONS
    // ========================================
    {
      name: 'messageScheduled',
      description: 'Scheduled messages',
      sampleData: {
        senderId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        message: 'Scheduled message',
        scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        status: 'pending',
      },
    },
    {
      name: 'messageDrafts',
      description: 'Message drafts',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        draftText: 'Draft message',
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'autoReplies',
      description: 'Automatic reply settings',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        enabled: false,
        message: 'I am currently away',
        triggers: ['away', 'busy'],
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'quickReplies',
      description: 'Quick reply templates',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        text: 'Thanks!',
        category: 'common',
        usageCount: 10,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'chatTemplates',
      description: 'Chat message templates',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        name: 'Meeting Reminder',
        template: 'Reminder: Meeting at {time}',
        category: 'business',
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'messageFilters',
      description: 'Message filtering rules',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        filterType: 'spam',
        keywords: ['spam', 'promotion'],
        action: 'block',
        enabled: true,
      },
    },
    {
      name: 'chatThemes',
      description: 'Chat theme customizations',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        themeName: 'Dark Blue',
        colors: { primary: '#1E3A8A', secondary: '#3B82F6' },
        isDefault: false,
        createdAt: serverTimestamp(),
      },
    },
    {
      name: 'wallpapers',
      description: 'Chat wallpaper settings',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        wallpaperUrl: '',
        isDefault: true,
        appliedTo: 'all_chats',
        updatedAt: serverTimestamp(),
      },
    },
    // ========================================
    // GROUP MANAGEMENT EXTENDED
    // ========================================
    {
      name: 'groupInvites',
      description: 'Group invitation system',
      sampleData: {
        groupId: 'sample-group-id',
        invitedBy: auth?.currentUser?.uid || 'user1',
        invitedUser: 'user2',
        status: 'pending',
        invitedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    },
    {
      name: 'groupRoles',
      description: 'Group member roles',
      sampleData: {
        groupId: 'sample-group-id',
        userId: auth?.currentUser?.uid || 'user1',
        role: 'admin',
        permissions: ['add_members', 'remove_members', 'edit_info'],
        assignedAt: serverTimestamp(),
      },
    },
    {
      name: 'groupSettings',
      description: 'Group-specific settings',
      sampleData: {
        groupId: 'sample-group-id',
        allowMemberInvites: true,
        requireAdminApproval: false,
        maxMembers: 256,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'mutedChats',
      description: 'Muted chat preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        chatId: 'sample-chat-id',
        mutedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        mutedAt: serverTimestamp(),
      },
    },
    // ========================================
    // AI & ML COLLECTIONS
    // ========================================
    {
      name: 'recommendations',
      description: 'AI-powered recommendations',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        type: 'contacts',
        recommendations: ['user2', 'user3'],
        score: 0.85,
        generatedAt: serverTimestamp(),
      },
    },
    {
      name: 'userInterests',
      description: 'User interest profiling',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        interests: ['technology', 'sports', 'music'],
        confidence: 0.9,
        updatedAt: serverTimestamp(),
      },
    },
    {
      name: 'contentAnalysis',
      description: 'AI content analysis results',
      sampleData: {
        contentId: 'sample-content-id',
        contentType: 'message',
        sentiment: 'positive',
        topics: ['greeting', 'casual'],
        confidence: 0.95,
        analyzedAt: serverTimestamp(),
      },
    },
    {
      name: 'spamDetection',
      description: 'Spam detection results',
      sampleData: {
        messageId: 'sample-message-id',
        isSpam: false,
        confidence: 0.1,
        reasons: [],
        checkedAt: serverTimestamp(),
      },
    },
    // ========================================
    // PERFORMANCE & MONITORING
    // ========================================
    {
      name: 'performanceMetrics',
      description: 'App performance monitoring',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        metric: 'message_send_time',
        value: 150,
        unit: 'ms',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'crashReports',
      description: 'Application crash reports',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        crashId: 'crash_123',
        stackTrace: 'Error stack trace',
        deviceInfo: 'iPhone 14',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'networkMetrics',
      description: 'Network performance data',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        latency: 50,
        bandwidth: 1000,
        connectionType: 'wifi',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // MICRO-INTERACTIONS & UI STATE
    // ========================================
    {
      name: 'buttonClicks',
      description: 'Every button click tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        buttonId: 'send_message_btn',
        screen: 'chat',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'scrollPositions',
      description: 'Scroll position tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        screen: 'chat_list',
        position: 150,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'screenTaps',
      description: 'Screen tap coordinates',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        x: 200,
        y: 400,
        screen: 'chat',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'keyboardEvents',
      description: 'Keyboard show/hide events',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        event: 'keyboard_shown',
        height: 300,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'swipeGestures',
      description: 'Swipe gesture tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        direction: 'left',
        screen: 'chat_list',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'longPresses',
      description: 'Long press interactions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        element: 'message',
        duration: 800,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'doubleTaps',
      description: 'Double tap interactions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        element: 'message',
        action: 'like',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'pinchZoom',
      description: 'Pinch zoom gestures',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        scale: 1.5,
        element: 'image',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // DETAILED MESSAGE INTERACTIONS
    // ========================================
    {
      name: 'messageViews',
      description: 'Individual message view tracking',
      sampleData: {
        messageId: 'msg_123',
        viewerId: auth?.currentUser?.uid || 'user1',
        viewDuration: 3000,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageHovers',
      description: 'Message hover events',
      sampleData: {
        messageId: 'msg_123',
        userId: auth?.currentUser?.uid || 'user1',
        hoverDuration: 500,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageSelections',
      description: 'Message text selections',
      sampleData: {
        messageId: 'msg_123',
        userId: auth?.currentUser?.uid || 'user1',
        selectedText: 'hello',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageCopies',
      description: 'Message copy actions',
      sampleData: {
        messageId: 'msg_123',
        userId: auth?.currentUser?.uid || 'user1',
        copiedText: 'hello world',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageShares',
      description: 'Message sharing actions',
      sampleData: {
        messageId: 'msg_123',
        sharedBy: auth?.currentUser?.uid || 'user1',
        sharedTo: 'external_app',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageBookmarks',
      description: 'Message bookmark actions',
      sampleData: {
        messageId: 'msg_123',
        userId: auth?.currentUser?.uid || 'user1',
        bookmarked: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageTranslations',
      description: 'Message translation requests',
      sampleData: {
        messageId: 'msg_123',
        userId: auth?.currentUser?.uid || 'user1',
        fromLang: 'en',
        toLang: 'sw',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'messageQuotes',
      description: 'Message quote/reply tracking',
      sampleData: {
        originalMessageId: 'msg_123',
        quotedBy: auth?.currentUser?.uid || 'user1',
        quoteText: 'Replying to this',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // EMOJI & REACTIONS DETAILED
    // ========================================
    {
      name: 'emojiUsage',
      description: 'Individual emoji usage tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        emoji: '😀',
        context: 'message',
        frequency: 5,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'emojiPicker',
      description: 'Emoji picker interactions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        category: 'smileys',
        searchTerm: 'happy',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'customEmojis',
      description: 'Custom emoji uploads',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        emojiName: 'custom_smile',
        imageUrl: '',
        approved: false,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'reactionAnimations',
      description: 'Reaction animation preferences',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        animationType: 'bounce',
        enabled: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'reactionCombos',
      description: 'Multiple reaction combinations',
      sampleData: {
        messageId: 'msg_123',
        reactions: ['❤️', '😂', '👍'],
        userId: auth?.currentUser?.uid || 'user1',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // TYPING & INPUT DETAILED
    // ========================================
    {
      name: 'typingSpeed',
      description: 'User typing speed analytics',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        wpm: 45,
        accuracy: 0.95,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'typingPatterns',
      description: 'Typing pattern analysis',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        pattern: 'burst_typing',
        avgPause: 200,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'autocorrections',
      description: 'Autocorrection usage',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        original: 'helo',
        corrected: 'hello',
        accepted: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'textPredictions',
      description: 'Text prediction usage',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        predicted: 'how are you',
        accepted: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'voiceToText',
      description: 'Voice-to-text conversions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        audioLength: 5000,
        transcribedText: 'hello world',
        accuracy: 0.98,
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // MEDIA INTERACTIONS DETAILED
    // ========================================
    {
      name: 'imageViews',
      description: 'Image view tracking',
      sampleData: {
        imageId: 'img_123',
        viewerId: auth?.currentUser?.uid || 'user1',
        viewDuration: 5000,
        zoomLevel: 1.0,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'videoPlays',
      description: 'Video playback tracking',
      sampleData: {
        videoId: 'vid_123',
        viewerId: auth?.currentUser?.uid || 'user1',
        watchTime: 30000,
        completed: false,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'audioPauses',
      description: 'Audio pause/resume tracking',
      sampleData: {
        audioId: 'aud_123',
        userId: auth?.currentUser?.uid || 'user1',
        action: 'pause',
        position: 15000,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'mediaRotations',
      description: 'Media rotation gestures',
      sampleData: {
        mediaId: 'med_123',
        userId: auth?.currentUser?.uid || 'user1',
        rotation: 90,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'mediaFilters',
      description: 'Applied media filters',
      sampleData: {
        mediaId: 'med_123',
        userId: auth?.currentUser?.uid || 'user1',
        filter: 'vintage',
        intensity: 0.7,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'mediaCrops',
      description: 'Media cropping actions',
      sampleData: {
        mediaId: 'med_123',
        userId: auth?.currentUser?.uid || 'user1',
        cropArea: { x: 0, y: 0, width: 100, height: 100 },
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // NAVIGATION & SCREEN TRACKING
    // ========================================
    {
      name: 'screenTransitions',
      description: 'Screen navigation tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        fromScreen: 'chat_list',
        toScreen: 'chat',
        transitionTime: 300,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'tabSwitches',
      description: 'Tab switching tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        fromTab: 'chats',
        toTab: 'updates',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'backButtonPresses',
      description: 'Back button usage tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        screen: 'chat',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'menuOpens',
      description: 'Menu opening tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        menuType: 'hamburger',
        screen: 'chat_list',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'modalOpens',
      description: 'Modal dialog tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        modalType: 'settings',
        trigger: 'button_click',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'tooltipViews',
      description: 'Tooltip display tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        tooltipId: 'send_button_help',
        viewDuration: 2000,
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // CONTACT & SOCIAL INTERACTIONS
    // ========================================
    {
      name: 'contactSearches',
      description: 'Contact search queries',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        searchQuery: 'john',
        resultsCount: 3,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'contactAdds',
      description: 'Contact addition tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        addedContactId: 'user2',
        method: 'phone_number',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'contactBlocks',
      description: 'Contact blocking actions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        blockedContactId: 'user2',
        reason: 'spam',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'contactUnblocks',
      description: 'Contact unblocking actions',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        unblockedContactId: 'user2',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'profileViews',
      description: 'Profile view tracking',
      sampleData: {
        viewerId: auth?.currentUser?.uid || 'user1',
        profileId: 'user2',
        viewDuration: 5000,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'profileEdits',
      description: 'Profile edit tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        field: 'bio',
        oldValue: 'old bio',
        newValue: 'new bio',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'statusViews',
      description: 'Status view tracking',
      sampleData: {
        statusId: 'status_123',
        viewerId: auth?.currentUser?.uid || 'user1',
        viewDuration: 3000,
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // CALL DETAILED TRACKING
    // ========================================
    {
      name: 'callAttempts',
      description: 'Call attempt tracking',
      sampleData: {
        callerId: auth?.currentUser?.uid || 'user1',
        receiverId: 'user2',
        callType: 'video',
        outcome: 'answered',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callRejections',
      description: 'Call rejection tracking',
      sampleData: {
        callId: 'call_123',
        rejectedBy: 'user2',
        reason: 'busy',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callMutes',
      description: 'Call mute/unmute tracking',
      sampleData: {
        callId: 'call_123',
        userId: auth?.currentUser?.uid || 'user1',
        action: 'mute',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callSpeakerToggles',
      description: 'Speaker on/off tracking',
      sampleData: {
        callId: 'call_123',
        userId: auth?.currentUser?.uid || 'user1',
        speakerOn: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callVideoToggles',
      description: 'Video on/off tracking',
      sampleData: {
        callId: 'call_123',
        userId: auth?.currentUser?.uid || 'user1',
        videoOn: false,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callScreenShares',
      description: 'Screen sharing tracking',
      sampleData: {
        callId: 'call_123',
        userId: auth?.currentUser?.uid || 'user1',
        sharing: true,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'callRecordings',
      description: 'Call recording tracking',
      sampleData: {
        callId: 'call_123',
        recordedBy: auth?.currentUser?.uid || 'user1',
        duration: 300000,
        fileUrl: '',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // GROUP DETAILED INTERACTIONS
    // ========================================
    {
      name: 'groupJoins',
      description: 'Group join tracking',
      sampleData: {
        groupId: 'group_123',
        userId: auth?.currentUser?.uid || 'user1',
        invitedBy: 'user2',
        method: 'invite_link',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'groupLeaves',
      description: 'Group leave tracking',
      sampleData: {
        groupId: 'group_123',
        userId: auth?.currentUser?.uid || 'user1',
        reason: 'voluntary',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'groupKicks',
      description: 'Group member removal tracking',
      sampleData: {
        groupId: 'group_123',
        kickedUserId: 'user2',
        kickedBy: auth?.currentUser?.uid || 'user1',
        reason: 'violation',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'groupPromotions',
      description: 'Group member promotion tracking',
      sampleData: {
        groupId: 'group_123',
        promotedUserId: 'user2',
        promotedBy: auth?.currentUser?.uid || 'user1',
        newRole: 'admin',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'groupDemotions',
      description: 'Group member demotion tracking',
      sampleData: {
        groupId: 'group_123',
        demotedUserId: 'user2',
        demotedBy: auth?.currentUser?.uid || 'user1',
        oldRole: 'admin',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'groupInfoEdits',
      description: 'Group info edit tracking',
      sampleData: {
        groupId: 'group_123',
        editedBy: auth?.currentUser?.uid || 'user1',
        field: 'description',
        oldValue: 'old desc',
        newValue: 'new desc',
        timestamp: serverTimestamp(),
      },
    },
    // ========================================
    // UPDATE/STORY DETAILED TRACKING
    // ========================================
    {
      name: 'updateUploads',
      description: 'Update upload tracking',
      sampleData: {
        userId: auth?.currentUser?.uid || 'user1',
        mediaType: 'video',
        fileSize: 5000000,
        uploadDuration: 30000,
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'updateDeletes',
      description: 'Update deletion tracking',
      sampleData: {
        updateId: 'update_123',
        deletedBy: auth?.currentUser?.uid || 'user1',
        reason: 'user_request',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'updateReports',
      description: 'Update reporting tracking',
      sampleData: {
        updateId: 'update_123',
        reportedBy: auth?.currentUser?.uid || 'user1',
        reason: 'inappropriate',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'updateShares',
      description: 'Update sharing tracking',
      sampleData: {
        updateId: 'update_123',
        sharedBy: auth?.currentUser?.uid || 'user1',
        sharedTo: 'external_app',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'updateSaves',
      description: 'Update save tracking',
      sampleData: {
        updateId: 'update_123',
        savedBy: auth?.currentUser?.uid || 'user1',
        timestamp: serverTimestamp(),
      },
    },
    {
      name: 'updateDownloads',
      description: 'Update download tracking',
      sampleData: {
        updateId: 'update_123',
        downloadedBy: auth?.currentUser?.uid || 'user1',
        downloadSize: 2000000,
        timestamp: serverTimestamp(),
      },
    },
  ];

  const createCollection = async (collectionInfo: typeof collectionsToCreate[0]) => {
    try {
      const collectionRef = collection(db, collectionInfo.name);
      const docRef = doc(collectionRef, 'sample-doc');
      
      await setDoc(docRef, collectionInfo.sampleData);
      
      setCreatedCollections(prev => [...prev, collectionInfo.name]);
      
      Alert.alert(
        'Success',
        `Collection "${collectionInfo.name}" created successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error(`Error creating collection ${collectionInfo.name}:`, error);
      Alert.alert(
        'Error',
        `Failed to create collection "${collectionInfo.name}". Please check your Firebase configuration.`,
        [{ text: 'OK' }]
      );
    }
  };

  const createAllCollections = async () => {
    if (!auth?.currentUser) {
      Alert.alert('Error', 'Please login first to create collections.');
      return;
    }

    setLoading(true);
    
    try {
      for (const collectionInfo of collectionsToCreate) {
        if (!createdCollections.includes(collectionInfo.name)) {
          await createCollection(collectionInfo);
          // Small delay to avoid overwhelming Firebase
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      Alert.alert(
        'Success',
        'All Firebase collections created successfully! Your IraChat app is now ready.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating collections:', error);
      Alert.alert(
        'Error',
        'Some collections failed to create. Please check your Firebase configuration.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-800">
          Firebase Collections
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View className="bg-blue-50 p-4 rounded-lg mb-6">
        <Text className="text-blue-800 font-semibold mb-2">
          🔥 Firebase Setup Required
        </Text>
        <Text className="text-blue-700">
          Click the button below to create all necessary Firebase collections for IraChat.
          This will set up your database structure with sample data.
        </Text>
      </View>

      {/* Create All Button */}
      <TouchableOpacity
        onPress={createAllCollections}
        disabled={loading}
        className={`bg-blue-600 p-4 rounded-lg mb-6 ${loading ? 'opacity-50' : ''}`}
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="cloud-upload" size={20} color="white" />
          )}
          <Text className="text-white font-semibold ml-2">
            {loading ? 'Creating Collections...' : 'Create All Collections'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Collections List */}
      <ScrollView className="flex-1">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Collections to Create:
        </Text>
        
        {collectionsToCreate.map((collection, index) => (
          <View key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">
                  {collection.name}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {collection.description}
                </Text>
              </View>
              
              <View className="ml-3">
                {createdCollections.includes(collection.name) ? (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                ) : (
                  <TouchableOpacity
                    onPress={() => createCollection(collection)}
                    disabled={loading}
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    <Text className="text-white text-xs">Create</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Status */}
      {createdCollections.length > 0 && (
        <View className="mt-4 p-3 bg-green-50 rounded-lg">
          <Text className="text-green-800 font-semibold">
            ✅ Created: {createdCollections.length}/{collectionsToCreate.length} collections
          </Text>
        </View>
      )}
    </View>
  );
};

export default FirebaseCollectionCreator;
