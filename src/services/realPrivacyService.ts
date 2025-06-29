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
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface PrivacySettings {
  userId: string;
  lastSeen: "everyone" | "contacts" | "nobody";
  profilePhoto: "everyone" | "contacts" | "nobody";
  status: "everyone" | "contacts" | "nobody";
  about: "everyone" | "contacts" | "nobody";
  readReceipts: boolean;
  groupsAddMe: "everyone" | "contacts" | "nobody";
  liveLocation: boolean;
  callsFrom: "everyone" | "contacts" | "nobody";
  blockedContacts: string[];
  twoStepVerification: boolean;
  disappearingMessages: boolean;
  screenshotNotification: boolean;
  onlineStatus: "everyone" | "contacts" | "nobody";
  forwardedMessages: boolean;
  autoDownloadMedia: boolean;
  securityNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedContact {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUserName: string;
  blockedUserAvatar?: string;
  reason?: string;
  blockedAt: Date;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'password_change' | 'privacy_change' | 'block' | 'unblock';
  description: string;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  timestamp: Date;
}

const defaultPrivacySettings: Omit<PrivacySettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  lastSeen: "contacts",
  profilePhoto: "everyone",
  status: "everyone",
  about: "everyone",
  readReceipts: true,
  groupsAddMe: "contacts",
  liveLocation: false,
  callsFrom: "contacts",
  blockedContacts: [],
  twoStepVerification: false,
  disappearingMessages: false,
  screenshotNotification: true,
  onlineStatus: "everyone",
  forwardedMessages: true,
  autoDownloadMedia: true,
  securityNotifications: true,
};

class RealPrivacyService {
  /**
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: string): Promise<{ success: boolean; settings?: PrivacySettings; error?: string }> {
    try {
      const settingsRef = doc(db, 'privacy_settings', userId);
      const settingsDoc = await getDoc(settingsRef);

      if (!settingsDoc.exists()) {
        // Create default settings if none exist
        const newSettings: PrivacySettings = {
          userId,
          ...defaultPrivacySettings,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(settingsRef, {
          ...newSettings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return { success: true, settings: newSettings };
      }

      const settingsData = settingsDoc.data();
      const settings: PrivacySettings = {
        ...settingsData,
        createdAt: settingsData.createdAt?.toDate() || new Date(),
        updatedAt: settingsData.updatedAt?.toDate() || new Date(),
      } as PrivacySettings;

      return { success: true, settings };
    } catch (error) {
      console.error('❌ Error getting privacy settings:', error);
      return { success: false, error: 'Failed to get privacy settings' };
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    updates: Partial<Omit<PrivacySettings, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settingsRef = doc(db, 'privacy_settings', userId);
      
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Log security event
      await this.logSecurityEvent(userId, 'privacy_change', 'Privacy settings updated');

      console.log('✅ Privacy settings updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating privacy settings:', error);
      return { success: false, error: 'Failed to update privacy settings' };
    }
  }

  /**
   * Block a user
   */
  async blockUser(
    userId: string,
    blockedUserId: string,
    blockedUserName: string,
    blockedUserAvatar?: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Add to blocked contacts collection
      const blockedContactRef = collection(db, 'blocked_contacts');
      await addDoc(blockedContactRef, {
        userId,
        blockedUserId,
        blockedUserName,
        blockedUserAvatar,
        reason,
        blockedAt: serverTimestamp(),
      });

      // Update privacy settings to include blocked user
      const settingsRef = doc(db, 'privacy_settings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const currentSettings = settingsDoc.data();
        const updatedBlockedContacts = [...(currentSettings.blockedContacts || []), blockedUserId];
        
        await updateDoc(settingsRef, {
          blockedContacts: updatedBlockedContacts,
          updatedAt: serverTimestamp(),
        });
      }

      // Log security event
      await this.logSecurityEvent(userId, 'block', `Blocked user: ${blockedUserName}`);

      console.log('✅ User blocked successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      return { success: false, error: 'Failed to block user' };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, blockedUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove from blocked contacts collection
      const blockedContactsRef = collection(db, 'blocked_contacts');
      const q = query(
        blockedContactsRef,
        where('userId', '==', userId),
        where('blockedUserId', '==', blockedUserId)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });

      // Update privacy settings to remove blocked user
      const settingsRef = doc(db, 'privacy_settings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const currentSettings = settingsDoc.data();
        const updatedBlockedContacts = (currentSettings.blockedContacts || []).filter(
          (id: string) => id !== blockedUserId
        );
        
        await updateDoc(settingsRef, {
          blockedContacts: updatedBlockedContacts,
          updatedAt: serverTimestamp(),
        });
      }

      // Log security event
      await this.logSecurityEvent(userId, 'unblock', `Unblocked user: ${blockedUserId}`);

      console.log('✅ User unblocked successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      return { success: false, error: 'Failed to unblock user' };
    }
  }

  /**
   * Get blocked contacts
   */
  async getBlockedContacts(userId: string): Promise<{ success: boolean; contacts?: BlockedContact[]; error?: string }> {
    try {
      const blockedContactsRef = collection(db, 'blocked_contacts');
      const q = query(blockedContactsRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      const contacts: BlockedContact[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        blockedAt: doc.data().blockedAt?.toDate() || new Date(),
      })) as BlockedContact[];

      return { success: true, contacts };
    } catch (error) {
      console.error('❌ Error getting blocked contacts:', error);
      return { success: false, error: 'Failed to get blocked contacts' };
    }
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const blockedContactsRef = collection(db, 'blocked_contacts');
      const q = query(
        blockedContactsRef,
        where('userId', '==', userId),
        where('blockedUserId', '==', targetUserId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Enable two-step verification
   */
  async enableTwoStepVerification(userId: string, pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you'd hash the PIN
      const settingsRef = doc(db, 'privacy_settings', userId);
      
      await updateDoc(settingsRef, {
        twoStepVerification: true,
        twoStepPin: pin, // In production, this should be hashed
        updatedAt: serverTimestamp(),
      });

      // Log security event
      await this.logSecurityEvent(userId, 'privacy_change', 'Two-step verification enabled');

      console.log('✅ Two-step verification enabled');
      return { success: true };
    } catch (error) {
      console.error('❌ Error enabling two-step verification:', error);
      return { success: false, error: 'Failed to enable two-step verification' };
    }
  }

  /**
   * Disable two-step verification
   */
  async disableTwoStepVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const settingsRef = doc(db, 'privacy_settings', userId);
      
      await updateDoc(settingsRef, {
        twoStepVerification: false,
        twoStepPin: null,
        updatedAt: serverTimestamp(),
      });

      // Log security event
      await this.logSecurityEvent(userId, 'privacy_change', 'Two-step verification disabled');

      console.log('✅ Two-step verification disabled');
      return { success: true };
    } catch (error) {
      console.error('❌ Error disabling two-step verification:', error);
      return { success: false, error: 'Failed to disable two-step verification' };
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(userId: string, limit: number = 50): Promise<{ success: boolean; events?: SecurityEvent[]; error?: string }> {
    try {
      const eventsRef = collection(db, 'security_events');
      const q = query(
        eventsRef,
        where('userId', '==', userId),
        // orderBy('timestamp', 'desc'),
        // limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const events: SecurityEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SecurityEvent[];

      // Sort by timestamp descending
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return { success: true, events: events.slice(0, limit) };
    } catch (error) {
      console.error('❌ Error getting security events:', error);
      return { success: false, error: 'Failed to get security events' };
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    userId: string,
    eventType: SecurityEvent['eventType'],
    description: string,
    additionalData?: {
      ipAddress?: string;
      deviceInfo?: string;
      location?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const eventsRef = collection(db, 'security_events');
      
      await addDoc(eventsRef, {
        userId,
        eventType,
        description,
        ipAddress: additionalData?.ipAddress,
        deviceInfo: additionalData?.deviceInfo,
        location: additionalData?.location,
        timestamp: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error logging security event:', error);
      return { success: false, error: 'Failed to log security event' };
    }
  }

  /**
   * Clear all data (for account deletion)
   */
  async clearAllUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete privacy settings
      const settingsRef = doc(db, 'privacy_settings', userId);
      await deleteDoc(settingsRef);

      // Delete blocked contacts
      const blockedContactsRef = collection(db, 'blocked_contacts');
      const blockedQuery = query(blockedContactsRef, where('userId', '==', userId));
      const blockedSnapshot = await getDocs(blockedQuery);
      
      blockedSnapshot.docs.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });

      // Delete security events
      const eventsRef = collection(db, 'security_events');
      const eventsQuery = query(eventsRef, where('userId', '==', userId));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      eventsSnapshot.docs.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });

      console.log('✅ All user privacy data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
      return { success: false, error: 'Failed to clear user data' };
    }
  }
}

export const realPrivacyService = new RealPrivacyService();
