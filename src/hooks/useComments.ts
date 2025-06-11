import { arrayRemove, arrayUnion, collection, doc, getDocs, increment, limit, onSnapshot, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Comment } from '../types';

const COMMENTS_PER_PAGE = 20;

interface UseCommentsProps {
  updateId: string;
  onError?: (error: Error) => void;
}

export const useComments = ({ updateId, onError }: UseCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastCommentId, setLastCommentId] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const fetchComments = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);

      const commentsRef = collection(db, 'updates', updateId, 'comments');
      let q = query(
        commentsRef,
        orderBy('createdAt', 'desc'),
        limit(COMMENTS_PER_PAGE)
      );

      if (!isInitial && lastCommentId) {
        const lastDoc = await getDocs(query(commentsRef, where('id', '==', lastCommentId)));
        if (!lastDoc.empty) {
          q = query(
            commentsRef,
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc.docs[0]),
            limit(COMMENTS_PER_PAGE)
          );
        }
      }

      const snapshot = await getDocs(q);
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(prev => isInitial ? newComments : [...prev, ...newComments]);
      setHasMore(newComments.length === COMMENTS_PER_PAGE);
      setLastCommentId(newComments[newComments.length - 1]?.id || null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [updateId, lastCommentId, onError]);

  const loadMoreComments = useCallback(() => {
    if (!loading && hasMore) {
      fetchComments(false);
    }
  }, [loading, hasMore, fetchComments]);

  const addComment = useCallback(async (text: string, user: any) => {
    try {
      const commentsRef = collection(db, 'updates', updateId, 'comments');
      const commentRef = doc(commentsRef);
      const updateRef = doc(db, 'updates', updateId);

      const newComment: Comment = {
        id: commentRef.id,
        userId: user.id,
        user: {
          id: user.id,
          name: user.displayName || user.username,
          phoneNumber: user.phoneNumber || '',
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          likesCount: user.likesCount,
        },
        text,
        likesCount: 0,
        repliesCount: 0,
        createdAt: Date.now(),
        timestamp: Date.now(),
        isLiked: false,
        isVisible: true,
      };

      await updateDoc(commentRef, newComment);
      await updateDoc(updateRef, {
        commentCount: increment(1),
        comments: arrayUnion(commentRef.id),
      });

      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('Error adding comment:', error);
      onError?.(error as Error);
    }
  }, [updateId, onError]);

  const likeComment = useCallback(async (commentId: string, userId: string) => {
    try {
      const commentRef = doc(db, 'updates', updateId, 'comments', commentId);
      const comment = comments.find(c => c.id === commentId);

      if (comment) {
        const newIsLiked = !comment.isLiked;
        await updateDoc(commentRef, {
          likesCount: increment(newIsLiked ? 1 : -1),
          likedBy: newIsLiked ? arrayUnion(userId) : arrayRemove(userId),
        });

        setComments(prev =>
          prev.map(c =>
            c.id === commentId
              ? { ...c, isLiked: newIsLiked, likesCount: c.likesCount + (newIsLiked ? 1 : -1) }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      onError?.(error as Error);
    }
  }, [updateId, comments, onError]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const commentRef = doc(db, 'updates', updateId, 'comments', commentId);
      const updateRef = doc(db, 'updates', updateId);

      await updateDoc(commentRef, { deleted: true });
      await updateDoc(updateRef, {
        commentCount: increment(-1),
        comments: arrayRemove(commentId),
      });

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      onError?.(error as Error);
    }
  }, [updateId, onError]);

  useEffect(() => {
    const commentsRef = collection(db, 'updates', updateId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(COMMENTS_PER_PAGE));

    setIsSubscribing(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(newComments);
      setHasMore(newComments.length === COMMENTS_PER_PAGE);
      setLastCommentId(newComments[newComments.length - 1]?.id || null);
    }, (error) => {
      console.error('Error subscribing to comments:', error);
      onError?.(error as Error);
    });

    return () => {
      unsubscribe();
      setIsSubscribing(false);
    };
  }, [updateId, onError]);

  return {
    comments,
    loading,
    hasMore,
    isSubscribing,
    fetchComments,
    loadMoreComments,
    addComment,
    likeComment,
    deleteComment,
  };
}; 