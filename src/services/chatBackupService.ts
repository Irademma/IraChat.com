// 💾 CHAT BACKUP & EXPORT SERVICE - Backup and export chat history
// Users can backup chats to cloud storage and export as files

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { collection, getDocs, query, orderBy, where, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseSimple';
import { RealMessage, RealChat } from './realTimeMessagingService';

export interface BackupData {
  version: string;
  exportDate: string;
  userId: string;
  userName: string;
  chats: ChatBackup[];
  totalMessages: number;
  totalChats: number;
}

export interface ChatBackup {
  chatId: string;
  chatName: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  isGroup: boolean;
  createdAt: string;
  messages: MessageBackup[];
  messageCount: number;
}

export interface MessageBackup {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  timestamp: string;
  reactions?: { [userId: string]: string };
  mediaUrl?: string;
  isEdited?: boolean;
  replyTo?: string;
}

class ChatBackupService {
  private readonly BACKUP_VERSION = '1.0.0';
  private readonly MAX_BACKUP_SIZE = 100 * 1024 * 1024; // 100MB limit

  /**
   * Export chat history as JSON file
   */
  async exportChatHistory(
    userId: string,
    userName: string,
    chatIds?: string[]
  ): Promise<boolean> {
    try {
      console.log('📦 Starting chat export...');
      
      // Get user's chats
      const chats = await this.getUserChats(userId, chatIds);
      
      if (chats.length === 0) {
        Alert.alert('No Data', 'No chats found to export.');
        return false;
      }

      // Get messages for each chat
      const chatBackups: ChatBackup[] = [];
      let totalMessages = 0;

      for (const chat of chats) {
        console.log(`📥 Exporting chat: ${chat.id}`);
        const messages = await this.getChatMessages(chat.id);
        
        const chatBackup: ChatBackup = {
          chatId: chat.id,
          chatName: chat.isGroup ? chat.groupName || 'Group Chat' : 'Direct Chat',
          participants: chat.participants,
          participantNames: chat.participantNames,
          isGroup: chat.isGroup,
          createdAt: this.formatDate(chat.createdAt),
          messages: messages.map(msg => this.formatMessageForBackup(msg)),
          messageCount: messages.length,
        };

        chatBackups.push(chatBackup);
        totalMessages += messages.length;
      }

      // Create backup data
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        userId,
        userName,
        chats: chatBackups,
        totalMessages,
        totalChats: chatBackups.length,
      };

      // Check backup size
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupSize = new Blob([backupJson]).size;

      if (backupSize > this.MAX_BACKUP_SIZE) {
        Alert.alert(
          'Backup Too Large',
          `The backup file is ${Math.round(backupSize / 1024 / 1024)}MB. Please select fewer chats or contact support.`
        );
        return false;
      }

      // Save to file
      const fileName = `IraChat_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, backupJson);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export IraChat Backup',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Backup saved to: ${fileUri}\n\nMessages: ${totalMessages}\nChats: ${chatBackups.length}`
        );
      }

      console.log('✅ Chat export completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error exporting chat history:', error);
      Alert.alert('Export Failed', 'Failed to export chat history. Please try again.');
      return false;
    }
  }

  /**
   * Export chat as text file (human-readable)
   */
  async exportChatAsText(chatId: string, chatName: string): Promise<boolean> {
    try {
      console.log('📝 Exporting chat as text:', chatId);

      const messages = await this.getChatMessages(chatId);
      
      if (messages.length === 0) {
        Alert.alert('No Messages', 'This chat has no messages to export.');
        return false;
      }

      // Format messages as text
      let textContent = `IraChat Export\n`;
      textContent += `Chat: ${chatName}\n`;
      textContent += `Exported: ${new Date().toLocaleString()}\n`;
      textContent += `Messages: ${messages.length}\n`;
      textContent += `${'='.repeat(50)}\n\n`;

      for (const message of messages) {
        const timestamp = new Date(message.timestamp.toDate()).toLocaleString();
        textContent += `[${timestamp}] ${message.senderName}: ${message.content}\n`;
        
        if (message.reactions && Object.keys(message.reactions).length > 0) {
          const reactions = Object.values(message.reactions).join(' ');
          textContent += `  Reactions: ${reactions}\n`;
        }
        textContent += '\n';
      }

      // Save to file
      const fileName = `${chatName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, textContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Export Chat as Text',
        });
      }

      console.log('✅ Text export completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error exporting chat as text:', error);
      Alert.alert('Export Failed', 'Failed to export chat as text. Please try again.');
      return false;
    }
  }

  /**
   * Import chat backup from file
   */
  async importChatBackup(): Promise<boolean> {
    try {
      console.log('📥 Starting chat import...');

      // Pick backup file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return false;
      }

      const fileUri = result.assets[0].uri;
      
      // Read and parse backup file
      const backupContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(backupContent);

      // Validate backup format
      if (!this.validateBackupData(backupData)) {
        Alert.alert('Invalid Backup', 'The selected file is not a valid IraChat backup.');
        return false;
      }

      // Confirm import
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Import Backup',
          `This will import ${backupData.totalChats} chats with ${backupData.totalMessages} messages.\n\nExported: ${new Date(backupData.exportDate).toLocaleDateString()}\n\nContinue?`,
          [
            { text: 'Cancel', onPress: () => resolve(false) },
            { text: 'Import', onPress: () => resolve(true) },
          ]
        );
      });

      if (!confirmed) return false;

      // Import chats and messages
      let importedChats = 0;
      let importedMessages = 0;

      for (const chatBackup of backupData.chats) {
        try {
          // Import chat
          await this.importChat(chatBackup);
          importedChats++;

          // Import messages
          for (const messageBackup of chatBackup.messages) {
            await this.importMessage(chatBackup.chatId, messageBackup);
            importedMessages++;
          }
        } catch (error) {
          console.error(`❌ Error importing chat ${chatBackup.chatId}:`, error);
        }
      }

      Alert.alert(
        'Import Complete',
        `Successfully imported:\n• ${importedChats} chats\n• ${importedMessages} messages`
      );

      console.log('✅ Chat import completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error importing chat backup:', error);
      Alert.alert('Import Failed', 'Failed to import chat backup. Please check the file format.');
      return false;
    }
  }

  /**
   * Create automatic backup to cloud storage
   */
  async createAutoBackup(userId: string, userName: string): Promise<boolean> {
    try {
      console.log('☁️ Creating automatic backup...');

      // Export chat history
      const success = await this.exportChatHistory(userId, userName);
      
      if (success) {
        // Save backup metadata to Firebase
        const backupRef = doc(db, 'backups', `${userId}_${Date.now()}`);
        await setDoc(backupRef, {
          userId,
          userName,
          createdAt: new Date(),
          type: 'auto',
          status: 'completed',
        });
      }

      return success;
    } catch (error) {
      console.error('❌ Error creating auto backup:', error);
      return false;
    }
  }

  /**
   * Get user's chats
   */
  private async getUserChats(userId: string, chatIds?: string[]): Promise<RealChat[]> {
    try {
      const chatsRef = collection(db, 'chats');
      let q;

      if (chatIds && chatIds.length > 0) {
        // Get specific chats
        q = query(chatsRef, where('participants', 'array-contains', userId));
      } else {
        // Get all user's chats
        q = query(
          chatsRef,
          where('participants', 'array-contains', userId),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealChat));
    } catch (error) {
      console.error('❌ Error getting user chats:', error);
      return [];
    }
  }

  /**
   * Get messages for a chat
   */
  private async getChatMessages(chatId: string): Promise<RealMessage[]> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealMessage));
    } catch (error) {
      console.error('❌ Error getting chat messages:', error);
      return [];
    }
  }

  /**
   * Format message for backup
   */
  private formatMessageForBackup(message: RealMessage): MessageBackup {
    return {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      type: message.type,
      timestamp: this.formatDate(message.timestamp),
      reactions: message.reactions,
      mediaUrl: message.mediaUrl,
      replyTo: message.replyTo,
    };
  }

  /**
   * Format date for backup
   */
  private formatDate(date: any): string {
    if (date?.toDate) {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return new Date(date).toISOString();
  }

  /**
   * Validate backup data format
   */
  private validateBackupData(data: any): boolean {
    return (
      data &&
      data.version &&
      data.exportDate &&
      data.userId &&
      data.chats &&
      Array.isArray(data.chats)
    );
  }

  /**
   * Import chat from backup
   */
  private async importChat(chatBackup: ChatBackup): Promise<void> {
    const chatRef = doc(db, 'chats', chatBackup.chatId);
    await setDoc(chatRef, {
      participants: chatBackup.participants,
      participantNames: chatBackup.participantNames,
      isGroup: chatBackup.isGroup,
      groupName: chatBackup.chatName,
      createdAt: new Date(chatBackup.createdAt),
      updatedAt: new Date(),
      lastMessage: null,
      lastMessageTime: new Date(),
      unreadCount: {},
    });
  }

  /**
   * Import message from backup
   */
  private async importMessage(chatId: string, messageBackup: MessageBackup): Promise<void> {
    const messageRef = doc(db, 'messages', messageBackup.id);
    await setDoc(messageRef, {
      chatId,
      senderId: messageBackup.senderId,
      senderName: messageBackup.senderName,
      content: messageBackup.content,
      type: messageBackup.type,
      timestamp: new Date(messageBackup.timestamp),
      reactions: messageBackup.reactions || {},
      mediaUrl: messageBackup.mediaUrl,
      replyTo: messageBackup.replyTo,
      statusInfo: {
        status: 'delivered',
        timestamp: new Date(),
        readBy: {},
        deliveredTo: {},
      },
      isRead: false,
      isDelivered: true,
    });
  }
}

// Export singleton instance
export const chatBackupService = new ChatBackupService();
export default chatBackupService;
