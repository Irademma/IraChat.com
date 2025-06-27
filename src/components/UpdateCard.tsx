// Individual update card component for vertical media updates
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
    Animated,
    BackHandler,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// import { Markdown } from "react-native-markdown-display"; // Removed for bundle optimization
import { useAccessibility } from "../hooks/useAccessibility";
import { useAnalytics } from "../hooks/useAnalytics";
import { useDoubleTap } from "../hooks/useDoubleTap";
import { useMentionNotifications } from "../hooks/useMentionNotifications";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { Update } from "../types";
import { formatNumber } from "../utils/formatNumber";
import {
    parseMentions,
    replaceMentionsWithLinks,
} from "../utils/parseMentions";
import {
    fontSize,
    hp,
    isMediumDevice,
    isSmallDevice,
    platformSpecific,
    spacing,
    wp,
} from "../utils/responsive";

interface UpdateCardProps {
  update: Update;
  isActive: boolean;
  onLike: (updateId: string) => void;
  onComment: (updateId: string) => void;
  onShare: (updateId: string) => void;
  onDownload: (updateId: string) => void;
  onReport: (updateId: string) => void;
  onProfilePress: (userId: string) => void;
  currentUserId?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 100; // Approximate header height
const TAB_BAR_HEIGHT = 65; // Tab bar height
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT;

export const UpdateCard: React.FC<UpdateCardProps> = ({
  update,
  isActive,
  onLike,
  onComment,
  onShare,
  onDownload,
  onReport,
  onProfilePress,
  currentUserId,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { trackView, trackEngagement } = useAnalytics({
    currentUserId: currentUserId || "",
  });
  const { settings } = useAccessibility();

  const {
    videoRef,
    status,
    isMuted,
    isPlaying,
    isBuffering,
    playVideo,
    pauseVideo,
    toggleMute,
    handlePlaybackStatusUpdate,
    handleError,
  } = useVideoPlayer({
    isActive,
    videoUri: update.mediaUrl,
  });

  const handleDoubleTap = useDoubleTap(() => {
    onLike(update.id);
    trackEngagement({
      type: "like",
      contentId: update.id,
      contentType: "update",
    });
  });

  const { sendMentionNotifications } = useMentionNotifications({
    currentUserId: currentUserId || "",
  });

  const handleMentionPress = useCallback(
    (userId: string) => {
      onProfilePress(userId);
    },
    [onProfilePress],
  );

  const processedCaption = useMemo(() => {
    const mentions = parseMentions(update.caption || "");
    return replaceMentionsWithLinks(
      update.caption || "",
      mentions,
      handleMentionPress,
    );
  }, [update.caption, handleMentionPress]);

  useEffect(() => {
    if (isActive) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      trackView({
        type: "update",
        contentId: update.id,
      });

      // Add back button handler for Android
      if (Platform.OS === "android") {
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            if (isActive) {
              if (isPlaying) {
                pauseVideo();
              }
              return true;
            }
            return false;
          },
        );

        return () => backHandler.remove();
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, update.id, trackView, isPlaying, pauseVideo]);

  const handleMediaPress = () => {
    if (!settings.autoplayVideos) {
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={() => onReport(update.id)}
        {...handleDoubleTap}
        style={styles.mediaContainer}
      >
        <Video
          ref={videoRef as any}
          style={styles.media}
          source={{ uri: update.mediaUrl }}
          shouldPlay={isPlaying}
          isLooping={true}
          isMuted={isMuted}
          resizeMode={"cover" as any}
        />

        {/* Loading state removed since useVideoPlayer.ts doesn't provide isLoading */}

        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <Ionicons
              name="hourglass-outline"
              size={styles.bufferingIcon.width}
              color="white"
            />
          </View>
        )}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => onProfilePress(update.user?.id || "")}
          >
            <Image
              source={{ uri: update.user?.avatar || "" }}
              style={styles.profilePic}
            />
            <Text style={styles.username}>{update.user?.name || ""}</Text>
          </TouchableOpacity>

          <Text style={styles.caption}>
            {processedCaption.text}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onLike(update.id)}
            >
              <Ionicons
                name={update.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={update.isLiked ? "#ff2d55" : "white"}
              />
              <Text style={styles.actionText}>
                {formatNumber(update.likeCount || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onComment(update.id)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="white" />
              <Text style={styles.actionText}>
                {formatNumber(update.commentCount || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onShare(update.id)}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDownload(update.id)}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={toggleMute}>
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(100),
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: hp(50),
  },
  contentContainer: {
    position: "absolute",
    bottom: platformSpecific.bottomPadding,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  profilePic: {
    width: isSmallDevice() ? wp(10) : isMediumDevice() ? wp(8) : wp(7),
    height: isSmallDevice() ? wp(10) : isMediumDevice() ? wp(8) : wp(7),
    borderRadius: isSmallDevice() ? wp(5) : isMediumDevice() ? wp(4) : wp(3.5),
    marginRight: spacing.sm,
  },
  username: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "bold",
  },
  caption: {
    color: "white",
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: fontSize.sm * 1.5,
  },
  mentionLink: {
    color: "#1DA1F2",
    textDecorationLine: "none",
    fontSize: fontSize.sm,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    padding: spacing.xs,
  },
  actionText: {
    color: "white",
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  loadingIcon: {
    width: isSmallDevice() ? wp(6) : wp(5),
    height: isSmallDevice() ? wp(6) : wp(5),
  },
  bufferingIcon: {
    width: isSmallDevice() ? wp(6) : wp(5),
    height: isSmallDevice() ? wp(6) : wp(5),
  },
});
