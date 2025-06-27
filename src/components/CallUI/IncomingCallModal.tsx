import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface IncomingCallModalProps {
  visible: boolean;
  callerName: string;
  callerAvatar: string;
  callType: "voice" | "video" | "group_voice" | "group_video";
  onAnswer: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName,
  callerAvatar,
  callType,
  onAnswer,
  onDecline,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="flex-1 justify-center items-center px-8">
          {/* Incoming call text */}
          <Text className="text-white/80 text-lg mb-8">
            Incoming {callType} call
          </Text>

          {/* Caller avatar */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image
              source={{ uri: callerAvatar }}
              className="w-48 h-48 rounded-full border-4 border-white/20"
            />
          </Animated.View>

          {/* Caller name */}
          <Text
            className="text-white text-3xl mt-8 text-center"
            style={{ fontWeight: "700" }}
          >
            {callerName}
          </Text>

          {/* Call type indicator */}
          <View className="flex-row items-center mt-4">
            <Ionicons
              name={(callType === "video" || callType === "group_video") ? "videocam" : "call"}
              size={20}
              color="white"
            />
            <Text className="text-white/80 text-lg ml-2">
              {callType === "group_voice" ? "Group voice call" :
               callType === "group_video" ? "Group video call" :
               callType === "video" ? "Video call" : "Voice call"}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row justify-around items-center pb-16 px-16">
          {/* Decline button */}
          <TouchableOpacity
            onPress={onDecline}
            className="w-20 h-20 bg-red-500 rounded-full items-center justify-center"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Decline call"
          >
            <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
          </TouchableOpacity>

          {/* Answer button */}
          <TouchableOpacity
            onPress={onAnswer}
            className="w-20 h-20 bg-green-500 rounded-full items-center justify-center"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Answer call"
          >
            <Ionicons name="call" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};
