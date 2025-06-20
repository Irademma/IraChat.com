import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import ProfilePicturePicker from "../ui/ProfilePicturePicker";

interface User {
  id: string;
  objectId?: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  status?: string;
}

interface AccountInfoProps {
  user: User;
}

export default function AccountInfo({ user }: AccountInfoProps) {
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [profilePicture, setProfilePicture] = useState(user.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleProfilePictureChange = (imageUri: string) => {
    setProfilePicture(imageUri);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    if (!username.trim()) {
      setError("Username is required");
      return false;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    if (bio.length > 200) {
      setError("Bio must be 200 characters or less");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError("");

    if (!validateForm()) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);
    try {
      // Create updated user data object
      const updatedUserData = {
        ...user,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        displayName: name.trim(),
        bio: bio.trim() || "I Love IraChat",
        image: profilePicture || user.image,
        avatar: profilePicture || user.image, // Keep both for compatibility
        status: bio.trim() || "I Love IraChat",
      };

      // Save updated data to localStorage
      localStorage.setItem(
        "iraChat_currentUser",
        JSON.stringify(updatedUserData),
      );

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white rounded-lg p-6">
      {/* Profile Picture Section */}
      <View className="items-center mb-8">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Profile Picture
        </Text>
        <ProfilePicturePicker
          currentImage={profilePicture}
          onImageSelect={handleProfilePictureChange}
        />
      </View>

      {/* Form Fields */}
      <View className="space-y-6">
        {/* Name Field */}
        <View>
          <Text className="text-base font-medium text-gray-700 mb-2">
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 bg-gray-50"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>

        {/* Username Field */}
        <View>
          <Text className="text-base font-medium text-gray-700 mb-2">
            Username
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
            <Text className="text-gray-500 text-base px-4 py-3">@</Text>
            <TextInput
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase())}
              placeholder="username"
              className="flex-1 text-base text-gray-800 py-3 pr-4"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text className="text-gray-500 text-sm mt-1">
            This is your unique identifier on IraChat
          </Text>
        </View>

        {/* Bio Field */}
        <View>
          <Text className="text-base font-medium text-gray-700 mb-2">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="I Love IraChat"
            multiline
            numberOfLines={4}
            maxLength={200}
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 bg-gray-50 h-24"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          <Text className="text-gray-500 text-sm mt-1">
            {bio.length}/200 characters
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View className="space-y-3 mt-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`py-4 px-6 rounded-lg ${
              loading ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            <Text
              className="text-white text-center text-base"
              style={{ fontWeight: "600" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            className="py-4 px-6 rounded-lg border border-gray-300"
          >
            <Text
              className="text-gray-700 text-center text-base"
              style={{ fontWeight: "600" }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
