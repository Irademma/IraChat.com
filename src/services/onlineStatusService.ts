// Real Online Status Service for Firebase
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebaseSimple";

interface OnlineUser {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  phoneNumber?: string;
}

class OnlineStatusService {
  private onlineUsers = new Map<string, OnlineUser>();
  private listeners = new Map<string, () => void>();

  /**
   * Update user's online status
   */
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      if (!db) {
        console.warn("⚠️ Firestore not available for online status update");
        return;
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update local cache
      this.onlineUsers.set(userId, {
        userId,
        isOnline,
        lastSeen: new Date(),
      });

      console.log(`✅ Updated online status for user ${userId}: ${isOnline}`);
    } catch (error) {
      console.error("❌ Error updating online status:", error);
    }
  }

  /**
   * Get online status for a specific user
   */
  async getUserOnlineStatus(userId: string): Promise<OnlineUser | null> {
    try {
      // Check cache first
      if (this.onlineUsers.has(userId)) {
        return this.onlineUsers.get(userId) || null;
      }

      if (!db) {
        console.warn("⚠️ Firestore not available for online status check");
        return null;
      }

      // Fetch from Firestore if not in cache
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const onlineUser: OnlineUser = {
          userId,
          isOnline: userData.isOnline || false,
          lastSeen: userData.lastSeen?.toDate() || new Date(),
          phoneNumber: userData.phoneNumber,
        };

        // Cache the result
        this.onlineUsers.set(userId, onlineUser);
        return onlineUser;
      }

      return null;
    } catch (error) {
      console.error("❌ Error getting online status:", error);
      return null;
    }
  }

  /**
   * Get online status for multiple users by phone numbers
   */
  async getOnlineStatusByPhoneNumbers(
    phoneNumbers: string[],
  ): Promise<Map<string, OnlineUser>> {
    const results = new Map<string, OnlineUser>();

    try {
      if (!db || phoneNumbers.length === 0) {
        return results;
      }

      // Query users by phone numbers in batches (Firestore limit is 10)
      const batchSize = 10;
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);

        const usersQuery = query(
          collection(db, "users"),
          where("phoneNumber", "in", batch),
        );

        const querySnapshot = await getDocs(usersQuery);

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const onlineUser: OnlineUser = {
            userId: doc.id,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen?.toDate() || new Date(),
            phoneNumber: userData.phoneNumber,
          };

          // Cache the result
          this.onlineUsers.set(doc.id, onlineUser);
          results.set(userData.phoneNumber, onlineUser);
        });
      }

      console.log(
        `✅ Retrieved online status for ${results.size} users out of ${phoneNumbers.length} requested`,
      );
    } catch (error) {
      console.error("❌ Error getting online status by phone numbers:", error);
    }

    return results;
  }

  /**
   * Listen to real-time online status updates for a user
   */
  listenToUserStatus(
    userId: string,
    callback: (onlineUser: OnlineUser | null) => void,
  ): () => void {
    try {
      if (!db) {
        console.warn("⚠️ Firestore not available for online status listener");
        return () => {};
      }

      const userRef = doc(db, "users", userId);
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const onlineUser: OnlineUser = {
              userId,
              isOnline: userData.isOnline || false,
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              phoneNumber: userData.phoneNumber,
            };

            // Update cache
            this.onlineUsers.set(userId, onlineUser);
            callback(onlineUser);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error("❌ Error in online status listener:", error);
          callback(null);
        },
      );

      // Store listener for cleanup
      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("❌ Error setting up online status listener:", error);
      return () => {};
    }
  }

  /**
   * Set user as online (call when app becomes active)
   */
  async setUserOnline(userId: string): Promise<void> {
    await this.updateUserStatus(userId, true);
  }

  /**
   * Set user as offline (call when app goes to background)
   */
  async setUserOffline(userId: string): Promise<void> {
    await this.updateUserStatus(userId, false);
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.onlineUsers.clear();
    console.log("🧹 Online status service cleaned up");
  }

  /**
   * Check if a user is currently online (with cache)
   */
  isUserOnline(userId: string): boolean {
    const user = this.onlineUsers.get(userId);
    if (!user) return false;

    // Consider user offline if last seen was more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return user.isOnline && user.lastSeen > fiveMinutesAgo;
  }

  /**
   * Get formatted last seen text
   */
  getLastSeenText(userId: string): string {
    const user = this.onlineUsers.get(userId);
    if (!user) return "Unknown";

    if (this.isUserOnline(userId)) {
      return "Online";
    }

    const now = new Date();
    const diffMs = now.getTime() - user.lastSeen.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return "Last seen long ago";
  }
}

// Export singleton instance
export const onlineStatusService = new OnlineStatusService();

// Export types
export type { OnlineUser };
