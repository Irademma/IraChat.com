// 😍 MESSAGE REACTIONS - Add emoji reactions to messages
// Users can react with emojis like WhatsApp/Instagram

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MessageReactionsProps {
  messageId: string;
  reactions: { [userId: string]: string };
  currentUserId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string) => void;
  showReactionPicker: boolean;
  onReactionPickerClose: () => void;
}

// Popular emoji reactions
const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];
const ALL_REACTIONS = [
  // Faces
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  
  // Emotions
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  
  // Hands & Gestures
  '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
  '🖖', '👏', '🙌', '🤝', '🙏', '✊', '👊', '🤛', '🤜',
  
  // Hearts & Symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
  '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️',
  '🗯️', '💭', '💤', '🔥', '⭐', '🌟', '✨', '⚡', '☄️', '💥',
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  onReactionAdd,
  onReactionRemove,
  showReactionPicker,
  onReactionPickerClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('quick');

  // Get reaction summary for display
  const getReactionSummary = () => {
    const reactionCounts: { [emoji: string]: number } = {};
    Object.values(reactions).forEach(emoji => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });

    return Object.entries(reactionCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count
      .slice(0, 3) // Show top 3
      .map(([emoji, count]) => ({ emoji, count }));
  };

  // Check if current user has reacted
  const currentUserReaction = reactions[currentUserId];

  // Handle reaction selection
  const handleReactionSelect = (emoji: string) => {
    if (currentUserReaction === emoji) {
      // Remove reaction if same emoji
      onReactionRemove(messageId);
    } else {
      // Add or change reaction
      onReactionAdd(messageId, emoji);
    }
    onReactionPickerClose();
  };

  // Quick reaction handler
  const handleQuickReaction = (emoji: string) => {
    if (currentUserReaction === emoji) {
      onReactionRemove(messageId);
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  const reactionSummary = getReactionSummary();

  return (
    <>
      {/* Reaction Summary Display */}
      {reactionSummary.length > 0 && (
        <View style={styles.reactionSummary}>
          {reactionSummary.map(({ emoji, count }) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.reactionBadge,
                currentUserReaction === emoji && styles.userReactionBadge,
              ]}
              onPress={() => handleQuickReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={onReactionPickerClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onReactionPickerClose}
        >
          <View style={styles.reactionPicker}>
            {/* Quick Reactions */}
            <View style={styles.quickReactions}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickReactionsContent}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.quickReactionButton,
                      currentUserReaction === emoji && styles.selectedReaction,
                    ]}
                    onPress={() => handleReactionSelect(emoji)}
                  >
                    <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  selectedCategory === 'quick' && styles.activeCategoryTab,
                ]}
                onPress={() => setSelectedCategory('quick')}
              >
                <Text style={styles.categoryTabText}>Quick</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  selectedCategory === 'all' && styles.activeCategoryTab,
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={styles.categoryTabText}>All</Text>
              </TouchableOpacity>
            </View>

            {/* All Reactions Grid */}
            {selectedCategory === 'all' && (
              <ScrollView style={styles.allReactionsContainer}>
                <View style={styles.allReactionsGrid}>
                  {ALL_REACTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.reactionGridItem,
                        currentUserReaction === emoji && styles.selectedReaction,
                      ]}
                      onPress={() => handleReactionSelect(emoji)}
                    >
                      <Text style={styles.reactionGridEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Remove Reaction Button */}
            {currentUserReaction && (
              <TouchableOpacity
                style={styles.removeReactionButton}
                onPress={() => {
                  onReactionRemove(messageId);
                  onReactionPickerClose();
                }}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.removeReactionText}>Remove Reaction</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  reactionSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 2,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  userReactionBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reactionPicker: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
    maxHeight: SCREEN_WIDTH * 0.8,
  },
  quickReactions: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickReactionsContent: {
    paddingHorizontal: 16,
  },
  quickReactionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedReaction: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  quickReactionEmoji: {
    fontSize: 24,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: '#667eea',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  allReactionsContainer: {
    maxHeight: 200,
    paddingHorizontal: 16,
  },
  allReactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 16,
  },
  reactionGridItem: {
    width: SCREEN_WIDTH / 8,
    height: SCREEN_WIDTH / 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  reactionGridEmoji: {
    fontSize: 20,
  },
  removeReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  removeReactionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default MessageReactions;
