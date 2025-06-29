// 👤 USER PROFILE - Complete user profile with actions
// View user details, block/unblock, start chat, call, etc.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userBlockingService } from '../services/userBlockingService';
import { contactService, IraChatContact } from '../services/contactService';
import { realTimeMessagingService } from '../services/realTimeMessagingService';
import BlockUser from './BlockUser';

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPhone?: string;
  userEmail?: string;
  userStatus?: string;
  lastSeen?: Date;
  currentUserId: string;
  onStartChat?: (userId: string, userName: string) => void;
  onStartCall?: (userId: string, userName: string, type: 'voice' | 'video') => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isVisible,
  onClose,
  userId,
  userName,
  userAvatar,
  userPhone,
  userEmail,
  userStatus,
  lastSeen,
  currentUserId,
  onStartChat,
  onStartCall,
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isContact, setIsContact] = useState(false);
  const [contact, setContact] = useState<IraChatContact | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [blockingStatus, setBlockingStatus] = useState({
    currentUserBlocked: false,
    blockedByTarget: false,
    canCommunicate: true,
  });

  // Load user data when modal opens
  useEffect(() => {
    if (isVisible && userId && currentUserId) {
      loadUserData();
    }
  }, [isVisible, userId, currentUserId]);

  // Load user blocking status and contact info
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Check blocking status
      const status = await userBlockingService.getBlockingStatus(currentUserId, userId);
      setBlockingStatus(status);
      setIsBlocked(status.currentUserBlocked);

      // Check if user is in contacts
      if (userPhone) {
        const existingContact = await contactService.getContactByPhone(currentUserId, userPhone);
        setIsContact(!!existingContact);
        setContact(existingContact);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle start chat
  const handleStartChat = async () => {
    if (!blockingStatus.canCommunicate) {
      Alert.alert('Cannot Start Chat', 'You cannot start a chat with this user.');
      return;
    }

    if (onStartChat) {
      onStartChat(userId, userName);
      onClose();
    }
  };

  // Handle voice call
  const handleVoiceCall = () => {
    if (!blockingStatus.canCommunicate) {
      Alert.alert('Cannot Call', 'You cannot call this user.');
      return;
    }

    if (onStartCall) {
      onStartCall(userId, userName, 'voice');
      onClose();
    }
  };

  // Handle video call
  const handleVideoCall = () => {
    if (!blockingStatus.canCommunicate) {
      Alert.alert('Cannot Call', 'You cannot call this user.');
      return;
    }

    if (onStartCall) {
      onStartCall(userId, userName, 'video');
      onClose();
    }
  };

  // Handle add to contacts
  const handleAddToContacts = async () => {
    if (!userPhone) {
      Alert.alert('No Phone Number', 'Cannot add user without phone number.');
      return;
    }

    try {
      const newContact: Omit<IraChatContact, 'id'> = {
        userId,
        name: userName,
        phoneNumber: userPhone,
        email: userEmail,
        avatar: userAvatar,
        isIraChatUser: true,
        isBlocked: false,
        isFavorite: false,
        lastSeen,
        status: userStatus,
        addedAt: new Date(),
        updatedAt: new Date(),
        isFromDevice: false,
      };

      const result = await contactService.addContact(currentUserId, newContact);
      
      if (result.success) {
        setIsContact(true);
        Alert.alert('Contact Added', `${userName} has been added to your contacts.`);
      } else {
        Alert.alert('Error', result.error || 'Failed to add contact');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  // Handle remove from contacts
  const handleRemoveFromContacts = async () => {
    if (!contact) return;

    Alert.alert(
      'Remove Contact',
      `Remove ${userName} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await contactService.deleteContact(contact.id);
              if (result.success) {
                setIsContact(false);
                setContact(null);
                Alert.alert('Contact Removed', `${userName} has been removed from your contacts.`);
              } else {
                Alert.alert('Error', result.error || 'Failed to remove contact');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove contact');
            }
          },
        },
      ]
    );
  };

  // Format last seen
  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Online';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              onPress={() => setShowBlockModal(true)}
              style={styles.moreButton}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <Image
                  source={{
                    uri: userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=667eea&color=fff`
                  }}
                  style={styles.profileAvatar}
                />
                <Text style={styles.profileName}>{userName}</Text>
                {userStatus && (
                  <Text style={styles.profileStatus}>{userStatus}</Text>
                )}
                <Text style={styles.lastSeen}>
                  Last seen {formatLastSeen(lastSeen)}
                </Text>
              </View>

              {/* Contact Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                
                {userPhone && (
                  <View style={styles.infoItem}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{userPhone}</Text>
                  </View>
                )}
                
                {userEmail && (
                  <View style={styles.infoItem}>
                    <Ionicons name="mail" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{userEmail}</Text>
                  </View>
                )}
              </View>

              {/* Blocking Status */}
              {!blockingStatus.canCommunicate && (
                <View style={styles.warningSection}>
                  {blockingStatus.currentUserBlocked && (
                    <View style={styles.warningItem}>
                      <Ionicons name="ban" size={20} color="#EF4444" />
                      <Text style={styles.warningText}>You have blocked this user</Text>
                    </View>
                  )}
                  {blockingStatus.blockedByTarget && (
                    <View style={styles.warningItem}>
                      <Ionicons name="ban" size={20} color="#EF4444" />
                      <Text style={styles.warningText}>This user has blocked you</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              {blockingStatus.canCommunicate && (
                <View style={styles.actionSection}>
                  <TouchableOpacity style={styles.primaryAction} onPress={handleStartChat}>
                    <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Message</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity style={styles.secondaryAction} onPress={handleVoiceCall}>
                      <Ionicons name="call" size={24} color="#667eea" />
                      <Text style={styles.secondaryActionText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryAction} onPress={handleVideoCall}>
                      <Ionicons name="videocam" size={24} color="#667eea" />
                      <Text style={styles.secondaryActionText}>Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Contact Management */}
              <View style={styles.contactSection}>
                {isContact ? (
                  <TouchableOpacity
                    style={styles.contactAction}
                    onPress={handleRemoveFromContacts}
                  >
                    <Ionicons name="person-remove" size={20} color="#EF4444" />
                    <Text style={[styles.contactActionText, { color: '#EF4444' }]}>
                      Remove from Contacts
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.contactAction}
                    onPress={handleAddToContacts}
                  >
                    <Ionicons name="person-add" size={20} color="#667eea" />
                    <Text style={styles.contactActionText}>Add to Contacts</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Block User Modal */}
      <BlockUser
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        targetUserId={userId}
        targetUserName={userName}
        targetUserAvatar={userAvatar}
        currentUserId={currentUserId}
        isBlocked={isBlocked}
        onBlockStatusChange={(blocked) => {
          setIsBlocked(blocked);
          setBlockingStatus(prev => ({
            ...prev,
            currentUserBlocked: blocked,
            canCommunicate: !blocked && !prev.blockedByTarget,
          }));
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  moreButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  profileStatus: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  warningSection: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryActionText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactActionText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserProfile;
