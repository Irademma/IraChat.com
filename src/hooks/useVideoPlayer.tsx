import { Video } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAnalytics } from './useAnalytics';

interface UseVideoPlayerProps {
  uri: string;
  isActive: boolean;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  onPlaybackStatusUpdate?: (status: any) => void;
  currentUserId?: string;
}

export const useVideoPlayer = ({
  uri,
  isActive,
  onError,
  onLoad,
  onPlaybackStatusUpdate,
  currentUserId,
}: UseVideoPlayerProps) => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isBackground, setIsBackground] = useState(false);
  const videoRef = useRef<Video>(null);
  const { trackPerformance } = useAnalytics({ currentUserId: currentUserId || '' });

  const loadVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();

      if (videoRef.current) {
        await videoRef.current.loadAsync(
          { uri },
          {
            shouldPlay: isActive && !isBackground,
            isLooping: true,
            isMuted: isMuted,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
          },
          false
        );

        const loadTime = Date.now() - startTime;
        trackPerformance({
          name: 'video_load_time',
          value: loadTime,
          unit: 'ms',
          context: { uri }
        });

        onLoad?.();
      }
    } catch (error) {
      console.error('Error loading video:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [uri, isActive, isMuted, isBackground, onError, onLoad, trackPerformance]);

  const handlePlaybackStatusUpdate = useCallback((playbackStatus: any) => {
    setStatus(playbackStatus);
    setIsBuffering(playbackStatus.isBuffering);
    onPlaybackStatusUpdate?.(playbackStatus);

    // Auto-restart video when it ends
    if (playbackStatus.didJustFinish) {
      videoRef.current?.setPositionAsync(0);
      videoRef.current?.playAsync();
    }
  }, [onPlaybackStatusUpdate]);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (status?.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      onError?.(error as Error);
    }
  }, [status?.isPlaying, onError]);

  const toggleMute = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const newMuteState = !isMuted;
      await videoRef.current.setIsMutedAsync(newMuteState);
      setIsMuted(newMuteState);
    } catch (error) {
      console.error('Error toggling mute:', error);
      onError?.(error as Error);
    }
  }, [isMuted, onError]);

  const seekTo = useCallback(async (position: number) => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setPositionAsync(position);
    } catch (error) {
      console.error('Error seeking video:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setIsBackground(nextAppState === 'background');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle video activation/deactivation
  useEffect(() => {
    if (isActive && !isBackground) {
      loadVideo();
      videoRef.current?.playAsync();
    } else if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [isActive, isBackground, loadVideo]);

  // Ensure video plays when active and app is in foreground
  useEffect(() => {
    if (videoRef.current && isActive && !isBackground && !status?.isPlaying) {
      videoRef.current.playAsync();
    }
  }, [isActive, isBackground, status?.isPlaying]);

  return {
    videoRef,
    status,
    isLoading,
    isMuted,
    isPlaying: status?.isPlaying || false,
    isBuffering,
    isBackground,
    togglePlayPause,
    toggleMute,
    seekTo,
    loadVideo,
    handleError: onError,
  };
}; 