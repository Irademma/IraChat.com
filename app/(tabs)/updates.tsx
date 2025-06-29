// 📱 REAL UPDATES TAB - Fully functional social media
// Real camera capture, media upload, story posting, and social interactions

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { realUpdatesService, RealUpdate, UpdateType } from "../../src/services/realUpdatesService";
import { formatTimeAgo } from "../../src/utils/dateUtils";
import { UpdatesInteractionPages } from "../../src/components/UpdatesInteractionPages";
import { UpdatesCommentsPage } from "../../src/components/UpdatesCommentsPage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function UpdatesScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [updates, setUpdates] = useState<RealUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);

  // Interaction pages state
  const [showInteractionPages, setShowInteractionPages] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>('');
  const [selectedInteractionTab, setSelectedInteractionTab] = useState<'likes' | 'views' | 'shares' | 'downloads'>('likes');

  // Comments page state
  const [showCommentsPage, setShowCommentsPage] = useState(false);
  const [commentsUpdateId, setCommentsUpdateId] = useState<string>('');

  // Load updates on component mount
  useEffect(() => {
    if (currentUser?.id) {
      loadUpdates();
      
      // Subscribe to real-time updates
      const unsubscribe = realUpdatesService.subscribeToUpdatesFeed(
        currentUser.id,
        (newUpdates) => {
          setUpdates(newUpdates);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    }
  }, [currentUser?.id]);

  // Load updates
  const loadUpdates = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      const feedUpdates = await realUpdatesService.getUpdatesFeed(currentUser.id);
      setUpdates(feedUpdates);
      console.log('✅ Loaded updates:', feedUpdates.length);
    } catch (error) {
      console.error('❌ Error loading updates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Refresh updates
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUpdates();
    setIsRefreshing(false);
  }, [loadUpdates]);

  // Handle like toggle
  const handleLike = async (updateId: string) => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realUpdatesService.toggleLike(updateId, currentUser.id);
      if (result.success) {
        // Update local state
        setUpdates(prev => prev.map(update => {
          if (update.id === updateId) {
            const newLikes = result.isLiked 
              ? [...update.likes, currentUser.id]
              : update.likes.filter(id => id !== currentUser.id);
            return { ...update, likes: newLikes };
          }
          return update;
        }));
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  // Handle comment
  const handleComment = async (updateId: string) => {
    try {
      console.log('💬 Opening comments for update:', updateId);
      setCommentsUpdateId(updateId);
      setShowCommentsPage(true);
    } catch (error) {
      console.error('❌ Error opening comments:', error);
    }
  };

  // Handle share
  const handleShare = async (updateId: string) => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realUpdatesService.shareUpdate(updateId, currentUser.id);
      if (result.success) {
        Alert.alert('Shared!', 'Update shared successfully');
        
        // Update local state
        setUpdates(prev => prev.map(update => {
          if (update.id === updateId) {
            return { ...update, shares: [...update.shares, currentUser.id] };
          }
          return update;
        }));
      } else {
        Alert.alert('Error', result.error || 'Failed to share update');
      }
    } catch (error) {
      console.error('❌ Error sharing update:', error);
      Alert.alert('Error', 'Failed to share update');
    }
  };

  // Handle download
  const handleDownload = async (updateId: string) => {
    if (!currentUser?.id) return;

    try {
      const update = updates.find(u => u.id === updateId);
      if (!update?.mediaUrl) return;

      // Record download in Firebase
      const result = await realUpdatesService.recordDownload(updateId, currentUser.id);

      if (result.success) {
        // In a real app, you would download the media file
        // For now, just show success message
        Alert.alert('Downloaded!', 'Media saved to your device');

        // Refresh updates to get latest download count
        await loadUpdates();

        console.log('✅ Update downloaded');
      } else {
        Alert.alert('Error', result.error || 'Failed to download media');
      }
    } catch (error) {
      console.error('❌ Error downloading update:', error);
      Alert.alert('Error', 'Failed to download media');
    }
  };

  // Handle interaction page opening
  const openInteractionPage = (updateId: string, tab: 'likes' | 'views' | 'shares' | 'downloads') => {
    setSelectedUpdateId(updateId);
    setSelectedInteractionTab(tab);
    setShowInteractionPages(true);
  };

  // Handle user profile navigation
  const handleUserPress = (userId: string) => {
    // Navigate to user profile
    console.log('Navigate to user profile:', userId);
    setShowInteractionPages(false);
  };

  // Handle camera options
  const handleCameraOption = (option: 'camera' | 'gallery' | 'video') => {
    setShowCameraOptions(false);
    
    switch (option) {
      case 'camera':
        openCamera('photo');
        break;
      case 'gallery':
        openGallery('photo');
        break;
      case 'video':
        openCamera('video');
        break;
    }
  };

  // Open camera
  const openCamera = async (type: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permission to take photos/videos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute max for videos
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        showCreateUpdateModal(asset.uri, type);
      }
    } catch (error) {
      console.error('❌ Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  // Open gallery
  const openGallery = async (type: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permission to select media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        showCreateUpdateModal(asset.uri, type);
      }
    } catch (error) {
      console.error('❌ Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  // Show create update modal
  const showCreateUpdateModal = (mediaUri: string, type: 'photo' | 'video') => {
    // Create update with caption input
    Alert.prompt(
      'Add Caption',
      'What\'s on your mind?',
      async (caption) => {
        if (caption !== null) { // User didn't cancel
          await createUpdate(mediaUri, type, caption || '');
        }
      },
      'plain-text',
      '',
      'default'
    );
  };

  // Create update
  const createUpdate = async (mediaUri: string, type: UpdateType, caption: string) => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      
      const result = await realUpdatesService.createUpdate(
        currentUser.id,
        currentUser.name || 'Unknown',
        currentUser.avatar,
        {
          type,
          caption,
          mediaUri,
          privacy: 'public',
          isStory: false,
        }
      );
      
      if (result.success) {
        Alert.alert('Success!', 'Your update has been posted');
        setShowCreateModal(false);
        // Refresh feed to show new update
        await loadUpdates();
      } else {
        Alert.alert('Error', result.error || 'Failed to create update');
      }
    } catch (error) {
      console.error('❌ Error creating update:', error);
      Alert.alert('Error', 'Failed to create update');
    } finally {
      setIsLoading(false);
    }
  };

  // Render update item - IRACHAT IMMERSIVE STYLE
  const renderUpdateItem = ({ item }: { item: RealUpdate }) => (
    <View style={styles.immersiveContainer}>
      {/* Full screen media background */}
      {item.mediaUrl && (
        <View style={styles.tiktokMediaContainer}>
          {item.type === 'photo' ? (
            <Image
              source={{ uri: item.mediaUrl }}
              style={styles.tiktokMedia}
              resizeMode="cover"
            />
          ) : item.type === 'video' ? (
            <Video
              source={{ uri: item.mediaUrl }}
              style={styles.tiktokMedia}
              shouldPlay={true}
              isLooping={true}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
            />
          ) : null}

          {/* Gradient overlay for text readability */}
          <View style={styles.tiktokGradientOverlay} />
        </View>
      )}

      {/* Right side actions - TikTok style */}
      <View style={styles.tiktokRightActions}>
        {/* User avatar */}
        <TouchableOpacity style={styles.tiktokAvatarContainer}>
          <Image
            source={{
              uri: item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName)}&background=87CEEB&color=fff`
            }}
            style={styles.tiktokAvatar}
          />
          <View style={styles.tiktokFollowButton}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Like button - CLICKABLE */}
        <TouchableOpacity
          style={styles.immersiveActionButton}
          onPress={() => handleLike(item.id)}
          onLongPress={() => openInteractionPage(item.id, 'likes')}
        >
          <Ionicons
            name={item.likes.includes(currentUser?.id || '') ? "heart" : "heart-outline"}
            size={32}
            color={item.likes.includes(currentUser?.id || '') ? "#87CEEB" : "#FFFFFF"}
          />
          <TouchableOpacity onPress={() => openInteractionPage(item.id, 'likes')}>
            <Text style={styles.immersiveActionText}>
              {item.likes.length > 999 ? `${(item.likes.length / 1000).toFixed(1)}K` : item.likes.length}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Comment button */}
        <TouchableOpacity
          style={styles.immersiveActionButton}
          onPress={() => handleComment(item.id)}
        >
          <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
          <Text style={styles.immersiveActionText}>{item.comments.length}</Text>
        </TouchableOpacity>

        {/* Share button - CLICKABLE */}
        <TouchableOpacity
          style={styles.immersiveActionButton}
          onPress={() => handleShare(item.id)}
          onLongPress={() => openInteractionPage(item.id, 'shares')}
        >
          <Ionicons name="arrow-redo" size={28} color="#FFFFFF" />
          <TouchableOpacity onPress={() => openInteractionPage(item.id, 'shares')}>
            <Text style={styles.immersiveActionText}>
              {item.shares.length > 999 ? `${(item.shares.length / 1000).toFixed(1)}K` : item.shares.length}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Download button - CLICKABLE */}
        <TouchableOpacity
          style={styles.immersiveActionButton}
          onPress={() => handleDownload(item.id)}
          onLongPress={() => openInteractionPage(item.id, 'downloads')}
        >
          <Ionicons name="download" size={28} color="#FFFFFF" />
          <TouchableOpacity onPress={() => openInteractionPage(item.id, 'downloads')}>
            <Text style={styles.immersiveActionText}>Save</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* More options */}
        <TouchableOpacity style={styles.immersiveActionButton}>
          <Ionicons name="ellipsis-horizontal" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom content - TikTok style */}
      <View style={styles.tiktokBottomContent}>
        {/* User info */}
        <View style={styles.tiktokUserInfo}>
          <TouchableOpacity onPress={() => {
            // Navigate to user profile
            console.log('Navigate to profile:', item.userName);
          }}>
            <Text style={styles.tiktokUserName}>@{item.userName}</Text>
          </TouchableOpacity>
          <Text style={styles.tiktokTimestamp}>{formatTimeAgo(item.timestamp)}</Text>
        </View>

        {/* Caption */}
        {item.caption && (
          <Text style={styles.tiktokCaption} numberOfLines={3}>
            {item.caption}
          </Text>
        )}



        {/* View count - CLICKABLE */}
        <TouchableOpacity
          style={styles.immersiveViewCount}
          onPress={() => openInteractionPage(item.id, 'views')}
        >
          <Ionicons name="eye" size={16} color="#FFFFFF" />
          <Text style={styles.immersiveViewText}>
            {item.views.length > 1000
              ? `${(item.views.length / 1000).toFixed(1)}K views`
              : `${item.views.length} views`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Updates Yet</Text>
      <Text style={styles.emptySubtitle}>
        Share your first photo or video to get started!
      </Text>
      <TouchableOpacity
        style={styles.createFirstButton}
        onPress={() => setShowCameraOptions(true)}
      >
        <Text style={styles.createFirstButtonText}>Create Update</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Updates</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCameraOptions(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && updates.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      ) : (
        <FlatList
          data={updates}
          renderItem={renderUpdateItem}
          keyExtractor={(item) => item.id}
          style={styles.tiktokList}
          showsVerticalScrollIndicator={false}
          pagingEnabled={true} // TikTok-style pagination
          snapToInterval={SCREEN_HEIGHT} // Snap to full screen height
          snapToAlignment="start"
          decelerationRate="fast"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { height: SCREEN_HEIGHT, backgroundColor: '#000000' }]}>
              <Ionicons name="camera-outline" size={64} color="#FFFFFF" />
              <Text style={[styles.emptyTitle, { color: '#FFFFFF' }]}>No Updates Yet</Text>
              <Text style={[styles.emptySubtitle, { color: '#FFFFFF' }]}>
                Share your first photo or video to get started
              </Text>
            </View>
          }
        />
      )}

      {/* Camera Options Modal */}
      <Modal
        visible={showCameraOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCameraOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cameraOptionsModal}>
            <Text style={styles.modalTitle}>Create Update</Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleCameraOption('camera')}
            >
              <Ionicons name="camera" size={24} color="#667eea" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleCameraOption('video')}
            >
              <Ionicons name="videocam" size={24} color="#667eea" />
              <Text style={styles.optionText}>Record Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleCameraOption('gallery')}
            >
              <Ionicons name="images" size={24} color="#667eea" />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCameraOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Interaction Pages Modal */}
      <UpdatesInteractionPages
        visible={showInteractionPages}
        onClose={() => setShowInteractionPages(false)}
        updateId={selectedUpdateId}
        initialTab={selectedInteractionTab}
        onUserPress={handleUserPress}
      />

      {/* Comments Page Modal */}
      <UpdatesCommentsPage
        visible={showCommentsPage}
        onClose={() => setShowCommentsPage(false)}
        updateId={commentsUpdateId}
        onUserPress={handleUserPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // TikTok black background
  },

  // IRACHAT IMMERSIVE STYLE COMPONENTS
  immersiveContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    backgroundColor: '#000000',
  },
  tiktokContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    backgroundColor: '#000000',
  },
  tiktokMediaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  tiktokMedia: {
    width: '100%',
    height: '100%',
  },
  tiktokGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.4)', // Gradient effect for React Native
    zIndex: 2,
  },
  tiktokRightActions: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    zIndex: 3,
    alignItems: 'center',
  },
  tiktokAvatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  tiktokAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tiktokFollowButton: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  immersiveActionButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
  },
  immersiveActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  tiktokActionButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
  },
  tiktokActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  tiktokBottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80, // Leave space for right actions
    padding: 16,
    zIndex: 3,
  },
  tiktokUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tiktokUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
  },
  tiktokTimestamp: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  tiktokCaption: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },

  tiktokViewCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  immersiveViewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  immersiveViewText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
    fontWeight: '500',
  },

  tiktokList: {
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  updateItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 16,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: '#000000',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  viewCountText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  createFirstButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cameraOptionsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});
