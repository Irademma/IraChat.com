// Posts Service - Real Firebase Implementation
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebaseSimple";

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    _id: string;
    name: string;
    username: string;
    image: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: any;
  updatedAt?: any;
  isEdited?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    username: string;
    image: string;
  };
  createdAt: any;
  likes: string[];
}

export interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  description?: string;
  createdAt: any;
  status: 'pending' | 'reviewed' | 'resolved';
}

class PostsService {
  /**
   * Like or unlike a post
   */
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }
      
      const postData = postDoc.data();
      const likes = postData.likes || [];
      const isLiked = likes.includes(userId);
      
      if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
        });
        console.log("👍 Post unliked");
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });
        console.log("❤️ Post liked");
      }
    } catch (error) {
      console.error("❌ Error toggling like:", error);
      throw error;
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string,
    content: string,
    userId: string,
    userInfo: { name: string; username: string; image: string }
  ): Promise<void> {
    try {
      const comment: Omit<Comment, 'id'> = {
        content,
        authorId: userId,
        author: userInfo,
        createdAt: serverTimestamp(),
        likes: [],
      };

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
      });
      
      console.log("💬 Comment added successfully");
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      throw error;
    }
  }

  /**
   * Edit a post
   */
  async editPost(postId: string, newContent: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }
      
      const postData = postDoc.data();
      if (postData.authorId !== userId) {
        throw new Error("You can only edit your own posts");
      }
      
      await updateDoc(postRef, {
        content: newContent,
        updatedAt: serverTimestamp(),
        isEdited: true,
      });
      
      console.log("✏️ Post edited successfully");
    } catch (error) {
      console.error("❌ Error editing post:", error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }
      
      const postData = postDoc.data();
      if (postData.authorId !== userId) {
        throw new Error("You can only delete your own posts");
      }
      
      await deleteDoc(postRef);
      console.log("🗑️ Post deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      throw error;
    }
  }

  /**
   * Report a post
   */
  async reportPost(
    postId: string,
    reporterId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    try {
      const report: Omit<Report, 'id'> = {
        postId,
        reporterId,
        reason,
        description,
        createdAt: serverTimestamp(),
        status: 'pending',
      };

      await addDoc(collection(db, "reports"), report);
      console.log("🚨 Post reported successfully");
    } catch (error) {
      console.error("❌ Error reporting post:", error);
      throw error;
    }
  }

  /**
   * Share a post (create a repost)
   */
  async sharePost(
    originalPostId: string,
    userId: string,
    userInfo: { name: string; username: string; image: string },
    shareText?: string
  ): Promise<void> {
    try {
      const originalPostRef = doc(db, "posts", originalPostId);
      const originalPostDoc = await getDoc(originalPostRef);
      
      if (!originalPostDoc.exists()) {
        throw new Error("Original post not found");
      }
      
      const sharePost = {
        content: shareText || `Shared a post`,
        authorId: userId,
        author: {
          _id: userId,
          ...userInfo,
        },
        originalPost: {
          id: originalPostId,
          ...originalPostDoc.data(),
        },
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        isShared: true,
      };

      await addDoc(collection(db, "posts"), sharePost);
      console.log("📤 Post shared successfully");
    } catch (error) {
      console.error("❌ Error sharing post:", error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<Comment[]> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }
      
      const postData = postDoc.data();
      return postData.comments || [];
    } catch (error) {
      console.error("❌ Error getting comments:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const postsService = new PostsService();
export default postsService;
