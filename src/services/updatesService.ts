/**
 * Updates Service - Handle updates/stories functionality with real data
 */

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db, firestore } from "./firebaseSimple";

export interface Update {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration?: number;
  timestamp: Date;
  expiresAt: Date;
  views: string[];
  likes: string[];
  comments: Comment[];
  isVisible: boolean;
  metadata?: {
    width: number;
    height: number;
    size: number;
  };
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: Date;
  likesCount: number;
  isVisible: boolean;
}

/**
 * Create a new update/story with real media upload
 */
export const createUpdate = async (
  userId: string,
  userName: string,
  file: Blob | File,
  type: "image" | "video",
  caption?: string,
  userAvatar?: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    console.log("📸 Creating new update...");

    // Upload media to storage
    const { storageService } = await import("./storageService");
    // Convert type to storage service format
    const storageType = type === "image" ? "images" : "videos";
    const mediaResult = await storageService.uploadUpdateMedia(
      userId,
      file,
      storageType as "images" | "videos",
      onProgress ? (progress) => onProgress(progress.progress) : undefined,
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const update: Omit<Update, "id"> = {
      userId,
      userName,
      userAvatar,
      type,
      mediaUrl: mediaResult.url,
      caption,
      timestamp: now,
      expiresAt: expiresAt,
      views: [],
      likes: [],
      comments: [],
      isVisible: true,
      metadata: {
        width: 1080,
        height: 1920,
        size: mediaResult.metadata.size,
      },
    };

    const docRef = await addDoc(collection(firestore, "updates"), {
      ...update,
      timestamp: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    console.log("✅ Update created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating update:", error);
    throw error;
  }
};

/**
 * Get all updates (non-expired)
 */
export const getUpdates = async (
  limitCount: number = 50,
): Promise<Update[]> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const now = Timestamp.now();
    const q = query(
      collection(firestore, "updates"),
      where("expiresAt", ">", now),
      where("isVisible", "==", true),
      orderBy("expiresAt"),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    const querySnapshot = await getDocs(q);
    const updates: Update[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      } as Update);
    });

    console.log(`✅ Retrieved ${updates.length} updates`);
    return updates;
  } catch (error) {
    console.error("❌ Error getting updates:", error);
    return [];
  }
};

/**
 * Get updates by user
 */
export const getUserUpdates = async (userId: string): Promise<Update[]> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const now = Timestamp.now();
    const q = query(
      collection(firestore, "updates"),
      where("userId", "==", userId),
      where("expiresAt", ">", now),
      where("isVisible", "==", true),
      orderBy("expiresAt"),
      orderBy("timestamp", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const updates: Update[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      } as Update);
    });

    return updates;
  } catch (error) {
    console.error("❌ Error getting user updates:", error);
    return [];
  }
};

/**
 * Toggle like on an update
 */
export const toggleLike = async (
  updateId: string,
  userId: string,
): Promise<boolean> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const updateRef = doc(firestore, "updates", updateId);
    const updateSnapshot = await getDoc(updateRef);

    if (updateSnapshot.exists()) {
      const data = updateSnapshot.data();
      const likes = data.likes || [];
      const isLiked = likes.includes(userId);

      const { arrayUnion, arrayRemove } = await import("firebase/firestore");

      if (isLiked) {
        // Remove like
        await updateDoc(updateRef, {
          likes: arrayRemove(userId),
        });
        console.log("💔 Update unliked:", updateId);
        return false;
      } else {
        // Add like
        await updateDoc(updateRef, {
          likes: arrayUnion(userId),
        });
        console.log("❤️ Update liked:", updateId);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("❌ Error toggling like:", error);
    throw error;
  }
};

/**
 * Mark update as viewed
 */
export const markAsViewed = async (
  updateId: string,
  viewerId: string,
): Promise<void> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const updateRef = doc(firestore, "updates", updateId);
    const { arrayUnion } = await import("firebase/firestore");

    await updateDoc(updateRef, {
      views: arrayUnion(viewerId),
    });

    console.log("👁️ Update marked as viewed:", updateId);
  } catch (error) {
    console.error("❌ Error marking update as viewed:", error);
  }
};

/**
 * Add comment to update
 */
export const addComment = async (
  updateId: string,
  comment: Omit<Comment, "id" | "timestamp">,
): Promise<string> => {
  try {
    const commentData = {
      ...comment,
      timestamp: serverTimestamp(),
      likesCount: 0,
      isVisible: true,
    };

    const docRef = await addDoc(
      collection(db, "updates", updateId, "comments"),
      commentData,
    );

    // Update comment count
    const updateRef = doc(db, "updates", updateId);
    const updateSnapshot = await getDoc(updateRef);
    if (updateSnapshot.exists()) {
      const currentComments = updateSnapshot.data().commentCount || 0;
      await updateDoc(updateRef, {
        commentCount: currentComments + 1,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    throw error;
  }
};

/**
 * Get comments for an update
 */
export const getUpdateComments = async (
  updateId: string,
): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, "updates", updateId, "comments"),
      where("isVisible", "==", true),
      orderBy("timestamp", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error("❌ Error getting comments:", error);
    return [];
  }
};

/**
 * Delete an update
 */
export const deleteUpdate = async (updateId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "updates", updateId), {
      isVisible: false,
    });
    console.log("✅ Update deleted:", updateId);
  } catch (error) {
    console.error("❌ Error deleting update:", error);
    throw error;
  }
};

/**
 * Subscribe to updates in real-time
 */
export const subscribeToUpdates = (callback: (updates: Update[]) => void) => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const now = Timestamp.now();
    const q = query(
      collection(firestore, "updates"),
      where("expiresAt", ">", now),
      where("isVisible", "==", true),
      orderBy("expiresAt"),
      orderBy("timestamp", "desc"),
      limit(50),
    );

    return onSnapshot(q, (querySnapshot) => {
      const updates: Update[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updates.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date(),
        } as Update);
      });
      callback(updates);
    });
  } catch (error) {
    console.error("❌ Error subscribing to updates:", error);
    return () => {};
  }
};

/**
 * Clean up expired updates (should be run periodically)
 */
export const cleanupExpiredUpdates = async (): Promise<void> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    const now = Timestamp.now();
    const q = query(
      collection(firestore, "updates"),
      where("expiresAt", "<=", now),
    );

    const querySnapshot = await getDocs(q);
    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      // Mark as invisible instead of deleting
      updatePromises.push(updateDoc(doc.ref, { isVisible: false }));
    });

    await Promise.all(updatePromises);
    console.log(`✅ Cleaned up ${updatePromises.length} expired updates`);
  } catch (error) {
    console.error("❌ Error cleaning up expired updates:", error);
  }
};

// Additional exports for UpdatesScreen compatibility
export const deleteMedia = async (
  updateId: string,
  mediaId: string,
): Promise<void> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    console.log("🗑️ Deleting media from update...", { updateId, mediaId });

    // Get the update document
    const updateRef = doc(firestore, "updates", updateId);
    const updateSnapshot = await getDoc(updateRef);

    if (!updateSnapshot.exists()) {
      throw new Error("Update not found");
    }

    const updateData = updateSnapshot.data();
    const media = updateData.media || [];

    // Remove the specific media item
    const updatedMedia = media.filter((m: any) => m.id !== mediaId);

    // Update the document
    await updateDoc(updateRef, {
      media: updatedMedia,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Media deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting media:", error);
    throw error;
  }
};

export const updateUpdateMedia = async (
  updateId: string,
  mediaUpdates: any,
): Promise<void> => {
  try {
    if (!firestore) throw new Error("Firestore not initialized");

    console.log("📝 Updating update media...", { updateId, mediaUpdates });

    const updateRef = doc(firestore, "updates", updateId);
    await updateDoc(updateRef, {
      ...mediaUpdates,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Update media updated successfully");
  } catch (error) {
    console.error("❌ Error updating update media:", error);
    throw error;
  }
};

// Legacy compatibility - keep the old likeUpdate function
export const likeUpdate = async (
  updateId: string,
  userId: string,
): Promise<void> => {
  await toggleLike(updateId, userId);
};

console.log("✅ Updates service initialized");
