// 👥 REAL GROUP SERVICE - Complete group management functionality
// Real group creation, member management, permissions, and group messaging

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseSimple';
import { realTimeMessagingService } from './realTimeMessagingService';

export type GroupRole = 'owner' | 'admin' | 'member';
export type GroupPrivacy = 'public' | 'private' | 'secret';

export interface RealGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  privacy: GroupPrivacy;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Members
  members: string[]; // Array of user IDs
  memberRoles: { [userId: string]: GroupRole };
  memberNames: { [userId: string]: string };
  memberAvatars: { [userId: string]: string };
  memberJoinedAt: { [userId: string]: Date };
  // Settings
  allowMemberInvites: boolean;
  allowMemberMessages: boolean;
  requireApproval: boolean;
  maxMembers: number;
  // Activity
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    type: string;
  };
  lastActivity: Date;
  messageCount: number;
  // Invite link
  inviteCode?: string;
  inviteLink?: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  invitedUser: string;
  invitedUserName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

class RealGroupService {
  /**
   * Create a new group
   */
  async createGroup(
    creatorId: string,
    creatorName: string,
    creatorAvatar: string | undefined,
    groupData: {
      name: string;
      description?: string;
      avatar?: string;
      privacy?: GroupPrivacy;
      allowMemberInvites?: boolean;
      allowMemberMessages?: boolean;
      requireApproval?: boolean;
      maxMembers?: number;
    }
  ): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      console.log('👥 Creating group:', groupData.name);

      const groupId = `group_${Date.now()}_${creatorId}`;
      const inviteCode = this.generateInviteCode();

      const group: Omit<RealGroup, 'id'> = {
        name: groupData.name,
        description: groupData.description,
        avatar: groupData.avatar,
        privacy: groupData.privacy || 'private',
        createdBy: creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [creatorId],
        memberRoles: { [creatorId]: 'owner' },
        memberNames: { [creatorId]: creatorName },
        memberAvatars: { [creatorId]: creatorAvatar || '' },
        memberJoinedAt: { [creatorId]: new Date() },
        allowMemberInvites: groupData.allowMemberInvites ?? true,
        allowMemberMessages: groupData.allowMemberMessages ?? true,
        requireApproval: groupData.requireApproval ?? false,
        maxMembers: groupData.maxMembers || 256,
        lastActivity: new Date(),
        messageCount: 0,
        inviteCode,
        inviteLink: `https://irachat.app/join/${inviteCode}`,
      };

      // Save group to Firebase
      const groupRef = doc(db, 'groups', groupId);
      await setDoc(groupRef, {
        ...group,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      // Create corresponding chat for the group
      try {
        const chatResult = await realTimeMessagingService.createGroupChat(
          groupId,
          groupData.name,
          [creatorId],
          { [creatorId]: creatorName },
          { [creatorId]: creatorAvatar || '' },
          groupData.avatar
        );

        if (!chatResult.success) {
          console.warn('⚠️ Failed to create group chat:', chatResult.error);
          // Don't fail group creation if chat creation fails
        }
      } catch (chatError) {
        console.warn('⚠️ Error creating group chat:', chatError);
        // Continue with group creation even if chat fails
      }

      console.log('✅ Group created successfully:', groupId);
      return { success: true, groupId };
    } catch (error) {
      console.error('❌ Error creating group:', error);
      return { success: false, error: 'Failed to create group' };
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string): Promise<RealGroup[]> {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(
        groupsRef,
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      );

      const snapshot = await getDocs(q);
      const groups: RealGroup[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          } : undefined,
        } as RealGroup);
      });

      return groups;
    } catch (error) {
      console.error('❌ Error getting user groups:', error);
      return [];
    }
  }

  /**
   * Subscribe to user's groups
   */
  subscribeToUserGroups(
    userId: string,
    callback: (groups: RealGroup[]) => void
  ): () => void {
    console.log('👥 Subscribing to user groups:', userId);

    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('members', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups: RealGroup[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          } : undefined,
        } as RealGroup);
      });

      console.log('👥 Received user groups:', groups.length);
      callback(groups);
    });

    return unsubscribe;
  }

  /**
   * Join group by invite code
   */
  async joinGroupByCode(
    inviteCode: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      console.log('👥 Joining group by code:', inviteCode);

      // Find group by invite code
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('inviteCode', '==', inviteCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: false, error: 'Invalid invite code' };
      }

      const groupDoc = snapshot.docs[0];
      const groupData = groupDoc.data() as RealGroup;
      const groupId = groupDoc.id;

      // Check if user is already a member
      if (groupData.members.includes(userId)) {
        return { success: false, error: 'You are already a member of this group' };
      }

      // Check if group is full
      if (groupData.members.length >= groupData.maxMembers) {
        return { success: false, error: 'Group is full' };
      }

      // Check if approval is required
      if (groupData.requireApproval) {
        // Create join request
        const requestId = `request_${Date.now()}_${userId}_${groupId}`;
        const requestRef = doc(db, 'groupJoinRequests', requestId);
        
        await setDoc(requestRef, {
          groupId,
          groupName: groupData.name,
          userId,
          userName,
          userAvatar,
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        return { success: true, groupId, error: 'Join request sent. Waiting for approval.' };
      }

      // Add user to group
      const result = await this.addMemberToGroup(groupId, userId, userName, userAvatar);
      return result;
    } catch (error) {
      console.error('❌ Error joining group by code:', error);
      return { success: false, error: 'Failed to join group' };
    }
  }

  /**
   * Add member to group
   */
  async addMemberToGroup(
    groupId: string,
    userId: string,
    userName: string,
    userAvatar?: string,
    role: GroupRole = 'member'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data() as RealGroup;

      // Check if user is already a member
      if (groupData.members.includes(userId)) {
        return { success: false, error: 'User is already a member' };
      }

      // Check if group is full
      if (groupData.members.length >= groupData.maxMembers) {
        return { success: false, error: 'Group is full' };
      }

      // Update group
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        [`memberRoles.${userId}`]: role,
        [`memberNames.${userId}`]: userName,
        [`memberAvatars.${userId}`]: userAvatar || '',
        [`memberJoinedAt.${userId}`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      // Add user to group chat
      await realTimeMessagingService.addUserToGroupChat(
        groupId,
        userId,
        userName,
        userAvatar || ''
      );

      console.log('✅ Member added to group:', userId, groupId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding member to group:', error);
      return { success: false, error: 'Failed to add member' };
    }
  }

  /**
   * Remove member from group
   */
  async removeMemberFromGroup(
    groupId: string,
    userId: string,
    removedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data() as RealGroup;

      // Check permissions
      const removerRole = groupData.memberRoles[removedBy];
      const targetRole = groupData.memberRoles[userId];

      if (removedBy !== userId && removerRole !== 'owner' && removerRole !== 'admin') {
        return { success: false, error: 'Not authorized to remove members' };
      }

      if (targetRole === 'owner' && removedBy !== userId) {
        return { success: false, error: 'Cannot remove group owner' };
      }

      // Remove user from group
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
        [`memberRoles.${userId}`]: null,
        [`memberNames.${userId}`]: null,
        [`memberAvatars.${userId}`]: null,
        [`memberJoinedAt.${userId}`]: null,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      // Remove user from group chat
      await realTimeMessagingService.removeUserFromGroupChat(groupId, userId);

      console.log('✅ Member removed from group:', userId, groupId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error removing member from group:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  }

  /**
   * Update group settings
   */
  async updateGroupSettings(
    groupId: string,
    userId: string,
    updates: Partial<Pick<RealGroup, 'name' | 'description' | 'avatar' | 'privacy' | 'allowMemberInvites' | 'allowMemberMessages' | 'requireApproval' | 'maxMembers'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data() as RealGroup;

      // Check permissions
      const userRole = groupData.memberRoles[userId];
      if (userRole !== 'owner' && userRole !== 'admin') {
        return { success: false, error: 'Not authorized to update group settings' };
      }

      // Update group
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      console.log('✅ Group settings updated:', groupId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating group settings:', error);
      return { success: false, error: 'Failed to update group settings' };
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data() as RealGroup;

      // Check if user is owner
      if (groupData.memberRoles[userId] !== 'owner') {
        return { success: false, error: 'Only group owner can delete the group' };
      }

      // Delete group
      await deleteDoc(groupRef);

      // Delete group chat
      await realTimeMessagingService.deleteGroupChat(groupId);

      console.log('✅ Group deleted:', groupId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting group:', error);
      return { success: false, error: 'Failed to delete group' };
    }
  }

  /**
   * Generate invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Search public groups
   */
  async searchPublicGroups(searchQuery: string, limitCount: number = 20): Promise<RealGroup[]> {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(
        groupsRef,
        where('privacy', '==', 'public'),
        orderBy('memberCount', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const groups: RealGroup[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const group = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date(),
        } as RealGroup;

        // Filter by name if searchQuery provided
        if (!searchQuery || group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          groups.push(group);
        }
      });

      return groups;
    } catch (error) {
      console.error('❌ Error searching public groups:', error);
      return [];
    }
  }
}

// Export singleton instance
export const realGroupService = new RealGroupService();
export default realGroupService;
