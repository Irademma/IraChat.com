import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { AppState, AppStateStatus } from "react-native";
import { firestore } from "./firebaseSimple";

export interface UserStatus {
  isOnline: boolean;
  lastSeen: Date;
  status?: string; // Custom status message
  isTyping?: { [chatId: string]: boolean };
}

class StatusService {
  private currentUserId: string | null = null;
  private statusUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;

  /**
   * Initialize status tracking for a user
   */
  async initializeStatus(userId: string): Promise<void> {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      this.currentUserId = userId;

      // Set user as online
      await this.setOnlineStatus(true);

      // Start periodic status updates
      this.startStatusUpdates();

      // Listen to app state changes
      this.setupAppStateListener();

      console.log("✅ Status tracking initialized for user:", userId);
    } catch (error) {
      console.error("❌ Error initializing status:", error);
    }
  }

  /**
   * Set user online/offline status
   */
  async setOnlineStatus(isOnline: boolean): Promise<void> {
    try {
      if (!firestore || !this.currentUserId) return;

      const userRef = doc(firestore, "users", this.currentUserId);

      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`📡 User status updated: ${isOnline ? "online" : "offline"}`);
    } catch (error) {
      console.error("❌ Error updating online status:", error);
    }
  }

  /**
   * Update custom status message
   */
  async updateStatusMessage(status: string): Promise<void> {
    try {
      if (!firestore || !this.currentUserId) return;

      const userRef = doc(firestore, "users", this.currentUserId);

      await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Status message updated:", status);
    } catch (error) {
      console.error("❌ Error updating status message:", error);
    }
  }

  /**
   * Set typing indicator for a chat
   */
  async setTypingStatus(chatId: string, isTyping: boolean): Promise<void> {
    try {
      if (!firestore || !this.currentUserId) return;

      const userRef = doc(firestore, "users", this.currentUserId);

      await updateDoc(userRef, {
        [`isTyping.${chatId}`]: isTyping,
        updatedAt: serverTimestamp(),
      });

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          this.setTypingStatus(chatId, false);
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Error updating typing status:", error);
    }
  }

  /**
   * Listen to a user's status
   */
  listenToUserStatus(
    userId: string,
    callback: (status: UserStatus) => void,
  ): () => void {
    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const userRef = doc(firestore, "users", userId);

      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const status: UserStatus = {
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen?.toDate() || new Date(),
            status: data.status,
            isTyping: data.isTyping || {},
          };
          callback(status);
        }
      });
    } catch (error) {
      console.error("❌ Error listening to user status:", error);
      return () => {};
    }
  }

  /**
   * Start periodic status updates to maintain online presence
   */
  private startStatusUpdates(): void {
    // Update status every 30 seconds to maintain online presence
    this.statusUpdateInterval = setInterval(() => {
      if (this.currentUserId) {
        this.setOnlineStatus(true);
      }
    }, 30000);
  }

  /**
   * Setup app state listener to handle background/foreground
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          // App came to foreground
          this.setOnlineStatus(true);
          this.startStatusUpdates();
        } else if (
          nextAppState === "background" ||
          nextAppState === "inactive"
        ) {
          // App went to background
          this.setOnlineStatus(false);
          this.stopStatusUpdates();
        }
      },
    );
  }

  /**
   * Stop status updates
   */
  private stopStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  /**
   * Cleanup status tracking
   */
  async cleanup(): Promise<void> {
    try {
      // Set user offline
      if (this.currentUserId) {
        await this.setOnlineStatus(false);
      }

      // Stop updates
      this.stopStatusUpdates();

      // Remove app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      this.currentUserId = null;

      console.log("✅ Status tracking cleaned up");
    } catch (error) {
      console.error("❌ Error cleaning up status:", error);
    }
  }

  /**
   * Format last seen time for display
   */
  formatLastSeen(lastSeen: Date, isOnline: boolean): string {
    if (isOnline) {
      return "Online";
    }

    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return lastSeen.toLocaleDateString();
    }
  }

  /**
   * Get typing users in a chat
   */
  getTypingUsers(
    chatParticipants: string[],
    userStatuses: { [userId: string]: UserStatus },
    chatId: string,
  ): string[] {
    return chatParticipants.filter((userId) => {
      const status = userStatuses[userId];
      return status?.isTyping?.[chatId] === true;
    });
  }

  /**
   * Batch listen to multiple users' statuses
   */
  listenToMultipleUserStatuses(
    userIds: string[],
    callback: (statuses: { [userId: string]: UserStatus }) => void,
  ): () => void {
    const unsubscribers: (() => void)[] = [];
    const statuses: { [userId: string]: UserStatus } = {};

    userIds.forEach((userId) => {
      const unsubscribe = this.listenToUserStatus(userId, (status) => {
        statuses[userId] = status;
        callback({ ...statuses });
      });
      unsubscribers.push(unsubscribe);
    });

    // Return cleanup function
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }

  /**
   * Check if user was recently online (within last 5 minutes)
   */
  isRecentlyOnline(lastSeen: Date, isOnline: boolean): boolean {
    if (isOnline) return true;

    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    return diffMins <= 5;
  }

  /**
   * Get online status indicator color
   */
  getStatusColor(isOnline: boolean, lastSeen: Date): string {
    if (isOnline) {
      return "#4CAF50"; // Green for online
    } else if (this.isRecentlyOnline(lastSeen, false)) {
      return "#FF9800"; // Orange for recently online
    } else {
      return "#9E9E9E"; // Gray for offline
    }
  }
}

export const statusService = new StatusService();
export default statusService;
