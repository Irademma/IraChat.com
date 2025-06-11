import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    AccessibilityInfo,
    Animated,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../theme/colors';
import { Group } from '../types/groupChat';
import { fontSize, hp, isSmallDevice, isTablet, wp } from '../utils/responsive';

interface GroupHeaderProps {
  group: Group;
  unreadCount?: number;
  typingMembers?: string[];
  recordingMembers?: string[];
  onlineMembers?: string[];
  onBackPress: () => void;
  onInfoPress: () => void;
  onSettingsPress: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  unreadCount = 0,
  typingMembers = [],
  recordingMembers = [],
  onlineMembers = [],
  onBackPress,
  onInfoPress,
  onSettingsPress,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const typingAnim = React.useRef(new Animated.Value(0)).current;
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };
    checkScreenReader();
  }, []);

  React.useEffect(() => {
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [unreadCount]);

  React.useEffect(() => {
    if (typingMembers.length > 0 || recordingMembers.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [typingMembers, recordingMembers]);

  const renderStatusIndicator = () => {
    if (recordingMembers.length > 0) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons 
            name="mic" 
            size={isTablet() ? 20 : 16}
            color={colors.error} 
            accessibilityLabel="Recording indicator"
          />
          <Text 
            style={[styles.statusText, isSmallDevice() && styles.statusTextSmall]}
            numberOfLines={1}
          >
            {recordingMembers.length === 1
              ? `${recordingMembers[0]} is recording...`
              : `${recordingMembers.length} members recording...`}
          </Text>
        </View>
      );
    }

    if (typingMembers.length > 0) {
      return (
        <View style={styles.statusContainer}>
          <Animated.View
            style={[
              styles.typingIndicator,
              {
                opacity: typingAnim,
              },
            ]}
          >
            <Text style={[styles.typingDots, isSmallDevice() && styles.typingDotsSmall]}>...</Text>
          </Animated.View>
          <Text 
            style={[styles.statusText, isSmallDevice() && styles.statusTextSmall]}
            numberOfLines={1}
          >
            {typingMembers.length === 1
              ? `${typingMembers[0]} is typing`
              : `${typingMembers.length} members typing`}
          </Text>
        </View>
      );
    }

    if (onlineMembers.length > 0) {
      return (
        <View style={styles.statusContainer}>
          <View style={[styles.onlineIndicator, isSmallDevice() && styles.onlineIndicatorSmall]} />
          <Text
            style={[styles.statusText, isSmallDevice() && styles.statusTextSmall]}
            numberOfLines={1}
          >
            {onlineMembers.length} {onlineMembers.length === 1 ? 'member' : 'members'} online
          </Text>
        </View>
      );
    }

    return null;
  };

  const getAccessibilityLabel = () => {
    const labels = [];
    labels.push(`Group: ${group.name}`);
    labels.push(`${group.members.length} members`);
    if (unreadCount > 0) {
      labels.push(`${unreadCount} unread messages`);
    }
    if (typingMembers.length > 0) {
      labels.push(`${typingMembers.length} members typing`);
    }
    if (recordingMembers.length > 0) {
      labels.push(`${recordingMembers.length} members recording`);
    }
    if (onlineMembers.length > 0) {
      labels.push(`${onlineMembers.length} members online`);
    }
    return labels.join(', ');
  };

  return (
    <View 
      style={styles.container}
      accessible={isScreenReaderEnabled}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="header"
    >
      <View style={styles.leftSection}>
        <TouchableOpacity 
          onPress={onBackPress} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons 
            name="arrow-back" 
            size={isTablet() ? 28 : 24}
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onInfoPress} 
          style={styles.groupInfo}
          accessibilityLabel={`View ${group.name} details`}
          accessibilityRole="button"
        >
          {group.photo ? (
            <Image 
              source={{ uri: group.photo }} 
              style={[
                styles.groupPhoto,
                isTablet() && styles.groupPhotoTablet,
                isSmallDevice() && styles.groupPhotoSmall
              ]}
            />
          ) : (
            <View style={[
              styles.groupPhotoPlaceholder,
              isTablet() && styles.groupPhotoTablet,
              isSmallDevice() && styles.groupPhotoSmall
            ]}>
              <Text style={[
                styles.groupInitials,
                isTablet() && styles.groupInitialsTablet,
                isSmallDevice() && styles.groupInitialsSmall
              ]}>
                {group.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.groupDetails}>
            <Text 
              style={[
                styles.groupName,
                isTablet() && styles.groupNameTablet,
                isSmallDevice() && styles.groupNameSmall
              ]}
              numberOfLines={1}
            >
              {group.name}
            </Text>
            <View style={styles.groupStatus}>
              <Text style={[
                styles.memberCount,
                isTablet() && styles.memberCountTablet,
                isSmallDevice() && styles.memberCountSmall
              ]}>
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </Text>
              {renderStatusIndicator()}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.unreadBadge,
              isTablet() && styles.unreadBadgeTablet,
              isSmallDevice() && styles.unreadBadgeSmall,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={[
              styles.unreadCount,
              isTablet() && styles.unreadCountTablet,
              isSmallDevice() && styles.unreadCountSmall
            ]}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </Animated.View>
        )}
        <TouchableOpacity 
          onPress={onSettingsPress} 
          style={styles.settingsButton}
          accessibilityLabel="Group settings"
          accessibilityRole="button"
        >
          <Ionicons 
            name="ellipsis-vertical" 
            size={isTablet() ? 28 : 24}
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: wp(2),
    marginRight: wp(2),
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupPhoto: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
  },
  groupPhotoTablet: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  groupPhotoSmall: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  groupPhotoPlaceholder: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  groupPhotoPlaceholderTablet: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  groupPhotoPlaceholderSmall: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  groupInitials: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  groupInitialsTablet: {
    fontSize: fontSize.md,
  },
  groupInitialsSmall: {
    fontSize: fontSize.sm,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: hp(0.2),
  },
  groupNameTablet: {
    fontSize: fontSize.lg,
  },
  groupNameSmall: {
    fontSize: fontSize.md,
  },
  groupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  memberCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: wp(2),
  },
  memberCountTablet: {
    fontSize: fontSize.xs,
  },
  memberCountSmall: {
    fontSize: fontSize.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: wp(1),
  },
  statusTextSmall: {
    fontSize: fontSize.xs,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
    marginLeft: wp(1),
  },
  typingDotsSmall: {
    fontSize: fontSize.lg,
  },
  onlineIndicator: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: colors.success,
    marginRight: wp(1),
  },
  onlineIndicatorSmall: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
  },
  settingsButton: {
    padding: wp(2),
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: wp(3),
    minWidth: wp(6),
    height: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
    paddingHorizontal: wp(1.5),
  },
  unreadBadgeTablet: {
    minWidth: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
  },
  unreadBadgeSmall: {
    minWidth: wp(4),
    height: wp(4),
    borderRadius: wp(2),
  },
  unreadCount: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  unreadCountTablet: {
    fontSize: fontSize.xxs,
  },
  unreadCountSmall: {
    fontSize: fontSize.xxs,
  },
});

export default GroupHeader; 