import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceMessageRecorder({ onSendVoiceMessage, onCancel }: VoiceMessageRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<number | null>(null);

  useEffect(() => {
    requestPermission();
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startDurationTimer();
    } else {
      stopPulseAnimation();
      stopDurationTimer();
    }
  }, [isRecording]);

  const requestPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone access to record voice messages.',
          [
            { text: 'Cancel', onPress: onCancel },
            { text: 'Settings', onPress: () => Audio.requestPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      Alert.alert('Error', 'Failed to request microphone permission');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startDurationTimer = () => {
    setRecordingDuration(0);
    durationInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestPermission();
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (uri) {
        onSendVoiceMessage(uri, recordingDuration);
      }
      
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setRecordingDuration(0);
      } catch (error) {
        console.error('Failed to cancel recording:', error);
      }
    }
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permissionGranted) {
    return (
      <View className="flex-row items-center justify-center py-4 px-4 bg-red-50 border border-red-200 rounded-lg">
        <Ionicons name="mic-off" size={20} color="#EF4444" />
        <Text className="text-red-600 ml-2">Microphone permission required</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-3 px-4 bg-gray-50 rounded-lg">
      {/* Cancel Button */}
      <TouchableOpacity
        onPress={cancelRecording}
        className="w-10 h-10 items-center justify-center mr-3"
      >
        <Ionicons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>

      {/* Recording Indicator */}
      <View className="flex-1 flex-row items-center">
        {isRecording ? (
          <>
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
              className="w-3 h-3 bg-red-500 rounded-full mr-3"
            />
            <Text className="text-gray-800 font-medium">Recording...</Text>
            <Text className="text-gray-500 ml-2">{formatDuration(recordingDuration)}</Text>
          </>
        ) : (
          <>
            <Ionicons name="mic" size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-2">Hold to record voice message</Text>
          </>
        )}
      </View>

      {/* Record/Send Button */}
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          isRecording ? 'bg-red-500' : 'bg-blue-500'
        }`}
        disabled={!permissionGranted}
      >
        <Ionicons 
          name={isRecording ? "stop" : "mic"} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
}
