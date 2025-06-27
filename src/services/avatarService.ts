/**
 * Avatar Service for IraChat
 * 
 * Centralized service for managing user avatars, profile photos,
 * and consistent avatar generation across the app
 */

import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { generatePlaceholderAvatar, getAvatarColor, getInitials } from '../utils/avatarUtils';
import { storage } from './firebaseSimple';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string | null;
  bio?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

class AvatarService {
  private static instance: AvatarService;
  private avatarCache = new Map<string, string>();
  
  public static getInstance(): AvatarService {
    if (!AvatarService.instance) {
      AvatarService.instance = new AvatarService();
    }
    return AvatarService.instance;
  }
  
  /**
   * Get avatar URL for a user with fallback to generated avatar
   */
  public getAvatarUrl(user: Partial<UserProfile>, size: number = 150): string {
    const cacheKey = `${user.id || user.phone || user.name}_${size}`;
    
    // Check cache first
    if (this.avatarCache.has(cacheKey)) {
      return this.avatarCache.get(cacheKey)!;
    }
    
    let avatarUrl: string;
    
    // Use existing avatar if valid
    if (user.avatar && this.isValidAvatarUrl(user.avatar)) {
      avatarUrl = user.avatar;
    } else {
      // Generate placeholder avatar
      const name = user.name || user.phone || 'User';
      avatarUrl = generatePlaceholderAvatar(name, size);
    }
    
    // Cache the result
    this.avatarCache.set(cacheKey, avatarUrl);
    return avatarUrl;
  }
  
  /**
   * Upload avatar image to Firebase Storage
   */
  public async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      console.log('📤 Uploading avatar for user:', userId);
      
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const avatarRef = ref(storage, `avatars/${userId}/${Date.now()}.jpg`);
      
      // Upload image
      const snapshot = await uploadBytes(avatarRef, blob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Avatar uploaded successfully:', downloadUrl);
      
      // Clear cache for this user
      this.clearUserCache(userId);
      
      return downloadUrl;
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }
  
  /**
   * Pick image from gallery or camera
   */
  public async pickAvatar(): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error picking avatar:', error);
      throw error;
    }
  }
  
  /**
   * Take photo with camera for avatar
   */
  public async takeAvatarPhoto(): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required');
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error taking avatar photo:', error);
      throw error;
    }
  }
  
  /**
   * Generate avatar initials and color for a user
   */
  public getAvatarInitials(user: Partial<UserProfile>): {
    initials: string;
    backgroundColor: string;
    textColor: string;
  } {
    const name = user.name || user.phone || 'User';
    const initials = getInitials(name);
    const backgroundColor = getAvatarColor(name);
    const textColor = '#FFFFFF'; // Always white text for good contrast
    
    return {
      initials,
      backgroundColor,
      textColor,
    };
  }
  
  /**
   * Validate if an avatar URL is valid
   */
  private isValidAvatarUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Clear cache for a specific user
   */
  public clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.avatarCache.keys()) {
      if (key.startsWith(userId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.avatarCache.delete(key));
  }
  
  /**
   * Clear entire avatar cache
   */
  public clearCache(): void {
    this.avatarCache.clear();
  }
  
  /**
   * Preload avatars for a list of users
   */
  public async preloadAvatars(users: Partial<UserProfile>[]): Promise<void> {
    const promises = users.map(user => {
      return new Promise<void>((resolve) => {
        // Just call getAvatarUrl to populate cache
        this.getAvatarUrl(user);
        resolve();
      });
    });
    
    await Promise.all(promises);
    console.log(`✅ Preloaded ${users.length} avatars`);
  }
  
  /**
   * Get avatar data for offline use
   */
  public getOfflineAvatarData(user: Partial<UserProfile>): {
    initials: string;
    backgroundColor: string;
    hasImage: boolean;
    imageUrl?: string;
  } {
    const { initials, backgroundColor } = this.getAvatarInitials(user);
    const hasImage = !!(user.avatar && this.isValidAvatarUrl(user.avatar));
    
    return {
      initials,
      backgroundColor,
      hasImage,
      imageUrl: hasImage ? (user.avatar || undefined) : undefined,
    };
  }
  
  /**
   * Generate avatar for group chats
   */
  public generateGroupAvatar(groupName: string, memberCount: number): string {
    // Use group name for consistent color
    const backgroundColor = getAvatarColor(groupName).replace('#', '');
    const initials = getInitials(groupName);

    // Include member count in the display if needed
    const displayText = memberCount > 1 ? `${initials} (${memberCount > 99 ? '99+' : memberCount})` : initials;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayText)}&background=${backgroundColor}&color=fff&size=150&bold=true&format=png`;
  }
  
  /**
   * Batch update avatars for multiple users
   */
  public async batchUpdateAvatars(updates: Array<{
    userId: string;
    imageUri: string;
  }>): Promise<Array<{
    userId: string;
    avatarUrl: string;
    success: boolean;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      updates.map(async ({ userId, imageUri }) => {
        try {
          const avatarUrl = await this.uploadAvatar(userId, imageUri);
          return { userId, avatarUrl, success: true };
        } catch (error) {
          return {
            userId,
            avatarUrl: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          userId: updates[index].userId,
          avatarUrl: '',
          success: false,
          error: result.reason?.message || 'Upload failed',
        };
      }
    });
  }
}

export const avatarService = AvatarService.getInstance();
export default avatarService;
