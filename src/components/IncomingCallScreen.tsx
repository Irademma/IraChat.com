// Incoming Call Screen - Telegram Style
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { CallData } from '../services/callingService';

interface IncomingCallScreenProps {
  callData: CallData;
  onAnswer: () => void;
  onDecline: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  callData,
  onAnswer,
  onDecline,
}) => {
  const [ringtone, setRingtone] = useState<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  // Initialize ringtone and animations
  useEffect(() => {
    initializeRingtone();
    startAnimations();
    startVibration();

    return () => {
      cleanup();
    };
  }, []);

  const initializeRingtone = async () => {
    try {
      // Set audio mode for ringtone
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // For now, we'll use vibration as the primary notification
      // since MP3 files are not provided
      console.log('🔊 Using vibration for incoming call notification');
    } catch (error) {
      console.warn('Could not initialize audio:', error);
    }
  };

  const startAnimations = () => {
    // Pulse animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const startVibration = () => {
    // Vibrate in pattern for incoming call
    const pattern = [0, 1000, 500, 1000, 500, 1000];
    Vibration.vibrate(pattern, true);
  };

  const cleanup = async () => {
    try {
      if (ringtone) {
        await ringtone.stopAsync();
        await ringtone.unloadAsync();
      }
      Vibration.cancel();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  };

  const handleAnswer = async () => {
    await cleanup();
    onAnswer();
  };

  const handleDecline = async () => {
    await cleanup();
    onDecline();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background Gradient */}
      <View style={[styles.background, { backgroundColor: '#667eea' }]} />

      {/* Slide in container */}
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Call Type Indicator */}
        <View style={styles.callTypeContainer}>
          <Ionicons 
            name={callData.type === 'video' ? 'videocam' : 'call'} 
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={styles.callTypeText}>
            Incoming {callData.type} call
          </Text>
        </View>

        {/* Caller Avatar with Pulse Animation */}
        <Animated.View 
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image 
            source={{ uri: callData.callerAvatar }} 
            style={styles.avatar}
          />
          
          {/* Pulse Rings */}
          <Animated.View 
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.7, 0],
                }),
              },
            ]}
          />
          <Animated.View 
            style={[
              styles.pulseRing,
              styles.pulseRingDelay,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.5, 0],
                }),
              },
            ]}
          />
        </Animated.View>

        {/* Caller Name */}
        <Text style={styles.callerName}>{callData.callerName}</Text>
        
        {/* Call Status */}
        <Text style={styles.callStatus}>
          {callData.type === 'video' ? 'Video calling...' : 'Calling...'}
        </Text>

        {/* Call Actions */}
        <View style={styles.actionsContainer}>
          {/* Decline Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Answer Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.answerButton]}
            onPress={handleAnswer}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {/* Message Button */}
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Message</Text>
          </TouchableOpacity>

          {/* Remind Me Button */}
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="time" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Remind me</Text>
          </TouchableOpacity>
        </View>

        {/* Swipe Indicators */}
        <View style={styles.swipeIndicators}>
          <View style={styles.swipeIndicator}>
            <Ionicons name="chevron-up" size={16} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.swipeText}>Swipe up for more options</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callTypeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  pulseRing: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pulseRingDelay: {
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    borderRadius: 140,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 60,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  declineButton: {
    backgroundColor: '#EF4444',
    transform: [{ rotate: '135deg' }],
  },
  answerButton: {
    backgroundColor: '#10B981',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 250,
    marginBottom: 40,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  swipeIndicators: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  swipeIndicator: {
    alignItems: 'center',
  },
  swipeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
