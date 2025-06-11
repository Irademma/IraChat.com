/**
 * Update/Story type definitions
 */

import { User } from './index';

export interface Update {
  id: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  timestamp: Date;
  expiresAt: Date;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isVisible: boolean;

  // Additional properties for compatibility
  userId?: string;
  userProfilePic?: string;
  username?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt: Date;
  shareCount: number;
  isLiked: boolean;
  isFollowing: boolean;
  media?: any[];
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  timestamp: Date;
  likesCount: number;
  isVisible: boolean;
  
  // Optional properties for compatibility
  userAvatar?: string;
  username?: string;
  likes?: number;
}

export interface UpdateView {
  id: string;
  updateId: string;
  userId: string;
  timestamp: Date;
}

export interface UpdateLike {
  id: string;
  updateId: string;
  userId: string;
  timestamp: Date;
}

export interface UpdatesScreenProps {
  userId: string;
  onUpdatePress?: (update: Update) => void;
  onUserPress?: (user: User) => void;
}

export interface UpdateCardProps {
  update: Update;
  currentUserId: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onMediaPress?: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  onUserPress?: (user: User) => void;
  onLike?: (updateId: string) => void;
  onComment?: (updateId: string) => void;
  onShare?: (updateId: string) => void;
}

export interface CreateUpdateData {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  user: User;
}

export interface UpdateFilters {
  userId?: string;
  mediaType?: 'image' | 'video';
  startDate?: Date;
  endDate?: Date;
  isVisible?: boolean;
}

export interface UpdateStats {
  totalUpdates: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageEngagement: number;
}

export interface UpdateAnalytics {
  updateId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  topViewers: User[];
  viewsByHour: { hour: number; views: number }[];
}

// Utility types
export type UpdateSortBy = 'timestamp' | 'likeCount' | 'commentCount' | 'viewCount';
export type UpdateSortOrder = 'asc' | 'desc';

export interface UpdateQuery {
  limit?: number;
  offset?: number;
  sortBy?: UpdateSortBy;
  sortOrder?: UpdateSortOrder;
  filters?: UpdateFilters;
}

export interface UpdateResponse {
  updates: Update[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Media processing types
export interface MediaProcessingOptions {
  quality?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
  compress?: boolean;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedMedia {
  uri: string;
  width: number;
  height: number;
  size: number;
  type: 'image' | 'video';
  duration?: number; // for videos
  thumbnail?: string; // for videos
}

// Story/Update creation flow types
export interface UpdateDraft {
  mediaUri: string;
  mediaType: 'image' | 'video';
  caption?: string;
  filters?: string[];
  effects?: string[];
  music?: {
    id: string;
    name: string;
    artist: string;
    url: string;
  };
}

export interface UpdateCreationStep {
  step: 'media' | 'edit' | 'caption' | 'publish';
  data: UpdateDraft;
  isValid: boolean;
}

// Update interaction types
export interface UpdateInteraction {
  type: 'view' | 'like' | 'comment' | 'share';
  updateId: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNotification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'share';
  updateId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Export default
export default Update;

