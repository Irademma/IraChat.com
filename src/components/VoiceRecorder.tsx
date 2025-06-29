// 🎤 VOICE RECORDER - Record and send voice messages
// WhatsApp-style voice message recording with waveform visualization

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  isVisible,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Simulate audio levels (in real app, get from recording)
      audioLevelRef.current = setInterval(() => {
        setAudioLevels(prev => {
          const newLevels = [...prev, Math.random() * 100];
          return newLevels.slice(-20); // Keep last 20 levels
        });
      }, 100);
    } else {
      // Stop animations
      pulseAnim.stopAnimation();
      waveAnim.stopAnimation();
      
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current);
        audioLevelRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioLevelRef.current) clearInterval(audioLevelRef.current);
    };
  }, [isRecording]);

  // Request audio permission
  const getPermission = async () => {
    if (permissionResponse?.status !== 'granted') {
      const permission = await requestPermission();
      return permission.granted;
    }
    return true;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const hasPermission = await getPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioLevels([]);

      // Haptic feedback
      Vibration.vibrate(50);

      console.log('🎤 Recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri, recordingDuration);
      }

      setRecording(null);
      setRecordingDuration(0);
      setAudioLevels([]);

      console.log('🎤 Recording stopped:', uri);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Cancel recording
  const cancelRecording = async () => {
    if (recording) {
      try {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setRecordingDuration(0);
        setAudioLevels([]);
      } catch (error) {
        console.error('❌ Failed to cancel recording:', error);
      }
    }
    onCancel();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle gesture
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideAnim } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX < -100) {
        // Swipe left to cancel
        cancelRecording();
      } else {
        // Snap back
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <View style={styles.recordingInterface}>
        {/* Cancel Indicator */}
        <View style={styles.cancelIndicator}>
          <Ionicons name="chevron-back" size={20} color="#EF4444" />
          <Text style={styles.cancelText}>Slide to cancel</Text>
        </View>

        {/* Waveform Visualization */}
        <View style={styles.waveformContainer}>
          {audioLevels.map((level, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  height: Math.max(4, level * 0.3),
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Recording Duration */}
        <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>

        {/* Recording Controls */}
        <View style={styles.controls}>
          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelRecording}
          >
            <Ionicons name="close" size={24} color="#EF4444" />
          </TouchableOpacity>

          {/* Record Button */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordingButton,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.recordButtonInner,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={32}
                    color="#FFFFFF"
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              !isRecording && recordingDuration > 0 && styles.sendButtonActive,
            ]}
            onPress={stopRecording}
            disabled={isRecording || recordingDuration === 0}
          >
            <Ionicons
              name="send"
              size={24}
              color={!isRecording && recordingDuration > 0 ? "#667eea" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          {isRecording
            ? "Release to send, slide left to cancel"
            : "Hold to record voice message"}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingBottom: 34, // Safe area
  },
  recordingInterface: {
    padding: 20,
    alignItems: 'center',
  },
  cancelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#667eea',
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  duration: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingButton: {
    backgroundColor: '#DC2626',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  instructions: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default VoiceRecorder;
