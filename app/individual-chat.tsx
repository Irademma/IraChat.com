import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ChatRoom } from "../src/components/ChatRoom";

export default function IndividualChatScreen() {
  const params = useLocalSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Quick initialization without blocking
    const initializeChat = async () => {
      // Skip auth check for faster loading - ChatRoom will handle it
      setIsReady(true);
    };

    // Initialize immediately for faster UX
    initializeChat();
  }, []);

  // Parse contact data from params immediately
  const contact = {
    id: params.contactId as string,
    name: params.contactName as string,
    avatar: params.contactAvatar as string,
    isOnline: params.contactIsOnline === "true",
  };

  // Show immediate loading state while ChatRoom initializes
  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa"
      }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: "#666",
          textAlign: "center"
        }}>
          Opening chat with {contact.name}...
        </Text>
      </View>
    );
  }

  return (
    <ChatRoom
      chatId={contact.id}
      partnerName={contact.name}
      partnerAvatar={contact.avatar}
      isOnline={contact.isOnline}
      partnerId={contact.id}
    />
  );
}
