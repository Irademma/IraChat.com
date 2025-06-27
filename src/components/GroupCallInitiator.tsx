// Group Call Initiation Component - Start group voice/video calls
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { groupCallingService } from '../services/groupCallingService';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isOnline: boolean;
}

interface GroupCallInitiatorProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  groupMembers: GroupMember[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
}

export const GroupCallInitiator: React.FC<GroupCallInitiatorProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
  groupMembers,
  currentUserId,
  isCurrentUserAdmin,
}) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [callType, setCallType] = useState<'group_voice' | 'group_video'>('group_voice');
  const [isStarting, setIsStarting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedParticipants([]);
      setCallType('group_voice');
      setIsStarting(false);
    }
  }, [visible]);

  // Check if user can start calls (admin only in some groups)
  const canStartCall = isCurrentUserAdmin; // You can modify this logic

  // Toggle participant selection
  const toggleParticipant = (participantId: string) => {
    if (participantId === currentUserId) return; // Can't deselect self

    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  // Start group call
  const startGroupCall = async () => {
    if (!canStartCall) {
      Alert.alert('Permission Denied', 'Only admins can start group calls');
      return;
    }

    if (selectedParticipants.length === 0) {
      Alert.alert('No Participants', 'Please select at least one participant');
      return;
    }

    try {
      setIsStarting(true);

      const currentUser = groupMembers.find(m => m.id === currentUserId);
      if (!currentUser) {
        throw new Error('Current user not found');
      }

      // Include current user in participants
      const allParticipants = [currentUserId, ...selectedParticipants];
      const admins = groupMembers.filter(m => m.isAdmin).map(m => m.id);

      const callId = await groupCallingService.startGroupCall(
        groupId,
        groupName,
        callType,
        currentUserId,
        currentUser.name,
        currentUser.avatar,
        allParticipants,
        admins
      );

      console.log('✅ Group call started:', callId);
      onClose();
      
      // Navigate to group call screen would happen here
      // router.push(`/group-call/${callId}`);
      
    } catch (error) {
      console.error('❌ Failed to start group call:', error);
      Alert.alert('Error', 'Failed to start group call');
    } finally {
      setIsStarting(false);
    }
  };

  // Render participant item
  const renderParticipant = ({ item }: { item: GroupMember }) => {
    const isSelected = selectedParticipants.includes(item.id);
    const isCurrentUser = item.id === currentUserId;
    const isDisabled = !item.isOnline && !isCurrentUser;

    return (
      <TouchableOpacity
        style={[
          styles.participantItem,
          isSelected && styles.participantSelected,
          isDisabled && styles.participantDisabled,
        ]}
        onPress={() => !isDisabled && toggleParticipant(item.id)}
        disabled={isDisabled}
      >
        <View style={styles.participantInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            {item.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
            {item.isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="star" size={10} color="#FFD700" />
              </View>
            )}
          </View>
          
          <View style={styles.participantDetails}>
            <Text style={[
              styles.participantName,
              isDisabled && styles.participantNameDisabled
            ]}>
              {isCurrentUser ? 'You' : item.name}
            </Text>
            <Text style={[
              styles.participantStatus,
              isDisabled && styles.participantStatusDisabled
            ]}>
              {isCurrentUser ? 'Call initiator' : 
               item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {isCurrentUser ? (
            <Ionicons name="person" size={20} color="#667eea" />
          ) : isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          ) : (
            <View style={styles.unselectedCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#667eea" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Start Group Call</Text>
          
          <TouchableOpacity 
            onPress={startGroupCall}
            disabled={!canStartCall || selectedParticipants.length === 0 || isStarting}
            style={[
              styles.startButton,
              (!canStartCall || selectedParticipants.length === 0 || isStarting) && styles.startButtonDisabled
            ]}
          >
            <Text style={[
              styles.startButtonText,
              (!canStartCall || selectedParticipants.length === 0 || isStarting) && styles.startButtonTextDisabled
            ]}>
              {isStarting ? 'Starting...' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Call Type Selector */}
        <View style={styles.callTypeContainer}>
          <Text style={styles.sectionTitle}>Call Type</Text>
          <View style={styles.callTypeButtons}>
            <TouchableOpacity
              style={[
                styles.callTypeButton,
                callType === 'group_voice' && styles.callTypeButtonActive
              ]}
              onPress={() => setCallType('group_voice')}
            >
              <Ionicons 
                name="call" 
                size={20} 
                color={callType === 'group_voice' ? '#FFFFFF' : '#667eea'} 
              />
              <Text style={[
                styles.callTypeText,
                callType === 'group_voice' && styles.callTypeTextActive
              ]}>
                Voice Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.callTypeButton,
                callType === 'group_video' && styles.callTypeButtonActive
              ]}
              onPress={() => setCallType('group_video')}
            >
              <Ionicons 
                name="videocam" 
                size={20} 
                color={callType === 'group_video' ? '#FFFFFF' : '#667eea'} 
              />
              <Text style={[
                styles.callTypeText,
                callType === 'group_video' && styles.callTypeTextActive
              ]}>
                Video Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Participants List */}
        <View style={styles.participantsContainer}>
          <Text style={styles.sectionTitle}>
            Select Participants ({selectedParticipants.length + 1}/{groupMembers.length})
          </Text>
          
          <FlatList
            data={groupMembers}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.id}
            style={styles.participantsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Permission Notice */}
        {!canStartCall && (
          <View style={styles.permissionNotice}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.permissionText}>
              Only group admins can start group calls
            </Text>
          </View>
        )}
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  startButtonTextDisabled: {
    color: '#9CA3AF',
  },
  callTypeContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  callTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: '#FFFFFF',
  },
  callTypeButtonActive: {
    backgroundColor: '#667eea',
  },
  callTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  callTypeTextActive: {
    color: '#FFFFFF',
  },
  participantsContainer: {
    flex: 1,
    padding: 20,
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  participantSelected: {
    backgroundColor: '#EBF8FF',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  participantDisabled: {
    opacity: 0.5,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 2,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  participantNameDisabled: {
    color: '#9CA3AF',
  },
  participantStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  participantStatusDisabled: {
    color: '#D1D5DB',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  permissionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
});
