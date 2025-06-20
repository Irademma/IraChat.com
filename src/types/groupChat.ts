export type GroupRole = "admin" | "moderator" | "member";

export interface GroupMember {
  userId: string;
  username: string;
  profilePic: string;
  role: GroupRole;
  joinedAt: Date;
  lastActive: Date;
  isMuted: boolean;
  notificationSettings: {
    mentions: boolean;
    allMessages: boolean;
    media: boolean;
  };

  // Additional properties for compatibility
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePic: string;
  content: string;
  mediaUrls?: string[];
  mediaType?: "image" | "video" | "document";
  mediaCaptions?: string[];
  mentions?: {
    userId: string;
    username: string;
    startIndex: number;
    endIndex: number;
  }[];
  reactions: {
    [emoji: string]: string[]; // emoji -> array of userIds
  };
  replies: {
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }[];
  timestamp: Date;
  isEdited: boolean;
  isDeleted: boolean;

  // Additional properties for compatibility
  media?: any[];
  sender?: any;
  type?: string;
}

export interface GroupChat {
  id: string;
  name: string;
  description: string;
  groupPhoto: string;
  photo?: string; // Alias for groupPhoto
  createdAt: Date;
  createdBy: string;
  admins: string[];
  moderators: string[];
  members: GroupMember[];
  settings: {
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanChangeInfo: boolean;
    onlyAdminsCanPinMessages: boolean;
    onlyAdminsCanDeleteMessages: boolean;
    messageRetentionDays: number;
    allowMediaSharing: boolean;
    allowMessageReactions: boolean;
    allowMessageReplies: boolean;
  };
  pinnedMessages: string[];
  lastMessage?: GroupMessage;
  unreadCount: number;
  isArchived: boolean;
}

export interface TemporaryCallGroup {
  id: string;
  name: string;
  participants: string[];
  callType: "voice" | "video";
  startTime: Date;
  endTime?: Date;
  callLog: {
    userId: string;
    joinedAt: Date;
    leftAt?: Date;
    duration?: number;
  }[];
}

// Additional exports for compatibility
export interface Group extends GroupChat {}

export interface GroupMemberPreferences {
  notifications: {
    mentions: boolean;
    allMessages: boolean;
    media: boolean;
  };
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    profilePhoto: boolean;
  };
  media: {
    autoDownload: boolean;
    quality: "low" | "medium" | "high";
  };
}
