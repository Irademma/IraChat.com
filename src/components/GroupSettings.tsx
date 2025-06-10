import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../theme/colors';
import { GroupMemberPreferences } from '../types/groupChat';
import { handleAdminAction } from '../utils/groupManagement';

interface GroupSettingsProps {
  preferences: GroupMemberPreferences;
  onAction: (action: string) => void;
  onHideContent: (type: 'message' | 'update', contentId: string) => void;
  isAdmin: boolean;
  groupId: string;
  members: Array<{
    id: string;
    name: string;
    isAdmin: boolean;
    isBlocked: boolean;
  }>;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
  onPromoteToAdmin: (memberId: string) => void;
  onDemoteFromAdmin: (memberId: string) => void;
  onBlockMember: (memberId: string) => void;
  onUnblockMember: (memberId: string) => void;
}

export const GroupSettings: React.FC<GroupSettingsProps> = ({
  preferences,
  onAction,
  onHideContent,
  isAdmin,
  groupId,
  members,
  onAddMember,
  onRemoveMember,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onBlockMember,
  onUnblockMember,
}) => {
  const renderActionButton = (
    icon: string,
    label: string,
    onPress: () => void,
    color: string = colors.primary
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor: color }]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  const handleMemberAction = async (
    action: 'block' | 'unblock' | 'promote' | 'demote' | 'remove',
    memberId: string
  ) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only group admins can perform this action.');
      return;
    }

    try {
      switch (action) {
        case 'block':
          await handleAdminAction('block', groupId, memberId, isAdmin, async () => {
            onBlockMember(memberId);
          });
          break;
        case 'unblock':
          await handleAdminAction('unblock', groupId, memberId, isAdmin, async () => {
            onUnblockMember(memberId);
          });
          break;
        case 'promote':
          await handleAdminAction('addAdmin', groupId, memberId, isAdmin, async () => {
            onPromoteToAdmin(memberId);
          });
          break;
        case 'demote':
          await handleAdminAction('removeAdmin', groupId, memberId, isAdmin, async () => {
            onDemoteFromAdmin(memberId);
          });
          break;
        case 'remove':
          Alert.alert(
            'Remove Member',
            'Are you sure you want to remove this member from the group?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => onRemoveMember(memberId),
              },
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Error handling member action:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Preferences</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Mute Notifications</Text>
          <Switch
            value={preferences.isMuted}
            onValueChange={() => onAction(preferences.isMuted ? 'unmute' : 'mute')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Archive Group</Text>
          <Switch
            value={preferences.isArchived}
            onValueChange={() => onAction(preferences.isArchived ? 'unarchive' : 'archive')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Settings</Text>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Lock Group</Text>
            <Switch
              value={preferences.isLocked}
              onValueChange={() => onAction(preferences.isLocked ? 'unlock' : 'lock')}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          {renderActionButton('person-add', 'Add Member', onAddMember)}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        {members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.name}
                {member.isAdmin && ' (Admin)'}
              </Text>
              {member.isBlocked && (
                <Text style={styles.blockedLabel}>Blocked</Text>
              )}
            </View>
            {isAdmin && (
              <View style={styles.memberActions}>
                {member.isBlocked ? (
                  renderActionButton(
                    'lock-open',
                    'Unblock',
                    () => handleMemberAction('unblock', member.id),
                    colors.success
                  )
                ) : (
                  renderActionButton(
                    'lock-closed',
                    'Block',
                    () => handleMemberAction('block', member.id),
                    colors.error
                  )
                )}
                {!member.isAdmin ? (
                  renderActionButton(
                    'star',
                    'Promote',
                    () => handleMemberAction('promote', member.id),
                    colors.warning
                  )
                ) : (
                  renderActionButton(
                    'star-outline',
                    'Demote',
                    () => handleMemberAction('demote', member.id),
                    colors.warning
                  )
                )}
                {!member.isAdmin && (
                  renderActionButton(
                    'person-remove',
                    'Remove',
                    () => handleMemberAction('remove', member.id),
                    colors.error
                  )
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Management</Text>
        <Text style={styles.sectionDescription}>
          Hidden messages and updates can be unhidden in this section
        </Text>
        {preferences.hiddenMessages.length > 0 && (
          <TouchableOpacity
            style={styles.hiddenContentButton}
            onPress={() => {
              // Navigate to hidden messages view
            }}
          >
            <Text style={styles.hiddenContentText}>
              {preferences.hiddenMessages.length} Hidden Messages
            </Text>
          </TouchableOpacity>
        )}
        {preferences.hiddenUpdates.length > 0 && (
          <TouchableOpacity
            style={styles.hiddenContentButton}
            onPress={() => {
              // Navigate to hidden updates view
            }}
          >
            <Text style={styles.hiddenContentText}>
              {preferences.hiddenUpdates.length} Hidden Updates
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    color: colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  memberItem: {
    marginBottom: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  blockedLabel: {
    fontSize: 14,
    color: colors.error,
  },
  memberActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hiddenContentButton: {
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  hiddenContentText: {
    fontSize: 16,
    color: colors.text,
  },
}); 