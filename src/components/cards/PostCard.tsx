import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";

interface Author {
  _id: string;
  name: string;
  username: string;
  image: string;
}

interface PostCardProps {
  id: string;
  currentUserId: string;
  owner: boolean;
  DB_userID: string;
  repostOf?: any;
  parentId?: string;
  content: string;
  author: Author;
  group?: any;
  createdAt: string;
  comments: any[];
  likes: string[];
  liked: boolean;
}

export default function PostCard({
  id,
  currentUserId,
  owner,
  DB_userID,
  repostOf,
  parentId,
  content,
  author,
  group,
  createdAt,
  comments,
  likes,
  liked,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCount, setLikesCount] = useState(likes.length);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    // In real app, this would make API call to like/unlike post
  };

  const handleComment = () => {
    Alert.alert("Comments", "Comment functionality coming soon!");
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon!");
  };

  const handleMoreOptions = () => {
    Alert.alert(
      "Post Options",
      owner ? "What would you like to do?" : "Report this post?",
      owner
        ? [
            {
              text: "Edit",
              onPress: () =>
                Alert.alert("Edit", "Edit functionality coming soon!"),
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () =>
                Alert.alert("Delete", "Delete functionality coming soon!"),
            },
            { text: "Cancel", style: "cancel" },
          ]
        : [
            {
              text: "Report",
              style: "destructive",
              onPress: () =>
                Alert.alert("Report", "Report functionality coming soon!"),
            },
            { text: "Cancel", style: "cancel" },
          ],
    );
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {/* Profile Picture */}
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

          {/* Author Info */}
          <View className="flex-1">
            <Text
              className="text-gray-800 text-base"
              style={{ fontWeight: "600" }}
            >
              {author.name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-sm">@{author.username}</Text>
              <Text className="text-gray-400 text-sm mx-1">•</Text>
              <Text className="text-gray-500 text-sm">
                {formatTime(createdAt)}
              </Text>
              {owner && (
                <>
                  <Text className="text-gray-400 text-sm mx-1">•</Text>
                  <Text
                    className="text-blue-500 text-sm"
                    style={{ fontWeight: "500" }}
                  >
                    You
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* More Options */}
        <TouchableOpacity onPress={handleMoreOptions} className="p-1">
          <Text className="text-gray-400 text-lg">⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="mb-4">
        <Text className="text-gray-800 text-base leading-6">{content}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        {/* Like Button */}
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center flex-1"
        >
          <Text
            className={`text-lg mr-2 ${isLiked ? "text-red-500" : "text-gray-400"}`}
          >
            {isLiked ? "❤️" : "🤍"}
          </Text>
          <Text
            className={`text-sm ${isLiked ? "text-red-500" : "text-gray-500"}`}
          >
            {likesCount > 0 ? likesCount : "Like"}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={handleComment}
          className="flex-row items-center flex-1"
        >
          <Text className="text-gray-400 text-lg mr-2">💬</Text>
          <Text className="text-gray-500 text-sm">
            {comments.length > 0 ? comments.length : "Comment"}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center flex-1"
        >
          <Text className="text-gray-400 text-lg mr-2">📤</Text>
          <Text className="text-gray-500 text-sm">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
