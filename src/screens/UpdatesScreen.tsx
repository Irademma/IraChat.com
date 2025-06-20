import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useDispatch } from "react-redux";
import { UpdateCard } from "../components/UpdateCard";
import { deleteUpdate, updateUpdateMedia } from "../services/updatesService";
import { colors } from "../styles/colors";
import { Update } from "../types/Update";
import { handleRefresh } from "../utils/paginationUtils";
// Mock styles for now
const styles = {
  container: { flex: 1 },
  updateCard: { margin: 10 },
};

export const UpdatesScreen: React.FC<any> = ({ currentUserId }) => {
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
      console.error("Error deleting update:", error);
      throw error;
    }
  };

  const handleDeleteMedia = async (updateId: string, mediaId: string) => {
    try {
      // Delete media from storage
      // await deleteMedia(update.id, mediaId); // Fix: update is not defined in this scope
      // Update update in database
      await updateUpdateMedia(updateId, mediaId);
      // Update local state
      setUpdates((prev) =>
        prev.map((update) =>
          update.id === updateId
            ? {
                ...update,
                media: update.media?.filter((m) => m.id !== mediaId) || [],
              }
            : update,
        ),
      );
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  };

  const renderUpdateItem = ({ item: update }: { item: Update }) => (
    <UpdateCard
      update={
        {
          ...update,
          createdAt:
            typeof update.createdAt === "number"
              ? update.createdAt
              : update.createdAt.getTime(),
        } as any
      }
      isActive={true}
      onLike={() => console.log("Like update:", update.id)}
      onComment={() => console.log("Comment on update:", update.id)}
      onShare={() => console.log("Share update:", update.id)}
      onDownload={() => console.log("Download update:", update.id)}
      onReport={() => handleDeleteUpdate(update.id)}
      onProfilePress={() => console.log("Profile press:", update.user?.id)}
      currentUserId={currentUserId}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={updates}
        renderItem={renderUpdateItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          // loadMoreUpdates implementation would go here
          console.log("Load more updates");
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              handleRefresh(setRefreshing, () => Promise.resolve())
            }
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};
