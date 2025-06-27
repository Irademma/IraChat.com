import React from "react";
import { View, Text, Image, Animated } from "react-native";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  phoneNumber: string;
}

interface CallInfoProps {
  contacts: Contact[];
  isConnected: boolean;
  isConnecting: boolean;
  callType: "voice" | "video";
  callDuration: number;
  error?: string | null;
  pulseAnim: Animated.Value;
}

export const CallInfo: React.FC<CallInfoProps> = ({
  contacts,
  isConnected,
  isConnecting,
  callType,
  callDuration,
  error,
  pulseAnim,
}) => {
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderContactInfo = () => {
    if (contacts.length === 1) {
      const contact = contacts[0];
      return (
        <View className="items-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image
              source={{ uri: contact.avatar }}
              className="w-40 h-40 rounded-full border-4 border-white/20"
            />
          </Animated.View>
          <Text
            className="text-white text-2xl mt-6"
            style={{ fontWeight: "700" }}
          >
            {contact.name}
          </Text>
          <Text className="text-white/80 text-lg mt-2">
            {contact.phoneNumber}
          </Text>
        </View>
      );
    } else {
      return (
        <View className="items-center">
          <Text className="text-white text-2xl" style={{ fontWeight: "700" }}>
            Group Call
          </Text>
          <Text className="text-white/80 text-lg mt-2">
            {contacts.length} participants
          </Text>
          <View className="flex-row mt-6">
            {contacts.slice(0, 3).map((contact, index) => (
              <Animated.View
                key={contact.id}
                style={{
                  transform: [{ scale: pulseAnim }],
                  marginLeft: index > 0 ? -20 : 0,
                  zIndex: contacts.length - index,
                }}
              >
                <Image
                  source={{ uri: contact.avatar }}
                  className="w-20 h-20 rounded-full border-2 border-white/20"
                />
              </Animated.View>
            ))}
          </View>
        </View>
      );
    }
  };

  const getStatusText = () => {
    if (error) return error;
    if (isConnected) return callType === "video" ? "Video call active" : "Voice call active";
    if (isConnecting) return callType === "video" ? "Connecting video call..." : "Connecting call...";
    return callType === "video" ? "Video calling..." : "Calling...";
  };

  return (
    <View className="flex-1 items-center justify-center px-8">
      {!isConnected ? (
        <View className="items-center">
          {renderContactInfo()}
          <Text className={`text-lg mt-8 ${error ? 'text-red-400' : 'text-white/80'}`}>
            {getStatusText()}
          </Text>
        </View>
      ) : (
        <View className="items-center">
          {callType !== "video" && renderContactInfo()}
          <Text
            className="text-white text-xl mt-8"
            style={{ fontWeight: "700" }}
          >
            {formatCallDuration(callDuration)}
          </Text>
          <Text className="text-white/80 text-base mt-2">
            {getStatusText()}
          </Text>
        </View>
      )}
    </View>
  );
};
