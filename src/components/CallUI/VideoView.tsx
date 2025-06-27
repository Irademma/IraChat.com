import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface VideoViewProps {
  stream: MediaStream | null;
  style?: any;
  objectFit?: "contain" | "cover";
  mirror?: boolean;
  placeholder?: string;
  isLocal?: boolean;
}

export const VideoView: React.FC<VideoViewProps> = ({
  stream,
  style,
  objectFit = "cover",
  mirror = false,
  placeholder = "No video",
  isLocal = false,
}) => {
  if (!stream) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </View>
    );
  }

  return (
    <RTCView
      {...({ streamURL: stream.toURL() } as any)}
      style={[styles.video, style]}
      {...({ objectFit } as any)}
      {...({ mirror } as any)}
      {...({ zOrder: isLocal ? 1 : 0 } as any)}
    />
  );
};

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 16,
    opacity: 0.7,
  },
});
