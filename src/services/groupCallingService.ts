// Group Calling Service - Handles group voice/video calls
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { CallData, GroupCallParticipant } from './callingService';
import { db } from './firebaseSimple';

export interface GroupCallData extends CallData {
  maxParticipants: number;
  activeParticipants: string[];
  invitedParticipants: string[];
  rejectedParticipants: string[];
  missedParticipants: string[];
}

class GroupCallingService {
  /**
   * Start a group call
   */
  async startGroupCall(
    groupId: string,
    groupName: string,
    callType: 'group_voice' | 'group_video',
    callerId: string,
    callerName: string,
    callerAvatar: string,
    participants: string[],
    admins: string[]
  ): Promise<string> {
    try {
      console.log('📞 Starting group call...', { groupId, callType, participants: participants.length });

      const callData: Omit<GroupCallData, 'id'> = {
        callerId,
        callerName,
        callerAvatar,
        receiverId: '', // Not used for group calls
        receiverName: '',
        receiverAvatar: '',
        type: callType,
        status: 'calling',
        startTime: new Date(),
        groupId,
        groupName,
        participants,
        admins,
        maxParticipants: 50, // Telegram-style limit
        activeParticipants: [callerId],
        invitedParticipants: participants.filter(p => p !== callerId),
        rejectedParticipants: [],
        missedParticipants: [],
      };

      const callRef = await addDoc(collection(db, 'groupCalls'), callData);
      
      // Add call notification to group chat
      await this.addGroupCallMessage(groupId, callRef.id, callType, 'started');

      // Send notifications to all participants
      await this.notifyParticipants(callRef.id, participants, 'invited');

      console.log('✅ Group call started with ID:', callRef.id);
      return callRef.id;
    } catch (error) {
      console.error('❌ Failed to start group call:', error);
      throw error;
    }
  }

  /**
   * Join a group call
   */
  async joinGroupCall(
    callId: string,
    userId: string,
    userName: string,
    userAvatar: string
  ): Promise<void> {
    try {
      console.log('📱 Joining group call:', callId);

      const callRef = doc(db, 'groupCalls', callId);
      
      // Add user to active participants
      await updateDoc(callRef, {
        activeParticipants: [...(await this.getActiveParticipants(callId)), userId],
        [`participants.${userId}`]: {
          userId,
          name: userName,
          avatar: userAvatar,
          joinedAt: serverTimestamp(),
          isMuted: false,
          isVideoEnabled: true,
          isSpeaking: false,
          connectionQuality: 'connecting',
        }
      });

      console.log('✅ Joined group call');
    } catch (error) {
      console.error('❌ Failed to join group call:', error);
      throw error;
    }
  }

  /**
   * Leave a group call
   */
  async leaveGroupCall(callId: string, userId: string): Promise<void> {
    try {
      console.log('📴 Leaving group call:', callId);

      const callRef = doc(db, 'groupCalls', callId);
      const activeParticipants = await this.getActiveParticipants(callId);
      
      // Remove user from active participants
      await updateDoc(callRef, {
        activeParticipants: activeParticipants.filter(p => p !== userId),
        [`participants.${userId}.leftAt`]: serverTimestamp(),
      });

      console.log('✅ Left group call');
    } catch (error) {
      console.error('❌ Failed to leave group call:', error);
    }
  }

  /**
   * End group call (admin only)
   */
  async endGroupCall(callId: string, adminId: string): Promise<void> {
    try {
      console.log('📴 Ending group call:', callId);

      const callRef = doc(db, 'groupCalls', callId);
      
      // Check if user is admin
      const callData = await this.getGroupCallData(callId);
      if (!callData?.admins?.includes(adminId)) {
        throw new Error('Only admins can end group calls');
      }

      // Update call status
      await updateDoc(callRef, {
        status: 'ended',
        endTime: serverTimestamp(),
        endedBy: adminId,
      });

      // Clean up call document after delay
      setTimeout(async () => {
        await deleteDoc(callRef);
      }, 10000);

      console.log('✅ Group call ended');
    } catch (error) {
      console.error('❌ Failed to end group call:', error);
      throw error;
    }
  }

  /**
   * Invite participants to ongoing call (admin only)
   */
  async inviteToGroupCall(
    callId: string,
    adminId: string,
    newParticipants: string[]
  ): Promise<void> {
    try {
      console.log('📞 Inviting participants to group call:', newParticipants);

      const callData = await this.getGroupCallData(callId);
      if (!callData?.admins?.includes(adminId)) {
        throw new Error('Only admins can invite participants');
      }

      const callRef = doc(db, 'groupCalls', callId);
      const currentInvited = callData.invitedParticipants || [];
      
      await updateDoc(callRef, {
        invitedParticipants: [...currentInvited, ...newParticipants],
        participants: [...(callData.participants || []), ...newParticipants],
      });

      // Send notifications to new participants
      await this.notifyParticipants(callId, newParticipants, 'invited');

      console.log('✅ Participants invited');
    } catch (error) {
      console.error('❌ Failed to invite participants:', error);
      throw error;
    }
  }

  /**
   * Remove participant from call (admin only)
   */
  async removeFromGroupCall(
    callId: string,
    adminId: string,
    participantId: string
  ): Promise<void> {
    try {
      console.log('🚫 Removing participant from group call:', participantId);

      const callData = await this.getGroupCallData(callId);
      if (!callData?.admins?.includes(adminId)) {
        throw new Error('Only admins can remove participants');
      }

      const callRef = doc(db, 'groupCalls', callId);
      const activeParticipants = await this.getActiveParticipants(callId);
      
      await updateDoc(callRef, {
        activeParticipants: activeParticipants.filter(p => p !== participantId),
        [`participants.${participantId}.removedAt`]: serverTimestamp(),
        [`participants.${participantId}.removedBy`]: adminId,
      });

      console.log('✅ Participant removed');
    } catch (error) {
      console.error('❌ Failed to remove participant:', error);
      throw error;
    }
  }

  /**
   * Decline group call invitation
   */
  async declineGroupCall(callId: string, userId: string): Promise<void> {
    try {
      console.log('❌ Declining group call:', callId);

      const callRef = doc(db, 'groupCalls', callId);
      const callData = await this.getGroupCallData(callId);
      const rejectedParticipants = callData?.rejectedParticipants || [];
      
      await updateDoc(callRef, {
        rejectedParticipants: [...rejectedParticipants, userId],
        invitedParticipants: (callData?.invitedParticipants || []).filter(p => p !== userId),
      });

      console.log('✅ Group call declined');
    } catch (error) {
      console.error('❌ Failed to decline group call:', error);
    }
  }

  /**
   * Listen for group call updates
   */
  listenToGroupCall(
    callId: string,
    onUpdate: (callData: GroupCallData) => void
  ): () => void {
    console.log('👂 Listening to group call updates:', callId);

    return onSnapshot(
      doc(db, 'groupCalls', callId),
      (doc) => {
        if (doc.exists()) {
          const callData = {
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(),
            endTime: doc.data().endTime?.toDate(),
          } as GroupCallData;
          onUpdate(callData);
        }
      },
      (error) => {
        console.error('❌ Error listening to group call:', error);
      }
    );
  }

  /**
   * Listen for incoming group calls
   */
  listenForGroupCalls(
    userId: string,
    onIncomingCall: (callData: GroupCallData) => void
  ): () => void {
    console.log('👂 Listening for group calls for user:', userId);

    return onSnapshot(
      query(
        collection(db, 'groupCalls'),
        where('participants', 'array-contains', userId),
        where('status', '==', 'calling')
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const callData = {
              id: change.doc.id,
              ...change.doc.data(),
              startTime: change.doc.data().startTime?.toDate() || new Date(),
            } as GroupCallData;

            // Only notify if user hasn't already joined or declined
            if (
              !callData.activeParticipants?.includes(userId) &&
              !callData.rejectedParticipants?.includes(userId)
            ) {
              console.log('📞 Incoming group call detected:', callData);
              onIncomingCall(callData);
            }
          }
        });
      },
      (error) => {
        console.error('❌ Error listening for group calls:', error);
      }
    );
  }

  /**
   * Get group call data
   */
  private async getGroupCallData(callId: string): Promise<GroupCallData | null> {
    try {
      const callDoc = await getDocs(query(collection(db, 'groupCalls'), where('__name__', '==', callId)));
      if (!callDoc.empty) {
        const doc = callDoc.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate() || new Date(),
          endTime: doc.data().endTime?.toDate(),
        } as GroupCallData;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get group call data:', error);
      return null;
    }
  }

  /**
   * Get active participants
   */
  private async getActiveParticipants(callId: string): Promise<string[]> {
    const callData = await this.getGroupCallData(callId);
    return callData?.activeParticipants || [];
  }

  /**
   * Send notifications to participants
   */
  private async notifyParticipants(
    callId: string,
    participants: string[],
    type: 'invited' | 'started' | 'ended'
  ): Promise<void> {
    // Implementation would depend on your notification service
    console.log(`📢 Notifying ${participants.length} participants: ${type}`);
  }

  /**
   * Add group call message to chat
   */
  private async addGroupCallMessage(
    groupId: string,
    callId: string,
    callType: 'group_voice' | 'group_video',
    status: 'started' | 'ended'
  ): Promise<void> {
    try {
      const messageData = {
        type: 'call',
        callType,
        callStatus: status,
        callId,
        senderId: 'system',
        timestamp: serverTimestamp(),
        text: `${callType === 'group_video' ? 'Video' : 'Voice'} call ${status}`,
      };

      await addDoc(collection(db, `chats/${groupId}/messages`), messageData);
    } catch (error) {
      console.error('Failed to add group call message:', error);
    }
  }
}

// Export singleton instance
export const groupCallingService = new GroupCallingService();
export default groupCallingService;
