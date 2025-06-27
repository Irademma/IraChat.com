import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View, Animated } from "react-native";

interface CallControlsProps {
  // Call state
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callType: "voice" | "video";
  
  // Actions
  onMute: () => void;
  onVideoToggle: () => void;
  onSpeakerToggle: () => void;
  onEndCall: () => void;
  onCameraSwitch?: () => void;
  
  // Animation
  fadeAnim: Animated.Value;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoEnabled,
  isSpeakerOn,
  callType,
  onMute,
  onVideoToggle,
  onSpeakerToggle,
  onEndCall,
  onCameraSwitch,
  fadeAnim,
}) => {
  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="absolute bottom-16 left-0 right-0"
    >
      <View className="flex-row justify-center items-center space-x-8 px-8">
        {/* Mute Button */}
        <TouchableOpacity
          onPress={onMute}
          className={`w-16 h-16 rounded-full items-center justify-center ${
            isMuted ? "bg-red-500" : "bg-white/20"
          }`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isMuted ? "Unmute microphone" : "Mute microphone"}
          accessibilityHint="Tap to toggle microphone"
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={onEndCall}
          className="w-20 h-20 bg-red-500 rounded-full items-center justify-center"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="End call"
          accessibilityHint="Tap to end the current call"
        >
          <Ionicons name="call" size={32} color="white" />
        </TouchableOpacity>

        {/* Video/Speaker Button */}
        {callType === "video" ? (
          <TouchableOpacity
            onPress={onVideoToggle}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              !isVideoEnabled ? "bg-red-500" : "bg-white/20"
            }`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isVideoEnabled ? "Turn off video" : "Turn on video"}
          >
            <Ionicons
              name={isVideoEnabled ? "videocam" : "videocam-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onSpeakerToggle}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              isSpeakerOn ? "bg-blue-500" : "bg-white/20"
            }`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Additional Controls for Video Calls */}
      {callType === "video" && (
        <View className="flex-row justify-center mt-6 space-x-6">
          <TouchableOpacity
            onPress={onSpeakerToggle}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isSpeakerOn ? "bg-blue-500" : "bg-white/20"
            }`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={20}
              color="white"
            />
          </TouchableOpacity>

          {onCameraSwitch && (
            <TouchableOpacity
              onPress={onCameraSwitch}
              className="w-12 h-12 rounded-full items-center justify-center bg-white/20"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Switch camera"
            >
              <Ionicons name="camera-reverse" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};
