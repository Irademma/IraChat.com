// 💬 REAL-TIME MESSAGING SERVICE - Actually works with Firebase!
// This service handles real messaging with live synchronization

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface MessageStatusInfo {
  status: MessageStatus;
  timestamp: Date;
  readBy?: { [userId: string]: Date }; // For group chats - who read when
  deliveredTo?: { [userId: string]: Date }; // For group chats - who received when
}

export interface RealMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'deleted';
  mediaUrl?: string;
  timestamp: Timestamp | Date | any;
  statusInfo: MessageStatusInfo;
  replyTo?: string; // ID of message being replied to
  reactions?: { [userId: string]: string }; // emoji reactions
  // Deletion fields
  deletedFor?: string[]; // Array of user IDs who deleted this message for themselves
  deletedForEveryone?: boolean; // True if sender deleted for everyone
  deletedAt?: Timestamp | Date | any; // When message was deleted
  // Forwarding fields
  isForwarded?: boolean; // True if this message was forwarded
  originalSender?: string; // Original sender's name (for forwarded messages)
  originalMessageId?: string; // ID of the original message
  // Media fields
  caption?: string; // Caption for media messages
  mediaWidth?: number; // Width of media (for images/videos)
  mediaHeight?: number; // Height of media (for images/videos)
  mediaDuration?: number; // Duration for audio/video (in seconds)
  mediaSize?: number; // File size in bytes
  thumbnailUrl?: string; // Thumbnail URL for videos
  fileName?: string; // Original file name
  mimeType?: string; // MIME type of the file
  // Voice message fields
  waveform?: number[]; // Audio waveform data for voice messages
  // Location fields
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  // Contact fields (for shared contacts)
  contact?: {
    name: string;
    phoneNumber: string;
    avatar?: string;
  };
  // Legacy fields for backward compatibility
  isRead: boolean;
  isDelivered: boolean;
}

export interface RealChat {
  id: string;
  participants: string[]; // User IDs
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  lastMessage?: RealMessage;
  lastMessageTime: Timestamp | Date | any;
  unreadCount: { [userId: string]: number };
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
  // Archive fields
  archivedBy?: string[]; // Array of user IDs who archived this chat
  archivedAt?: { [userId: string]: Timestamp | Date | any }; // When each user archived the chat
}

class RealTimeMessagingService {
  private messageListeners: { [chatId: string]: () => void } = {};
  private chatListeners: { [userId: string]: () => void } = {};

  /**
   * Send a real message to Firebase
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    mediaUrl?: string,
    senderAvatar?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('💬 Sending real message...', { chatId, senderId, content, type });

      const messageData: Omit<RealMessage, 'id'> = {
        chatId,
        senderId,
        senderName,
        senderAvatar,
        content,
        type,
        mediaUrl,
        timestamp: serverTimestamp(),
        statusInfo: {
          status: 'sent' as MessageStatus,
          timestamp: new Date(),
          readBy: {},
          deliveredTo: {},
        },
        isRead: false,
        isDelivered: true,
      };

      // Add message to Firestore
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const docRef = await addDoc(messagesRef, messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, {
        ...messageData,
        id: docRef.id,
        timestamp: new Date(),
      } as RealMessage);

      console.log('✅ Message sent successfully:', docRef.id);
      return { success: true, messageId: docRef.id };
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark message as delivered
  async markMessageAsDelivered(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as RealMessage;
        const updatedStatusInfo = {
          ...messageData.statusInfo,
          status: 'delivered' as MessageStatus,
          deliveredTo: {
            ...messageData.statusInfo.deliveredTo,
            [userId]: new Date(),
          },
        };

        await updateDoc(messageRef, {
          statusInfo: updatedStatusInfo,
          isDelivered: true,
        });

        console.log('✅ Message marked as delivered:', messageId);
      }
    } catch (error) {
      console.error('❌ Error marking message as delivered:', error);
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as RealMessage;
        const updatedStatusInfo = {
          ...messageData.statusInfo,
          status: 'read' as MessageStatus,
          readBy: {
            ...messageData.statusInfo.readBy,
            [userId]: new Date(),
          },
        };

        await updateDoc(messageRef, {
          statusInfo: updatedStatusInfo,
          isRead: true,
        });

        console.log('✅ Message marked as read:', messageId);
      }
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  }

  // Mark all messages in a chat as read
  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        where('senderId', '!=', userId), // Don't mark own messages as read
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      for (const messageDoc of snapshot.docs) {
        batch.push(this.markMessageAsRead(messageDoc.id, userId));
      }

      await Promise.all(batch);
      console.log('✅ All messages in chat marked as read:', chatId);
    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
    }
  }

  // Typing indicator functions
  async setTypingStatus(chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = doc(db, 'typing', `${chatId}_${userId}`);

      if (isTyping) {
        await setDoc(typingRef, {
          chatId,
          userId,
          userName,
          isTyping: true,
          timestamp: serverTimestamp(),
        });
      } else {
        // Remove typing indicator when user stops typing
        await updateDoc(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp(),
        });
      }

      console.log(`👀 ${userName} ${isTyping ? 'started' : 'stopped'} typing in chat:`, chatId);
    } catch (error) {
      console.error('❌ Error updating typing status:', error);
    }
  }

  // Subscribe to typing indicators for a chat
  subscribeToTypingIndicators(
    chatId: string,
    currentUserId: string,
    callback: (typingUsers: { userId: string; userName: string }[]) => void
  ): () => void {
    console.log('👀 Subscribing to typing indicators for chat:', chatId);

    const typingRef = collection(db, 'typing');
    const q = query(
      typingRef,
      where('chatId', '==', chatId),
      where('isTyping', '==', true),
      where('userId', '!=', currentUserId) // Don't show own typing
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers = snapshot.docs
        .map(doc => {
          const data = doc.data();
          // Only include recent typing indicators (within last 10 seconds)
          const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - timestamp.getTime();

          if (timeDiff < 10000) { // 10 seconds
            return {
              userId: data.userId,
              userName: data.userName,
            };
          }
          return null;
        })
        .filter(Boolean) as { userId: string; userName: string }[];

      callback(typingUsers);
    });

    return unsubscribe;
  }

  // Message reaction functions
  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as RealMessage;
        const updatedReactions = {
          ...messageData.reactions,
          [userId]: emoji,
        };

        await updateDoc(messageRef, {
          reactions: updatedReactions,
        });

        console.log('✅ Reaction added:', { messageId, userId, emoji });
      }
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
    }
  }

  async removeReaction(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as RealMessage;
        const updatedReactions = { ...messageData.reactions };
        delete updatedReactions[userId];

        await updateDoc(messageRef, {
          reactions: updatedReactions,
        });

        console.log('✅ Reaction removed:', { messageId, userId });
      }
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
    }
  }

  // Message deletion functions
  async deleteMessageForSelf(messageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const messageData = messageDoc.data() as RealMessage;

      // Add user to deletedFor array
      const deletedFor = messageData.deletedFor || [];
      if (!deletedFor.includes(userId)) {
        deletedFor.push(userId);
      }

      await updateDoc(messageRef, {
        deletedFor: deletedFor,
      });

      console.log('✅ Message deleted for self:', messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting message for self:', error);
      return { success: false, error: 'Failed to delete message' };
    }
  }

  async deleteMessageForEveryone(messageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const messageData = messageDoc.data() as RealMessage;

      // Check if user is the sender
      if (messageData.senderId !== userId) {
        return { success: false, error: 'Only sender can delete for everyone' };
      }

      // Check if message is within deletion time limit (e.g., 1 hour)
      const messageTime = messageData.timestamp?.toDate?.() || new Date(messageData.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - messageTime.getTime();
      const oneHour = 60 * 60 * 1000;

      if (timeDiff > oneHour) {
        return { success: false, error: 'Message too old to delete for everyone' };
      }

      // Delete media files from storage if they exist
      if (messageData.mediaUrl) {
        try {
          const { ref, deleteObject } = await import('firebase/storage');
          const { storage } = await import('./firebaseSimple');
          const mediaRef = ref(storage, messageData.mediaUrl);
          await deleteObject(mediaRef);
          console.log('✅ Media file deleted from storage');
        } catch (storageError) {
          console.warn('⚠️ Could not delete media file from storage:', storageError);
        }
      }

      // Delete thumbnail if it exists
      if (messageData.thumbnailUrl) {
        try {
          const { ref, deleteObject } = await import('firebase/storage');
          const { storage } = await import('./firebaseSimple');
          const thumbnailRef = ref(storage, messageData.thumbnailUrl);
          await deleteObject(thumbnailRef);
          console.log('✅ Thumbnail deleted from storage');
        } catch (storageError) {
          console.warn('⚠️ Could not delete thumbnail from storage:', storageError);
        }
      }

      // Mark message as deleted for everyone
      await updateDoc(messageRef, {
        deletedForEveryone: true,
        deletedAt: serverTimestamp(),
        content: 'This message was deleted',
        caption: undefined,
        mediaUrl: undefined,
        thumbnailUrl: undefined,
        type: 'deleted',
        // Clear all media-related fields
        mediaWidth: undefined,
        mediaHeight: undefined,
        mediaDuration: undefined,
        mediaSize: undefined,
        fileName: undefined,
        mimeType: undefined,
        waveform: undefined,
        location: undefined,
        contact: undefined,
      });

      console.log('✅ Message deleted for everyone:', messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting message for everyone:', error);
      return { success: false, error: 'Failed to delete message' };
    }
  }

  // Forward message to multiple chats
  async forwardMessage(
    originalMessage: RealMessage,
    targetChatIds: string[],
    forwarderId: string,
    forwarderName: string,
    forwarderAvatar?: string
  ): Promise<{ success: boolean; error?: string; forwardedCount?: number }> {
    try {
      let successCount = 0;
      const forwardPromises = targetChatIds.map(async (chatId) => {
        try {
          // Create forwarded message
          const forwardedMessage: Omit<RealMessage, 'id'> = {
            chatId,
            senderId: forwarderId,
            senderName: forwarderName,
            senderAvatar: forwarderAvatar,
            content: originalMessage.content,
            type: originalMessage.type,
            mediaUrl: originalMessage.mediaUrl,
            timestamp: serverTimestamp(),
            statusInfo: {
              status: 'sent',
              timestamp: new Date(),
              readBy: {},
              deliveredTo: {},
            },
            isRead: false,
            isDelivered: true,
            // Mark as forwarded
            isForwarded: true,
            originalSender: originalMessage.senderName,
            originalMessageId: originalMessage.id,
          };

          // Add to messages collection
          const messagesRef = collection(db, 'messages');
          const messageDoc = await addDoc(messagesRef, forwardedMessage);

          // Update chat's last message
          const chatRef = doc(db, 'chats', chatId);
          await updateDoc(chatRef, {
            lastMessage: {
              id: messageDoc.id,
              content: originalMessage.content,
              type: originalMessage.type,
              senderId: forwarderId,
              senderName: forwarderName,
              timestamp: serverTimestamp(),
            },
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          successCount++;
          console.log('✅ Message forwarded to chat:', chatId);
        } catch (error) {
          console.error(`❌ Error forwarding to chat ${chatId}:`, error);
        }
      });

      await Promise.all(forwardPromises);

      if (successCount === 0) {
        return { success: false, error: 'Failed to forward message to any chat' };
      } else if (successCount < targetChatIds.length) {
        return {
          success: true,
          forwardedCount: successCount,
          error: `Forwarded to ${successCount} of ${targetChatIds.length} chats`
        };
      } else {
        return { success: true, forwardedCount: successCount };
      }
    } catch (error) {
      console.error('❌ Error forwarding message:', error);
      return { success: false, error: 'Failed to forward message' };
    }
  }

  // Chat archive functions
  async archiveChat(chatId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }

      const chatData = chatDoc.data() as RealChat;
      const archivedBy = chatData.archivedBy || [];

      if (!archivedBy.includes(userId)) {
        archivedBy.push(userId);

        await updateDoc(chatRef, {
          archivedBy: archivedBy,
          [`archivedAt.${userId}`]: serverTimestamp(),
        });
      }

      console.log('✅ Chat archived:', chatId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error archiving chat:', error);
      return { success: false, error: 'Failed to archive chat' };
    }
  }

  async unarchiveChat(chatId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }

      const chatData = chatDoc.data() as RealChat;
      const archivedBy = (chatData.archivedBy || []).filter((id: string) => id !== userId);

      const updateData: any = {
        archivedBy: archivedBy,
      };

      // Remove the user's archive timestamp
      updateData[`archivedAt.${userId}`] = null;

      await updateDoc(chatRef, updateData);

      console.log('✅ Chat unarchived:', chatId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error unarchiving chat:', error);
      return { success: false, error: 'Failed to unarchive chat' };
    }
  }

  // Get archived chats for a user
  subscribeToArchivedChats(
    userId: string,
    callback: (chats: RealChat[]) => void
  ): () => void {
    console.log('📦 Subscribing to archived chats for user:', userId);

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      where('archivedBy', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const archivedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as RealChat));

      console.log('📦 Received archived chats:', archivedChats.length);
      callback(archivedChats);
    });

    return unsubscribe;
  }

  // Media message functions
  async sendMediaMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    mediaUri: string,
    mediaType: 'image' | 'video' | 'audio' | 'file',
    caption?: string,
    replyTo?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📸 Sending media message:', mediaType);

      // Upload media to Firebase Storage
      const uploadResult = await this.uploadMediaFile(mediaUri, mediaType);
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      // Get media metadata
      const metadata = await this.getMediaMetadata(mediaUri, mediaType);

      // Create message
      const messageId = `msg_${Date.now()}_${senderId}`;
      const message: Omit<RealMessage, 'id'> = {
        chatId,
        senderId,
        senderName,
        senderAvatar,
        content: caption || '',
        caption,
        type: mediaType,
        mediaUrl: uploadResult.url,
        mediaWidth: metadata.width,
        mediaHeight: metadata.height,
        mediaDuration: metadata.duration,
        mediaSize: metadata.size,
        thumbnailUrl: uploadResult.thumbnailUrl,
        timestamp: serverTimestamp(),
        statusInfo: {
          status: 'sent',
          timestamp: new Date(),
          readBy: {},
          deliveredTo: {},
        },
        replyTo,
        reactions: {},
        isRead: false,
        isDelivered: true,
      };

      // Add to messages collection
      const messagesRef = collection(db, 'messages');
      const messageDoc = await addDoc(messagesRef, message);

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          id: messageDoc.id,
          content: caption || `📎 ${mediaType}`,
          type: mediaType,
          senderId,
          senderName,
          timestamp: serverTimestamp(),
        },
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Media message sent successfully:', messageDoc.id);
      return { success: true, messageId: messageDoc.id };
    } catch (error) {
      console.error('❌ Error sending media message:', error);
      return { success: false, error: 'Failed to send media message' };
    }
  }

  // Upload media file to Firebase Storage
  private async uploadMediaFile(
    mediaUri: string,
    mediaType: 'image' | 'video' | 'audio' | 'file'
  ): Promise<{ success: boolean; url?: string; thumbnailUrl?: string; error?: string }> {
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('./firebaseSimple');

      // Convert URI to blob
      const response = await fetch(mediaUri);
      const blob = await response.blob();

      // Create storage reference
      const fileExtension = this.getFileExtension(mediaUri, mediaType);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storageRef = ref(storage, `messages/${mediaType}s/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Generate thumbnail for videos
      let thumbnailUrl: string | undefined;
      if (mediaType === 'video') {
        thumbnailUrl = await this.generateVideoThumbnail(mediaUri);
      }

      console.log('✅ Media file uploaded successfully');
      return { success: true, url: downloadURL, thumbnailUrl };
    } catch (error) {
      console.error('❌ Error uploading media file:', error);
      return { success: false, error: 'Failed to upload media file' };
    }
  }

  // Get media metadata
  private async getMediaMetadata(
    mediaUri: string,
    mediaType: 'image' | 'video' | 'audio' | 'file'
  ): Promise<{
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  }> {
    try {
      const metadata: any = {};

      // Get file size
      try {
        const response = await fetch(mediaUri, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          metadata.size = parseInt(contentLength, 10);
        }
      } catch (error) {
        console.warn('Could not get file size:', error);
      }

      // Get dimensions for images and videos
      if (mediaType === 'image' || mediaType === 'video') {
        try {
          const { Image } = await import('react-native');

          if (mediaType === 'image') {
            const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
              Image.getSize(
                mediaUri,
                (width, height) => resolve({ width, height }),
                reject
              );
            });
            metadata.width = dimensions.width;
            metadata.height = dimensions.height;
          }
        } catch (error) {
          console.warn('Could not get media dimensions:', error);
        }
      }

      // Get duration for audio and video
      if (mediaType === 'audio' || mediaType === 'video') {
        try {
          // This would require a media library to get duration
          // For now, we'll set a placeholder
          metadata.duration = 0;
        } catch (error) {
          console.warn('Could not get media duration:', error);
        }
      }

      return metadata;
    } catch (error) {
      console.error('❌ Error getting media metadata:', error);
      return {};
    }
  }

  // Generate video thumbnail
  private async generateVideoThumbnail(videoUri: string): Promise<string | undefined> {
    try {
      // This would require a video processing library
      // For now, return undefined
      return undefined;
    } catch (error) {
      console.error('❌ Error generating video thumbnail:', error);
      return undefined;
    }
  }

  // Get file extension
  private getFileExtension(uri: string, mediaType: 'image' | 'video' | 'audio' | 'file'): string {
    const uriParts = uri.split('.');
    const extension = uriParts[uriParts.length - 1];

    if (extension && extension.length <= 4) {
      return extension;
    }

    // Default extensions based on media type
    switch (mediaType) {
      case 'image': return 'jpg';
      case 'video': return 'mp4';
      case 'audio': return 'mp3';
      case 'file': return 'bin';
      default: return 'bin';
    }
  }

  /**
   * Listen to real-time messages for a chat
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: RealMessage[]) => void
  ): () => void {
    console.log('👂 Subscribing to real-time messages for chat:', chatId);

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: RealMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as RealMessage);
        });

        // Reverse to show oldest first
        messages.reverse();
        console.log('📨 Received real-time messages:', messages.length);
        callback(messages);
      },
      (error) => {
        console.error('❌ Error listening to messages:', error);
        callback([]);
      }
    );

    // Store listener for cleanup
    this.messageListeners[chatId] = unsubscribe;
    return unsubscribe;
  }

  /**
   * Create or get a chat between users
   */
  async createOrGetChat(
    currentUserId: string,
    otherUserId: string,
    currentUserName: string,
    otherUserName: string,
    currentUserAvatar?: string,
    otherUserAvatar?: string
  ): Promise<{ success: boolean; chatId?: string; error?: string }> {
    try {
      console.log('💬 Creating/getting chat between users...', { currentUserId, otherUserId });

      // Create a consistent chat ID based on user IDs
      const chatId = [currentUserId, otherUserId].sort().join('_');

      // Check if chat already exists
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        console.log('✅ Chat already exists:', chatId);
        return { success: true, chatId };
      }

      // Create new chat
      const chatData: Omit<RealChat, 'id'> = {
        participants: [currentUserId, otherUserId],
        participantNames: {
          [currentUserId]: currentUserName,
          [otherUserId]: otherUserName,
        },
        participantAvatars: {
          [currentUserId]: currentUserAvatar || '',
          [otherUserId]: otherUserAvatar || '',
        },
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0,
        },
        isGroup: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(chatRef, chatData);
      console.log('✅ New chat created:', chatId);
      return { success: true, chatId };
    } catch (error: any) {
      console.error('❌ Failed to create/get chat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's chats with real-time updates
   */
  subscribeToUserChats(
    userId: string,
    callback: (chats: RealChat[]) => void
  ): () => void {
    console.log('👂 Subscribing to user chats:', userId);

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats: RealChat[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          chats.push({
            id: doc.id,
            ...data,
            lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as RealChat);
        });

        console.log('📨 Received user chats:', chats.length);
        callback(chats);
      },
      (error) => {
        console.error('❌ Error listening to chats:', error);
        callback([]);
      }
    );

    this.chatListeners[userId] = unsubscribe;
    return unsubscribe;
  }

  /**
   * Update chat's last message
   */
  private async updateChatLastMessage(chatId: string, message: RealMessage): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          id: message.id,
          content: message.content,
          type: message.type,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp,
        },
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Failed to update chat last message:', error);
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      });
      console.log('✅ Messages marked as read for chat:', chatId);
    } catch (error) {
      console.error('❌ Failed to mark messages as read:', error);
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = doc(db, 'chats', chatId, 'typing', userId);
      if (isTyping) {
        await setDoc(typingRef, {
          isTyping: true,
          timestamp: serverTimestamp(),
        });
      } else {
        await setDoc(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    console.log('🧹 Cleaning up messaging listeners...');
    
    // Clean up message listeners
    Object.values(this.messageListeners).forEach(unsubscribe => unsubscribe());
    this.messageListeners = {};

    // Clean up chat listeners
    Object.values(this.chatListeners).forEach(unsubscribe => unsubscribe());
    this.chatListeners = {};
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId: string): Promise<RealChat | null> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const data = chatDoc.data();
        return {
          id: chatDoc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RealChat;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get chat:', error);
      return null;
    }
  }

  /**
   * Create a group chat
   */
  async createGroupChat(
    groupId: string,
    groupName: string,
    participants: string[],
    participantNames: { [userId: string]: string },
    participantAvatars: { [userId: string]: string },
    groupAvatar?: string
  ): Promise<{ success: boolean; chatId?: string; error?: string }> {
    try {
      console.log('👥 Creating group chat:', groupName);

      const chatData: Omit<RealChat, 'id'> = {
        participants,
        participantNames,
        participantAvatars,
        lastMessageTime: serverTimestamp(),
        unreadCount: participants.reduce((acc, userId) => {
          acc[userId] = 0;
          return acc;
        }, {} as { [userId: string]: number }),
        isGroup: true,
        groupName,
        groupAvatar,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const chatRef = doc(db, 'chats', groupId);
      await setDoc(chatRef, chatData);

      console.log('✅ Group chat created:', groupId);
      return { success: true, chatId: groupId };
    } catch (error: any) {
      console.error('❌ Failed to create group chat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add user to group chat
   */
  async addUserToGroupChat(
    chatId: string,
    userId: string,
    userName: string,
    userAvatar: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('👥 Adding user to group chat:', { chatId, userId });

      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return { success: false, error: 'Group chat not found' };
      }

      const chatData = chatDoc.data() as RealChat;

      if (!chatData.isGroup) {
        return { success: false, error: 'Not a group chat' };
      }

      if (chatData.participants.includes(userId)) {
        return { success: false, error: 'User already in group' };
      }

      const updatedParticipants = [...chatData.participants, userId];
      const updatedParticipantNames = { ...chatData.participantNames, [userId]: userName };
      const updatedParticipantAvatars = { ...chatData.participantAvatars, [userId]: userAvatar };
      const updatedUnreadCount = { ...chatData.unreadCount, [userId]: 0 };

      await updateDoc(chatRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantAvatars: updatedParticipantAvatars,
        unreadCount: updatedUnreadCount,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User added to group chat:', userId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to add user to group chat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove user from group chat
   */
  async removeUserFromGroupChat(
    chatId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('👥 Removing user from group chat:', { chatId, userId });

      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return { success: false, error: 'Group chat not found' };
      }

      const chatData = chatDoc.data() as RealChat;

      if (!chatData.isGroup) {
        return { success: false, error: 'Not a group chat' };
      }

      if (!chatData.participants.includes(userId)) {
        return { success: false, error: 'User not in group' };
      }

      const updatedParticipants = chatData.participants.filter(id => id !== userId);
      const updatedParticipantNames = { ...chatData.participantNames };
      const updatedParticipantAvatars = { ...chatData.participantAvatars };
      const updatedUnreadCount = { ...chatData.unreadCount };

      delete updatedParticipantNames[userId];
      delete updatedParticipantAvatars[userId];
      delete updatedUnreadCount[userId];

      await updateDoc(chatRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantAvatars: updatedParticipantAvatars,
        unreadCount: updatedUnreadCount,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User removed from group chat:', userId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to remove user from group chat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete group chat
   */
  async deleteGroupChat(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('👥 Deleting group chat:', chatId);

      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return { success: false, error: 'Group chat not found' };
      }

      const chatData = chatDoc.data() as RealChat;

      if (!chatData.isGroup) {
        return { success: false, error: 'Not a group chat' };
      }

      // Mark as deleted instead of actually deleting
      await updateDoc(chatRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Group chat deleted:', chatId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete group chat:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const realTimeMessagingService = new RealTimeMessagingService();
export default realTimeMessagingService;
