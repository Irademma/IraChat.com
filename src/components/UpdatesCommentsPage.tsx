import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { realUpdatesService } from '../services/realUpdatesService';
import { formatTimeAgo } from '../utils/dateUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  id: string;
  updateId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: string[];
  replies: Reply[];
  parentCommentId?: string;
}

interface Reply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: string[];
  replyToUserId?: string;
  replyToUserName?: string;
}

interface UpdatesCommentsPageProps {
  visible: boolean;
  onClose: () => void;
  updateId: string;
  onUserPress: (userId: string) => void;
}

export const UpdatesCommentsPage: React.FC<UpdatesCommentsPageProps> = ({
  visible,
  onClose,
  updateId,
  onUserPress,
}) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string } | null>(null);
  const [showReplies, setShowReplies] = useState<{ [commentId: string]: boolean }>({});
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      loadComments();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && updateId) {
      loadComments();
    }
  }, [updateId, visible]);

  const loadComments = async () => {
    if (!updateId) return;
    
    setIsLoading(true);
    try {
      const result = await realUpdatesService.getUpdateComments(updateId);
      if (result.success && result.comments) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('❌ Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !currentUser?.id) return;

    setIsPosting(true);
    try {
      const result = await realUpdatesService.addComment(
        updateId,
        currentUser.id,
        currentUser.name || 'Unknown User',
        currentUser.avatar,
        commentText.trim(),
        replyingTo?.commentId
      );

      if (result.success) {
        setCommentText('');
        setReplyingTo(null);
        await loadComments();
        
        // Scroll to bottom to show new comment
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', result.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser?.id) return;

    try {
      const result = await realUpdatesService.likeComment(commentId, currentUser.id);
      if (result.success) {
        await loadComments();
      }
    } catch (error) {
      console.error('❌ Error liking comment:', error);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo({ commentId, userName });
    setCommentText(`@${userName} `);
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderReply = ({ item: reply }: { item: Reply }) => (
    <View style={styles.replyContainer}>
      <TouchableOpacity onPress={() => onUserPress(reply.userId)}>
        <Image
          source={{ uri: reply.userAvatar || 'https://via.placeholder.com/32' }}
          style={styles.replyAvatar}
        />
      </TouchableOpacity>
      
      <View style={styles.replyContent}>
        <View style={styles.replyBubble}>
          <TouchableOpacity onPress={() => onUserPress(reply.userId)}>
            <Text style={styles.replyUserName}>{reply.userName}</Text>
          </TouchableOpacity>
          {reply.replyToUserName && (
            <Text style={styles.replyToText}>
              replying to <Text style={styles.replyToUser}>@{reply.replyToUserName}</Text>
            </Text>
          )}
          <Text style={styles.replyText}>{reply.content}</Text>
        </View>
        
        <View style={styles.replyActions}>
          <Text style={styles.replyTime}>{formatTimeAgo(reply.timestamp)}</Text>
          <TouchableOpacity
            style={styles.replyActionButton}
            onPress={() => handleLikeComment(reply.id)}
          >
            <Ionicons
              name={reply.likes.includes(currentUser?.id || '') ? "heart" : "heart-outline"}
              size={14}
              color={reply.likes.includes(currentUser?.id || '') ? "#87CEEB" : "#666"}
            />
            {reply.likes.length > 0 && (
              <Text style={styles.replyActionText}>{reply.likes.length}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.replyActionButton}
            onPress={() => handleReply(reply.commentId, reply.userName)}
          >
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.replyActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
        <Image
          source={{ uri: comment.userAvatar || 'https://via.placeholder.com/40' }}
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
            <Text style={styles.commentUserName}>{comment.userName}</Text>
          </TouchableOpacity>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.timestamp)}</Text>
          <TouchableOpacity
            style={styles.commentActionButton}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Ionicons
              name={comment.likes.includes(currentUser?.id || '') ? "heart" : "heart-outline"}
              size={16}
              color={comment.likes.includes(currentUser?.id || '') ? "#87CEEB" : "#666"}
            />
            {comment.likes.length > 0 && (
              <Text style={styles.commentActionText}>{comment.likes.length}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commentActionButton}
            onPress={() => handleReply(comment.id, comment.userName)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
          {comment.replies.length > 0 && (
            <TouchableOpacity
              style={styles.commentActionButton}
              onPress={() => toggleReplies(comment.id)}
            >
              <Ionicons 
                name={showReplies[comment.id] ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#666" 
              />
              <Text style={styles.commentActionText}>
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Replies */}
        {showReplies[comment.id] && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <View key={reply.id}>
                {renderReply({ item: reply })}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Comments List */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#87CEEB" />
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            )
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                Replying to @{replyingTo.userName}
              </Text>
              <TouchableOpacity onPress={() => {
                setReplyingTo(null);
                setCommentText('');
              }}>
                <Ionicons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <Image
              source={{ uri: currentUser?.avatar || 'https://via.placeholder.com/32' }}
              style={styles.inputAvatar}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: commentText.trim() && !isPosting ? 1 : 0.5 }
              ]}
              onPress={handlePostComment}
              disabled={!commentText.trim() || isPosting}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#87CEEB" />
              ) : (
                <Ionicons name="send" size={20} color="#87CEEB" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  commentsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  commentsContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999999',
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#87CEEB',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 12,
  },
  commentTime: {
    fontSize: 12,
    color: '#666666',
    marginRight: 16,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  replyUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#87CEEB',
    marginBottom: 1,
  },
  replyToText: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 2,
  },
  replyToUser: {
    color: '#87CEEB',
    fontWeight: '500',
  },
  replyText: {
    fontSize: 12,
    color: '#000000',
    lineHeight: 16,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 10,
  },
  replyTime: {
    fontSize: 11,
    color: '#666666',
    marginRight: 12,
  },
  replyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  replyActionText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 3,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#87CEEB',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
});
