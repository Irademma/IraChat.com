// 📤 REAL MEDIA UPLOAD SERVICE - Actually uploads to Firebase!
// This service handles uploading photos and videos to Firebase Storage

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebaseSimple';

export interface UploadProgress {
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
  metadata?: {
    size: number;
    contentType: string;
    timeCreated: string;
  };
}

class MediaUploadService {
  /**
   * Upload media file to Firebase Storage
   */
  async uploadMedia(
    uri: string,
    userId: string,
    type: 'photo' | 'video',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('📤 Starting media upload...', { uri, type });

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const extension = type === 'photo' ? 'jpg' : 'mp4';
      const filename = `${type}_${timestamp}.${extension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `updates/${userId}/${filename}`);

      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📤 Upload progress: ${progress.toFixed(1)}%`);
            
            if (onProgress) {
              onProgress({
                progress: Math.round(progress),
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            }
          },
          (error) => {
            // Error callback
            console.error('❌ Upload failed:', error);
            reject({
              success: false,
              error: error.message || 'Upload failed',
            });
          },
          async () => {
            // Success callback
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              console.log('✅ Upload completed:', downloadURL);
              
              resolve({
                success: true,
                downloadURL,
                metadata: {
                  size: uploadTask.snapshot.totalBytes,
                  contentType: uploadTask.snapshot.metadata.contentType || '',
                  timeCreated: uploadTask.snapshot.metadata.timeCreated || new Date().toISOString(),
                },
              });
            } catch (error: any) {
              console.error('❌ Failed to get download URL:', error);
              reject({
                success: false,
                error: 'Failed to get download URL',
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Media upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload media',
      };
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    uri: string,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('📤 Uploading profile picture...', uri);

      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profiles/${userId}/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress({
                progress: Math.round(progress),
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            }
          },
          (error) => {
            console.error('❌ Profile picture upload failed:', error);
            reject({
              success: false,
              error: error.message || 'Profile picture upload failed',
            });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Profile picture uploaded:', downloadURL);
              
              resolve({
                success: true,
                downloadURL,
                metadata: {
                  size: uploadTask.snapshot.totalBytes,
                  contentType: uploadTask.snapshot.metadata.contentType || '',
                  timeCreated: uploadTask.snapshot.metadata.timeCreated || new Date().toISOString(),
                },
              });
            } catch (error: any) {
              reject({
                success: false,
                error: 'Failed to get download URL',
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Profile picture upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload profile picture',
      };
    }
  }

  /**
   * Upload chat media (photos/videos in messages)
   */
  async uploadChatMedia(
    uri: string,
    chatId: string,
    userId: string,
    type: 'photo' | 'video',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('📤 Uploading chat media...', { uri, chatId, type });

      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const extension = type === 'photo' ? 'jpg' : 'mp4';
      const filename = `${type}_${timestamp}.${extension}`;
      
      const storageRef = ref(storage, `chats/${chatId}/media/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress({
                progress: Math.round(progress),
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            }
          },
          (error) => {
            console.error('❌ Chat media upload failed:', error);
            reject({
              success: false,
              error: error.message || 'Chat media upload failed',
            });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Chat media uploaded:', downloadURL);
              
              resolve({
                success: true,
                downloadURL,
                metadata: {
                  size: uploadTask.snapshot.totalBytes,
                  contentType: uploadTask.snapshot.metadata.contentType || '',
                  timeCreated: uploadTask.snapshot.metadata.timeCreated || new Date().toISOString(),
                },
              });
            } catch (error: any) {
              reject({
                success: false,
                error: 'Failed to get download URL',
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Chat media upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload chat media',
      };
    }
  }

  /**
   * Get file size from URI
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
      console.error('❌ Failed to get file size:', error);
      return 0;
    }
  }

  /**
   * Validate file size (max 50MB for videos, 10MB for photos)
   */
  async validateFileSize(uri: string, type: 'photo' | 'video'): Promise<{ valid: boolean; error?: string }> {
    try {
      const fileSize = await this.getFileSize(uri);
      const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for photo
      
      if (fileSize > maxSize) {
        const maxSizeMB = type === 'video' ? '50MB' : '10MB';
        return {
          valid: false,
          error: `File size exceeds ${maxSizeMB} limit`,
        };
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate file size',
      };
    }
  }
}

// Export singleton instance
export const mediaUploadService = new MediaUploadService();
export default mediaUploadService;
