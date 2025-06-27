import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export default function NewChatScreen({ navigation }: any) {
  const [chatName, setChatName] = useState("");
  const [loading, setLoading] = useState(false);

  const createChat = async () => {
    if (!chatName.trim()) {
      Alert.alert("Error", "Please enter a chat name");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "chats"), {
        name: chatName,
        isGroup: false,
        participants: [],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
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
            source={require("../../assets/images/comment.png")}
            className="w-16 h-16 mb-4"
            style={{ tintColor: "#3B82F6" }}
            resizeMode="contain"
          />
          <Text
            className="text-xl text-gray-800 mb-2"
            style={{ fontWeight: "700" }}
          >
            Create New Chat
          </Text>
          <Text className="text-gray-600 text-center">
            Start a new conversation
          </Text>
        </View>

        {/* Input Field */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2" style={{ fontWeight: "500" }}>
            Chat Name
          </Text>
          <TextInput
            placeholder="Enter chat name..."
            value={chatName}
            onChangeText={setChatName}
            className="border border-gray-300 px-4 py-3 rounded-lg text-base"
            editable={!loading}
            placeholderTextColor="#9CA3AF"
            maxLength={50}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={createChat}
          disabled={loading || !chatName.trim()}
          className={`py-3 px-6 rounded-lg ${
            loading || !chatName.trim() ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text
            className="text-white text-center text-base"
            style={{ fontWeight: "600" }}
          >
            {loading ? "Creating..." : "Create Chat"}
          </Text>
        </TouchableOpacity>

        {/* Alternative Options */}
        <View className="mt-8">
          <Text className="text-gray-500 text-center mb-4">Or</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateGroup")}
            disabled={loading}
            className="border border-blue-500 py-3 px-6 rounded-lg"
          >
            <Text
              className="text-blue-500 text-center text-base"
              style={{ fontWeight: "600" }}
            >
              Create Group Chat
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
