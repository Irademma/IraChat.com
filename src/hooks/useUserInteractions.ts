import { arrayRemove, arrayUnion, doc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { collection, db } from '../services/firebase';

interface UseUserInteractionsProps {
  currentUserId: string;
  onError?: (error: Error) => void;
}

export const useUserInteractions = ({ currentUserId, onError }: UseUserInteractionsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const followUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', userId);

      await updateDoc(currentUserRef, {
        following: arrayUnion(userId),
        followingCount: increment(1),
      });

      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId),
        followersCount: increment(1),
      });
    } catch (error) {
      console.error('Error following user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const unfollowUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', userId);

      await updateDoc(currentUserRef, {
        following: arrayRemove(userId),
        followingCount: increment(-1),
      });

      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId),
        followersCount: increment(-1),
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const blockUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', userId);

      // Remove from following/followers if exists
      await updateDoc(currentUserRef, {
        blocked: arrayUnion(userId),
        following: arrayRemove(userId),
        followingCount: increment(-1),
      });

      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId),
        followersCount: increment(-1),
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        blocked: arrayRemove(userId),
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const reportUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);

      const reportRef = doc(collection(db, 'reports'));
      await setDoc(reportRef, {
        reporterId: currentUserId,
        reportedUserId: userId,
        reason,
        createdAt: Date.now(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error reporting user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const reportContent = useCallback(async (contentId: string, contentType: 'update' | 'comment', reason: string) => {
    try {
      setIsLoading(true);

      const reportRef = doc(collection(db, 'reports'));
      await setDoc(reportRef, {
        reporterId: currentUserId,
        contentId,
        contentType,
        reason,
        createdAt: Date.now(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error reporting content:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const muteUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        muted: arrayUnion(userId),
      });
    } catch (error) {
      console.error('Error muting user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  const unmuteUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        muted: arrayRemove(userId),
      });
    } catch (error) {
      console.error('Error unmuting user:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, onError]);

  return {
    isLoading,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    reportUser,
    reportContent,
    muteUser,
    unmuteUser,
  };
}; 