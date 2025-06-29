import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  bio?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  // Privacy settings
  showLastSeen: boolean;
  showOnlineStatus: boolean;
  allowUnknownMessages: boolean;
  // Verification
  isVerified: boolean;
  verificationBadge?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  status?: string;
  showLastSeen?: boolean;
  showOnlineStatus?: boolean;
  allowUnknownMessages?: boolean;
}

class RealUserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      const user: UserProfile = {
        id: userDoc.id,
        ...userData,
        lastSeen: userData.lastSeen?.toDate() || new Date(),
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      } as UserProfile;

      return { success: true, user };
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: UpdateUserProfileData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Check if user exists
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      // If username is being updated, check if it's available
      if (updates.username) {
        const isAvailable = await this.isUsernameAvailable(updates.username, userId);
        if (!isAvailable) {
          return { success: false, error: 'Username is already taken' };
        }
      }

      // Update user document
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User profile updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      // If no users found with this username, it's available
      if (querySnapshot.empty) {
        return true;
      }

      // If excluding a user ID (for updates), check if the only match is the excluded user
      if (excludeUserId) {
        const matches = querySnapshot.docs.filter(doc => doc.id !== excludeUserId);
        return matches.length === 0;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating online status:', error);
      return { success: false, error: 'Failed to update online status' };
    }
  }

  /**
   * Search users by name or username
   */
  async searchUsers(query: string, limit: number = 20): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
    try {
      const usersRef = collection(db, 'users');
      
      // Search by name (case-insensitive)
      const nameQuery = query.toLowerCase();
      const usersSnapshot = await getDocs(usersRef);
      
      const matchingUsers: UserProfile[] = [];
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const user = {
          id: doc.id,
          ...userData,
          lastSeen: userData.lastSeen?.toDate() || new Date(),
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        } as UserProfile;

        // Check if name or username matches
        const nameMatch = user.name?.toLowerCase().includes(nameQuery);
        const usernameMatch = user.username?.toLowerCase().includes(nameQuery);
        
        if (nameMatch || usernameMatch) {
          matchingUsers.push(user);
        }
      });

      // Sort by relevance (exact matches first, then partial matches)
      matchingUsers.sort((a, b) => {
        const aExactName = a.name?.toLowerCase() === nameQuery;
        const bExactName = b.name?.toLowerCase() === nameQuery;
        const aExactUsername = a.username?.toLowerCase() === nameQuery;
        const bExactUsername = b.username?.toLowerCase() === nameQuery;

        if (aExactName || aExactUsername) return -1;
        if (bExactName || bExactUsername) return 1;
        return 0;
      });

      return { 
        success: true, 
        users: matchingUsers.slice(0, limit) 
      };
    } catch (error) {
      console.error('❌ Error searching users:', error);
      return { success: false, error: 'Failed to search users' };
    }
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateUser(
    userId: string,
    userData: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new user
        await setDoc(userRef, {
          id: userId,
          isOnline: true,
          showLastSeen: true,
          showOnlineStatus: true,
          allowUnknownMessages: true,
          isVerified: false,
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        });
      }

      console.log('✅ User profile created/updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error creating/updating user:', error);
      return { success: false, error: 'Failed to create/update user' };
    }
  }

  /**
   * Get multiple users by IDs
   */
  async getUsersByIds(userIds: string[]): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
    try {
      const users: UserProfile[] = [];
      
      // Fetch users in batches to avoid Firestore limitations
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        
        const userPromises = batch.map(async (userId) => {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: userDoc.id,
              ...userData,
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as UserProfile;
          }
          return null;
        });

        const batchUsers = await Promise.all(userPromises);
        users.push(...batchUsers.filter(user => user !== null) as UserProfile[]);
      }

      return { success: true, users };
    } catch (error) {
      console.error('❌ Error getting users by IDs:', error);
      return { success: false, error: 'Failed to get users' };
    }
  }
}

export const realUserService = new RealUserService();
