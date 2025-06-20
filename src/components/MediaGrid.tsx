import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { colors } from "../theme/colors";
import { MediaPreview } from "./MediaPreview";
import { MediaViewer } from "./MediaViewer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MediaGridProps {
  media: Array<{
    url: string;
    type: "image" | "video" | "file";
    caption?: string;
    fileType?: string;
    fileSize?: string;
  }>;
  onClose: () => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ media, onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState<(typeof media)[0] | null>(
    null,
  );
  const [showViewer, setShowViewer] = useState(false);
  const { isTablet } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMediaPress = (item: (typeof media)[0]) => {
    setSelectedMedia(item);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedMedia(null);
  };

  const numColumns = isTablet ? 4 : 3;
  const itemSize = (SCREEN_WIDTH - (numColumns + 1) * 8) / numColumns;

  const renderMediaItem = ({ item }: { item: (typeof media)[0] }) => (
    <TouchableOpacity
      style={[styles.mediaItem, { width: itemSize, height: itemSize }]}
      onPress={() => handleMediaPress(item)}
      activeOpacity={0.8}
    >
      <MediaPreview
        media={item}
        onPress={() => handleMediaPress(item)}
        style={styles.preview}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // Implement share functionality
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
        />

        {showViewer && selectedMedia && (
          <MediaViewer
            media={media}
            initialIndex={media.findIndex((m) => m.url === selectedMedia.url)}
            onClose={handleCloseViewer}
          />
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  grid: {
    padding: 4,
  },
  mediaItem: {
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.mediaPreview.background,
    borderWidth: 1,
    borderColor: colors.mediaPreview.border,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
});
