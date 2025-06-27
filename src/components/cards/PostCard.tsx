import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { postsService } from "../../services/postsService";
import { CommentsModal } from "../modals/CommentsModal";
import { EditPostModal } from "../modals/EditPostModal";
import { ShareModal } from "../modals/ShareModal";

interface Author {
  _id: string;
  name: string;
  username: string;
  image: string;
}

interface Comment {
  _id: string;
  text: string;
  author: Author;
  createdAt: string;
  likes: string[];
}

interface PostCardProps {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  liked: boolean;
  owner: boolean;
  currentUserId: string;
}

export default function PostCard({
  id,
  content,
  author,
  createdAt,
  likes,
  comments,
  liked,
  owner,
  currentUserId,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [postContent, setPostContent] = useState(content);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return "Just now";
    }
  };

  const handleLike = async () => {
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      
      // Real Firebase update
      await postsService.toggleLike(id, currentUserId);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleComment = () => {
    setShowCommentsModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleMoreOptions = () => {
    Alert.alert(
      "Post Options",
      owner ? "What would you like to do?" : "Report this post?",
      owner
        ? [
            {
              text: "Edit",
              onPress: () => setShowEditModal(true),
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: handleDeletePost,
            },
            { text: "Cancel", style: "cancel" },
          ]
        : [
            {
              text: "Report",
              style: "destructive",
              onPress: handleReportPost,
            },
            { text: "Cancel", style: "cancel" },
          ],
    );
  };

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await postsService.deletePost(id, currentUserId);
              Alert.alert("Success", "Post deleted successfully!");
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert("Error", "Failed to delete post. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleReportPost = () => {
    Alert.alert(
      "Report Post",
      "Why are you reporting this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Spam",
          onPress: () => submitReport("spam"),
        },
        {
          text: "Inappropriate Content",
          onPress: () => submitReport("inappropriate"),
        },
        {
          text: "Harassment",
          onPress: () => submitReport("harassment"),
        },
        {
          text: "Other",
          onPress: () => {
            Alert.prompt(
              "Report Details",
              "Please describe the issue:",
              async (description) => {
                if (description) {
                  await submitReport("other", description);
                }
              }
            );
          },
        },
      ]
    );
  };

  const submitReport = async (reason: string, description?: string) => {
    try {
      await postsService.reportPost(id, currentUserId, reason, description);
      Alert.alert("Thank You", "Your report has been submitted. We'll review it shortly.");
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  return (
    <View className="bg-white mx-4 my-2 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-3">
        <View className="flex-row items-center flex-1">
          {/* Avatar */}
          <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
            {author.image ? (
              <Image
                source={{ uri: author.image }}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white font-bold text-sm">
                {author.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* User Info */}
          <View className="flex-1">
            <Text className="text-gray-800 font-semibold text-base">
              {author.name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-sm">@{author.username}</Text>
              <Text className="text-gray-400 mx-1">•</Text>
              <Text className="text-gray-500 text-sm">
                {formatTime(createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* More Options */}
        <TouchableOpacity
          onPress={handleMoreOptions}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="mb-4">
        <Text className="text-gray-800 text-base leading-6 px-4">{postContent}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100">
        {/* Like Button */}
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center"
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={22}
            color={isLiked ? "#EF4444" : "#6B7280"}
          />
          <Text className="text-gray-600 text-sm ml-1 font-medium">
            {likesCount}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={handleComment}
          className="flex-row items-center"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-1 font-medium">
            {comments.length}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center"
        >
          <Ionicons name="share-outline" size={20} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-1 font-medium">Share</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <CommentsModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={id}
        currentUser={{
          id: currentUserId,
          name: "Current User",
          username: "currentuser",
          image: "",
        }}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={id}
        postContent={postContent}
        postAuthor={author.name}
        currentUser={{
          id: currentUserId,
          name: "Current User",
          username: "currentuser",
          image: "",
        }}
      />

      <EditPostModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        postId={id}
        currentContent={postContent}
        currentUserId={currentUserId}
        onPostUpdated={(newContent) => {
          setPostContent(newContent);
          setShowEditModal(false);
        }}
      />
    </View>
  );
}