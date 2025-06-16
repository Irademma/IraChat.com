// Real Chat Service for Firebase Firestore
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseSimple";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: "text" | "image" | "video" | "audio" | "file";
  mediaUrl?: string;
  mediaType?: string;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: string;
  reactions?: { [userId: string]: string };
}

export interface Chat {
  id: string;
  name?: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  isGroup: boolean;
  groupAdmin?: string;
  groupDescription?: string;
  groupAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: string;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  userId: string;
  name: string;
  avatar?: string;
  role: "admin" | "member";
  joinedAt: Date;
}

class ChatService {
  /**
   * Create a new chat between users
   */
  async createChat(
    participants: string[],
    participantNames: { [userId: string]: string },
    participantAvatars: { [userId: string]: string } = {},
    isGroup: boolean = false,
    groupName?: string,
    groupDescription?: string,
  ): Promise<string> {
    try {
      console.log("💬 Creating new chat...", {
        participants,
        isGroup,
        groupName,
      });

      const chatData: Omit<Chat, "id"> = {
        participants,
        participantNames,
        participantAvatars,
        isGroup,
        name: isGroup ? groupName : undefined,
        groupDescription: isGroup ? groupDescription : undefined,
        groupAdmin: isGroup ? participants[0] : undefined,
        unreadCount: participants.reduce(
          (acc, userId) => {
            acc[userId] = 0;
            return acc;
          },
          {} as { [userId: string]: number },
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const chatRef = await addDoc(collection(db, "chats"), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Chat created successfully:", chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      throw error;
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    text: string,
    type: "text" | "image" | "video" | "audio" | "file" = "text",
    mediaUrl?: string,
    senderAvatar?: string,
  ): Promise<string> {
    try {
      console.log("📤 Sending message...", {
        chatId,
        senderId,
        text: text.substring(0, 50),
      });

      const messageData: Omit<Message, "id"> = {
        text,
        senderId,
        senderName,
        senderAvatar,
        timestamp: new Date(),
        type,
        mediaUrl,
        isRead: false,
        isDelivered: true,
      };

      // Add message to messages subcollection
      const messageRef = await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          ...messageData,
          timestamp: serverTimestamp(),
        },
      );

      // Update chat's last message info
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: senderId,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Message sent successfully:", messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  }

  /**
   * Listen to messages in a chat
   */
  listenToMessages(
    chatId: string,
    onMessagesUpdate: (messages: Message[]) => void,
  ): () => void {
    console.log("👂 Listening to messages for chat:", chatId);

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as Message;
        });

        console.log(
          `📥 Received ${messages.length} messages for chat ${chatId}`,
        );
        onMessagesUpdate(messages);
      },
      (error) => {
        console.error("❌ Error listening to messages:", error);
      },
    );

    return unsubscribe;
  }

  /**
   * Listen to user's chats
   */
  listenToUserChats(
    userId: string,
    onChatsUpdate: (chats: Chat[]) => void,
  ): () => void {
    console.log("👂 Listening to chats for user:", userId);

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats: Chat[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastMessageAt: data.lastMessageAt?.toDate(),
          } as Chat;
        });

        console.log(`📥 Received ${chats.length} chats for user ${userId}`);
        onChatsUpdate(chats);
      },
      (error) => {
        console.error("❌ Error listening to chats:", error);
      },
    );

    return unsubscribe;
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const chatDoc = await getDoc(doc(db, "chats", chatId));

      if (!chatDoc.exists()) {
        return null;
      }

      const data = chatDoc.data();
      return {
        id: chatDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as Chat;
    } catch (error) {
      console.error("❌ Error getting chat:", error);
      return null;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      console.log("👁️ Marking messages as read...", { chatId, userId });

      const batch = writeBatch(db);

      // Get unread messages
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(
        messagesRef,
        where("senderId", "!=", userId),
        where("isRead", "==", false),
      );

      const snapshot = await getDocs(q);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      // Reset unread count for this user
      batch.update(doc(db, "chats", chatId), {
        [`unreadCount.${userId}`]: 0,
      });

      await batch.commit();
      console.log("✅ Messages marked as read");
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
      console.log("✅ Message deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    chatId: string,
    messageId: string,
    userId: string,
    reaction: string,
  ): Promise<void> {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        [`reactions.${userId}`]: reaction,
      });
      console.log("✅ Reaction added successfully");
    } catch (error) {
      console.error("❌ Error adding reaction:", error);
      throw error;
    }
  }

  /**
   * Update chat info (for groups)
   */
  async updateChatInfo(
    chatId: string,
    updates: {
      name?: string;
      groupDescription?: string;
      groupAvatar?: string;
    },
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Chat info updated successfully");
    } catch (error) {
      console.error("❌ Error updating chat info:", error);
      throw error;
    }
  }

  /**
   * Add member to group chat
   */
  async addMemberToGroup(
    chatId: string,
    userId: string,
    userName: string,
    userAvatar?: string,
  ): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        throw new Error("Chat not found");
      }

      const chatData = chatDoc.data() as Chat;

      if (!chatData.isGroup) {
        throw new Error("Cannot add member to non-group chat");
      }

      const updatedParticipants = [...chatData.participants, userId];
      const updatedParticipantNames = {
        ...chatData.participantNames,
        [userId]: userName,
      };
      const updatedParticipantAvatars = { ...chatData.participantAvatars };
      if (userAvatar) {
        updatedParticipantAvatars[userId] = userAvatar;
      }

      await updateDoc(chatRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantAvatars: updatedParticipantAvatars,
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Member added to group successfully");
    } catch (error) {
      console.error("❌ Error adding member to group:", error);
      throw error;
    }
  }

  /**
   * Remove member from group chat
   */
  async removeMemberFromGroup(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        throw new Error("Chat not found");
      }

      const chatData = chatDoc.data() as Chat;

      if (!chatData.isGroup) {
        throw new Error("Cannot remove member from non-group chat");
      }

      const updatedParticipants = chatData.participants.filter(
        (p) => p !== userId,
      );
      const updatedParticipantNames = { ...chatData.participantNames };
      delete updatedParticipantNames[userId];

      const updatedParticipantAvatars = { ...chatData.participantAvatars };
      delete updatedParticipantAvatars[userId];

      const updatedUnreadCount = { ...chatData.unreadCount };
      delete updatedUnreadCount[userId];

      await updateDoc(chatRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantAvatars: updatedParticipantAvatars,
        unreadCount: updatedUnreadCount,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Member removed from group successfully");
    } catch (error) {
      console.error("❌ Error removing member from group:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
