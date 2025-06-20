// Comment modal for vertical media updates
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Comment } from "../types";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  isLoading: boolean;
  newComment: string;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  isSubmitting: boolean;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  comments,
  isLoading,
  newComment,
  onCommentChange,
  onSubmitComment,
  isSubmitting,
}) => {
  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return "now";

    const now = new Date();
    const commentTime = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentTime.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "flex-start",
      }}
    >
      {/* User Avatar */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#E5E5E5",
          marginRight: 12,
          overflow: "hidden",
        }}
      >
        {item.userAvatar ? (
          <Image
            source={{ uri: item.userAvatar }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#CCCCCC",
            }}
          >
            <Ionicons name="person" size={16} color="#666666" />
          </View>
        )}
      </View>

      {/* Comment Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: "#000000",
              marginRight: 8,
            }}
          >
            {item.username}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666666",
            }}
          >
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: "#000000",
            lineHeight: 20,
          }}
        >
          {item.text}
        </Text>

        {/* Comment Actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={16}
              color={item.isLiked ? "#FF3040" : "#666666"}
            />
            <Text
              style={{
                fontSize: 12,
                color: "#666666",
                marginLeft: 4,
              }}
            >
              {(item.likes || 0) > 0 ? item.likes || 0 : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 12,
                color: "#666666",
                fontWeight: "500",
              }}
            >
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E5E5",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#000000",
              }}
            >
              Comments
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 4,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <View style={{ flex: 1 }}>
            {isLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#667eea" />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: "#666666",
                  }}
                >
                  Loading comments...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                }}
              >
                <Ionicons name="chatbubble-outline" size={48} color="#CCCCCC" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#666666",
                    marginTop: 16,
                    textAlign: "center",
                  }}
                >
                  No comments yet
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#999999",
                    marginTop: 8,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Be the first to comment on this update
                </Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 8,
                }}
              />
            )}
          </View>

          {/* Comment Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: "#E5E5E5",
              backgroundColor: "#FFFFFF",
            }}
          >
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 14,
                maxHeight: 100,
                backgroundColor: "#F8F8F8",
              }}
              placeholder="Add a comment..."
              placeholderTextColor="#999999"
              value={newComment}
              onChangeText={onCommentChange}
              multiline
              textAlignVertical="center"
            />

            <TouchableOpacity
              onPress={onSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              style={{
                marginLeft: 12,
                backgroundColor: newComment.trim() ? "#667eea" : "#E5E5E5",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                minWidth: 60,
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: newComment.trim() ? "#FFFFFF" : "#999999",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
