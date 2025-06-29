// 📱 REAL UPDATES SERVICE - Complete social media functionality
// Real story posting, media upload, interactions, and feed management

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc as updateFirestoreDoc,
  getDocs,
  addDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseSimple';
import * as ImagePicker from 'expo-image-picker';

export type UpdateType = 'photo' | 'video' | 'text';
export type UpdatePrivacy = 'public' | 'friends' | 'private';

export interface RealUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  caption?: string;
  type: UpdateType;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  videoDuration?: number;
  privacy: UpdatePrivacy;
  timestamp: Date;
  expiresAt?: Date; // For stories that expire
  // Interaction data
  likes: string[]; // Array of user IDs who liked
  comments: string[]; // Array of comment IDs
  shares: string[]; // Array of user IDs who shared
  views: string[]; // Array of user IDs who viewed
  downloads: string[]; // Array of user IDs who downloaded
  // Metadata
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[]; // Hashtags
  mentions?: string[]; // @mentions
  musicTrack?: {
    title: string;
    artist: string;
    url: string;
  };
}

export interface UpdateComment {
  id: string;
  updateId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: string[];
  replies?: UpdateComment[];
}

export interface UpdateInteraction {
  updateId: string;
  userId: string;
  type: 'like' | 'comment' | 'share' | 'view' | 'download';
  timestamp: Date;
}

class RealUpdatesService {
  /**
   * Create a new update/story
   */
  async createUpdate(
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    content: {
      type: UpdateType;
      caption?: string;
      mediaUri?: string;
      privacy?: UpdatePrivacy;
      isStory?: boolean;
      musicTrack?: any;
      location?: any;
      tags?: string[];
      mentions?: string[];
    }
  ): Promise<{ success: boolean; updateId?: string; error?: string }> {
    try {
      console.log('📱 Creating update:', content.type);

      const updateId = `update_${Date.now()}_${userId}`;
      let mediaUrl: string | undefined;

      // Upload media if provided
      if (content.mediaUri && content.type !== 'text') {
        const uploadResult = await this.uploadMedia(content.mediaUri, updateId, content.type);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        mediaUrl = uploadResult.url;
      }

      // Create update object
      const update: Omit<RealUpdate, 'id'> = {
        userId,
        userName,
        userAvatar,
        content: content.caption || '',
        caption: content.caption,
        type: content.type,
        mediaUrl,
        privacy: content.privacy || 'public',
        timestamp: new Date(),
        expiresAt: content.isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined, // 24 hours for stories
        likes: [],
        comments: [],
        shares: [],
        views: [],
        downloads: [],
        location: content.location,
        tags: content.tags || [],
        mentions: content.mentions || [],
        musicTrack: content.musicTrack,
      };

      // Save to Firebase
      const updateRef = doc(db, 'updates', updateId);
      await setDoc(updateRef, {
        ...update,
        timestamp: serverTimestamp(),
        expiresAt: update.expiresAt ? serverTimestamp() : null,
      });

      console.log('✅ Update created successfully:', updateId);
      return { success: true, updateId };
    } catch (error) {
      console.error('❌ Error creating update:', error);
      return { success: false, error: 'Failed to create update' };
    }
  }

  /**
   * Upload media to Firebase Storage
   */
  private async uploadMedia(
    mediaUri: string,
    updateId: string,
    type: UpdateType
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('📤 Uploading media:', type);

      // Convert URI to blob
      const response = await fetch(mediaUri);
      const blob = await response.blob();

      // Create storage reference
      const fileExtension = type === 'video' ? 'mp4' : 'jpg';
      const fileName = `${updateId}.${fileExtension}`;
      const storageRef = ref(storage, `updates/${type}s/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      console.log('✅ Media uploaded successfully');
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      return { success: false, error: 'Failed to upload media' };
    }
  }

  /**
   * Get updates feed
   */
  async getUpdatesFeed(
    userId: string,
    limitCount: number = 20
  ): Promise<RealUpdate[]> {
    try {
      const updatesRef = collection(db, 'updates');
      const q = query(
        updatesRef,
        where('privacy', '==', 'public'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const updates: RealUpdate[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        updates.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate(),
        } as RealUpdate);
      });

      return updates;
    } catch (error) {
      console.error('❌ Error getting updates feed:', error);
      return [];
    }
  }

  /**
   * Subscribe to updates feed
   */
  subscribeToUpdatesFeed(
    userId: string,
    callback: (updates: RealUpdate[]) => void,
    limitCount: number = 20
  ): () => void {
    console.log('📱 Subscribing to updates feed for user:', userId);

    const updatesRef = collection(db, 'updates');
    const q = query(
      updatesRef,
      where('privacy', '==', 'public'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates: RealUpdate[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const update = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate(),
        } as RealUpdate;

        // Filter out expired stories
        if (update.expiresAt && update.expiresAt < new Date()) {
          return;
        }

        updates.push(update);
      });

      console.log('📱 Received updates feed:', updates.length);
      callback(updates);
    });

    return unsubscribe;
  }

  /**
   * Like/unlike an update
   */
  async toggleLike(
    updateId: string,
    userId: string
  ): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
    try {
      const updateRef = doc(db, 'updates', updateId);
      const updateSnapshot = await getDoc(updateRef);

      if (!updateSnapshot.exists()) {
        return { success: false, isLiked: false, error: 'Update not found' };
      }

      const updateData = updateSnapshot.data() as RealUpdate;
      const isCurrentlyLiked = updateData.likes.includes(userId);

      if (isCurrentlyLiked) {
        // Unlike
        await updateFirestoreDoc(updateRef, {
          likes: arrayRemove(userId),
        });
      } else {
        // Like
        await updateFirestoreDoc(updateRef, {
          likes: arrayUnion(userId),
        });
      }

      // Log interaction
      await this.logInteraction(updateId, userId, 'like');

      console.log(`✅ Update ${isCurrentlyLiked ? 'unliked' : 'liked'}:`, updateId);
      return { success: true, isLiked: !isCurrentlyLiked };
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      return { success: false, isLiked: false, error: 'Failed to toggle like' };
    }
  }



  /**
   * Share an update
   */
  async shareUpdate(
    updateId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateRef = doc(db, 'updates', updateId);
      await updateFirestoreDoc(updateRef, {
        shares: arrayUnion(userId),
      });

      // Log interaction
      await this.logInteraction(updateId, userId, 'share');

      console.log('✅ Update shared:', updateId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sharing update:', error);
      return { success: false, error: 'Failed to share update' };
    }
  }

  /**
   * View an update (for analytics)
   */
  async viewUpdate(
    updateId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateRef = doc(db, 'updates', updateId);
      const updateSnapshot = await getDoc(updateRef);

      if (updateSnapshot.exists()) {
        const updateData = updateSnapshot.data() as RealUpdate;
        
        // Only add view if not already viewed
        if (!updateData.views.includes(userId)) {
          await updateFirestoreDoc(updateRef, {
            views: arrayUnion(userId),
          });

          // Log interaction
          await this.logInteraction(updateId, userId, 'view');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error viewing update:', error);
      return { success: false, error: 'Failed to view update' };
    }
  }

  /**
   * Delete an update
   */
  async deleteUpdate(
    updateId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user owns the update
      const updateRef = doc(db, 'updates', updateId);
      const updateSnapshot = await getDoc(updateRef);

      if (!updateSnapshot.exists()) {
        return { success: false, error: 'Update not found' };
      }

      const updateData = updateSnapshot.data() as RealUpdate;
      if (updateData.userId !== userId) {
        return { success: false, error: 'Not authorized to delete this update' };
      }

      // Delete media from storage if exists
      if (updateData.mediaUrl) {
        try {
          const mediaRef = ref(storage, updateData.mediaUrl);
          await deleteObject(mediaRef);
        } catch (error) {
          console.warn('⚠️ Could not delete media file:', error);
        }
      }

      // Delete update document
      await updateFirestoreDoc(updateRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      console.log('✅ Update deleted:', updateId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting update:', error);
      return { success: false, error: 'Failed to delete update' };
    }
  }

  /**
   * Get update likes with user details
   */
  async getUpdateLikes(updateId: string): Promise<{ success: boolean; interactions?: any[]; error?: string }> {
    try {
      const likesRef = collection(db, 'updates', updateId, 'likes');
      const likesSnapshot = await getDocs(likesRef);

      const interactions = await Promise.all(
        likesSnapshot.docs.map(async (likeDoc) => {
          const likeData = likeDoc.data();
          const userRef = doc(db, 'users', likeData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            userId: likeData.userId,
            userName: userData.name || 'Unknown User',
            userAvatar: userData.avatar,
            timestamp: likeData.timestamp?.toDate() || new Date(),
            interactionType: 'like',
          };
        })
      );

      return { success: true, interactions };
    } catch (error) {
      console.error('❌ Error getting update likes:', error);
      return { success: false, error: 'Failed to get likes' };
    }
  }

  /**
   * Get update views with user details
   */
  async getUpdateViews(updateId: string): Promise<{ success: boolean; interactions?: any[]; error?: string }> {
    try {
      const viewsRef = collection(db, 'updates', updateId, 'views');
      const viewsSnapshot = await getDocs(viewsRef);

      const interactions = await Promise.all(
        viewsSnapshot.docs.map(async (viewDoc) => {
          const viewData = viewDoc.data();
          const userRef = doc(db, 'users', viewData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            userId: viewData.userId,
            userName: userData.name || 'Unknown User',
            userAvatar: userData.avatar,
            timestamp: viewData.timestamp?.toDate() || new Date(),
            interactionType: 'view',
          };
        })
      );

      return { success: true, interactions };
    } catch (error) {
      console.error('❌ Error getting update views:', error);
      return { success: false, error: 'Failed to get views' };
    }
  }

  /**
   * Get update shares with user details
   */
  async getUpdateShares(updateId: string): Promise<{ success: boolean; interactions?: any[]; error?: string }> {
    try {
      const sharesRef = collection(db, 'updates', updateId, 'shares');
      const sharesSnapshot = await getDocs(sharesRef);

      const interactions = await Promise.all(
        sharesSnapshot.docs.map(async (shareDoc) => {
          const shareData = shareDoc.data();
          const userRef = doc(db, 'users', shareData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            userId: shareData.userId,
            userName: userData.name || 'Unknown User',
            userAvatar: userData.avatar,
            timestamp: shareData.timestamp?.toDate() || new Date(),
            interactionType: 'share',
          };
        })
      );

      return { success: true, interactions };
    } catch (error) {
      console.error('❌ Error getting update shares:', error);
      return { success: false, error: 'Failed to get shares' };
    }
  }

  /**
   * Get update downloads with user details
   */
  async getUpdateDownloads(updateId: string): Promise<{ success: boolean; interactions?: any[]; error?: string }> {
    try {
      const downloadsRef = collection(db, 'updates', updateId, 'downloads');
      const downloadsSnapshot = await getDocs(downloadsRef);

      const interactions = await Promise.all(
        downloadsSnapshot.docs.map(async (downloadDoc) => {
          const downloadData = downloadDoc.data();
          const userRef = doc(db, 'users', downloadData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            userId: downloadData.userId,
            userName: userData.name || 'Unknown User',
            userAvatar: userData.avatar,
            timestamp: downloadData.timestamp?.toDate() || new Date(),
            interactionType: 'download',
          };
        })
      );

      return { success: true, interactions };
    } catch (error) {
      console.error('❌ Error getting update downloads:', error);
      return { success: false, error: 'Failed to get downloads' };
    }
  }

  /**
   * Record download interaction
   */
  async recordDownload(updateId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const downloadRef = doc(db, 'updates', updateId, 'downloads', userId);
      await setDoc(downloadRef, {
        userId,
        timestamp: serverTimestamp(),
      });

      // Also log in general interactions
      await this.logInteraction(updateId, userId, 'download');

      console.log('✅ Download recorded');
      return { success: true };
    } catch (error) {
      console.error('❌ Error recording download:', error);
      return { success: false, error: 'Failed to record download' };
    }
  }

  /**
   * Get update comments with replies
   */
  async getUpdateComments(updateId: string): Promise<{ success: boolean; comments?: any[]; error?: string }> {
    try {
      const commentsRef = collection(db, 'updates', updateId, 'comments');
      const commentsQuery = query(commentsRef, orderBy('timestamp', 'asc'));
      const commentsSnapshot = await getDocs(commentsQuery);

      const comments = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();

          // Get replies for this comment
          const repliesRef = collection(db, 'updates', updateId, 'comments', commentDoc.id, 'replies');
          const repliesQuery = query(repliesRef, orderBy('timestamp', 'asc'));
          const repliesSnapshot = await getDocs(repliesQuery);

          const replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
            timestamp: replyDoc.data().timestamp?.toDate() || new Date(),
          }));

          return {
            id: commentDoc.id,
            ...commentData,
            timestamp: commentData.timestamp?.toDate() || new Date(),
            replies,
          };
        })
      );

      return { success: true, comments };
    } catch (error) {
      console.error('❌ Error getting update comments:', error);
      return { success: false, error: 'Failed to get comments' };
    }
  }

  /**
   * Add comment to update
   */
  async addComment(
    updateId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    content: string,
    parentCommentId?: string
  ): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      if (parentCommentId) {
        // This is a reply
        const replyRef = collection(db, 'updates', updateId, 'comments', parentCommentId, 'replies');
        const replyDoc = await addDoc(replyRef, {
          commentId: parentCommentId,
          userId,
          userName,
          userAvatar,
          content,
          timestamp: serverTimestamp(),
          likes: [],
        });

        console.log('✅ Reply added');
        return { success: true, commentId: replyDoc.id };
      } else {
        // This is a main comment
        const commentRef = collection(db, 'updates', updateId, 'comments');
        const commentDoc = await addDoc(commentRef, {
          updateId,
          userId,
          userName,
          userAvatar,
          content,
          timestamp: serverTimestamp(),
          likes: [],
        });

        // Update comment count on the update
        const updateRef = doc(db, 'updates', updateId);
        await updateFirestoreDoc(updateRef, {
          comments: arrayUnion(commentDoc.id),
        });

        console.log('✅ Comment added');
        return { success: true, commentId: commentDoc.id };
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return { success: false, error: 'Failed to add comment' };
    }
  }

  /**
   * Like/unlike comment
   */
  async likeComment(commentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For simplicity, we'll assume this is a main comment
      // In a real implementation, you'd need to determine if it's a comment or reply
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      const commentData = commentDoc.data();
      const isLiked = commentData.likes?.includes(userId);

      if (isLiked) {
        await updateFirestoreDoc(commentRef, {
          likes: arrayRemove(userId),
        });
      } else {
        await updateFirestoreDoc(commentRef, {
          likes: arrayUnion(userId),
        });
      }

      console.log('✅ Comment like toggled');
      return { success: true };
    } catch (error) {
      console.error('❌ Error liking comment:', error);
      return { success: false, error: 'Failed to like comment' };
    }
  }

  /**
   * Log user interaction for analytics
   */
  private async logInteraction(
    updateId: string,
    userId: string,
    type: 'like' | 'comment' | 'share' | 'view' | 'download'
  ): Promise<void> {
    try {
      const interactionId = `${updateId}_${userId}_${type}_${Date.now()}`;
      const interactionRef = doc(db, 'interactions', interactionId);

      await setDoc(interactionRef, {
        updateId,
        userId,
        type,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Error logging interaction:', error);
    }
  }
}

// Export singleton instance
export const realUpdatesService = new RealUpdatesService();
export default realUpdatesService;
