/**
 * Improved Empty State Component for IraChat
 * 
 * Engaging empty states with illustrations, helpful messages,
 * and clear calls to action
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../styles/designSystem';

interface EmptyStateProps {
  type: 'chats' | 'groups' | 'calls' | 'updates' | 'contacts' | 'search' | 'generic';
  title?: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  showIllustration?: boolean;
  showBackground?: boolean;
}

const emptyStateConfig = {
  chats: {
    icon: 'chatbubbles-outline' as const,
    title: 'No conversations yet',
    subtitle: 'Start messaging with your contacts to see your chats here',
    actionText: 'Start a new chat',
    color: colors.primary,
  },
  groups: {
    icon: 'people-outline' as const,
    title: 'No groups yet',
    subtitle: 'Create or join groups to chat with multiple people at once',
    actionText: 'Create a group',
    color: colors.success,
  },
  calls: {
    icon: 'call-outline' as const,
    title: 'No call history',
    subtitle: 'Your voice and video calls will appear here',
    actionText: 'Make a call',
    color: colors.info,
  },
  updates: {
    icon: 'camera-outline' as const,
    title: 'No updates yet',
    subtitle: 'Share photos and videos to see updates from your contacts',
    actionText: 'Share an update',
    color: colors.warning,
  },
  contacts: {
    icon: 'person-add-outline' as const,
    title: 'No contacts found',
    subtitle: 'Add contacts to start chatting and sharing updates',
    actionText: 'Add contacts',
    color: colors.primary,
  },
  search: {
    icon: 'search-outline' as const,
    title: 'No results found',
    subtitle: 'Try adjusting your search terms or check the spelling',
    actionText: 'Clear search',
    color: colors.gray500,
  },
  generic: {
    icon: 'document-outline' as const,
    title: 'Nothing here yet',
    subtitle: 'Content will appear here when available',
    actionText: 'Refresh',
    color: colors.gray500,
  },
};

export const EmptyStateImproved: React.FC<EmptyStateProps> = ({
  type,
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
  showIllustration = true,
  showBackground = false,
}) => {
  const config = emptyStateConfig[type];
  
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displayActionText = actionText || config.actionText;
  
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing['4xl'],
          paddingVertical: spacing['6xl'],
        },
        style,
      ]}
    >
      {/* Illustration */}
      {showIllustration && (
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: `${config.color}15`, // 15% opacity
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing['3xl'],
          }}
        >
          <Ionicons
            name={config.icon}
            size={48}
            color={config.color}
          />
        </View>
      )}
      
      {/* Title */}
      <Text
        style={[
          {
            fontSize: 24,
            fontWeight: '600' as const,
            color: colors.gray800,
            textAlign: 'center' as const,
            marginBottom: spacing.md,
          },
        ]}
      >
        {displayTitle}
      </Text>
      
      {/* Subtitle */}
      <Text
        style={[
          {
            fontSize: 16,
            fontWeight: '400' as const,
            color: colors.gray500,
            textAlign: 'center' as const,
            marginBottom: spacing['3xl'],
            lineHeight: 22,
          },
        ]}
      >
        {displaySubtitle}
      </Text>
      
      {/* Action Button */}
      {onActionPress && displayActionText && (
        <TouchableOpacity
          onPress={onActionPress}
          style={{
            backgroundColor: config.color,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing['2xl'],
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '600' as const,
                color: colors.white,
                marginRight: spacing.sm,
              },
            ]}
          >
            {displayActionText}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Specific empty state components for common use cases
export const ChatsEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => {
  const { ImageBackground } = require('react-native');

  return (
    <View style={{ flex: 1 }}>
      {/* IraChat Tiled Background */}
      <ImageBackground
        source={require('../../assets/images/BACKGROUND.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
        }}
        resizeMode="repeat"
      />

      {/* Overlay for better readability */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      />

      {/* Empty State Content */}
      <EmptyStateImproved type="chats" {...props} />
    </View>
  );
};

export const GroupsEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyStateImproved type="groups" {...props} />
);

export const CallsEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyStateImproved type="calls" {...props} />
);

export const UpdatesEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyStateImproved type="updates" {...props} />
);

export const ContactsEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyStateImproved type="contacts" {...props} />
);

export const SearchEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyStateImproved type="search" {...props} />
);

// Loading state component
interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  style,
}) => (
  <View
    style={[
      {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['4xl'],
      },
      style,
    ]}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
      }}
    >
      <Ionicons
        name="hourglass-outline"
        size={32}
        color={colors.primary}
      />
    </View>
    
    <Text
      style={[
        {
          fontSize: 16,
          fontWeight: '400' as const,
          color: colors.gray600,
          textAlign: 'center' as const,
        },
      ]}
    >
      {message}
    </Text>
  </View>
);

// Error state component
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please try again or contact support if the problem persists',
  onRetry,
  style,
}) => (
  <View
    style={[
      {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['4xl'],
      },
      style,
    ]}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.error}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
      }}
    >
      <Ionicons
        name="alert-circle-outline"
        size={32}
        color={colors.error}
      />
    </View>
    
    <Text
      style={[
        {
          fontSize: 20,
          fontWeight: '600' as const,
          color: colors.gray800,
          textAlign: 'center' as const,
          marginBottom: spacing.md,
        },
      ]}
    >
      {title}
    </Text>
    
    <Text
      style={[
        {
          fontSize: 16,
          fontWeight: '400' as const,
          color: colors.gray500,
          textAlign: 'center' as const,
          marginBottom: spacing['3xl'],
          lineHeight: 22,
        },
      ]}
    >
      {message}
    </Text>
    
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: colors.error,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing['2xl'],
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons
          name="refresh"
          size={16}
          color={colors.white}
          style={{ marginRight: spacing.sm }}
        />
        <Text
          style={[
            {
              fontSize: 16,
              fontWeight: '600' as const,
              color: colors.white,
            },
          ]}
        >
          Try again
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default EmptyStateImproved;
