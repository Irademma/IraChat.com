// Automatic Firestore Data Management for IraChat
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebaseSimple';

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

// Group Management Service
export const groupService = {
  // Automatically create group when user creates one
  async createGroup(groupData: {
    name: string;
    description?: string;
    participants: string[];
    createdBy: string;
    avatar?: string;
    maxMembers?: number;
  }) {
    try {
      console.log('👥 Creating group:', groupData.name);

      const group = {
        name: groupData.name,
        description: groupData.description || '',
        participants: groupData.participants,
        admins: [groupData.createdBy],
        createdBy: groupData.createdBy,
        createdAt: serverTimestamp(),
        avatar: groupData.avatar || `https://via.placeholder.com/150/87CEEB/FFFFFF?text=${groupData.name.charAt(0)}`,
        maxMembers: groupData.maxMembers || 1024,
        settings: {
          onlyAdminsCanMessage: false,
          onlyAdminsCanAddMembers: true,
          onlyAdminsCanEditInfo: true
        }
      };

      const groupRef = await addDoc(collection(db, 'groups'), group);

      // Also create a chat for this group
      await chatService.createChat(groupData.participants, true, groupData.name);

      console.log('✅ Group created with ID:', groupRef.id);
      return groupRef.id;
    } catch (error) {
      console.error('❌ Error creating group:', error);
      throw error;
    }
  },

  // Automatically add member to group
  async addMember(groupId: string, userId: string) {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        participants: arrayUnion(userId)
      });
      console.log('✅ Member added to group');
    } catch (error) {
      console.error('❌ Error adding member:', error);
      throw error;
    }
  },

  // Automatically remove member from group
  async removeMember(groupId: string, userId: string) {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        participants: arrayRemove(userId)
      });
      console.log('✅ Member removed from group');
    } catch (error) {
      console.error('❌ Error removing member:', error);
      throw error;
    }
  }
};

// Document Management Service
export const documentService = {
  // Automatically store document when user uploads file
  async uploadDocument(documentData: {
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedBy: string;
    chatId: string;
    downloadUrl: string;
    description?: string;
  }) {
    try {
      console.log('📄 Storing document:', documentData.fileName);

      const document = {
        fileName: documentData.fileName,
        fileSize: documentData.fileSize,
        fileType: documentData.fileType,
        uploadedBy: documentData.uploadedBy,
        uploadedAt: serverTimestamp(),
        downloadUrl: documentData.downloadUrl,
        chatId: documentData.chatId,
        description: documentData.description || ''
      };

      const docRef = await addDoc(collection(db, 'documents'), document);

      // Send message with document reference
      await messageService.sendMessage(documentData.chatId, documentData.uploadedBy, {
        text: `📄 ${documentData.fileName}`,
        type: 'document',
        fileName: documentData.fileName,
        mediaUrl: documentData.downloadUrl,
        fileSize: documentData.fileSize
      });

      console.log('✅ Document stored with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing document:', error);
      throw error;
    }
  }
};

// Media Management Service
export const mediaService = {
  // Automatically store media when user uploads photo/video/audio
  async uploadMedia(mediaData: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
    uploadedBy: string;
    chatId: string;
    fileName: string;
    fileSize?: number;
    dimensions?: { width: number; height: number };
  }) {
    try {
      console.log('🎬 Storing media:', mediaData.fileName);

      const media = {
        type: mediaData.type,
        url: mediaData.url,
        thumbnail: mediaData.thumbnail || null,
        duration: mediaData.duration || null,
        uploadedBy: mediaData.uploadedBy,
        uploadedAt: serverTimestamp(),
        chatId: mediaData.chatId,
        fileName: mediaData.fileName,
        fileSize: mediaData.fileSize || 0,
        dimensions: mediaData.dimensions || null
      };

      const mediaRef = await addDoc(collection(db, 'media'), media);

      // Send message with media reference
      await messageService.sendMessage(mediaData.chatId, mediaData.uploadedBy, {
        text: '',
        type: mediaData.type,
        mediaUrl: mediaData.url,
        fileName: mediaData.fileName,
        fileSize: mediaData.fileSize,
        duration: mediaData.duration
      });

      console.log('✅ Media stored with ID:', mediaRef.id);
      return mediaRef.id;
    } catch (error) {
      console.error('❌ Error storing media:', error);
      throw error;
    }
  },

  // Get all media for a chat
  async getChatMedia(chatId: string) {
    try {
      const q = query(
        collection(db, 'media'),
        where('chatId', '==', chatId),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error getting chat media:', error);
      return [];
    }
  }
};
