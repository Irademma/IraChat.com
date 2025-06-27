import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnhancedGroupChatScreen } from "../src/screens/EnhancedGroupChatScreen";

export default function EnhancedGroupChatRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const groupId = params.groupId as string || "default-group";
  const currentUserId = "current-user"; // This should come from auth context

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <View style={{ flex: 1 }}>
        <EnhancedGroupChatScreen
          groupId={groupId}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      </View>
    </SafeAreaView>
  );
}
