import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { colors } from "../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MediaViewerProps {
  media: Array<{
    url: string;
    type: "image" | "video" | "file";
    caption?: string;
    fileType?: string;
    fileSize?: string;
  }>;
  initialIndex: number;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const { isTablet } = useResponsive();
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        scale.setValue(1 - Math.abs(gesture.dx) / SCREEN_WIDTH);
        opacity.setValue(1 - Math.abs(gesture.dx) / SCREEN_WIDTH);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SCREEN_WIDTH * 0.3) {
          Animated.parallel([
            Animated.timing(pan, {
              toValue: {
                x: gesture.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
                y: gesture.dy,
              },
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => onClose());
        } else {
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handleVideoPress = async () => {
    if (media[currentIndex].type === "video") {
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (
      (direction === "left" && currentIndex < media.length - 1) ||
      (direction === "right" && currentIndex > 0)
    ) {
      setCurrentIndex((prev) => prev + (direction === "left" ? 1 : -1));
    }
  };

  const renderMediaContent = () => {
    const currentMedia = media[currentIndex];

    switch (currentMedia.type) {
      case "image":
        return (
          <Image
            source={{ uri: currentMedia.url }}
            style={styles.mediaContent}
            resizeMode="contain"
          />
        );
      case "video":
        return (
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={handleVideoPress}
            activeOpacity={1}
          >
            <VideoView
              ref={videoRef}
              style={styles.mediaContent}
              player={{
                source: currentMedia.url,
                loop: true,
                muted: !isPlaying,
              }}
              contentFit="contain"
              allowsFullscreen={true}
              allowsPictureInPicture={false}
            />
            {!isPlaying && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        );
      case "file":
        return (
          <View style={styles.fileContainer}>
            <Ionicons
              name={getFileIcon(currentMedia.fileType)}
              size={64}
              color={colors.primary}
            />
            <Text style={styles.fileName}>{currentMedia.caption}</Text>
            <Text style={styles.fileInfo}>
              {currentMedia.fileType?.toUpperCase()} • {currentMedia.fileSize}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return "document-text";
      case "doc":
      case "docx":
        return "document";
      case "xls":
      case "xlsx":
        return "grid";
      case "ppt":
      case "pptx":
        return "easel";
      case "zip":
      case "rar":
        return "archive";
      default:
        return "document";
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {renderMediaContent()}
      </Animated.View>

      {showControls && (
        <>
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

          {media[currentIndex].caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{media[currentIndex].caption}</Text>
            </View>
          )}

          {media.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.leftButton]}
                  onPress={() => handleSwipe("right")}
                >
                  <Ionicons
                    name="chevron-back"
                    size={32}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              {currentIndex < media.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.rightButton]}
                  onPress={() => handleSwipe("left")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={32}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  captionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  caption: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  fileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  fileName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  fileInfo: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});
