import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Complete update data structure
interface Update {
  id: string;
  username: string;
  userProfilePic: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
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

// Sample updates for demonstration
const mockUpdates: Update[] = [
  {
    id: '1',
    username: '@john_doe',
    userProfilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    mediaType: 'photo',
    caption: 'Beautiful sunset at the beach! 🌅 #nature #sunset',
    likesCount: 42,
    commentsCount: 8,
    sharesCount: 12,
    downloadsCount: 5,
    isLiked: false,
    isShared: false,
    isDownloaded: false,
    userId: 'user1',
    timestamp: '2 hours ago',
    comments: [
      { id: 'c1', username: '@jane_smith', text: 'Amazing view! 😍', timestamp: '1h ago' },
      { id: 'c2', username: '@mike_wilson', text: 'Where is this?', timestamp: '45m ago' }
    ]
  },
  {
    id: '2',
    username: '@sarah_jones',
    userProfilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400',
    mediaType: 'photo',
    caption: 'Coffee time ☕ Perfect way to start the day!',
    likesCount: 28,
    commentsCount: 3,
    sharesCount: 7,
    downloadsCount: 2,
    isLiked: true,
    isShared: false,
    isDownloaded: false,
    userId: 'user2',
    timestamp: '4 hours ago',
    comments: [
      { id: 'c3', username: '@coffee_lover', text: 'Looks delicious! ☕', timestamp: '3h ago' }
    ]
  },
  {
    id: '3',
    username: '@travel_buddy',
    userProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    mediaType: 'photo',
    caption: 'Mountain hiking adventure! 🏔️ #hiking #adventure #nature',
    likesCount: 67,
    commentsCount: 15,
    sharesCount: 23,
    downloadsCount: 11,
    isLiked: false,
    isShared: true,
    isDownloaded: false,
    userId: 'user3',
    timestamp: '6 hours ago',
    comments: [
      { id: 'c4', username: '@hiker_pro', text: 'Epic trail! Which mountain?', timestamp: '5h ago' },
      { id: 'c5', username: '@nature_lover', text: 'Breathtaking view! 🤩', timestamp: '4h ago' }
    ]
  }
];

export default function UpdatesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [updates, setUpdates] = useState<Update[]>(mockUpdates);
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive design
  const isSmallDevice = SCREEN_HEIGHT < 700;

  // Interaction handlers
  const handleLike = useCallback((updateId: string) => {
    setUpdates(prevUpdates =>
      prevUpdates.map(update =>
        update.id === updateId
          ? {
              ...update,
              isLiked: !update.isLiked,
              likesCount: update.isLiked ? update.likesCount - 1 : update.likesCount + 1
            }
          : update
      )
    );
  }, []);

  const handleShare = useCallback((updateId: string) => {
    setUpdates(prevUpdates =>
      prevUpdates.map(update =>
        update.id === updateId
          ? {
              ...update,
              isShared: !update.isShared,
              sharesCount: update.isShared ? update.sharesCount - 1 : update.sharesCount + 1
            }
          : update
      )
    );
  }, []);

  const handleDownload = useCallback((updateId: string) => {
    setUpdates(prevUpdates =>
      prevUpdates.map(update =>
        update.id === updateId
          ? {
              ...update,
              isDownloaded: true,
              downloadsCount: update.downloadsCount + 1
            }
          : update
      )
    );
  }, []);

  const handleComment = useCallback((updateId: string) => {
    // In a real app, this would open a comment modal
    console.log('Opening comments for update:', updateId);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateUpdate = useCallback(async () => {
    try {
      // Import ImagePicker dynamically
      const ImagePicker = await import('expo-image-picker');

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission denied');
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'all' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        console.log('📤 Uploading media to Firebase Storage...');

        // Import media service
        const { uploadUpdateMedia, getMediaType } = await import('../../src/services/mediaService');

        // Upload media to Firebase Storage
        const detectedType = getMediaType(asset.uri);
        const mediaType: 'photo' | 'video' = detectedType === 'video' ? 'video' : 'photo';
        const uploadResult = await uploadUpdateMedia(asset.uri, 'current_user', mediaType);

        if (uploadResult.success && uploadResult.url) {
          // Create new update with uploaded media URL
          const newUpdate: Update = {
            id: `update_${Date.now()}`,
            username: '@current_user',
            userProfilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            mediaUrl: uploadResult.url,
            mediaType: mediaType,
            caption: 'New update!',
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            downloadsCount: 0,
            isLiked: false,
            isShared: false,
            isDownloaded: false,
            userId: 'current_user',
            timestamp: 'Just now',
            comments: []
          };

          // Add to updates list
          setUpdates(prevUpdates => [newUpdate, ...prevUpdates]);
          console.log('✅ New update created and uploaded successfully');
          Alert.alert('Success', 'Your update has been posted successfully!');
        } else {
          console.error('❌ Failed to upload media:', uploadResult.error);
          Alert.alert(
            'Upload Failed',
            'Failed to upload media to cloud storage. Your update will be saved locally.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Save Locally',
                onPress: () => {
                  // Fallback to local URI
                  const newUpdate: Update = {
                    id: `update_${Date.now()}`,
                    username: '@current_user',
                    userProfilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                    mediaUrl: asset.uri,
                    mediaType: mediaType,
                    caption: 'New update! (Local)',
                    likesCount: 0,
                    commentsCount: 0,
                    sharesCount: 0,
                    downloadsCount: 0,
                    isLiked: false,
                    isShared: false,
                    isDownloaded: false,
                    userId: 'current_user',
                    timestamp: 'Just now',
                    comments: []
                  };

                  setUpdates(prevUpdates => [newUpdate, ...prevUpdates]);
                  console.log('⚠️ New update created with local media (upload failed)');
                }
              }
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Error creating update:', error);

      // Show user-friendly error message
      if (error.message?.includes('permission')) {
        Alert.alert('Permission Error', 'Please grant the necessary permissions to upload media.');
      } else if (error.message?.includes('network')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to create update. Please try again.');
      }
    }
  }, []);

  const renderUpdateItem = ({ item }: { item: Update }) => (
    <View style={styles.updateCard}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <Image source={{ uri: item.userProfilePic }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>

      {/* Media Content */}
      <View style={styles.mediaContainer}>
        <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} />
        {item.mediaType === 'video' && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="white" />
          </View>
        )}
      </View>

      {/* Caption */}
      {item.caption && (
        <Text style={styles.caption}>{item.caption}</Text>
      )}

      {/* Interaction Buttons */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleLike(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${item.isLiked ? 'Unlike' : 'Like'} this update`}
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

  const renderEmptyState = () => (
    <View
      style={styles.emptyContainer}
      accessible={true}
      accessibilityLabel="No updates available"
    >
      <Ionicons
        name="radio-button-on"
        size={80}
        color="#9CA3AF"
        accessible={true}
        accessibilityLabel="Updates icon"
      />
      <Text
        style={styles.emptyTitle}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="No updates yet"
      >
        No updates yet
      </Text>
      <Text
        style={styles.emptyDescription}
        accessible={true}
        accessibilityLabel="Updates from your contacts will appear here"
      >
        Updates from your contacts will appear here
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Refresh updates"
        accessibilityHint="Tap to refresh and check for new updates"
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Updates screen"
    >
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
            colors={['#667eea']}
            tintColor="#667eea"
            accessibilityLabel="Pull to refresh updates"
          />
        }
        contentContainerStyle={updates.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
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
    backgroundColor: '#f1f5f9',
  },
  updateCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  interactionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});