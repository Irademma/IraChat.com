// Firebase service for vertical media updates functionality
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Comment, Update } from "../types";
import { db, storage } from "./firebaseSimple";

// Collections
const UPDATES_COLLECTION = "updates";
const COMMENTS_COLLECTION = "comments";
const LIKES_COLLECTION = "likes";

// ===== UPDATE OPERATIONS =====

export const createUpdate = async (updateData: {
  userId: string;
  username: string;
  userAvatar?: string;
  mediaFile: any; // File or blob
  mediaType: "photo" | "video";
  caption?: string;
  musicUrl?: string;
  musicTitle?: string;
}): Promise<string> => {
  try {
    // Upload media file to Firebase Storage
    const mediaRef = ref(storage, `updates/${updateData.userId}/${Date.now()}`);
    const uploadResult = await uploadBytes(mediaRef, updateData.mediaFile);
    const mediaUrl = await getDownloadURL(uploadResult.ref);

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create update document
    const updateDoc = {
      userId: updateData.userId,
      username: updateData.username,
      userAvatar: updateData.userAvatar || "",
      mediaUrl,
      mediaType: updateData.mediaType,
      caption: updateData.caption || "",
      musicUrl: updateData.musicUrl || "",
      musicTitle: updateData.musicTitle || "",
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      expiresAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    };

    const docRef = await addDoc(collection(db, UPDATES_COLLECTION), updateDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating update:", error);
    throw error;
  }
};

export const getUpdates = async (
  limitCount: number = 10,
  lastDoc?: any,
): Promise<{ updates: Update[]; lastVisible: any }> => {
  try {
    let q = query(
      collection(db, UPDATES_COLLECTION),
      where("expiresAt", ">", new Date()), // Only get non-expired updates
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const updates: Update[] = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp,
        expiresAt: data.expiresAt,
      } as Update);
      lastVisible = doc;
    });

    return { updates, lastVisible };
  } catch (error) {
    console.error("Error fetching updates:", error);
    throw error;
  }
};

export const incrementUpdateViews = async (updateId: string): Promise<void> => {
  try {
    const updateRef = doc(db, UPDATES_COLLECTION, updateId);
    await updateDoc(updateRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

export const deleteUpdate = async (
  updateId: string,
  mediaUrl: string,
): Promise<void> => {
  try {
    // Delete media from storage
    const mediaRef = ref(storage, mediaUrl);
    await deleteObject(mediaRef);

    // Delete update document
    await deleteDoc(doc(db, UPDATES_COLLECTION, updateId));

    // Delete associated comments and likes
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("updateId", "==", updateId),
    );
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where("updateId", "==", updateId),
    );

    const [commentsSnapshot, likesSnapshot] = await Promise.all([
      getDocs(commentsQuery),
      getDocs(likesQuery),
    ]);

    const deletePromises: Promise<void>[] = [];

    commentsSnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    likesSnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting update:", error);
    throw error;
  }
};

// ===== LIKE OPERATIONS =====

export const toggleLike = async (
  updateId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where("updateId", "==", updateId),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(likesQuery);
    const updateRef = doc(db, UPDATES_COLLECTION, updateId);

    if (querySnapshot.empty) {
      // Add like
      await addDoc(collection(db, LIKES_COLLECTION), {
        updateId,
        userId,
        timestamp: serverTimestamp(),
      });

      await updateDoc(updateRef, {
        likes: increment(1),
      });

      return true; // Liked
    } else {
      // Remove like
      const likeDoc = querySnapshot.docs[0];
      await deleteDoc(likeDoc.ref);

      await updateDoc(updateRef, {
        likes: increment(-1),
      });

      return false; // Unliked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const checkIfLiked = async (
  updateId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where("updateId", "==", updateId),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(likesQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
};

// ===== COMMENT OPERATIONS =====

export const addComment = async (commentData: {
  updateId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
}): Promise<string> => {
  try {
    const commentDoc = {
      updateId: commentData.updateId,
      userId: commentData.userId,
      username: commentData.username,
      userAvatar: commentData.userAvatar || "",
      text: commentData.text,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentDoc,
    );

    // Increment comment count on update
    const updateRef = doc(db, UPDATES_COLLECTION, commentData.updateId);
    await updateDoc(updateRef, {
      comments: increment(1),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getComments = async (updateId: string): Promise<Comment[]> => {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("updateId", "==", updateId),
      orderBy("timestamp", "desc"),
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp,
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// ===== REAL-TIME LISTENERS =====

export const subscribeToComments = (
  updateId: string,
  callback: (comments: Comment[]) => void,
): (() => void) => {
  const commentsQuery = query(
    collection(db, COMMENTS_COLLECTION),
    where("updateId", "==", updateId),
    orderBy("timestamp", "desc"),
  );

  return onSnapshot(commentsQuery, (querySnapshot) => {
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp,
      } as Comment);
    });
    callback(comments);
  });
};

// ===== CLEANUP OPERATIONS =====

export const cleanupExpiredUpdates = async (): Promise<void> => {
  try {
    const expiredQuery = query(
      collection(db, UPDATES_COLLECTION),
      where("expiresAt", "<=", new Date()),
    );

    const querySnapshot = await getDocs(expiredQuery);
    const deletePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      deletePromises.push(deleteUpdate(doc.id, data.mediaUrl));
    });

    await Promise.all(deletePromises);
    console.log(`Cleaned up ${deletePromises.length} expired updates`);
  } catch (error) {
    console.error("Error cleaning up expired updates:", error);
  }
};
