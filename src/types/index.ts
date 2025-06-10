export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isVerified?: boolean;
}

export interface Message {
  id: string;
  text?: string;
  senderId: string;
  senderPhoneNumber?: string;
  senderName?: string;
  timestamp: any;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  // Enhanced message status for individual chats
  status?: 'sent' | 'delivered' | 'seen_not_replied' | 'seen_replied';
  statusTime?: any;
  // Media support for individual chats
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    caption?: string;
  };
  file?: {
    type: 'document';
    name: string;
    size: string;
    url: string;
    caption?: string;
  };
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: string[];
  participantDetails?: User[];
  lastMessage?: string;
  lastMessageAt?: string; // Serialized as ISO string
  timestamp: string; // Serialized as ISO string
  avatar?: string;
  description?: string;
  createdBy?: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  selectedChatId: string | null;
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  user: AuthState;
  chat: ChatState;
  updates: UpdatesState;
}

// Update/Post related types for vertical media updates
export interface Update {
  id: string;
  user: User;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  caption: string;
  musicTitle?: string;
  musicAuthor?: string;
  location?: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked: boolean;
  isFollowing: boolean;
  hashtags?: string[];
  mentions?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  likesCount: number;
  repliesCount: number;
  createdAt: number;
  isLiked: boolean;
}

export interface Like {
  id: string;
  updateId: string;
  userId: string;
  timestamp: any; // Firebase timestamp
}

export interface UpdatesState {
  updates: Update[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  lastVisible: any; // For pagination
}

export interface UpdateState {
  updates: Update[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastUpdateId: string | null;
}

export interface UpdateAction {
  type: 'FETCH_UPDATES_START' | 'FETCH_UPDATES_SUCCESS' | 'FETCH_UPDATES_ERROR' | 'ADD_UPDATE' | 'UPDATE_LIKE' | 'UPDATE_COMMENT' | 'UPDATE_SHARE' | 'UPDATE_VIEW';
  payload?: any;
}

export interface UpdateContextType {
  state: UpdateState;
  fetchUpdates: () => Promise<void>;
  loadMoreUpdates: () => Promise<void>;
  addUpdate: (update: Update) => void;
  likeUpdate: (updateId: string) => void;
  commentUpdate: (updateId: string, comment: Comment) => void;
  shareUpdate: (updateId: string) => void;
  viewUpdate: (updateId: string) => void;
}

export type NavigationParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ChatRoom: { chatId: string; chatName?: string };
  NewChat: undefined;
  CreateGroup: undefined;
  Profile: undefined;
  Settings: undefined;
};

