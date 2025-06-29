// 🚫 BLOCK USER COMPONENT - Block/unblock users with confirmation
// Provides UI for blocking users with reason selection

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userBlockingService } from '../services/userBlockingService';

interface BlockUserProps {
  isVisible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  currentUserId: string;
  isBlocked: boolean;
  onBlockStatusChange: (blocked: boolean) => void;
}

const BLOCK_REASONS = [
  'Spam or unwanted messages',
  'Harassment or bullying',
  'Inappropriate content',
  'Fake account',
  'Scam or fraud',
  'Other',
];

export const BlockUser: React.FC<BlockUserProps> = ({
  isVisible,
  onClose,
  targetUserId,
  targetUserName,
  targetUserAvatar,
  currentUserId,
  isBlocked,
  onBlockStatusChange,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReportOption, setShowReportOption] = useState(false);

  // Handle block user
  const handleBlockUser = async () => {
    if (!selectedReason && !customReason) {
      Alert.alert('Reason Required', 'Please select or enter a reason for blocking this user.');
      return;
    }

    const reason = selectedReason === 'Other' ? customReason : selectedReason;

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${targetUserName}?\n\nThey won't be able to send you messages or see your online status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await userBlockingService.blockUser(
                currentUserId,
                targetUserId,
                targetUserName,
                targetUserAvatar,
                reason
              );

              if (result.success) {
                onBlockStatusChange(true);
                onClose();
                Alert.alert('User Blocked', `${targetUserName} has been blocked.`);
              } else {
                Alert.alert('Error', result.error || 'Failed to block user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to block user');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle unblock user
  const handleUnblockUser = async () => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${targetUserName}?\n\nThey will be able to send you messages again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await userBlockingService.unblockUser(
                currentUserId,
                targetUserId
              );

              if (result.success) {
                onBlockStatusChange(false);
                onClose();
                Alert.alert('User Unblocked', `${targetUserName} has been unblocked.`);
              } else {
                Alert.alert('Error', result.error || 'Failed to unblock user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle report and block
  const handleReportAndBlock = async () => {
    if (!selectedReason && !customReason) {
      Alert.alert('Reason Required', 'Please select or enter a reason for reporting this user.');
      return;
    }

    const reason = selectedReason === 'Other' ? customReason : selectedReason;

    Alert.alert(
      'Report and Block User',
      `Are you sure you want to report and block ${targetUserName}?\n\nThis will block the user and send a report to our moderation team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report & Block',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await userBlockingService.reportAndBlockUser(
                currentUserId,
                targetUserId,
                targetUserName,
                reason,
                customReason
              );

              if (result.success) {
                onBlockStatusChange(true);
                onClose();
                Alert.alert(
                  'User Reported and Blocked',
                  `${targetUserName} has been reported and blocked. Thank you for helping keep IraChat safe.`
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to report and block user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to report and block user');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isVisible) {
      setSelectedReason('');
      setCustomReason('');
      setShowReportOption(false);
    }
  }, [isVisible]);

  return (
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
          <Text style={styles.title}>
            {isBlocked ? 'Unblock User' : 'Block User'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {isBlocked ? (
            // Unblock UI
            <View style={styles.unblockContainer}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle" size={80} color="#EF4444" />
                <Text style={styles.userName}>{targetUserName}</Text>
                <Text style={styles.blockedLabel}>Currently Blocked</Text>
              </View>

              <View style={styles.unblockInfo}>
                <Text style={styles.infoTitle}>User is blocked</Text>
                <Text style={styles.infoText}>
                  This user cannot send you messages or see your online status.
                  You can unblock them at any time.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.unblockButton}
                onPress={handleUnblockUser}
                disabled={isLoading}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.unblockButtonText}>
                  {isLoading ? 'Unblocking...' : 'Unblock User'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Block UI
            <View style={styles.blockContainer}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle" size={80} color="#6B7280" />
                <Text style={styles.userName}>{targetUserName}</Text>
              </View>

              <View style={styles.blockInfo}>
                <Text style={styles.infoTitle}>Block this user?</Text>
                <Text style={styles.infoText}>
                  Blocked users won't be able to send you messages or see your online status.
                  They won't be notified that you blocked them.
                </Text>
              </View>

              {/* Reason Selection */}
              <View style={styles.reasonSection}>
                <Text style={styles.reasonTitle}>Reason for blocking (optional)</Text>
                
                {BLOCK_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason && styles.selectedReason,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[
                      styles.reasonText,
                      selectedReason === reason && styles.selectedReasonText,
                    ]}>
                      {reason}
                    </Text>
                    {selectedReason === reason && (
                      <Ionicons name="checkmark" size={20} color="#667eea" />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Custom reason input */}
                {selectedReason === 'Other' && (
                  <TextInput
                    style={styles.customReasonInput}
                    placeholder="Please specify..."
                    placeholderTextColor="#9CA3AF"
                    value={customReason}
                    onChangeText={setCustomReason}
                    multiline
                    maxLength={200}
                  />
                )}
              </View>

              {/* Report Option */}
              <TouchableOpacity
                style={styles.reportToggle}
                onPress={() => setShowReportOption(!showReportOption)}
              >
                <Ionicons 
                  name={showReportOption ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={showReportOption ? "#EF4444" : "#9CA3AF"} 
                />
                <Text style={styles.reportToggleText}>
                  Also report this user for violating community guidelines
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={showReportOption ? handleReportAndBlock : handleBlockUser}
                  disabled={isLoading}
                >
                  <Ionicons name="ban" size={20} color="#FFFFFF" />
                  <Text style={styles.blockButtonText}>
                    {isLoading 
                      ? 'Processing...' 
                      : showReportOption 
                        ? 'Report & Block' 
                        : 'Block User'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  unblockContainer: {
    padding: 24,
    alignItems: 'center',
  },
  blockContainer: {
    padding: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  blockedLabel: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  unblockInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  blockInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  reasonSection: {
    marginBottom: 24,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedReason: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
  },
  reasonText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedReasonText: {
    color: '#667eea',
    fontWeight: '500',
  },
  customReasonInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reportToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  reportToggleText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  blockButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  unblockButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unblockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default BlockUser;
