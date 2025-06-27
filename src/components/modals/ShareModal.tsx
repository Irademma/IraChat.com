import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { postsService } from '../../services/postsService';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  postAuthor: string;
  currentUser: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  postId,
  postContent,
  postAuthor,
  currentUser,
}) => {
  const [shareText, setShareText] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const shareOptions = [
    {
      title: 'Share to IraChat',
      description: 'Share with your IraChat followers',
      icon: 'chatbubbles',
      color: '#3B82F6',
      action: handleShareToIraChat,
    },
    {
      title: 'Copy Link',
      description: 'Copy link to clipboard',
      icon: 'copy',
      color: '#6B7280',
      action: handleCopyLink,
    },
    {
      title: 'Share Externally',
      description: 'Share via other apps',
      icon: 'share',
      color: '#10B981',
      action: handleExternalShare,
    },
    {
      title: 'Send Message',
      description: 'Send to a specific contact',
      icon: 'send',
      color: '#8B5CF6',
      action: handleSendMessage,
    },
  ];

  async function handleShareToIraChat() {
    try {
      setIsSharing(true);
      await postsService.sharePost(
        postId,
        currentUser.id,
        {
          name: currentUser.name,
          username: currentUser.username,
          image: currentUser.image || '',
        },
        shareText.trim() || undefined
      );
      
      Alert.alert('Success', 'Post shared to your timeline!');
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post');
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCopyLink() {
    try {
      // Generate shareable post URL
      const postUrl = `https://irachat.com/posts/${postId}`;

      // Use the Share API to share the post link
      await Share.share({
        message: `Check out this post by ${postAuthor}: "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}" - ${postUrl}`,
        url: postUrl,
        title: `Post by ${postAuthor}`,
      });

      console.log('✅ Post link shared successfully');
    } catch (error) {
      console.error('❌ Error sharing link:', error);
      Alert.alert('Error', 'Failed to share link. Please try again.');
    }
  }

  async function handleExternalShare() {
    try {
      const shareContent = `Check out this post by ${postAuthor} on IraChat:\n\n"${postContent}"\n\nDownload IraChat: https://irachat.com`;
      
      await Share.share({
        message: shareContent,
        title: 'IraChat Post',
      });
    } catch (error) {
      console.error('Error sharing externally:', error);
      Alert.alert('Error', 'Failed to share');
    }
  }

  function handleSendMessage() {
    Alert.alert(
      'Send Message',
      'Choose how you want to share this post:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Link',
          onPress: () => {
            handleCopyLink();
          },
        },
        {
          text: 'Share via SMS',
          onPress: () => {
            const message = `Check out this post: "${postContent.substring(0, 50)}..." - Shared via IraChat`;
            Alert.alert('SMS Ready', `Message copied: ${message}`);
          },
        },
      ]
    );
  }

  const renderShareOption = (option: typeof shareOptions[0]) => (
    <TouchableOpacity
      key={option.title}
      onPress={option.action}
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={isSharing}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${option.color}20` }}
      >
        <Ionicons name={option.icon as any} size={24} color={option.color} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-semibold text-base">
          {option.title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {option.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-800">Share Post</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Post Preview */}
        <View className="p-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-gray-600 text-sm mb-2">Sharing post by {postAuthor}:</Text>
          <Text className="text-gray-800 text-base" numberOfLines={3}>
            "            &quot;{postContent}&quot;"
          </Text>
        </View>

        {/* Share Text Input (for IraChat sharing) */}
        <View className="p-4 border-b border-gray-200">
          <Text className="text-gray-700 font-semibold mb-2">Add your thoughts (optional):</Text>
          <TextInput
            value={shareText}
            onChangeText={setShareText}
            placeholder="What do you think about this post?"
            className="bg-gray-100 rounded-lg p-3 text-gray-800"
            multiline
            maxLength={280}
            numberOfLines={3}
          />
          <Text className="text-gray-400 text-xs mt-1 text-right">
            {shareText.length}/280
          </Text>
        </View>

        {/* Share Options */}
        <View className="flex-1">
          {shareOptions.map(renderShareOption)}
        </View>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200">
          <Text className="text-gray-500 text-xs text-center">
            Sharing helps spread great content and supports creators
          </Text>
        </View>
      </View>
    </Modal>
  );
};
