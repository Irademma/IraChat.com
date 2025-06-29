import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface ChatData {
  id: string;
  participantIds: string[];
  participantName?: string;
  participantAvatar?: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: {
    text: string;
    timestamp: any;
    senderId: string;
  };
  messageCount: number;
  mediaCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'voice';
  mediaUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatClearOptions {
  clearMessages: boolean;
  clearMedia: boolean;
  clearAll: boolean;
}

class RealChatService {
  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string): Promise<{ success: boolean; chats?: ChatData[]; error?: string }> {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participantIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const chats: ChatData[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ChatData[];

      return { success: true, chats };
    } catch (error) {
      console.error('❌ Error getting user chats:', error);
      return { success: false, error: 'Failed to get user chats' };
    }
  }

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(
    chatId: string,
    limitCount: number = 50
  ): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        chatId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      return { success: true, messages: messages.reverse() };
    } catch (error) {
      console.error('❌ Error getting chat messages:', error);
      return { success: false, error: 'Failed to get chat messages' };
    }
  }

  /**
   * Clear all messages from a chat
   */
  async clearChatMessages(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const querySnapshot = await getDocs(messagesRef);
      
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      // Update chat metadata
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messageCount: 0,
        lastMessage: null,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Chat messages cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing chat messages:', error);
      return { success: false, error: 'Failed to clear chat messages' };
    }
  }

  /**
   * Clear only media files from a chat
   */
  async clearChatMedia(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const q = query(
        messagesRef,
        where('type', 'in', ['image', 'video', 'audio', 'document', 'voice'])
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      // Update media count
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        mediaCount: 0,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Chat media cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing chat media:', error);
      return { success: false, error: 'Failed to clear chat media' };
    }
  }

  /**
   * Clear entire chat (messages and metadata)
   */
  async clearChatCompletely(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First clear all messages
      const messagesResult = await this.clearChatMessages(chatId);
      if (!messagesResult.success) {
        return messagesResult;
      }
      
      // Then delete the chat document itself
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);

      console.log('✅ Chat cleared completely');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing chat completely:', error);
      return { success: false, error: 'Failed to clear chat completely' };
    }
  }

  /**
   * Clear multiple chats with different options
   */
  async clearMultipleChats(
    chatIds: string[],
    options: ChatClearOptions
  ): Promise<{ success: boolean; results?: { [chatId: string]: boolean }; error?: string }> {
    try {
      const results: { [chatId: string]: boolean } = {};
      
      for (const chatId of chatIds) {
        try {
          if (options.clearAll) {
            const result = await this.clearChatCompletely(chatId);
            results[chatId] = result.success;
          } else if (options.clearMessages && options.clearMedia) {
            const result = await this.clearChatMessages(chatId);
            results[chatId] = result.success;
          } else if (options.clearMessages) {
            // Clear only text messages, keep media
            const messagesRef = collection(db, `chats/${chatId}/messages`);
            const q = query(messagesRef, where('type', '==', 'text'));
            const querySnapshot = await getDocs(q);
            
            const batch = writeBatch(db);
            querySnapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            
            results[chatId] = true;
          } else if (options.clearMedia) {
            const result = await this.clearChatMedia(chatId);
            results[chatId] = result.success;
          }
        } catch (error) {
          console.error(`❌ Error clearing chat ${chatId}:`, error);
          results[chatId] = false;
        }
      }

      const successCount = Object.values(results).filter(success => success).length;
      console.log(`✅ Cleared ${successCount}/${chatIds.length} chats successfully`);
      
      return { success: true, results };
    } catch (error) {
      console.error('❌ Error clearing multiple chats:', error);
      return { success: false, error: 'Failed to clear multiple chats' };
    }
  }

  /**
   * Get chat storage statistics
   */
  async getChatStorageStats(userId: string): Promise<{ 
    success: boolean; 
    stats?: {
      totalChats: number;
      totalMessages: number;
      totalMediaFiles: number;
      estimatedStorageSize: number; // in MB
      oldestChat: Date;
      newestChat: Date;
    }; 
    error?: string 
  }> {
    try {
      const chatsResult = await this.getUserChats(userId);
      if (!chatsResult.success || !chatsResult.chats) {
        return { success: false, error: 'Failed to get user chats' };
      }

      const chats = chatsResult.chats;
      const totalChats = chats.length;
      const totalMessages = chats.reduce((sum, chat) => sum + chat.messageCount, 0);
      const totalMediaFiles = chats.reduce((sum, chat) => sum + chat.mediaCount, 0);
      
      // Estimate storage size (rough calculation)
      const estimatedStorageSize = Math.round(
        (totalMessages * 0.1) + // 0.1 KB per text message
        (totalMediaFiles * 2.5)   // 2.5 MB average per media file
      );

      const chatDates = chats.map(chat => chat.createdAt);
      const oldestChat = new Date(Math.min(...chatDates.map(date => date.getTime())));
      const newestChat = new Date(Math.max(...chatDates.map(date => date.getTime())));

      return {
        success: true,
        stats: {
          totalChats,
          totalMessages,
          totalMediaFiles,
          estimatedStorageSize,
          oldestChat,
          newestChat,
        }
      };
    } catch (error) {
      console.error('❌ Error getting chat storage stats:', error);
      return { success: false, error: 'Failed to get chat storage statistics' };
    }
  }

  /**
   * Archive a chat (hide from main list but keep data)
   */
  async archiveChat(chatId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }

      const chatData = chatDoc.data();
      const archivedBy = chatData.archivedBy || [];
      
      if (!archivedBy.includes(userId)) {
        archivedBy.push(userId);
        
        await updateDoc(chatRef, {
          archivedBy,
          updatedAt: serverTimestamp(),
        });
      }

      console.log('✅ Chat archived successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error archiving chat:', error);
      return { success: false, error: 'Failed to archive chat' };
    }
  }

  /**
   * Unarchive a chat
   */
  async unarchiveChat(chatId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }

      const chatData = chatDoc.data();
      const archivedBy = (chatData.archivedBy || []).filter((id: string) => id !== userId);
      
      await updateDoc(chatRef, {
        archivedBy,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Chat unarchived successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error unarchiving chat:', error);
      return { success: false, error: 'Failed to unarchive chat' };
    }
  }

  /**
   * Export chat data for backup
   */
  async exportChatData(
    chatId: string,
    format: 'json' | 'csv' | 'txt' = 'json'
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const messagesResult = await this.getChatMessages(chatId, 10000); // Get all messages
      if (!messagesResult.success || !messagesResult.messages) {
        return { success: false, error: 'Failed to get chat messages for export' };
      }

      const messages = messagesResult.messages;
      let exportData: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(messages, null, 2);
          break;
        
        case 'csv':
          const csvHeader = 'Timestamp,Sender,Type,Content\n';
          const csvRows = messages.map(msg => 
            `"${msg.timestamp.toISOString()}","${msg.senderId}","${msg.type}","${msg.text || msg.mediaUrl || ''}"`
          ).join('\n');
          exportData = csvHeader + csvRows;
          break;
        
        case 'txt':
          exportData = messages.map(msg => 
            `[${msg.timestamp.toLocaleString()}] ${msg.senderId}: ${msg.text || `[${msg.type.toUpperCase()}]`}`
          ).join('\n');
          break;
        
        default:
          return { success: false, error: 'Unsupported export format' };
      }

      console.log('✅ Chat data exported successfully');
      return { success: true, data: exportData };
    } catch (error) {
      console.error('❌ Error exporting chat data:', error);
      return { success: false, error: 'Failed to export chat data' };
    }
  }

  /**
   * Clear all user data (for account deletion)
   */
  async clearAllUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const chatsResult = await this.getUserChats(userId);
      if (!chatsResult.success || !chatsResult.chats) {
        return { success: false, error: 'Failed to get user chats' };
      }

      const chatIds = chatsResult.chats.map(chat => chat.id);
      
      // Clear all chats completely
      const clearResult = await this.clearMultipleChats(chatIds, {
        clearMessages: false,
        clearMedia: false,
        clearAll: true,
      });

      if (!clearResult.success) {
        return { success: false, error: 'Failed to clear user chats' };
      }

      console.log('✅ All user chat data cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing all user data:', error);
      return { success: false, error: 'Failed to clear all user data' };
    }
  }
}

export const realChatService = new RealChatService();
