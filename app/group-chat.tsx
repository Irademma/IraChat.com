import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { GroupChatRoom } from "../src/components/GroupChatRoom";

export default function GroupChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Quick initialization without blocking
    const initializeGroupChat = async () => {
      try {
        // Validate required params
        if (!params.groupId || !params.groupName) {
          setError('Missing group information');
          return;
        }

        // Skip auth check for faster loading - GroupChatRoom will handle it
        setIsReady(true);
      } catch (err) {
        console.error('Error initializing group chat:', err);
        setError('Failed to initialize group chat');
      }
    };

    // Initialize immediately for faster UX
    initializeGroupChat();
  }, [params]);

  // Parse group data from params with validation
  const group = {
    id: (params.groupId as string) || '',
    name: (params.groupName as string) || 'Unknown Group',
    avatar: (params.groupAvatar as string) || '',
    isAdmin: params.isAdmin === "true",
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
          fontWeight: "600",
          color: "#dc3545",
          marginBottom: 16,
          textAlign: "center",
        }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#87CEEB",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading state
  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}>
        <ActivityIndicator size="large" color="#87CEEB" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: "#6c757d",
        }}>
          Loading group chat...
        </Text>
      </View>
    );
  }

  // Render the real GroupChatRoom component
  return (
    <GroupChatRoom
      groupId={group.id}
      groupName={group.name}
      groupAvatar={group.avatar}
      isAdmin={group.isAdmin}
    />
  );
}
