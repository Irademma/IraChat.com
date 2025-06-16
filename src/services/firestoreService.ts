// Automatic Firestore Data Management for IraChat
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db, auth } from './firebaseSimple';

// User Management Service
export const userService = {
  // Automatically create user profile on registration
  async createUserProfile(userData: {
    uid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    avatar?: string;
  }) {
    try {
      console.log('👤 Creating user profile:', userData.uid);
      
      await setDoc(doc(db, 'users', userData.uid), {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || 'IraChat User',
        phoneNumber: userData.phoneNumber || '',
        avatar: userData.avatar || `https://via.placeholder.com/150/87CEEB/FFFFFF?text=${userData.displayName?.charAt(0) || 'U'}`,
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        settings: {
          notifications: true,
          darkMode: false,
          language: 'en',
          readReceipts: true
        }
      });
      
      console.log('✅ User profile created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  },

  // Automatically update user online status
  async updateOnlineStatus(userId: string, isOnline: boolean) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating online status:', error);
    }
  },

  // Automatically update user profile
  async updateProfile(userId: string, updates: any) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ User profile updated');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }
};

// Chat Management Service
export const chatService = {
  // Automatically create new chat when conversation starts
  async createChat(participants: string[], isGroup: boolean = false, chatName?: string) {
    try {
      console.log('💬 Creating new chat with participants:', participants);
      
      const chatData = {
        participants,
        isGroup,
        name: isGroup ? chatName : null,
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        lastMessageBy: '',
        createdAt: serverTimestamp(),
        avatar: isGroup ? null : null,
        unreadCount: participants.reduce((acc, userId) => {
          acc[userId] = 0;
          return acc;
        }, {} as Record<string, number>)
      };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('✅ Chat created with ID:', chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      throw error;
    }
  },

  // Automatically update chat when new message is sent
  async updateChatLastMessage(chatId: string, message: string, senderId: string, messageType: string = 'text') {
    try {
      const lastMessagePreview = messageType === 'text' ? message : 
        messageType === 'image' ? '📸 Photo' :
        messageType === 'video' ? '🎥 Video' :
        messageType === 'audio' ? '🎵 Audio' :
        messageType === 'document' ? '📄 Document' : message;

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: lastMessagePreview,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: senderId
      });
    } catch (error) {
      console.error('❌ Error updating chat last message:', error);
    }
  },

  // Automatically delete chat
  async deleteChat(chatId: string) {
    try {
      console.log('🗑️ Deleting chat:', chatId);
      await deleteDoc(doc(db, 'chats', chatId));
      console.log('✅ Chat deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      throw error;
    }
  },

  // Get user's chats with real-time updates
  getUserChats(userId: string, callback: (chats: any[]) => void) {
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(chats);
      });
    } catch (error) {
      console.error('❌ Error setting up chat listener:', error);
      callback([]);
      return () => {};
    }
  }
};

// Message Management Service
export const messageService = {
  // Automatically create message when user sends one
  async sendMessage(chatId: string, senderId: string, messageData: {
    text?: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
  }) {
    try {
      console.log('📨 Sending message to chat:', chatId);
      
      const message = {
        chatId,
        senderId,
        text: messageData.text || '',
        type: messageData.type,
        timestamp: serverTimestamp(),
        readBy: [senderId],
        mediaUrl: messageData.mediaUrl || null,
        fileName: messageData.fileName || null,
        fileSize: messageData.fileSize || null,
        duration: messageData.duration || null,
        reactions: {},
        replyTo: null,
        edited: false,
        editedAt: null
      };

      const messageRef = await addDoc(collection(db, 'messages'), message);
      
      // Automatically update chat's last message
      await chatService.updateChatLastMessage(
        chatId, 
        messageData.text || '', 
        senderId, 
        messageData.type
      );

      console.log('✅ Message sent with ID:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  // Get messages for a chat with real-time updates
  getChatMessages(chatId: string, callback: (messages: any[]) => void) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messages);
      });
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
      callback([]);
      return () => {};
    }
  },

  // Automatically mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        readBy: arrayUnion(userId)
      });
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  }
};
