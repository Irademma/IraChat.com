import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ChatRoom } from "../src/components/ChatRoom";

export default function IndividualChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Quick initialization without blocking
    const initializeChat = async () => {
      try {
        // Validate required params
        if (!params.contactId || !params.contactName) {
          setError('Missing contact information');
          return;
        }

        // Skip auth check for faster loading - ChatRoom will handle it
        setIsReady(true);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat');
      }
    };

    // Initialize immediately for faster UX
    initializeChat();
  }, [params]);

  // Parse contact data from params with validation
  const contact = {
    id: (params.contactId as string) || '',
    name: (params.contactName as string) || 'Unknown',
    avatar: (params.contactAvatar as string) || '',
    isOnline: params.contactIsOnline === "true",
  };

  // Show error state
  if (error) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 20,
      }}>
        <Text style={{
          fontSize: 18,
          color: "#dc3545",
          textAlign: "center",
          marginBottom: 16,
        }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#667eea",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
