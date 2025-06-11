// Custom hook for vertical media updates functionality
import { useCallback, useEffect, useState } from 'react';
import { Update } from '../types';

interface UseUpdatesProps {
  currentUserId?: string;
  onError?: (error: Error) => void;
}

// Mock updates data for development
const mockUpdates: Update[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'John Doe',
      phoneNumber: '+256700000001',
      username: 'john_doe',
      displayName: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      followersCount: 1200,
      followingCount: 300,
      likesCount: 5600,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    mediaType: 'image',
    caption: 'Beautiful sunset at the beach! 🌅 #sunset #beach #nature',
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    likeCount: 45,
    commentCount: 12,
    shareCount: 8,
    viewCount: 234,
    isLiked: false,
    isFollowing: false,
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      phoneNumber: '+256700000002',
      username: 'jane_smith',
      displayName: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      followersCount: 890,
      followingCount: 450,
      likesCount: 3200,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop',
    mediaType: 'image',
    caption: 'Morning hike in the mountains 🏔️ #hiking #nature #adventure',
    createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    likeCount: 67,
    commentCount: 23,
    shareCount: 15,
    viewCount: 456,
    isLiked: true,
    isFollowing: true,
  },
];

export const useUpdates = ({ currentUserId, onError }: UseUpdatesProps) => {
  const [updates, setUpdates] = useState<Update[]>(mockUpdates);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchUpdates = useCallback(async (refresh = false) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (refresh) {
        setUpdates(mockUpdates);
      }
    }, 1000);
  }, []);

  const handleLike = useCallback(async (updateId: string) => {
    setUpdates(prev => prev.map(update =>
      update.id === updateId
        ? { ...update, isLiked: !update.isLiked, likeCount: update.likeCount + (update.isLiked ? -1 : 1) }
        : update
    ));
  }, []);

  const handleComment = useCallback(async (updateId: string) => {
    console.log('Comment on update:', updateId);
  }, []);

  const handleShare = useCallback(async (updateId: string) => {
    console.log('Share update:', updateId);
  }, []);

  const handleDownload = useCallback(async (updateId: string) => {
    console.log('Download update:', updateId);
  }, []);

  const handleReport = useCallback(async (updateId: string) => {
    console.log('Report update:', updateId);
  }, []);

  useEffect(() => {
    fetchUpdates(true);
  }, [fetchUpdates]);

  return {
    updates,
    isLoading,
    hasMore,
    fetchUpdates,
    handleLike,
    handleComment,
    handleShare,
    handleDownload,
    handleReport,
  };
};
