import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaPreviewProps {
  media: {
    url: string;
    type: 'image' | 'video' | 'file';
    caption?: string;
    fileType?: string;
    fileSize?: string;
  };
  onPress: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  onPress,
  onLongPress,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const { isTablet } = useResponsive();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleVideoPress = async () => {
    if (media.type === 'video') {
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
    onPress();
  };

  const renderFilePreview = () => {
    const getFileIcon = () => {
      switch (media.fileType?.toLowerCase()) {
        case 'pdf':
          return 'document-text';
        case 'doc':
        case 'docx':
          return 'document';
        case 'xls':
        case 'xlsx':
          return 'grid';
        case 'ppt':
        case 'pptx':
          return 'easel';
        case 'zip':
        case 'rar':
          return 'archive';
        default:
          return 'document';
      }
    };

    return (
      <View style={styles.filePreview}>
        <Ionicons name={getFileIcon()} size={32} color={colors.primary} />
        <Text style={styles.fileName} numberOfLines={1}>
          {media.caption || 'File'}
        </Text>
        <Text style={styles.fileInfo}>
          {media.fileType?.toUpperCase()} • {media.fileSize}
        </Text>
      </View>
    );
  };

  const renderMediaContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <Image
            source={{ uri: media.url }}
            style={styles.mediaContent}
            resizeMode="cover"
          />
        );
      case 'video':
        return (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: media.url }}
              style={styles.mediaContent}
              resizeMode={'cover' as any}
              isLooping
              shouldPlay={isPlaying}
              isMuted={!isPlaying}
            />
            {!isPlaying && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color={colors.primary} />
              </View>
            )}
          </View>
        );
      case 'file':
        return renderFilePreview();
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handleVideoPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {renderMediaContent()}
        {media.caption && media.type !== 'file' && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={2}>
              {media.caption}
            </Text>
          </View>
        )}
        {media.type === 'video' && (
          <View style={styles.videoInfo}>
            <Ionicons name="videocam" size={16} color={colors.primary} />
            <Text style={styles.videoDuration}>00:00</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.mediaPreview.background,
    borderWidth: 1,
    borderColor: colors.mediaPreview.border,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  mediaContent: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: colors.mediaPreview.overlay,
  },
  caption: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  videoInfo: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoDuration: {
    color: colors.background,
    fontSize: 12,
    marginLeft: 4,
  },
  filePreview: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  fileInfo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
