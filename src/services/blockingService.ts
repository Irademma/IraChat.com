// Blocking Service for User Management
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseSimple";

export interface BlockedUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  blockedAt: Date;
}

/**
 * Block a user
 */
export const blockUser = async (
  currentUserId: string,
  targetUserId: string,
  targetUserName: string,
  targetUserAvatar?: string
): Promise<void> => {
  try {
    console.log(`🚫 Blocking user ${targetUserId}...`);

    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);

    const blockedUser: BlockedUser = {
      userId: targetUserId,
      userName: targetUserName,
      userAvatar: targetUserAvatar,
      blockedAt: new Date(),
    };

    if (userDoc.exists()) {
      // Update existing user document
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(blockedUser),
      });
    } else {
      // Create new user document with blocked users
      await setDoc(userRef, {
        blockedUsers: [blockedUser],
      });
    }

    console.log(`✅ User ${targetUserId} blocked successfully`);
  } catch (error) {
    console.error("❌ Error blocking user:", error);
    throw error;
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  try {
    console.log(`✅ Unblocking user ${targetUserId}...`);

    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const blockedUsers = userData.blockedUsers || [];
      
      // Find and remove the blocked user
      const updatedBlockedUsers = blockedUsers.filter(
        (user: BlockedUser) => user.userId !== targetUserId
      );

      await updateDoc(userRef, {
        blockedUsers: updatedBlockedUsers,
      });
    }

    console.log(`✅ User ${targetUserId} unblocked successfully`);
  } catch (error) {
    console.error("❌ Error unblocking user:", error);
    throw error;
  }
};

/**
 * Check if a user is blocked
 */
export const isUserBlocked = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const blockedUsers = userData.blockedUsers || [];
      
      return blockedUsers.some((user: BlockedUser) => user.userId === targetUserId);
    }

    return false;
  } catch (error) {
    console.error("❌ Error checking if user is blocked:", error);
    return false;
  }
};

/**
 * Get all blocked users
 */
export const getBlockedUsers = async (currentUserId: string): Promise<BlockedUser[]> => {
  try {
    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.blockedUsers || [];
    }

    return [];
  } catch (error) {
    console.error("❌ Error getting blocked users:", error);
    return [];
  }
};

/**
 * Check if current user is blocked by another user
 */
export const isBlockedByUser = async (
  currentUserId: string,
  otherUserId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", otherUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const blockedUsers = userData.blockedUsers || [];
      
      return blockedUsers.some((user: BlockedUser) => user.userId === currentUserId);
    }

    return false;
  } catch (error) {
    console.error("❌ Error checking if blocked by user:", error);
    return false;
  }
};

export default {
  blockUser,
  unblockUser,
  isUserBlocked,
  getBlockedUsers,
  isBlockedByUser,
};
