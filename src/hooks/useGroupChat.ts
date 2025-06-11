/**
 * Group Chat Hook - Manage group chat functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { GroupChat, GroupMessage, GroupMember } from '../types/groupChat';
import { User } from '../types';

interface UseGroupChatProps {
  groupId: string;
  currentUserId: string;
}

interface UseGroupChatReturn {
  group: GroupChat | null;
  messages: GroupMessage[];
  members: GroupMember[];
  loading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string, mediaUrls?: string[]) => Promise<void>;
  addMember: (userId: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateGroupInfo: (updates: Partial<GroupChat>) => Promise<void>;
  leaveGroup: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  
  // Utilities
  isAdmin: boolean;
  isModerator: boolean;
  canAddMembers: boolean;
  canDeleteMessages: boolean;
  canChangeInfo: boolean;
}

export const useGroupChat = ({ groupId, currentUserId }: UseGroupChatProps): UseGroupChatReturn => {
  const [group, setGroup] = useState<GroupChat | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for now - replace with actual Firebase calls
  const mockGroup: GroupChat = {
    id: groupId,
    name: 'Sample Group',
    description: 'A sample group chat',
    groupPhoto: 'https://i.pravatar.cc/150?u=group',
    createdAt: new Date(),
    createdBy: 'user1',
    admins: ['user1'],
    moderators: [],
    members: [
      {
        userId: currentUserId,
        username: 'Current User',
        profilePic: 'https://i.pravatar.cc/150?u=current',
        role: 'member',
        joinedAt: new Date(),
        lastActive: new Date(),
        isMuted: false,
        notificationSettings: {
          mentions: true,
          allMessages: true,
          media: true,
        },
      },
    ],
    settings: {
      onlyAdminsCanAddMembers: false,
      onlyAdminsCanChangeInfo: false,
      onlyAdminsCanPinMessages: true,
      onlyAdminsCanDeleteMessages: false,
      messageRetentionDays: 30,
      allowMediaSharing: true,
      allowMessageReactions: true,
      allowMessageReplies: true,
    },
    pinnedMessages: [],
    unreadCount: 0,
    isArchived: false,
  };

  const mockMessages: GroupMessage[] = [
    {
      id: 'msg1',
      senderId: 'user1',
      senderName: 'John Doe',
      senderProfilePic: 'https://i.pravatar.cc/150?u=user1',
      content: 'Hello everyone!',
      reactions: {},
      replies: [],
      timestamp: new Date(),
      isEdited: false,
      isDeleted: false,
    },
  ];

  // Load group data
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGroup(mockGroup);
        setMessages(mockMessages);
        setMembers(mockGroup.members);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  // Check user permissions
  const isAdmin = group?.admins.includes(currentUserId) || false;
  const isModerator = group?.moderators.includes(currentUserId) || false;
  const canAddMembers = isAdmin || !group?.settings.onlyAdminsCanAddMembers;
  const canDeleteMessages = isAdmin || !group?.settings.onlyAdminsCanDeleteMessages;
  const canChangeInfo = isAdmin || !group?.settings.onlyAdminsCanChangeInfo;

  // Actions
  const sendMessage = useCallback(async (content: string, mediaUrls?: string[]) => {
    try {
      const newMessage: GroupMessage = {
        id: `msg_${Date.now()}`,
        senderId: currentUserId,
        senderName: 'Current User',
        senderProfilePic: 'https://i.pravatar.cc/150?u=current',
        content,
        mediaUrls,
        reactions: {},
        replies: [],
        timestamp: new Date(),
        isEdited: false,
        isDeleted: false,
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [currentUserId]);

  const addMember = useCallback(async (userId: string) => {
    try {
      if (!canAddMembers) {
        throw new Error('You do not have permission to add members');
      }
      
      const newMember: GroupMember = {
        userId,
        username: 'New Member',
        profilePic: `https://i.pravatar.cc/150?u=${userId}`,
        role: 'member',
        joinedAt: new Date(),
        lastActive: new Date(),
        isMuted: false,
        notificationSettings: {
          mentions: true,
          allMessages: true,
          media: true,
        },
      };

      setMembers(prev => [...prev, newMember]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  }, [canAddMembers]);

  const removeMember = useCallback(async (userId: string) => {
    try {
      if (!isAdmin) {
        throw new Error('Only admins can remove members');
      }
      
      setMembers(prev => prev.filter(member => member.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }, [isAdmin]);

  const updateGroupInfo = useCallback(async (updates: Partial<GroupChat>) => {
    try {
      if (!canChangeInfo) {
        throw new Error('You do not have permission to change group info');
      }
      
      setGroup(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    }
  }, [canChangeInfo]);

  const leaveGroup = useCallback(async () => {
    try {
      setMembers(prev => prev.filter(member => member.userId !== currentUserId));
      // Navigate away from group
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
    }
  }, [currentUserId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, isEdited: true }
          : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
    }
  }, []);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    try {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          
          if (reactions[emoji].includes(currentUserId)) {
            reactions[emoji] = reactions[emoji].filter(id => id !== currentUserId);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].push(currentUserId);
          }
          
          return { ...msg, reactions };
        }
        return msg;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react to message');
    }
  }, [currentUserId]);

  return {
    group,
    messages,
    members,
    loading,
    error,
    
    // Actions
    sendMessage,
    addMember,
    removeMember,
    updateGroupInfo,
    leaveGroup,
    deleteMessage,
    editMessage,
    reactToMessage,
    
    // Utilities
    isAdmin,
    isModerator,
    canAddMembers,
    canDeleteMessages,
    canChangeInfo,
  };
};
