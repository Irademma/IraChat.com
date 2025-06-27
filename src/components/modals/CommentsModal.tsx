import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postsService, Comment } from '../../services/postsService';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  currentUser: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
  currentUser,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments when modal opens
  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await postsService.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await postsService.addComment(
        postId,
        newComment.trim(),
        currentUser.id,
        {
          name: currentUser.name,
          username: currentUser.username,
          image: currentUser.image || '',
        }
      );
      
      setNewComment('');
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="flex-row p-4 border-b border-gray-100">
      {/* Avatar */}
      <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
        {item.author.image ? (
          <Image
            source={{ uri: item.author.image }}
            className="w-8 h-8 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-white font-bold text-xs">
            {item.author.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Comment Content */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-gray-800 font-semibold text-sm mr-2">
            {item.author.name}
          </Text>
          <Text className="text-gray-500 text-xs">
            @{item.author.username}
          </Text>
          <Text className="text-gray-400 text-xs mx-1">•</Text>
          <Text className="text-gray-500 text-xs">
            {formatTime(item.createdAt)}
          </Text>
        </View>
        <Text className="text-gray-800 text-sm leading-5">
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-800">Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item, index) => `comment-${index}`}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4">
                {isLoading ? 'Loading comments...' : 'No comments yet'}
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                Be the first to comment!
              </Text>
            </View>
          }
        />

        {/* Add Comment Input */}
        <View className="flex-row items-center p-4 border-t border-gray-200">
          {/* User Avatar */}
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
            {currentUser.image ? (
              <Image
                source={{ uri: currentUser.image }}
                className="w-8 h-8 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* Input */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              className="flex-1 text-gray-800"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className={`ml-2 ${
                newComment.trim() && !isSubmitting
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={newComment.trim() && !isSubmitting ? '#3B82F6' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
