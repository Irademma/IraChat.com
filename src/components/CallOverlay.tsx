// Mini Call Overlay - Shows when navigating away from call screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CallData } from '../services/callingService';

interface CallOverlayProps {
  callData: CallData;
  callDuration: number;
  onEndCall: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  isVisible: boolean;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
  callData,
  callDuration,
  onEndCall,
  onToggleMute,
  isMuted,
  isVisible,
}) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigate back to call screen
  const returnToCall = () => {
    router.push('/call');
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* Call Info */}
      <TouchableOpacity style={styles.callInfo} onPress={returnToCall}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: callData.receiverAvatar }} 
            style={styles.avatar}
          />
          <View style={[
            styles.callTypeIndicator,
            { backgroundColor: (callData.type === 'video' || callData.type === 'group_video') ? '#667eea' : '#10B981' }
          ]}>
            <Ionicons
              name={(callData.type === 'video' || callData.type === 'group_video') ? 'videocam' : 'call'}
              size={8}
              color="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.contactName} numberOfLines={1}>
            {callData.groupName || callData.receiverName}
          </Text>
          <Text style={styles.callDuration}>
            {formatDuration(callDuration)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Call Controls */}
      <View style={styles.controls}>
        {/* Mute Button */}
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.mutedButton]}
          onPress={onToggleMute}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={16} 
            color={isMuted ? "#EF4444" : "#FFFFFF"} 
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity 
          style={styles.endCallButton}
          onPress={onEndCall}
        >
          <Ionicons name="call" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  callInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  callTypeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  textContainer: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  callDuration: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mutedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  endCallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
