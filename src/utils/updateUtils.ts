/**
 * Update/Story utilities for IraChat
 */

import { User } from "../types";
import { ProcessedMedia, Update, UpdateDraft } from "../types/Update";

/**
 * Check if an update is expired
 */
export const isUpdateExpired = (update: Update): boolean => {
  return new Date() > new Date(update.expiresAt);
};

/**
 * Check if an update is visible (not expired and marked as visible)
 */
export const isUpdateVisible = (update: Update): boolean => {
  return update.isVisible && !isUpdateExpired(update);
};

/**
 * Get time remaining for an update
 */
export const getTimeRemaining = (update: Update): number => {
  const now = new Date().getTime();
  const expiresAt = new Date(update.expiresAt).getTime();
  return Math.max(0, expiresAt - now);
};

/**
 * Format time remaining as human readable string
 */
export const formatTimeRemaining = (update: Update): string => {
  const remaining = getTimeRemaining(update);

  if (remaining === 0) {
    return "Expired";
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Calculate engagement rate for an update
 */
export const calculateEngagementRate = (update: Update): number => {
  if (update.viewCount === 0) return 0;

  const engagements = update.likeCount + update.commentCount;
  return (engagements / update.viewCount) * 100;
};

/**
 * Sort updates by various criteria
 */
export const sortUpdates = (
  updates: Update[],
  sortBy:
    | "timestamp"
    | "likeCount"
    | "commentCount"
    | "viewCount"
    | "engagement" = "timestamp",
  order: "asc" | "desc" = "desc",
): Update[] => {
  return [...updates].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case "timestamp":
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case "likeCount":
        aValue = a.likeCount;
        bValue = b.likeCount;
        break;
      case "commentCount":
        aValue = a.commentCount;
        bValue = b.commentCount;
        break;
      case "viewCount":
        aValue = a.viewCount;
        bValue = b.viewCount;
        break;
      case "engagement":
        aValue = calculateEngagementRate(a);
        bValue = calculateEngagementRate(b);
        break;
      default:
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
    }

    if (order === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
};

/**
 * Filter updates by various criteria
 */
export const filterUpdates = (
  updates: Update[],
  filters: {
    userId?: string;
    mediaType?: "image" | "video";
    hasCaption?: boolean;
    minLikes?: number;
    minComments?: number;
    minViews?: number;
    dateRange?: { start: Date; end: Date };
  },
): Update[] => {
  return updates.filter((update) => {
    // Filter by user
    if (filters.userId && update.user.id !== filters.userId) {
      return false;
    }

    // Filter by media type
    if (filters.mediaType && update.mediaType !== filters.mediaType) {
      return false;
    }

    // Filter by caption presence
    if (filters.hasCaption !== undefined) {
      const hasCaption = Boolean(update.caption && update.caption.trim());
      if (filters.hasCaption !== hasCaption) {
        return false;
      }
    }

    // Filter by minimum likes
    if (filters.minLikes !== undefined && update.likeCount < filters.minLikes) {
      return false;
    }

    // Filter by minimum comments
    if (
      filters.minComments !== undefined &&
      update.commentCount < filters.minComments
    ) {
      return false;
    }

    // Filter by minimum views
    if (filters.minViews !== undefined && update.viewCount < filters.minViews) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange) {
      const updateDate = new Date(update.timestamp);
      if (
        updateDate < filters.dateRange.start ||
        updateDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Group updates by user
 */
export const groupUpdatesByUser = (
  updates: Update[],
): Map<string, Update[]> => {
  const grouped = new Map<string, Update[]>();

  updates.forEach((update) => {
    const userId = update.user.id;
    if (!grouped.has(userId)) {
      grouped.set(userId, []);
    }
    grouped.get(userId)!.push(update);
  });

  return grouped;
};

/**
 * Get updates statistics
 */
export const getUpdatesStats = (updates: Update[]) => {
  const totalUpdates = updates.length;
  const totalViews = updates.reduce((sum, update) => sum + update.viewCount, 0);
  const totalLikes = updates.reduce((sum, update) => sum + update.likeCount, 0);
  const totalComments = updates.reduce(
    (sum, update) => sum + update.commentCount,
    0,
  );

  const imageUpdates = updates.filter((u) => u.mediaType === "image").length;
  const videoUpdates = updates.filter((u) => u.mediaType === "video").length;

  const averageViews = totalUpdates > 0 ? totalViews / totalUpdates : 0;
  const averageLikes = totalUpdates > 0 ? totalLikes / totalUpdates : 0;
  const averageComments = totalUpdates > 0 ? totalComments / totalUpdates : 0;
  const averageEngagement =
    totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

  return {
    totalUpdates,
    totalViews,
    totalLikes,
    totalComments,
    imageUpdates,
    videoUpdates,
    averageViews,
    averageLikes,
    averageComments,
    averageEngagement,
  };
};

/**
 * Validate update draft
 */
export const validateUpdateDraft = (
  draft: UpdateDraft,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!draft.mediaUri) {
    errors.push("Media is required");
  }

  if (!draft.mediaType) {
    errors.push("Media type is required");
  }

  if (draft.caption && draft.caption.length > 500) {
    errors.push("Caption must be 500 characters or less");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create update from draft
 */
export const createUpdateFromDraft = (
  draft: UpdateDraft,
  user: User,
  processedMedia: ProcessedMedia,
): Omit<
  Update,
  | "id"
  | "timestamp"
  | "expiresAt"
  | "likeCount"
  | "commentCount"
  | "viewCount"
  | "isVisible"
> => {
  return {
    user,
    mediaUrl: processedMedia.uri,
    mediaType: processedMedia.type,
    caption: draft.caption?.trim() || undefined,
    createdAt: new Date(),
    isLiked: false,
    shareCount: 0,
    isFollowing: false,
  };
};

/**
 * Format update caption with mentions and hashtags
 */
export const formatUpdateCaption = (caption: string): string => {
  if (!caption) return "";

  return (
    caption
      // Format mentions
      .replace(/@(\w+)/g, "<mention>@$1</mention>")
      // Format hashtags
      .replace(/#(\w+)/g, "<hashtag>#$1</hashtag>")
      // Format URLs
      .replace(/(https?:\/\/[^\s]+)/g, "<link>$1</link>")
  );
};

/**
 * Extract mentions from caption
 */
export const extractMentions = (caption: string): string[] => {
  if (!caption) return [];

  const mentions = caption.match(/@(\w+)/g);
  return mentions ? mentions.map((mention) => mention.substring(1)) : [];
};

/**
 * Extract hashtags from caption
 */
export const extractHashtags = (caption: string): string[] => {
  if (!caption) return [];

  const hashtags = caption.match(/#(\w+)/g);
  return hashtags ? hashtags.map((hashtag) => hashtag.substring(1)) : [];
};

/**
 * Generate update preview text
 */
export const generateUpdatePreview = (
  update: Update,
  maxLength: number = 100,
): string => {
  if (update.caption) {
    return update.caption.length > maxLength
      ? `${update.caption.substring(0, maxLength)}...`
      : update.caption;
  }

  return `${update.user.displayName} shared a ${update.mediaType}`;
};

/**
 * Check if user can delete update
 */
export const canDeleteUpdate = (
  update: Update,
  currentUserId: string,
): boolean => {
  return update.user.id === currentUserId;
};

/**
 * Check if user can edit update
 */
export const canEditUpdate = (
  update: Update,
  currentUserId: string,
): boolean => {
  return update.user.id === currentUserId && !isUpdateExpired(update);
};

/**
 * Get update share URL
 */
export const getUpdateShareUrl = (updateId: string): string => {
  return `https://irachat.com/updates/${updateId}`;
};

/**
 * Format update timestamp
 */
export const formatUpdateTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
};

// Additional exports for UpdatesScreen compatibility
export const handleMediaPress = (
  mediaUrl: string,
  mediaType: "image" | "video",
) => {
  console.log("Media pressed:", { mediaUrl, mediaType });
  // In a real implementation, this would open a media viewer
};

export const handleUpdateLongPress = (update: Update) => {
  console.log("Update long pressed:", update.id);
  // In a real implementation, this would show action sheet
};

export const handleUpdatePress = (update: Update) => {
  console.log("Update pressed:", update.id);
  // In a real implementation, this might navigate to update details
};

export default {
  isUpdateExpired,
  isUpdateVisible,
  getTimeRemaining,
  formatTimeRemaining,
  calculateEngagementRate,
  sortUpdates,
  filterUpdates,
  groupUpdatesByUser,
  getUpdatesStats,
  validateUpdateDraft,
  createUpdateFromDraft,
  formatUpdateCaption,
  extractMentions,
  extractHashtags,
  generateUpdatePreview,
  canDeleteUpdate,
  canEditUpdate,
  getUpdateShareUrl,
  formatUpdateTimestamp,
  handleMediaPress,
  handleUpdateLongPress,
  handleUpdatePress,
};
