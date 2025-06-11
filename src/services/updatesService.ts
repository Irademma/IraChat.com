/**
 * Updates Service - Handle updates/stories functionality
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Update, Comment } from '../types';

/**
 * Create a new update/story
 */
export const createUpdate = async (updateData: Omit<Update, 'id' | 'timestamp' | 'expiresAt'>): Promise<string> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const update: Omit<Update, 'id'> = {
      ...updateData,
      timestamp: now,
      expiresAt: expiresAt,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      isVisible: true
    };

    const docRef = await addDoc(collection(db, 'updates'), {
      ...update,
      timestamp: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt)
    });

    console.log('✅ Update created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating update:', error);
    throw error;
  }
};

/**
 * Get all updates (non-expired)
 */
export const getUpdates = async (limitCount: number = 50): Promise<Update[]> => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'updates'),
      where('expiresAt', '>', now),
      where('isVisible', '==', true),
      orderBy('expiresAt'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const updates: Update[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as Update);
    });

    console.log(`✅ Retrieved ${updates.length} updates`);
    return updates;
  } catch (error) {
    console.error('❌ Error getting updates:', error);
    return [];
  }
};

/**
 * Get updates by user
 */
export const getUserUpdates = async (userId: string): Promise<Update[]> => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'updates'),
      where('user.id', '==', userId),
      where('expiresAt', '>', now),
      where('isVisible', '==', true),
      orderBy('expiresAt'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const updates: Update[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as Update);
    });

    return updates;
  } catch (error) {
    console.error('❌ Error getting user updates:', error);
    return [];
  }
};

/**
 * Like an update
 */
export const likeUpdate = async (updateId: string, userId: string): Promise<void> => {
  try {
    const updateRef = doc(db, 'updates', updateId);
    const updateDoc = await getDoc(updateRef);
    
    if (updateDoc.exists()) {
      const currentLikes = updateDoc.data().likeCount || 0;
      await updateDoc(updateRef, {
        likeCount: currentLikes + 1
      });
      
      // Add to user's liked updates (optional)
      await addDoc(collection(db, 'userLikes'), {
        userId,
        updateId,
        timestamp: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('❌ Error liking update:', error);
    throw error;
  }
};

/**
 * Add comment to update
 */
export const addComment = async (updateId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const commentData = {
      ...comment,
      timestamp: serverTimestamp(),
      likesCount: 0,
      isVisible: true
    };

    const docRef = await addDoc(collection(db, 'updates', updateId, 'comments'), commentData);
    
    // Update comment count
    const updateRef = doc(db, 'updates', updateId);
    const updateDoc = await getDoc(updateRef);
    if (updateDoc.exists()) {
      const currentComments = updateDoc.data().commentCount || 0;
      await updateDoc(updateRef, {
        commentCount: currentComments + 1
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for an update
 */
export const getUpdateComments = async (updateId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'updates', updateId, 'comments'),
      where('isVisible', '==', true),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error('❌ Error getting comments:', error);
    return [];
  }
};

/**
 * Delete an update
 */
export const deleteUpdate = async (updateId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'updates', updateId), {
      isVisible: false
    });
    console.log('✅ Update deleted:', updateId);
  } catch (error) {
    console.error('❌ Error deleting update:', error);
    throw error;
  }
};

/**
 * Subscribe to updates in real-time
 */
export const subscribeToUpdates = (callback: (updates: Update[]) => void) => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'updates'),
    where('expiresAt', '>', now),
    where('isVisible', '==', true),
    orderBy('expiresAt'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const updates: Update[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as Update);
    });
    callback(updates);
  });
};

/**
 * Clean up expired updates (should be run periodically)
 */
export const cleanupExpiredUpdates = async (): Promise<void> => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'updates'),
      where('expiresAt', '<=', now)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Cleaned up ${deletePromises.length} expired updates`);
  } catch (error) {
    console.error('❌ Error cleaning up expired updates:', error);
  }
};

console.log('✅ Updates service initialized');
