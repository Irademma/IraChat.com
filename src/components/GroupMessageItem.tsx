import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../styles/colors';
import { GroupMessage } from '../types/groupChat';
import { formatTimeAgo } from '../utils/dateUtils';
import { handleDelete } from '../utils/deleteHandler';
import { fontSize, spacing, wp } from '../utils/responsive';

// Define Media type for compatibility
interface Media {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  caption?: string;
}

// Define MediaPreview component for compatibility
const MediaPreview: React.FC<{ media: Media; onPress: () => void; onLongPress: () => void }> = ({ media, onPress, onLongPress }) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
    <Image source={{ uri: media.url }} style={{ width: wp(50), height: wp(50), borderRadius: 8 }} />
  </TouchableOpacity>
);

interface GroupMessageItemProps {
  message: GroupMessage;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => Promise<void>;
  onReaction?: (messageId: string, reaction: string) => void;
  onReply?: (message: GroupMessage) => void;
  onMention?: (userId: string) => void;
  onMediaPress?: (media: Media) => void;
  onLongPress?: () => void;
}

export const GroupMessageItem: React.FC<GroupMessageItemProps> = ({
  message,
  isCurrentUser,
  onDelete,
  onReaction,
  onReply,
  onMention,
  onMediaPress,
  onLongPress,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleDeleteMessage = async () => {
    if (!onDelete) return;

    handleDelete({
      type: 'message',
      onDelete: async () => {
        await onDelete(message.id);
      },
    });
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!onDelete) return;

    handleDelete({
      type: 'media',
      onDelete: async () => {
        // Implement media deletion logic
        const updatedMedia = message.media.filter(m => m.id !== mediaId);
        // Update the message with new media array
        await onDelete(message.id);
      },
    });
  };

  const renderMedia = () => {
    const mediaUrls = message.mediaUrls || message.media || [];
    if (!mediaUrls?.length) return null;

    return (
      <View style={styles.mediaContainer}>
        {mediaUrls.map((media, index) => {
          const mediaItem = typeof media === 'string'
            ? { id: `media_${index}`, type: 'image' as const, url: media }
            : media;

          return (
            <TouchableOpacity
              key={mediaItem.id || `media_${index}`}
              style={styles.mediaItem}
              onPress={() => onMediaPress?.(mediaItem)}
              onLongPress={() => handleDeleteMedia(mediaItem.id || `media_${index}`)}
            >
              <MediaPreview
                media={mediaItem}
                onPress={() => onMediaPress?.(mediaItem)}
                onLongPress={() => handleDeleteMedia(mediaItem.id || `media_${index}`)}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderReactions = useCallback(() => {
    const reactions = Object.entries(message.reactions);
    if (!reactions.length) return null;

    return (
      <View style={styles.reactionsContainer}>
        {reactions.map(([emoji, userIds]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => onReaction?.(message.id, emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{userIds.length}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [message.reactions, onReaction]);

  const renderReplies = useCallback(() => {
    if (!message.replies.length) return null;

    return (
      <View style={styles.repliesContainer}>
        {message.replies.map((reply) => (
          <View key={reply.messageId} style={styles.replyItem}>
            <Text style={styles.replySender}>{reply.senderName}</Text>
            <Text style={styles.replyContent}>{reply.content}</Text>
          </View>
        ))}
      </View>
    );
  }, [message.replies]);

  return (
    <Animated.View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {!isCurrentUser && (
        <Image
          source={{ uri: message.senderProfilePic }}
          style={styles.avatar}
        />
      )}

      <View style={styles.messageContent}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          delayLongPress={500}
          style={styles.messageBubble}
        >
          <Text style={styles.messageText}>{message.content}</Text>
          {renderMedia()}
          <Text style={styles.timestamp}>
            {formatTimeAgo(message.timestamp)}
            {message.isEdited && ' (edited)'}
          </Text>
        </TouchableOpacity>

        {renderReactions()}
        {renderReplies()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowReactions(!showReactions)}
          >
            <Ionicons name="happy-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReply?.(message)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {isCurrentUser && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteMessage}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    marginRight: spacing.sm,
  },
  messageContent: {
    maxWidth: wp(70),
  },
  senderName: {
    color: '#666',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  messageBubble: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: spacing.sm,
  },
  messageText: {
    color: 'white',
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  timestamp: {
    color: '#666',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    marginTop: spacing.sm,
  },
  mediaItem: {
    marginBottom: spacing.xs,
  },
  media: {
    width: wp(50),
    height: wp(50),
    borderRadius: 8,
  },
  mediaCaption: {
    color: 'white',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  reactionEmoji: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
  },
  reactionCount: {
    color: 'white',
    fontSize: fontSize.xs,
  },
  repliesContainer: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: '#333',
  },
  replyItem: {
    marginBottom: spacing.xs,
  },
  replySender: {
    color: '#666',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  replyContent: {
    color: 'white',
    fontSize: fontSize.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: 8,
  },
}); 