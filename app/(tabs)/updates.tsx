import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock update data for now
interface Update {
  id: string;
  username: string;
  userProfilePic: string;
  mediaUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  userId: string;
}

const mockUpdates: Update[] = [];

export default function UpdatesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [updates] = useState<Update[]>(mockUpdates);
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive design (placeholder for responsive hooks)
  const isSmallDevice = SCREEN_HEIGHT < 700;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  }, []);

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
      <FlatList
        ref={flatListRef}
        data={updates}
        renderItem={() => null}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
            accessibilityLabel="Pull to refresh updates"
          />
        }
        contentContainerStyle={updates.length === 0 ? { flex: 1 } : undefined}
        accessible={true}
        accessibilityLabel="Updates list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
});