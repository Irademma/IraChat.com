import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { trackMediaInteraction } from "../services/analytics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MediaItem {
  id: string;
  uri: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

interface XStyleMediaViewerProps {
  visible: boolean;
  mediaItem: MediaItem | null;
  onClose: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const XStyleMediaViewer: React.FC<XStyleMediaViewerProps> = ({
  visible,
  mediaItem,
  onClose,
  onDelete,
  canDelete = false,
}) => {
  const [showControls, setShowControls] = useState(true);

  // Animations
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const mediaScale = useRef(new Animated.Value(0.8)).current;
  const mediaTranslateY = useRef(new Animated.Value(50)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  // Pan gesture for swipe down to close
  const panY = useRef(new Animated.Value(0)).current;
  const panGestureRef = useRef<any>(null);

  React.useEffect(() => {
    if (visible && mediaItem) {
      // Track media viewer opening
      trackMediaInteraction("view", mediaItem.type);

      // Animate in
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mediaScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mediaTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      backgroundOpacity.setValue(0);
      mediaScale.setValue(0.8);
      mediaTranslateY.setValue(50);
      panY.setValue(0);
    }
  }, [visible]);

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: true },
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;

      // Close if swiped down significantly or with high velocity
      if (translationY > 100 || velocityY > 1000) {
        closeWithAnimation();
      } else {
        // Snap back to original position
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(mediaScale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(mediaTranslateY, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const toggleControls = () => {
    const newValue = showControls ? 0 : 1;
    setShowControls(!showControls);

    Animated.timing(controlsOpacity, {
      toValue: newValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleDownload = async () => {
    if (!mediaItem) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save media to your device.",
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(mediaItem.uri);
      trackMediaInteraction("download", mediaItem.type);
      Alert.alert("Success", "Media saved to your device!");
    } catch (error) {
      Alert.alert("Error", "Failed to save media to your device.");
    }
  };

  const handleShare = async () => {
    if (!mediaItem) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(mediaItem.uri);
        trackMediaInteraction("share", mediaItem.type);
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share media.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Media", "Are you sure you want to delete this media?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete?.();
          closeWithAnimation();
        },
      },
    ]);
  };

  if (!visible || !mediaItem) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Blurred Background */}
      <Animated.View
        style={{
          flex: 1,
          opacity: backgroundOpacity,
        }}
      >
        <BlurView
          intensity={50}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />
      </Animated.View>

      {/* Media Content */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PanGestureHandler
          ref={panGestureRef}
          onGestureEvent={handlePanGesture}
          onHandlerStateChange={handlePanStateChange}
        >
          <Animated.View
            style={{
              transform: [
                { scale: mediaScale },
                { translateY: Animated.add(mediaTranslateY, panY) },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={toggleControls}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.7,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {mediaItem.type === "image" ? (
                <Image
                  source={{ uri: mediaItem.uri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="play-circle" size={80} color="white" />
                  <Text style={{ color: "white", marginTop: 10 }}>
                    Video Player
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Controls */}
      <Animated.View
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          opacity: controlsOpacity,
        }}
      >
        <TouchableOpacity onPress={closeWithAnimation}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handleDownload}
            style={{ marginRight: 20 }}
          >
            <Ionicons name="download" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={{ marginRight: 20 }}>
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Swipe indicator */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          alignItems: "center",
          opacity: controlsOpacity,
        }}
      >
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: 2,
          }}
        />
        <Text style={{ color: "white", fontSize: 12, marginTop: 8 }}>
          Swipe down to close
        </Text>
      </Animated.View>
    </Modal>
  );
};
