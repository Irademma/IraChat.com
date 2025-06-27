import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { postsService } from '../../services/postsService';

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  currentContent: string;
  currentUserId: string;
  onPostUpdated: (newContent: string) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  onClose,
  postId,
  currentContent,
  currentUserId,
  onPostUpdated,
}) => {
  const [content, setContent] = useState(currentContent);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      Alert.alert('Error', 'Post content cannot be empty');
      return;
    }

    if (trimmedContent === currentContent.trim()) {
      Alert.alert('No Changes', 'You haven\'t made any changes to the post');
      return;
    }

    try {
      setIsUpdating(true);
      await postsService.editPost(postId, trimmedContent, currentUserId);
      
      onPostUpdated(trimmedContent);
      Alert.alert('Success', 'Post updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() !== currentContent.trim()) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setContent(currentContent);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const resetContent = () => {
    setContent(currentContent);
  };

  const clearContent = () => {
    Alert.alert(
      'Clear Content',
      'Are you sure you want to clear all content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setContent(''),
        },
      ]
    );
  };

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
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-blue-600 text-base font-semibold">Cancel</Text>
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-gray-800">Edit Post</Text>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={isUpdating || !content.trim()}
            className={`px-4 py-2 rounded-lg ${
              content.trim() && !isUpdating
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          >
            <Text
              className={`font-semibold ${
                content.trim() && !isUpdating
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Editor */}
        <View className="flex-1 p-4">
          <Text className="text-gray-700 font-semibold mb-3">Edit your post:</Text>
          
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="What&apos;s on your mind?"
            className="flex-1 text-gray-800 text-base leading-6"
            multiline
            textAlignVertical="top"
            maxLength={2000}
            autoFocus
          />
          
          {/* Character Count */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-gray-500 text-sm">
              {content.length}/2000 characters
            </Text>
            
            {content.length > 1800 && (
              <Text className="text-orange-500 text-sm font-semibold">
                {2000 - content.length} characters remaining
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={resetContent}
            className="flex-row items-center px-4 py-2 bg-gray-100 rounded-lg"
          >
            <Ionicons name="refresh" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2 font-semibold">Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={clearContent}
            className="flex-row items-center px-4 py-2 bg-red-100 rounded-lg"
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
            <Text className="text-red-600 ml-2 font-semibold">Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View className="p-4 bg-blue-50 border-t border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
            <View className="ml-2 flex-1">
              <Text className="text-blue-800 text-sm font-semibold">Editing Tips:</Text>
              <Text className="text-blue-700 text-xs mt-1">
                • Make sure your content is clear and engaging{'\n'}
                • Check for typos before saving{'\n'}
                • Edited posts will show an &quot;edited&quot; indicator
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
