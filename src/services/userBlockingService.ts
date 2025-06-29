// 🚫 USER BLOCKING SERVICE - Block and unblock users
// Prevents blocked users from sending messages and seeing status

import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface BlockedUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  blockedAt: Date;
  reason?: string;
}

export interface UserBlockingData {
  blockedUsers: string[]; // Array of blocked user IDs
  blockedBy: string[]; // Array of user IDs who blocked this user
  lastUpdated: Date;
}

class UserBlockingService {
  /**
   * Block a user
   */
  async blockUser(
    currentUserId: string,
    targetUserId: string,
    targetUserName: string,
    targetUserAvatar?: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (currentUserId === targetUserId) {
        return { success: false, error: 'Cannot block yourself' };
      }

      // Update current user's blocked list
      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        blockedUsers: arrayUnion(targetUserId),
        lastUpdated: serverTimestamp(),
      });

      // Update target user's blockedBy list
      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        blockedBy: arrayUnion(currentUserId),
        lastUpdated: serverTimestamp(),
      });

      // Create block record for detailed tracking
      const blockRef = doc(db, 'blocks', `${currentUserId}_${targetUserId}`);
      await updateDoc(blockRef, {
        blockerId: currentUserId,
        blockedUserId: targetUserId,
        blockedUserName: targetUserName,
        blockedUserAvatar: targetUserAvatar,
        blockedAt: serverTimestamp(),
        reason: reason || '',
        isActive: true,
      });

      console.log('✅ User blocked successfully:', targetUserId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      return { success: false, error: 'Failed to block user' };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update current user's blocked list
      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        blockedUsers: arrayRemove(targetUserId),
        lastUpdated: serverTimestamp(),
      });

      // Update target user's blockedBy list
      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        blockedBy: arrayRemove(currentUserId),
        lastUpdated: serverTimestamp(),
      });

      // Deactivate block record
      const blockRef = doc(db, 'blocks', `${currentUserId}_${targetUserId}`);
      await updateDoc(blockRef, {
        isActive: false,
        unblockedAt: serverTimestamp(),
      });

      console.log('✅ User unblocked successfully:', targetUserId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      return { success: false, error: 'Failed to unblock user' };
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const blockedUsers = userData.blockedUsers || [];
        return blockedUsers.includes(targetUserId);
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Check if current user is blocked by target user
   */
  async isBlockedByUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const blockedBy = userData.blockedBy || [];
        return blockedBy.includes(targetUserId);
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking if blocked by user:', error);
      return false;
    }
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(currentUserId: string): Promise<BlockedUser[]> {
    try {
      const blocksRef = collection(db, 'blocks');
      const q = query(
        blocksRef,
        where('blockerId', '==', currentUserId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const blockedUsers: BlockedUser[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        blockedUsers.push({
          userId: data.blockedUserId,
          userName: data.blockedUserName,
          userAvatar: data.blockedUserAvatar,
          blockedAt: data.blockedAt?.toDate() || new Date(),
          reason: data.reason,
        });
      });

      return blockedUsers;
    } catch (error) {
      console.error('❌ Error getting blocked users:', error);
      return [];
    }
  }

  /**
   * Check if users can communicate (neither has blocked the other)
   */
  async canCommunicate(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const [user1BlocksUser2, user2BlocksUser1] = await Promise.all([
        this.isUserBlocked(user1Id, user2Id),
        this.isUserBlocked(user2Id, user1Id),
      ]);

      return !user1BlocksUser2 && !user2BlocksUser1;
    } catch (error) {
      console.error('❌ Error checking communication status:', error);
      return false;
    }
  }

  /**
   * Filter messages based on blocking status
   */
  filterMessagesForBlockedUsers(
    messages: any[],
    currentUserId: string,
    blockedUsers: string[]
  ): any[] {
    return messages.filter(message => {
      // Hide messages from blocked users
      if (blockedUsers.includes(message.senderId)) {
        return false;
      }
      
      // Hide messages where current user is blocked by sender
      // (This would be handled by the backend in a real app)
      return true;
    });
  }

  /**
   * Get blocking status between two users
   */
  async getBlockingStatus(
    currentUserId: string,
    targetUserId: string
  ): Promise<{
    currentUserBlocked: boolean;
    blockedByTarget: boolean;
    canCommunicate: boolean;
  }> {
    try {
      const [currentUserBlocked, blockedByTarget] = await Promise.all([
        this.isUserBlocked(currentUserId, targetUserId),
        this.isBlockedByUser(currentUserId, targetUserId),
      ]);

      return {
        currentUserBlocked,
        blockedByTarget,
        canCommunicate: !currentUserBlocked && !blockedByTarget,
      };
    } catch (error) {
      console.error('❌ Error getting blocking status:', error);
      return {
        currentUserBlocked: false,
        blockedByTarget: false,
        canCommunicate: true,
      };
    }
  }

  /**
   * Report and block user (for abuse cases)
   */
  async reportAndBlockUser(
    currentUserId: string,
    targetUserId: string,
    targetUserName: string,
    reason: string,
    reportDetails?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Block the user first
      const blockResult = await this.blockUser(
        currentUserId,
        targetUserId,
        targetUserName,
        undefined,
        reason
      );

      if (!blockResult.success) {
        return blockResult;
      }

      // Create abuse report
      const reportRef = doc(db, 'reports', `${currentUserId}_${targetUserId}_${Date.now()}`);
      await updateDoc(reportRef, {
        reporterId: currentUserId,
        reportedUserId: targetUserId,
        reportedUserName: targetUserName,
        reason,
        details: reportDetails || '',
        reportedAt: serverTimestamp(),
        status: 'pending',
        type: 'user_abuse',
      });

      console.log('✅ User reported and blocked:', targetUserId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error reporting and blocking user:', error);
      return { success: false, error: 'Failed to report and block user' };
    }
  }
}

// Export singleton instance
export const userBlockingService = new UserBlockingService();
export default userBlockingService;
