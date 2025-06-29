// 🔔 PUSH NOTIFICATION SERVICE - Complete notification system
// Real push notifications for messages, calls, groups, and updates

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseSimple';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'message' | 'call' | 'group' | 'update' | 'system';
  chatId?: string;
  callId?: string;
  groupId?: string;
  updateId?: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string; // Use string for JSON serialization
  callType?: 'voice' | 'video';
  [key: string]: any; // Allow additional properties
}

export interface PushToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: Date;
  lastUsed: Date;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications
   */
  async initialize(userId: string): Promise<string | null> {
    try {
      // Check if device supports push notifications
      if (!Constants.isDevice) {
        console.log('📱 Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission denied');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your Expo project ID
      });

      this.expoPushToken = token.data;
      console.log('🔔 Push token obtained:', this.expoPushToken);

      // Save token to user profile in Firebase
      await this.saveTokenToFirebase(userId, this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'IraChat Messages',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('calls', {
          name: 'IraChat Calls',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 1000, 500, 1000],
          lightColor: '#EF4444',
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Save push token to Firebase user profile
   */
  private async saveTokenToFirebase(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushToken: token,
        lastTokenUpdate: new Date(),
      });
      console.log('✅ Push token saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('🔔 Notification received:', notification);
        this.handleForegroundNotification(notification);
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleForegroundNotification(notification: Notifications.Notification): void {
    const data = notification.request.content.data as NotificationData;
    
    // You can customize behavior based on notification type
    switch (data.type) {
      case 'message':
        // Show in-app notification or update UI
        console.log('💬 New message notification');
        break;
      case 'call':
        // Show incoming call UI
        console.log('📞 Incoming call notification');
        break;
      case 'system':
        // Show system notification
        console.log('🔔 System notification');
        break;
    }
  }

  /**
   * Handle notification tap response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data as NotificationData;
    
    // Navigate to appropriate screen based on notification type
    switch (data.type) {
      case 'message':
        // Navigate to chat screen
        console.log('🔗 Navigate to chat:', data.chatId);
        // You can use navigation service here
        break;
      case 'call':
        // Navigate to call screen or show call UI
        console.log('📞 Handle call notification');
        break;
    }
  }

  /**
   * Send local notification (for testing)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  /**
   * Send push notification to specific user
   */
  async sendPushNotification(
    recipientUserId: string,
    title: string,
    body: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // Get recipient's push token from Firebase
      const userRef = doc(db, 'users', recipientUserId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('❌ User not found:', recipientUserId);
        return false;
      }

      const userData = userDoc.data();
      const recipientToken = userData.pushToken;

      if (!recipientToken) {
        console.log('❌ No push token for user:', recipientUserId);
        return false;
      }

      // Send push notification via Expo Push API
      const message = {
        to: recipientToken,
        sound: 'default',
        title,
        body,
        data,
        channelId: data.type === 'call' ? 'calls' : 'default',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      if (result.data?.status === 'ok') {
        console.log('✅ Push notification sent successfully');
        return true;
      } else {
        console.error('❌ Push notification failed:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    recipientUserId: string,
    senderName: string,
    messageContent: string,
    chatId: string,
    senderId: string,
    messageId: string
  ): Promise<void> {
    const data: NotificationData = {
      type: 'message',
      chatId,
      senderId,
      senderName,
      content: messageContent,
      messageId,
      timestamp: new Date().toISOString(),
    };

    await this.sendPushNotification(
      recipientUserId,
      senderName,
      messageContent,
      data
    );
  }

  /**
   * Send call notification
   */
  async sendCallNotification(
    recipientUserId: string,
    callerName: string,
    callType: 'voice' | 'video',
    chatId: string,
    callerId: string
  ): Promise<void> {
    const data: NotificationData = {
      type: 'call',
      chatId,
      senderId: callerId,
      senderName: callerName,
      content: `Incoming ${callType} call`,
      timestamp: new Date().toISOString(),
      callType,
    };

    const title = `Incoming ${callType} call`;
    const body = `${callerName} is calling you`;

    await this.sendPushNotification(recipientUserId, title, body, data);
  }

  /**
   * Send reaction notification
   */
  async sendReactionNotification(
    recipientUserId: string,
    reactorName: string,
    emoji: string,
    messageContent: string,
    chatId: string,
    reactorId: string,
    messageId: string
  ): Promise<void> {
    const data: NotificationData = {
      type: 'message',
      chatId,
      senderId: reactorId,
      senderName: reactorName,
      content: emoji,
      messageId,
      timestamp: new Date().toISOString(),
    };

    const title = `${reactorName} reacted ${emoji}`;
    const body = `to "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`;

    await this.sendPushNotification(recipientUserId, title, body, data);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🧹 All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
