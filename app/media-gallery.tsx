import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

interface MediaItem {
  id: string;
  uri: string;
  type: "photo" | "video";
  creationTime: number;
  filename: string;
  duration?: number;
}

const { width } = Dimensions.get("window");
const itemSize = (width - 48) / 3; // 3 columns with padding

export default function MediaGalleryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = params.chatId as string;

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | "photos" | "videos">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestPermissionAndLoadMedia();
  }, []);

  const requestPermissionAndLoadMedia = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
        await loadMediaItems();
      } else {
        Alert.alert(
          "Permission Required",
          "Please grant media library access to view photos and videos.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => MediaLibrary.requestPermissionsAsync(),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaItems = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 100,
        sortBy: "creationTime",
      });

      const videos = await MediaLibrary.getAssetsAsync({
        mediaType: "video",
        first: 50,
        sortBy: "creationTime",
      });

      const allMedia: MediaItem[] = [
        ...media.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          type: "photo" as const,
          creationTime: asset.creationTime,
          filename: asset.filename,
        })),
        ...videos.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          type: "video" as const,
          creationTime: asset.creationTime,
          filename: asset.filename,
          duration: asset.duration,
        })),
      ];

      // Sort by creation time (newest first)
      allMedia.sort((a, b) => b.creationTime - a.creationTime);
      setMediaItems(allMedia);
    } catch (error) {
      console.error("Error loading media:", error);
      Alert.alert("Error", "Failed to load media items");
    }
  };

  const getFilteredMedia = () => {
    switch (selectedTab) {
      case "photos":
        return mediaItems.filter((item) => item.type === "photo");
      case "videos":
        return mediaItems.filter((item) => item.type === "video");
      default:
        return mediaItems;
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (chatId) {
      // If opened from a chat, send the media
      Alert.alert("Send Media", `Send this ${item.type} to the chat?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // TODO: Implement media sending logic
            Alert.alert("Success", `${item.type} sent to chat!`);
            router.back();
          },
        },
      ]);
    } else {
      // Just view the media
      Alert.alert("Media Viewer", "Media viewer will be available soon");
    }
  };

  const TabButton = ({
    title,
    value,
    count,
  }: {
    title: string;
    value: typeof selectedTab;
    count: number;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedTab(value)}
      className={`flex-1 py-3 px-4 rounded-lg mx-1 ${
        selectedTab === value ? "bg-blue-500" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-center font-medium ${
          selectedTab === value ? "text-white" : "text-gray-600"
        }`}
      >
        {title}
      </Text>
      <Text
        className={`text-center text-xs mt-1 ${
          selectedTab === value ? "text-blue-100" : "text-gray-400"
        }`}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );

  const MediaItemComponent = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      onPress={() => handleMediaSelect(item)}
      className="relative"
      style={{ width: itemSize, height: itemSize, margin: 2 }}
    >
      <Image
        source={{ uri: item.uri }}
        style={{ width: itemSize, height: itemSize }}
        className="rounded-lg"
        resizeMode="cover"
      />

      {item.type === "video" && (
        <View className="absolute inset-0 items-center justify-center">
          <View className="bg-black bg-opacity-50 rounded-full p-2">
            <Ionicons name="play" size={20} color="white" />
          </View>
        </View>
      )}

      {item.duration && (
        <View className="absolute bottom-1 right-1 bg-black bg-opacity-70 px-2 py-1 rounded">
          <Text className="text-white text-xs">
            {Math.floor(item.duration / 60)}:
            {(item.duration % 60).toString().padStart(2, "0")}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading media...</Text>
      </View>
    );
  }

  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">
              Media Gallery
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="images" size={64} color="#9CA3AF" />
          <Text className="text-gray-800 text-lg font-medium mt-4 text-center">
            Permission Required
          </Text>
          <Text className="text-gray-500 text-center mt-2 mb-6">
            We need access to your media library to show photos and videos.
          </Text>
          <TouchableOpacity
            onPress={requestPermissionAndLoadMedia}
            className="bg-blue-500 py-3 px-6 rounded-lg"
          >
            <Text className="text-white font-medium">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const filteredMedia = getFilteredMedia();
  const photoCount = mediaItems.filter((item) => item.type === "photo").length;
  const videoCount = mediaItems.filter((item) => item.type === "video").length;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Media Gallery</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 bg-gray-50">
        <TabButton title="All" value="all" count={mediaItems.length} />
        <TabButton title="Photos" value="photos" count={photoCount} />
        <TabButton title="Videos" value="videos" count={videoCount} />
      </View>

      {/* Media Grid */}
      {filteredMedia.length > 0 ? (
        <FlatList
          data={filteredMedia}
          renderItem={({ item }) => <MediaItemComponent item={item} />}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="images-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No media found</Text>
          <Text className="text-gray-400 text-sm mt-2">
            {selectedTab === "photos"
              ? "No photos available"
              : selectedTab === "videos"
                ? "No videos available"
                : "No media files available"}
          </Text>
        </View>
      )}
    </View>
  );
}
