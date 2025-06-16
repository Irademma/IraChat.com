import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AccountInfo from "../src/components/forms/AccountInfo";

interface User {
  id: string;
  objectId?: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  status?: string;
}

export default function EditProfileScreen() {
  const [isClient, setIsClient] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const router = useRouter();

  // Client-side mounting check (similar to your example)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load current user data (similar to fetchUser in your example)
  useEffect(() => {
    if (isClient) {
      loadUserData();
    }
  }, [isClient]);

  const loadUserData = () => {
    try {
      const currentUserData = localStorage.getItem("iraChat_currentUser");
      if (currentUserData) {
        const user = JSON.parse(currentUserData);

        // Create userData object similar to your example structure
        const userInfo: User = {
          id: user.id || Date.now().toString(),
          objectId: user._id || user.objectId,
          username: user.username || "",
          name: user.name || user.displayName || "",
          bio: user.bio || "",
          image: user.avatar || user.image || "",
          status: user.status || "I Love IraChat",
        };

        setUserData(userInfo);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Client-side check (similar to your example)
  if (!isClient) return null;

  // Return null if no user data (similar to your example)
  if (!userData) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header - Following your example structure */}
          <Text
            className="text-3xl text-gray-800 mb-2"
            style={{ fontWeight: "700" }}
          >
            Edit Profile
          </Text>

          {/* Account Information Section - Similar to your example */}
          <View className="mt-8">
            <AccountInfo user={userData} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
