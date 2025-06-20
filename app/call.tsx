import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Contact {
  id: string;
  name: string;
  avatar: string;
  phoneNumber: string;
}

export default function CallScreen() {
  const router = useRouter();
  const { type, contacts } = useLocalSearchParams();
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(type === "video");
  const [callContacts, setCallContacts] = useState<Contact[]>([]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer ref for call duration
  const timerRef = useRef<number | null>(null);

  // Sample contacts data for demonstration
  const mockContactsData: Contact[] = [
    {
      id: "1",
      name: "John Doe",
      phoneNumber: "+256701234567",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phoneNumber: "+256701234568",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
    },
    {
      id: "3",
      name: "Mike Wilson",
      phoneNumber: "+256701234569",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
  ];

  useEffect(() => {
    // Parse contact IDs and get contact data
    if (contacts) {
      try {
        const decodedContacts = decodeURIComponent(contacts as string);
        const contactIds = decodedContacts.split(",");
        const selectedContacts = mockContactsData.filter((c) =>
          contactIds.includes(c.id),
        );

        if (selectedContacts.length === 0) {
          Alert.alert("Error", "No valid contacts found for call");
          router.back();
          return;
        }

        setCallContacts(selectedContacts);
      } catch (error) {
        console.error("Error parsing contacts:", error);
        Alert.alert("Error", "Invalid call parameters");
        router.back();
        return;
      }
    }

    // Simulate call connection after 3 seconds
    const connectionTimer = setTimeout(() => {
      setIsCallConnected(true);
      setIsCallActive(true);
      startCallTimer();
    }, 3000);

    // Start pulse animation for ringing
    startPulseAnimation();

    return () => {
      clearTimeout(connectionTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contacts, router]);

  useEffect(() => {
    if (isCallConnected) {
      // Fade in call controls
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isCallConnected]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    Alert.alert("End Call", "Are you sure you want to end this call?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Call",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("📴 Ending call...");

            // Import calling service
            const { callingService } = await import(
              "../src/services/callingService"
            );

            // End the call
            await callingService.endCall();

            console.log("✅ Call ended successfully");
            router.back();
          } catch (error) {
            console.error("❌ Error ending call:", error);
            router.back();
          }
        },
      },
    ]);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
  };

  const renderContactInfo = () => {
    if (callContacts.length === 1) {
      const contact = callContacts[0];
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
            {callContacts.length} participants
          </Text>
          <View className="flex-row mt-6">
            {callContacts.slice(0, 3).map((contact, index) => (
              <Animated.View
                key={contact.id}
                style={{
                  transform: [{ scale: pulseAnim }],
                  marginLeft: index > 0 ? -20 : 0,
                  zIndex: callContacts.length - index,
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

  const renderVideoCall = () => {
    if (type !== "video" || !isVideoOn) return null;

    return (
      <View className="absolute inset-0">
        {/* Remote video (full screen) */}
        <View className="flex-1 bg-gray-900 items-center justify-center">
          <Text className="text-white text-lg">Remote Video</Text>
          <Text className="text-white/60 text-sm mt-2">
            {callContacts[0]?.name || "Contact"}&apos;s video
          </Text>
        </View>

        {/* Local video (picture-in-picture) */}
        <View className="absolute top-16 right-4 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xs">You</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900">
      <StatusBar
        barStyle="light-content"
        translucent
      />

      {/* Video Call Overlay */}
      {renderVideoCall()}

      {/* Call Info */}
      <View className="flex-1 items-center justify-center px-8">
        {!isCallConnected ? (
          <View className="items-center">
            {renderContactInfo()}
            <Text className="text-white/80 text-lg mt-8">
              {type === "video" ? "Video calling..." : "Calling..."}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            {type !== "video" && renderContactInfo()}
            <Text
              className="text-white text-xl mt-8"
              style={{ fontWeight: "700" }}
            >
              {formatCallDuration(callDuration)}
            </Text>
            <Text className="text-white/80 text-base mt-2">
              {type === "video" ? "Video call active" : "Voice call active"}
            </Text>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-16 left-0 right-0"
      >
        <View className="flex-row justify-center items-center space-x-8 px-8">
          {/* Mute Button */}
          <TouchableOpacity
            onPress={handleMute}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              isMuted ? "bg-red-500" : "bg-white/20"
            }`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isMuted ? "Unmute microphone" : "Mute microphone"
            }
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
            onPress={handleEndCall}
            className="w-20 h-20 bg-red-500 rounded-full items-center justify-center"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="End call"
            accessibilityHint="Tap to end the current call"
          >
            <Ionicons name="call" size={32} color="white" />
          </TouchableOpacity>

          {/* Speaker/Video Button */}
          {type === "video" ? (
            <TouchableOpacity
              onPress={handleVideoToggle}
              className={`w-16 h-16 rounded-full items-center justify-center ${
                !isVideoOn ? "bg-red-500" : "bg-white/20"
              }`}
            >
              <Ionicons
                name={isVideoOn ? "videocam" : "videocam-off"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSpeaker}
              className={`w-16 h-16 rounded-full items-center justify-center ${
                isSpeakerOn ? "bg-blue-500" : "bg-white/20"
              }`}
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
        {type === "video" && (
          <View className="flex-row justify-center mt-6 space-x-6">
            <TouchableOpacity
              onPress={handleSpeaker}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isSpeakerOn ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              <Ionicons
                name={isSpeakerOn ? "volume-high" : "volume-medium"}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity className="w-12 h-12 rounded-full items-center justify-center bg-white/20">
              <Ionicons name="camera-reverse" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
