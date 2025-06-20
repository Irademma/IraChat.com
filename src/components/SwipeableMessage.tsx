import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { trackSwipeAction } from "../services/analytics";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  type: "text" | "image" | "video" | "audio";
  media?: Array<{
    id: string;
    uri: string;
    type: "image" | "video" | "audio";
  }>;
}

interface SwipeableMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onArchive: (message: Message) => void;
  onMediaPress?: (mediaUri: string, mediaType: string) => void;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = ({
  message,
  isOwnMessage,
  onReply,
  onArchive,
  onMediaPress,
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const replyIconOpacity = useRef(new Animated.Value(0)).current;
  const archiveIconOpacity = useRef(new Animated.Value(0)).current;
  const replyIconScale = useRef(new Animated.Value(0.8)).current;
  const archiveIconScale = useRef(new Animated.Value(0.8)).current;

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  );

  const handlePanStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.ACTIVE) {
      // Show appropriate icon based on swipe direction
      if (translationX > 0) {
        // Swiping right - show reply icon
        const progress = Math.min(translationX / 80, 1);
        replyIconOpacity.setValue(progress);
        replyIconScale.setValue(0.8 + progress * 0.2);
        archiveIconOpacity.setValue(0);
      } else if (translationX < 0) {
        // Swiping left - show archive icon
        const progress = Math.min(Math.abs(translationX) / 80, 1);
        archiveIconOpacity.setValue(progress);
        archiveIconScale.setValue(0.8 + progress * 0.2);
        replyIconOpacity.setValue(0);
      }
    }

    if (state === State.END) {
      const threshold = 80;

      if (translationX > threshold) {
        // Swipe right - Reply
        trackSwipeAction("reply", message.type);
        onReply(message);
      } else if (translationX < -threshold) {
        // Swipe left - Archive
        trackSwipeAction("archive", message.type);
        onArchive(message);
      }

      // Reset animations
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(replyIconOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(archiveIconOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMediaGrid = () => {
    if (!message.media || message.media.length === 0) return null;

    const mediaItems = message.media;
    const gridCols = mediaItems.length === 1 ? 1 : 2;

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 8,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {mediaItems.map((media, index) => (
          <TouchableOpacity
            key={media.id}
            onPress={() => onMediaPress?.(media.uri, media.type)}
            style={{
              width: gridCols === 1 ? "100%" : "50%",
              aspectRatio: 1,
              padding: 1,
            }}
          >
            {media.type === "image" ? (
              <Image
                source={{ uri: media.uri }}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f0f0f0",
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={media.type === "video" ? "play-circle" : "volume-high"}
                  size={40}
                  color="white"
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={{ marginVertical: 4, paddingHorizontal: 16 }}>
      {/* Background Icons */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 30,
        }}
      >
        {/* Reply Icon (Left) */}
        <Animated.View
          style={{
            opacity: replyIconOpacity,
            transform: [{ scale: replyIconScale }],
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#4CAF50",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-undo" size={20} color="white" />
          </View>
        </Animated.View>

        {/* Archive Icon (Right) */}
        <Animated.View
          style={{
            opacity: archiveIconOpacity,
            transform: [{ scale: archiveIconScale }],
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#FF9800",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="archive" size={20} color="white" />
          </View>
        </Animated.View>
      </View>

      {/* Message Content */}
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={handlePanStateChange}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
            flexDirection: "row",
            justifyContent: isOwnMessage ? "flex-end" : "flex-start",
          }}
        >
          {/* Sender Avatar (for others' messages) */}
          {!isOwnMessage && (
            <Image
              source={{ uri: message.sender.avatar }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 8,
                alignSelf: "flex-end",
              }}
            />
          )}

          {/* Message Bubble */}
          <View
            style={{
              maxWidth: "75%",
              backgroundColor: isOwnMessage ? "#667eea" : "#f0f0f0",
              borderRadius: 16,
              padding: 12,
              borderBottomRightRadius: isOwnMessage ? 4 : 16,
              borderBottomLeftRadius: isOwnMessage ? 16 : 4,
            }}
          >
            {/* Sender Name (for group messages) */}
            {!isOwnMessage && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#667eea",
                  marginBottom: 4,
                }}
              >
                {message.sender.name}
              </Text>
            )}

            {/* Message Text */}
            {message.content && (
              <Text
                style={{
                  fontSize: 16,
                  color: isOwnMessage ? "white" : "#333",
                  lineHeight: 20,
                }}
              >
                {message.content}
              </Text>
            )}

            {/* Media Grid */}
            {renderMediaGrid()}

            {/* Timestamp */}
            <Text
              style={{
                fontSize: 11,
                color: isOwnMessage ? "rgba(255,255,255,0.7)" : "#999",
                marginTop: 4,
                alignSelf: "flex-end",
              }}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
