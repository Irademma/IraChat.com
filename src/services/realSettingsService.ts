// ⚙️ REAL SETTINGS SERVICE - Complete app settings and preferences
// User profile management, privacy settings, notifications, and app preferences

import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth';
import { db, storage, auth } from './firebaseSimple';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  // Profile settings
  displayName: string;
  bio?: string;
  avatar?: string;
  phoneNumber: string;
  email?: string;
  
  // Privacy settings
  profileVisibility: 'everyone' | 'contacts' | 'nobody';
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
  statusVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceiptsEnabled: boolean;
  
  // Notification settings
  messageNotifications: boolean;
  callNotifications: boolean;
  groupNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationPreview: boolean;
  
  // Chat settings
  enterToSend: boolean;
  fontSize: 'small' | 'medium' | 'large';
  chatWallpaper?: string;
  autoDownloadMedia: 'never' | 'wifi' | 'always';
  
  // Security settings
  twoFactorEnabled: boolean;
  fingerprintLockEnabled: boolean;
  autoLockTime: number; // in minutes
  
  // App preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // Backup settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  includeVideos: boolean;
  
  // Advanced settings
  keepChatArchived: boolean;
  showSecurityNotifications: boolean;
  
  // Timestamps
  updatedAt: Date;
}

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
  email?: string;
}

class RealSettingsService {
  private readonly SETTINGS_STORAGE_KEY = 'user_settings';

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          // Profile settings
          displayName: userData.name || userData.displayName || '',
          bio: userData.bio || '',
          avatar: userData.avatar || '',
          phoneNumber: userData.phoneNumber || '',
          email: userData.email || '',
          
          // Privacy settings (with defaults)
          profileVisibility: userData.settings?.profileVisibility || 'everyone',
          lastSeenVisibility: userData.settings?.lastSeenVisibility || 'everyone',
          profilePhotoVisibility: userData.settings?.profilePhotoVisibility || 'everyone',
          statusVisibility: userData.settings?.statusVisibility || 'everyone',
          readReceiptsEnabled: userData.settings?.readReceiptsEnabled ?? true,
          
          // Notification settings
          messageNotifications: userData.settings?.messageNotifications ?? true,
          callNotifications: userData.settings?.callNotifications ?? true,
          groupNotifications: userData.settings?.groupNotifications ?? true,
          soundEnabled: userData.settings?.soundEnabled ?? true,
          vibrationEnabled: userData.settings?.vibrationEnabled ?? true,
          notificationPreview: userData.settings?.notificationPreview ?? true,
          
          // Chat settings
          enterToSend: userData.settings?.enterToSend ?? false,
          fontSize: userData.settings?.fontSize || 'medium',
          chatWallpaper: userData.settings?.chatWallpaper,
          autoDownloadMedia: userData.settings?.autoDownloadMedia || 'wifi',
          
          // Security settings
          twoFactorEnabled: userData.settings?.twoFactorEnabled ?? false,
          fingerprintLockEnabled: userData.settings?.fingerprintLockEnabled ?? false,
          autoLockTime: userData.settings?.autoLockTime || 5,
          
          // App preferences
          theme: userData.settings?.theme || 'auto',
          language: userData.settings?.language || 'en',
          
          // Backup settings
          autoBackup: userData.settings?.autoBackup ?? true,
          backupFrequency: userData.settings?.backupFrequency || 'weekly',
          includeVideos: userData.settings?.includeVideos ?? false,
          
          // Advanced settings
          keepChatArchived: userData.settings?.keepChatArchived ?? true,
          showSecurityNotifications: userData.settings?.showSecurityNotifications ?? true,
          
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare settings update
      const settingsUpdate: any = {};
      Object.keys(settings).forEach(key => {
        if (key !== 'updatedAt' && settings[key as keyof UserSettings] !== undefined) {
          settingsUpdate[`settings.${key}`] = settings[key as keyof UserSettings];
        }
      });
      
      // Update in Firebase
      await updateDoc(userRef, {
        ...settingsUpdate,
        updatedAt: serverTimestamp(),
      });
      
      // Cache settings locally
      await this.cacheSettings(userId, settings);
      
      console.log('✅ User settings updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating user settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Update in Firebase
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      });
      
      // Update Firebase Auth profile if needed
      if (auth.currentUser && (profileData.displayName || profileData.avatar)) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
          photoURL: profileData.avatar,
        });
      }
      
      console.log('✅ User profile updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    userId: string,
    imageUri: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('📤 Uploading profile picture...');
      
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profiles/${fileName}`);
      
      // Upload file
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with new avatar
      await this.updateUserProfile(userId, { avatar: downloadURL });
      
      console.log('✅ Profile picture uploaded successfully');
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      return { success: false, error: 'Failed to upload profile picture' };
    }
  }

  /**
   * Change profile picture
   */
  async changeProfilePicture(userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        return await this.uploadProfilePicture(userId, result.assets[0].uri);
      }
      
      return { success: false, error: 'No image selected' };
    } catch (error) {
      console.error('❌ Error changing profile picture:', error);
      return { success: false, error: 'Failed to change profile picture' };
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      console.log('✅ Password changed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error changing password:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please log in again to change your password' };
      }
      
      return { success: false, error: 'Failed to change password' };
    }
  }

  /**
   * Change email
   */
  async changeEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Update email
      await updateEmail(auth.currentUser, newEmail);
      
      // Update in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Email changed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error changing email:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please log in again to change your email' };
      }
      
      return { success: false, error: 'Failed to change email' };
    }
  }

  /**
   * Cache settings locally
   */
  private async cacheSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const key = `${this.SETTINGS_STORAGE_KEY}_${userId}`;
      const existingSettings = await AsyncStorage.getItem(key);
      const currentSettings = existingSettings ? JSON.parse(existingSettings) : {};
      
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(key, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('❌ Error caching settings:', error);
    }
  }

  /**
   * Get cached settings
   */
  async getCachedSettings(userId: string): Promise<Partial<UserSettings> | null> {
    try {
      const key = `${this.SETTINGS_STORAGE_KEY}_${userId}`;
      const cachedSettings = await AsyncStorage.getItem(key);
      return cachedSettings ? JSON.parse(cachedSettings) : null;
    } catch (error) {
      console.error('❌ Error getting cached settings:', error);
      return null;
    }
  }

  /**
   * Clear cached settings
   */
  async clearCachedSettings(userId: string): Promise<void> {
    try {
      const key = `${this.SETTINGS_STORAGE_KEY}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Error clearing cached settings:', error);
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Remove sensitive data
        const exportData = {
          profile: {
            name: userData.name,
            bio: userData.bio,
            phoneNumber: userData.phoneNumber,
            email: userData.email,
            createdAt: userData.createdAt,
          },
          settings: userData.settings,
          // Add other non-sensitive data as needed
        };
        
        return { success: true, data: exportData };
      }
      
      return { success: false, error: 'User data not found' };
    } catch (error) {
      console.error('❌ Error exporting user data:', error);
      return { success: false, error: 'Failed to export user data' };
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would require careful implementation in production
      // For now, just mark as deleted
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });
      
      console.log('✅ User account marked as deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting user account:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }
}

// Export singleton instance
export const realSettingsService = new RealSettingsService();
export default realSettingsService;
