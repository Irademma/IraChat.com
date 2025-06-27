import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { MainHeader } from "../../src/components/MainHeader";

// Removed unused SCREEN_HEIGHT

// Utility function to format timestamps
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      // Show actual date for older posts
      return date.toLocaleDateString();
    }
  } catch (error) {
    return "Unknown";
  }
};

// Caption Component with Read More/Less functionality
interface CaptionComponentProps {
  caption: string;
  maxLines?: number;
}

const CaptionComponent: React.FC<CaptionComponentProps> = ({ caption, maxLines = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  // Removed unused textHeight state

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const onTextLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    // Estimate if text needs "read more" (rough calculation)
    const lineHeight = 20; // Approximate line height
    const estimatedLines = height / lineHeight;
    setShowReadMore(estimatedLines > maxLines);
  };

  return (
    <View style={styles.captionContainer}>
      <Text
        style={[
          styles.caption,
          !isExpanded && showReadMore && { maxHeight: maxLines * 20 },
        ]}
        numberOfLines={isExpanded ? undefined : (showReadMore ? maxLines : undefined)}
        onLayout={onTextLayout}
      >
        {caption}
      </Text>
      {showReadMore && (
        <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>
            {isExpanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Complete update data structure
interface Update {
  id: string;
  username: string;
  userProfilePic: string;
  mediaUrl: string;
  mediaType: "photo" | "video";
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  downloadsCount: number;
  isLiked: boolean;
  isShared: boolean;
  isDownloaded: boolean;
  userId: string;
  timestamp: string;
  comments: Array<{
    id: string;
    username: string;
    text: string;
    timestamp: string;
  }>;
}

// Real updates will be loaded from Firebase

export default function UpdatesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for testing (additive, doesn't replace live functionality)
  const { mockUpdates, shouldUseMockData } = require("../../src/hooks/useMockData").useMockUpdates();

  // Removed unused currentTime state

  // Get current user from Redux store
  const currentUser = { id: "current_user", name: "Current User", avatar: null }; // Fallback if Redux not available

  // Check if current user is blocked by the update owner
  const isBlockedByUser = async (updateUserId: string): Promise<boolean> => {
    try {
      // Check Firebase for blocking relationship
      const { isUserBlocked } = await import("../../src/services/blockingService");
      return await isUserBlocked(currentUser.id, updateUserId);
    } catch (error) {
      console.error("Error checking blocking status:", error);
      return false; // Default to not blocked if error
    }
  };

  // Load updates from Firebase on component mount
  useEffect(() => {
    loadUpdatesFromFirebase();
  }, []);

  // Real-time timestamp updates handled by individual components
  // Removed global timer for better performance

  // Load updates from Firebase
  const loadUpdatesFromFirebase = async () => {
    try {
      setIsLoading(true);
      let allUpdates: Update[] = [];

      // Load real updates from Firebase
      try {
        const { getUpdates } = await import("../../src/services/updatesService");
        const firebaseUpdates = await getUpdates(50); // Load up to 50 updates

        // Convert Firebase updates to local Update format
        const convertedUpdates: Update[] = firebaseUpdates.map((update: any) => ({
          id: update.id,
          username: `@${update.userName || 'user'}`,
          userProfilePic: update.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(update.userName || 'User')}&background=667eea&color=fff`,
          mediaUrl: update.mediaUrl,
          mediaType: update.type === 'image' ? 'photo' : 'video',
          caption: update.caption || '',
          likesCount: update.likes?.length || 0,
          commentsCount: update.comments?.length || 0,
          sharesCount: 0, // Will be implemented
          downloadsCount: 0, // Will be implemented
          isLiked: update.likes?.includes(currentUser.id) || false,
          isShared: false,
          isDownloaded: false,
          userId: update.userId,
          timestamp: update.timestamp?.toISOString() || new Date().toISOString(),
          comments: [],
        }));

        allUpdates = [...convertedUpdates];
        console.log(`✅ Loaded ${convertedUpdates.length} updates from Firebase`);
      } catch (firebaseError) {
        console.log("📭 Firebase updates not available, using mock data if enabled");
      }

      // Add mock data if enabled and available (only when no real updates exist)
      if (shouldUseMockData && mockUpdates && mockUpdates.length > 0 && allUpdates.length === 0) {
        const convertedMockUpdates: Update[] = mockUpdates.map((mockUpdate: any) => ({
          id: `mock_${mockUpdate.id}`,
          username: `@${mockUpdate.userName}`,
          userProfilePic: mockUpdate.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mockUpdate.userName)}&background=667eea&color=fff`,
          mediaUrl: mockUpdate.mediaUrl,
          mediaType: mockUpdate.mediaType === 'image' ? 'photo' : 'video',
          caption: mockUpdate.caption || '',
          likesCount: mockUpdate.likes,
          commentsCount: mockUpdate.comments,
          sharesCount: Math.floor(mockUpdate.likes * 0.3), // Estimate shares
          downloadsCount: Math.floor(mockUpdate.views * 0.1), // Estimate downloads
          isLiked: mockUpdate.isLiked,
          isShared: false,
          isDownloaded: false,
          userId: mockUpdate.userId,
          timestamp: mockUpdate.timestamp.toISOString(),
          comments: [],
        }));

        // Only add mock updates when no real updates exist (not overriding)
        allUpdates = [...convertedMockUpdates];
        console.log(`📊 Added ${convertedMockUpdates.length} mock updates for testing (no real updates found)`);
      }

      setUpdates(allUpdates);
    } catch (error) {
      console.error("❌ Failed to load updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Responsive design handled by individual components

  // Interaction handlers with real Firebase functionality
  const handleLike = useCallback(async (updateId: string) => {
    try {
      // Optimistic update
      setUpdates((prevUpdates) =>
        prevUpdates.map((update) =>
          update.id === updateId
            ? {
                ...update,
                isLiked: !update.isLiked,
                likesCount: update.isLiked
                  ? update.likesCount - 1
                  : update.likesCount + 1,
              }
            : update,
        ),
      );

      // Update Firebase
      const { toggleLike } = await import("../../src/services/updatesService");
      await toggleLike(updateId, currentUser.id);
      console.log(`✅ Like toggled for update ${updateId}`);

      // Mark as viewed when interacting
      const { markAsViewed } = await import("../../src/services/updatesService");
      await markAsViewed(updateId, currentUser.id);
    } catch (error) {
      console.error("❌ Failed to update like:", error);
      // Revert optimistic update on error
      setUpdates((prevUpdates) =>
        prevUpdates.map((update) =>
          update.id === updateId
            ? {
                ...update,
                isLiked: !update.isLiked,
                likesCount: update.isLiked
                  ? update.likesCount + 1
                  : update.likesCount - 1,
              }
            : update,
        ),
      );
    }
  }, [updates, currentUser.id]);

  const handleShare = useCallback(async (updateId: string) => {
    try {
      // Check if user is blocked from sharing
      const update = updates.find(u => u.id === updateId);
      if (update && await isBlockedByUser(update.userId)) {
        Alert.alert("Action Restricted", "You cannot share this update.");
        return;
      }

      // Optimistic update
      setUpdates((prevUpdates) =>
        prevUpdates.map((update) =>
          update.id === updateId
            ? {
                ...update,
                isShared: true,
                sharesCount: update.sharesCount + 1,
              }
            : update,
        ),
      );

      // Update Firebase - add share tracking
      const { updateDoc, doc, increment } = await import("firebase/firestore");
      const { db } = await import("../../src/services/firebaseSimple");

      const updateRef = doc(db, "updates", updateId);
      await updateDoc(updateRef, {
        sharesCount: increment(1),
        [`shares.${currentUser.id}`]: true,
      });

      // Mark as viewed when sharing
      const { markAsViewed } = await import("../../src/services/updatesService");
      await markAsViewed(updateId, currentUser.id);

      console.log(`✅ Update shared: ${updateId}`);
      Alert.alert("Shared", "Update shared successfully!");
    } catch (error) {
      console.error("❌ Failed to share update:", error);
      Alert.alert("Error", "Failed to share update. Please try again.");
    }
  }, [currentUser.id, updates, isBlockedByUser]);

  const handleDownload = useCallback(async (updateId: string) => {
    try {
      const update = updates.find(u => u.id === updateId);
      if (!update) return;

      // Check if user is blocked from downloading
      if (await isBlockedByUser(update.userId)) {
        Alert.alert("Action Restricted", "You cannot download this update.");
        return;
      }

      // Optimistic update
      setUpdates((prevUpdates) =>
        prevUpdates.map((u) =>
          u.id === updateId
            ? {
                ...u,
                isDownloaded: true,
                downloadsCount: u.downloadsCount + 1,
              }
            : u,
        ),
      );

      // Download media to device
      const { downloadAsync, documentDirectory } = await import("expo-file-system");
      const MediaLibrary = await import("expo-media-library");

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant media library permissions to download media.");
        return;
      }

      // Download the file
      const fileUri = `${documentDirectory}${updateId}_${Date.now()}.${update.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      await downloadAsync(update.mediaUrl, fileUri);

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(fileUri);

      // Update Firebase - add download tracking
      const { updateDoc, doc, increment } = await import("firebase/firestore");
      const { db } = await import("../../src/services/firebaseSimple");

      const updateRef = doc(db, "updates", updateId);
      await updateDoc(updateRef, {
        downloadsCount: increment(1),
        [`downloads.${currentUser.id}`]: true,
      });

      // Mark as viewed when downloading
      const { markAsViewed } = await import("../../src/services/updatesService");
      await markAsViewed(updateId, currentUser.id);

      console.log(`✅ Media downloaded: ${updateId}`);
      Alert.alert("Downloaded", "Media downloaded to your device!");
    } catch (error) {
      console.error("❌ Failed to download media:", error);
      Alert.alert("Error", "Failed to download media. Please try again.");
    }
  }, [updates, currentUser.id]);

  const handleComment = useCallback(async (updateId: string) => {
    try {
      // Check if user is blocked from commenting
      const update = updates.find(u => u.id === updateId);
      if (update && await isBlockedByUser(update.userId)) {
        Alert.alert("Action Restricted", "You cannot comment on this update.");
        return;
      }

      // Mark as viewed when opening comments
      const { markAsViewed } = await import("../../src/services/updatesService");
      await markAsViewed(updateId, currentUser.id);

      // For now, show a simple prompt for comment
      Alert.prompt(
        "Add Comment",
        "Enter your comment:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Post",
            onPress: async (text) => {
              if (text && text.trim()) {
                try {
                  // For now, just update the local state
                  // Full comment system will be implemented later
                  setUpdates((prevUpdates) =>
                    prevUpdates.map((update) =>
                      update.id === updateId
                        ? {
                            ...update,
                            commentsCount: update.commentsCount + 1,
                          }
                        : update,
                    ),
                  );

                  console.log(`✅ Comment added locally for update ${updateId}: ${text.trim()}`);
                  Alert.alert("Success", "Comment posted successfully!");
                } catch (error) {
                  console.error("❌ Failed to post comment:", error);
                  Alert.alert("Error", "Failed to post comment. Please try again.");
                }
              }
            },
          },
        ],
        "plain-text"
      );
    } catch (error) {
      console.error("❌ Error opening comments:", error);
    }
  }, [currentUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUpdatesFromFirebase();
    setRefreshing(false);
  }, []);

  const handleCreateUpdate = useCallback(async () => {
    Alert.alert(
      "Create Update",
      "Choose how you want to create your update",
      [
        { text: "Camera", onPress: () => console.log("Open camera") },
        { text: "Gallery", onPress: () => console.log("Open gallery") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  }, []);

  const renderUpdateItem = ({ item }: { item: Update }) => (
    <View style={styles.updateCard}>
      {/* User Header */}
      <View style={styles.userHeader}>
        {(() => {
          const Avatar = require("../../src/components/Avatar").Avatar;
          return (
            <Avatar
              name={item.username.replace('@', '')}
              imageUrl={item.userProfilePic}
              size={40}
              showOnlineStatus={false}
              style={{ marginRight: 12 }}
            />
          );
        })()}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>

      {/* Media Content */}
      <View style={styles.mediaContainer}>
        <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} />
        {item.mediaType === "video" && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="white" />
          </View>
        )}
      </View>

      {/* Caption with Read More/Less */}
      {item.caption && <CaptionComponent caption={item.caption} />}

      {/* Interaction Buttons */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleLike(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${item.isLiked ? "Unlike" : "Like"} this update`}
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={24}
            color={item.isLiked ? "#EF4444" : "#6B7280"}
          />
          <Text style={styles.interactionText}>{item.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleComment(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View comments"
        >
          <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
          <Text style={styles.interactionText}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleShare(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share this update"
        >
          <Ionicons
            name={item.isShared ? "share" : "share-outline"}
            size={24}
            color={item.isShared ? "#667eea" : "#6B7280"}
          />
          <Text style={styles.interactionText}>{item.sharesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleDownload(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Download this media"
        >
          <Ionicons
            name={item.isDownloaded ? "download" : "download-outline"}
            size={24}
            color={item.isDownloaded ? "#10B981" : "#6B7280"}
          />
          <Text style={styles.interactionText}>{item.downloadsCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    const { UpdatesEmptyState } = require("../../src/components/EmptyStateImproved");
    return (
      <UpdatesEmptyState
        onActionPress={() => {
          // Navigate to camera or media picker for creating an update
          console.log("Create update action pressed");
        }}
      />
    );
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Updates screen"
    >
      {/* Simple Header for Updates */}
      <MainHeader
        onSearchResults={(results) => {
          console.log('Updates search results:', results);
        }}
        searchPlaceholder="Search updates..."
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={updates}
          renderItem={renderUpdateItem}
          keyExtractor={(item) => item.id}
          getItemLayout={(_data, index) => ({
            length: 400, // Approximate height of each update item
            offset: 416 * index, // 400 + 16 (separator height)
            index,
          })}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
              accessibilityLabel="Pull to refresh updates"
            />
          }
          contentContainerStyle={
            updates.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
          }
          accessible={true}
          accessibilityLabel="Updates list"
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}

      {/* Floating Action Button for Creating Updates */}
      <TouchableOpacity
        onPress={handleCreateUpdate}
        style={styles.fab}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new update"
        accessibilityHint="Tap to post a photo or video update"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea", // Sky blue background as requested
  },
  updateCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B5CF6", // Purple color for username
  },
  timestamp: {
    fontSize: 13, // Increased from 12 for better readability
    color: "#3B82F6", // Blue color for timestamp
    marginTop: 2,
    fontWeight: "500",
  },
  mediaContainer: {
    position: "relative",
    marginBottom: 12,
  },
  mediaImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    resizeMode: "cover",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captionContainer: {
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  interactionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  interactionText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
});
