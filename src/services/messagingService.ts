import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "./firebaseSimple";
import { storageService } from "./storageService";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text?: string;
  media?: {
    type: "image" | "video" | "audio" | "document";
    url: string;
    thumbnail?: string;
    caption?: string;
    fileName?: string;
    size?: number;
    duration?: number; // for audio/video
  };
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
  reactions?: {
    [emoji: string]: string[]; // emoji -> array of user IDs
  };
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  isEdited?: boolean;
  editedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  isForwarded?: boolean;
  forwardedFrom?: string;
}

export interface Chat {
  id: string;
  type: "individual" | "group";
  name: string;
  avatar?: string;
  participants: string[];
  admins?: string[]; // for groups
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
    type: "text" | "image" | "video" | "audio" | "document";
  };
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
  isTyping?: { [userId: string]: boolean };
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    muteUntil?: Date;
    disappearingMessages?: number; // seconds
    wallpaper?: string;
  };
}

class MessagingService {
  /**
   * Create a new individual chat
   */
  async createIndividualChat(
    currentUserId: string,
    otherUserId: string,
  ): Promise<string> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      // Check if chat already exists
      const existingChatQuery = query(
        collection(firestore, "chats"),
        where("type", "==", "individual"),
        where("participants", "array-contains", currentUserId),
      );

      const existingChats = await getDocs(existingChatQuery);
      const existingChat = existingChats.docs.find((doc) => {
        const data = doc.data();
        return data.participants.includes(otherUserId);
      });

      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const chatData: Omit<Chat, "id"> = {
        type: "individual",
        name: "", // Will be set based on contact name
        participants: [currentUserId, otherUserId],
        lastMessageTime: new Date(),
        unreadCount: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const chatRef = await addDoc(collection(firestore, "chats"), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
      });

      console.log("✅ Created new individual chat:", chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error("❌ Error creating individual chat:", error);
      throw error;
    }
  }

  /**
   * Create a new group chat
   */
  async createGroupChat(
    currentUserId: string,
    participants: string[],
    name: string,
    avatar?: string,
  ): Promise<string> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const chatData: Omit<Chat, "id"> = {
        type: "group",
        name,
        avatar,
        participants: [currentUserId, ...participants],
        admins: [currentUserId],
        lastMessageTime: new Date(),
        unreadCount: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const chatRef = await addDoc(collection(firestore, "chats"), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
      });

      console.log("✅ Created new group chat:", chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error("❌ Error creating group chat:", error);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    text: string,
    replyTo?: Message["replyTo"],
  ): Promise<string> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const messageData: Omit<Message, "id"> = {
        chatId,
        senderId,
        senderName,
        text,
        replyTo,
        timestamp: new Date(),
        status: "sending",
      };

      const messageRef = await addDoc(collection(firestore, "messages"), {
        ...messageData,
        timestamp: serverTimestamp(),
      });

      // Update chat's last message
      await this.updateChatLastMessage(chatId, {
        text,
        senderId,
        timestamp: new Date(),
        type: "text",
      });

      console.log("✅ Sent text message:", messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error("❌ Error sending text message:", error);
      throw error;
    }
  }

  /**
   * Send a media message
   */
  async sendMediaMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    file: Blob | File,
    type: "image" | "video" | "audio" | "document",
    caption?: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      // Upload media to storage
      const mediaResult = await storageService.uploadChatMedia(
        senderId,
        file,
        type === "image"
          ? "images"
          : type === "video"
            ? "videos"
            : type === "audio"
              ? "audio"
              : "documents",
        onProgress ? (progress) => onProgress(progress.progress) : undefined,
      );

      const messageData: Omit<Message, "id"> = {
        chatId,
        senderId,
        senderName,
        media: {
          type,
          url: mediaResult.url,
          caption,
          fileName: file instanceof File ? file.name : undefined,
          size: mediaResult.metadata.size,
        },
        timestamp: new Date(),
        status: "sending",
      };

      const messageRef = await addDoc(collection(firestore, "messages"), {
        ...messageData,
        timestamp: serverTimestamp(),
      });

      // Update chat's last message
      await this.updateChatLastMessage(chatId, {
        text: caption || `📎 ${type}`,
        senderId,
        timestamp: new Date(),
        type,
      });

      console.log("✅ Sent media message:", messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error("❌ Error sending media message:", error);
      throw error;
    }
  }

  /**
   * Listen to messages in a chat
   */
  listenToMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
  ): () => void {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const messagesQuery = query(
        collection(firestore, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp", "desc"),
      );

      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];

        callback(messages);
      });
    } catch (error) {
      console.error("❌ Error listening to messages:", error);
      return () => {};
    }
  }

  /**
   * Listen to user's chats
   */
  listenToChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const chatsQuery = query(
        collection(firestore, "chats"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageTime", "desc"),
      );

      return onSnapshot(chatsQuery, (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Chat[];

        callback(chats);
      });
    } catch (error) {
      console.error("❌ Error listening to chats:", error);
      return () => {};
    }
  }

  /**
   * Update chat's last message
   */
  private async updateChatLastMessage(
    chatId: string,
    lastMessage: Chat["lastMessage"],
  ): Promise<void> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      await updateDoc(doc(firestore, "chats", chatId), {
        lastMessage,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ Error updating chat last message:", error);
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      // Reset unread count for this user
      await updateDoc(doc(firestore, "chats", chatId), {
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const messageRef = doc(firestore, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const reactions = data.reactions || {};

        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }

        if (!reactions[emoji].includes(userId)) {
          reactions[emoji].push(userId);
        }

        await updateDoc(messageRef, { reactions });
      }
    } catch (error) {
      console.error("❌ Error adding reaction:", error);
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const messageRef = doc(firestore, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const reactions = data.reactions || {};

        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].filter(
            (id: string) => id !== userId,
          );

          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        }

        await updateDoc(messageRef, { reactions });
      }
    } catch (error) {
      console.error("❌ Error removing reaction:", error);
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;
