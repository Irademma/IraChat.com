import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../src/services/firebaseSimple";
import { useRouter } from "expo-router";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "chats"), {
        name: groupName,
        description: groupDescription.trim() || "",
        isGroup: true,
        participants: [],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={require("../assets/images/groups.png")}
            className="w-16 h-16 mb-4"
            style={{ tintColor: "#3B82F6" }}
            resizeMode="contain"
          />
          <Text
            className="text-xl text-gray-800 mb-2"
            style={{ fontWeight: "700" }}
          >
            Create New Group
          </Text>
          <Text className="text-gray-600 text-center">
            Start a group conversation
          </Text>
        </View>

        {/* Input Fields */}
        <View className="space-y-4 mb-6">
          <View>
            <Text className="text-gray-700 mb-2" style={{ fontWeight: "500" }}>
              Group Name *
            </Text>
            <TextInput
              placeholder="Enter group name..."
              value={groupName}
              onChangeText={setGroupName}
              className="border border-gray-300 px-4 py-3 rounded-lg text-base"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              maxLength={50}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2" style={{ fontWeight: "500" }}>
              Description (Optional)
            </Text>
            <TextInput
              placeholder="Enter group description..."
              value={groupDescription}
              onChangeText={setGroupDescription}
              className="border border-gray-300 px-4 py-3 rounded-lg text-base"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={loading || !groupName.trim()}
          className={`py-3 px-6 rounded-lg ${
            loading || !groupName.trim() ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text
            className="text-white text-center text-base"
            style={{ fontWeight: "600" }}
          >
            {loading ? "Creating Group..." : "Create Group"}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text className="text-blue-800 text-sm text-center">
            You can add members to the group after creating it
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
