// 📱 UPDATES INTERACTION PAGES - Complete user interaction tracking
// Shows who liked, viewed, shared, downloaded updates with full user details

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { realUpdatesService } from '../services/realUpdatesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UserInteraction {
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  interactionType: 'like' | 'view' | 'share' | 'download';
}

interface UpdateInteractionData {
  updateId: string;
  updateTitle: string;
  updateThumbnail?: string;
  likes: UserInteraction[];
  views: UserInteraction[];
  shares: UserInteraction[];
  downloads: UserInteraction[];
}

interface UpdatesInteractionPagesProps {
  visible: boolean;
  onClose: () => void;
  updateId: string;
  initialTab: 'likes' | 'views' | 'shares' | 'downloads';
  onUserPress: (userId: string) => void;
}

export const UpdatesInteractionPages: React.FC<UpdatesInteractionPagesProps> = ({
  visible,
  onClose,
  updateId,
  initialTab,
  onUserPress,
}) => {
  const [activeTab, setActiveTab] = useState<'likes' | 'views' | 'shares' | 'downloads'>(initialTab);
  const [interactionData, setInteractionData] = useState<UpdateInteractionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load interaction data
  const loadInteractionData = async () => {
    if (!updateId) return;

    try {
      setIsLoading(true);
      
      // Load all interaction data for the update
      const [likesResult, viewsResult, sharesResult, downloadsResult] = await Promise.all([
        realUpdatesService.getUpdateLikes(updateId),
        realUpdatesService.getUpdateViews(updateId),
        realUpdatesService.getUpdateShares(updateId),
        realUpdatesService.getUpdateDownloads(updateId),
      ]);

      if (likesResult.success && viewsResult.success && sharesResult.success && downloadsResult.success) {
        setInteractionData({
          updateId,
          updateTitle: 'Update', // You can get this from the update data
          likes: likesResult.interactions || [],
          views: viewsResult.interactions || [],
          shares: sharesResult.interactions || [],
          downloads: downloadsResult.interactions || [],
        });
      } else {
        Alert.alert('Error', 'Failed to load interaction data');
      }
    } catch (error) {
      console.error('❌ Error loading interaction data:', error);
      Alert.alert('Error', 'Failed to load interaction data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInteractionData();
    setIsRefreshing(false);
  };

  // Load data when modal opens
  useEffect(() => {
    if (visible && updateId) {
      setActiveTab(initialTab);
      loadInteractionData();
    }
  }, [visible, updateId, initialTab]);

  // Get current tab data
  const getCurrentTabData = (): UserInteraction[] => {
    if (!interactionData) return [];
    
    switch (activeTab) {
      case 'likes':
        return interactionData.likes;
      case 'views':
        return interactionData.views;
      case 'shares':
        return interactionData.shares;
      case 'downloads':
        return interactionData.downloads;
      default:
        return [];
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Render user interaction item
  const renderUserInteraction = ({ item }: { item: UserInteraction }) => (
    <TouchableOpacity
      style={styles.userInteractionItem}
      onPress={() => onUserPress(item.userId)}
      activeOpacity={0.7}
    >
      {/* User Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => onUserPress(item.userId)}
      >
        <Image
          source={{
            uri: item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName)}&background=87CEEB&color=fff`
          }}
          style={styles.userAvatar}
        />
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={() => onUserPress(item.userId)}>
          <Text style={styles.userName}>{item.userName}</Text>
        </TouchableOpacity>
        <Text style={styles.interactionTime}>{formatTimeAgo(item.timestamp)}</Text>
      </View>

      {/* Interaction Type Icon */}
      <View style={styles.interactionIcon}>
        <Ionicons
          name={
            item.interactionType === 'like' ? 'heart' :
            item.interactionType === 'view' ? 'eye' :
            item.interactionType === 'share' ? 'arrow-redo' :
            'download'
          }
          size={20}
          color={
            item.interactionType === 'like' ? '#87CEEB' :
            item.interactionType === 'view' ? '#10B981' :
            item.interactionType === 'share' ? '#F59E0B' :
            '#8B5CF6'
          }
        />
      </View>
    </TouchableOpacity>
  );

  // Render tab button
  const renderTabButton = (
    tab: 'likes' | 'views' | 'shares' | 'downloads',
    icon: string,
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#87CEEB' : '#8E8E93'}
      />
      <Text style={[
        styles.tabLabel,
        activeTab === tab && styles.activeTabLabel
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.tabCount,
        activeTab === tab && styles.activeTabCount
      ]}>
        {count > 999 ? `${(count / 1000).toFixed(1)}K` : count}
      </Text>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={
          activeTab === 'likes' ? 'heart-outline' :
          activeTab === 'views' ? 'eye-outline' :
          activeTab === 'shares' ? 'arrow-redo-outline' :
          'download-outline'
        }
        size={64}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>
        No {activeTab} yet
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'likes' && 'Be the first to like this update'}
        {activeTab === 'views' && 'No one has viewed this update yet'}
        {activeTab === 'shares' && 'No one has shared this update yet'}
        {activeTab === 'downloads' && 'No one has downloaded this update yet'}
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Update Interactions</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTabButton('likes', 'heart', 'Likes', interactionData?.likes.length || 0)}
          {renderTabButton('views', 'eye', 'Views', interactionData?.views.length || 0)}
          {renderTabButton('shares', 'arrow-redo', 'Shares', interactionData?.shares.length || 0)}
          {renderTabButton('downloads', 'download', 'Downloads', interactionData?.downloads.length || 0)}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#87CEEB" />
            <Text style={styles.loadingText}>Loading {activeTab}...</Text>
          </View>
        ) : (
          <FlatList
            data={getCurrentTabData()}
            renderItem={renderUserInteraction}
            keyExtractor={(item) => `${item.userId}-${item.timestamp.getTime()}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#87CEEB"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#87CEEB',
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#87CEEB',
    fontWeight: '600',
  },
  tabCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '600',
  },
  activeTabCount: {
    color: '#87CEEB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  userInteractionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  interactionTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  interactionIcon: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default UpdatesInteractionPages;
