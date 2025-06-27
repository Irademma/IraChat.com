import { VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { ViewToken } from "react-native";

interface UseVideoPlayerProps {
  isActive: boolean;
  videoUri: string;
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => void;
}

export const useVideoPlayer = ({
  isActive,
  videoUri,
  onViewableItemsChanged,
}: UseVideoPlayerProps) => {
  const [status, setStatus] = useState<any>({});
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<VideoView>(null);
  const lastPlaybackStatus = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive]);

  const playVideo = async () => {
    try {
      if (videoRef.current) {
        // VideoView doesn't have playAsync method - it's controlled by player prop
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing video:", error);
    }
  };

  const pauseVideo = async () => {
    try {
      if (videoRef.current) {
        // VideoView doesn't have pauseAsync method - it's controlled by player prop
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing video:", error);
    }
  };

  const toggleMute = async () => {
    try {
      if (videoRef.current) {
        const newMuteState = !isMuted;
        // VideoView doesn't have setIsMutedAsync method - it's controlled by player prop
        setIsMuted(newMuteState);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const replayVideo = async () => {
    try {
      if (videoRef.current) {
        // VideoView doesn't have setPositionAsync/playAsync methods - it's controlled by player prop
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error replaying video:", error);
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: any) => {
    if (!playbackStatus.isLoaded) {
      setIsBuffering(true);
      return;
    }

    setIsBuffering(false);
    setStatus(playbackStatus);
    lastPlaybackStatus.current = playbackStatus;

    // Auto-replay when video ends
    if (playbackStatus.didJustFinish) {
      replayVideo();
    }
  };

  const handleLoad = async () => {
    try {
      if (videoRef.current) {
        // VideoView doesn't have setIsMutedAsync/playAsync methods - it's controlled by player prop
        if (isActive) {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error loading video:", error);
    }
  };

  const handleError = (error: any) => {
    console.error("Video error:", error);
    setIsBuffering(false);
    setIsPlaying(false);
  };

  return {
    videoRef,
    status,
    isMuted,
    isPlaying,
    isBuffering,
    playVideo,
    pauseVideo,
    toggleMute,
    replayVideo,
    handlePlaybackStatusUpdate,
    handleLoad,
    handleError,
  };
};
