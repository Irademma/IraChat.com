import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { UpdateCard } from '../components/UpdateCard';
import { deleteMedia, deleteUpdate, updateUpdateMedia } from '../services/updatesService';
import { colors } from '../styles/colors';
import { styles } from '../styles/styles';
import { Update } from '../types/Update';
import { handleRefresh, loadMoreUpdates } from '../utils/paginationUtils';
import { handleMediaPress, handleUpdateLongPress, handleUpdatePress } from '../utils/updateUtils';

export const UpdatesScreen: React.FC<UpdatesScreenProps> = ({
  currentUserId,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      // Delete update from database
      await deleteUpdate(updateId);
      // Update local state
      setUpdates((prev) => prev.filter((update) => update.id !== updateId));
    } catch (error) {
      console.error('Error deleting update:', error);
      throw error;
    }
  };

  const handleDeleteMedia = async (updateId: string, mediaId: string) => {
    try {
      // Delete media from storage
      await deleteMedia(mediaId);
      // Update update in database
      await updateUpdateMedia(updateId, mediaId);
      // Update local state
      setUpdates((prev) =>
        prev.map((update) =>
          update.id === updateId
            ? {
                ...update,
                media: update.media.filter((m) => m.id !== mediaId),
              }
            : update
        )
      );
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  };

  const renderUpdateItem = ({ item: update }: { item: Update }) => (
    <UpdateCard
      update={update}
      currentUserId={currentUserId}
      onDelete={handleDeleteUpdate}
      onPress={() => handleUpdatePress(update)}
      onMediaPress={handleMediaPress}
      onLongPress={handleUpdateLongPress}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={updates}
        renderItem={renderUpdateItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreUpdates}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}; 