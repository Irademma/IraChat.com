// Group Chat Room with Group Calling Functionality
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GroupCallInitiator } from './GroupCallInitiator';
import { groupCallingService } from '../services/groupCallingService';
import { auth } from '../services/firebaseSimple';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isOnline: boolean;
}

interface GroupChatRoomProps {
  groupId: string;
  groupName: string;
  groupAvatar: string;
  groupMembers: GroupMember[];
  currentUserIsAdmin: boolean;
  onlineCount: number;
}

export const GroupChatRoom: React.FC<GroupChatRoomProps> = ({
  groupId,
  groupName,
  groupAvatar,
  groupMembers,
  currentUserIsAdmin,
  onlineCount,
}) => {
  const [showGroupCallInitiator, setShowGroupCallInitiator] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  
  const currentUser = auth?.currentUser;

  // Quick start group voice call (admin only)
  const startQuickVoiceCall = async () => {
    if (!currentUserIsAdmin) {
      Alert.alert('Permission Denied', 'Only admins can start group calls');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsStartingCall(true);

      // Get all online members except current user
      const onlineMembers = groupMembers.filter(m => m.isOnline && m.id !== currentUser.uid);
      
      if (onlineMembers.length === 0) {
        Alert.alert('No Online Members', 'No other members are currently online');
        return;
      }

      const allParticipants = [currentUser.uid, ...onlineMembers.map(m => m.id)];
      const admins = groupMembers.filter(m => m.isAdmin).map(m => m.id);

      const callId = await groupCallingService.startGroupCall(
        groupId,
        groupName,
        'group_voice',
        currentUser.uid,
        currentUser.displayName || 'Unknown',
        currentUser.photoURL || '',
        allParticipants,
        admins
      );

      console.log('✅ Quick group voice call started:', callId);
      
      // Navigate to group call screen would happen here
      // router.push(`/group-call/${callId}`);
      
    } catch (error) {
      console.error('❌ Failed to start quick voice call:', error);
      Alert.alert('Error', 'Failed to start group call');
    } finally {
      setIsStartingCall(false);
    }
  };

  // Quick start group video call (admin only)
  const startQuickVideoCall = async () => {
    if (!currentUserIsAdmin) {
      Alert.alert('Permission Denied', 'Only admins can start group calls');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsStartingCall(true);

      // Get all online members except current user
      const onlineMembers = groupMembers.filter(m => m.isOnline && m.id !== currentUser.uid);
      
      if (onlineMembers.length === 0) {
        Alert.alert('No Online Members', 'No other members are currently online');
        return;
      }

      const allParticipants = [currentUser.uid, ...onlineMembers.map(m => m.id)];
      const admins = groupMembers.filter(m => m.isAdmin).map(m => m.id);

      const callId = await groupCallingService.startGroupCall(
        groupId,
        groupName,
        'group_video',
        currentUser.uid,
        currentUser.displayName || 'Unknown',
        currentUser.photoURL || '',
        allParticipants,
        admins
      );

      console.log('✅ Quick group video call started:', callId);
      
      // Navigate to group call screen would happen here
      // router.push(`/group-call/${callId}`);
      
    } catch (error) {
      console.error('❌ Failed to start quick video call:', error);
      Alert.alert('Error', 'Failed to start group call');
    } finally {
      setIsStartingCall(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Group Chat Header */}
      <View style={styles.header}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.memberCount}>
            {groupMembers.length} members, {onlineCount} online
          </Text>
        </View>

        {/* Group Call Actions */}
        <View style={styles.callActions}>
          {/* Advanced Call Options */}
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => setShowGroupCallInitiator(true)}
            disabled={!currentUserIsAdmin}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={currentUserIsAdmin ? "#667eea" : "#9CA3AF"} 
            />
          </TouchableOpacity>

          {/* Quick Video Call */}
          <TouchableOpacity
            style={[styles.callButton, isStartingCall && styles.callButtonDisabled]}
            onPress={startQuickVideoCall}
            disabled={!currentUserIsAdmin || isStartingCall}
          >
            <Ionicons 
              name="videocam" 
              size={20} 
              color={currentUserIsAdmin && !isStartingCall ? "#667eea" : "#9CA3AF"} 
            />
          </TouchableOpacity>

          {/* Quick Voice Call */}
          <TouchableOpacity
            style={[styles.callButton, isStartingCall && styles.callButtonDisabled]}
            onPress={startQuickVoiceCall}
            disabled={!currentUserIsAdmin || isStartingCall}
          >
            <Ionicons 
              name="call" 
              size={20} 
              color={currentUserIsAdmin && !isStartingCall ? "#667eea" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Notice */}
      {!currentUserIsAdmin && (
        <View style={styles.adminNotice}>
          <Ionicons name="information-circle" size={16} color="#F59E0B" />
          <Text style={styles.adminNoticeText}>
            Only group admins can start group calls
          </Text>
        </View>
      )}

      {/* Group Call Initiator Modal */}
      <GroupCallInitiator
        visible={showGroupCallInitiator}
        onClose={() => setShowGroupCallInitiator(false)}
        groupId={groupId}
        groupName={groupName}
        groupMembers={groupMembers}
        currentUserId={currentUser?.uid || ''}
        isCurrentUserAdmin={currentUserIsAdmin}
      />

      {/* Rest of the chat interface would go here */}
      <View style={styles.chatContent}>
        <Text style={styles.placeholder}>
          Chat messages would appear here...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  memberCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  adminNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  adminNoticeText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
