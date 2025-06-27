// Full-Screen Call Interface - Telegram Style
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { CallData } from '../services/callingService';

interface CallScreenProps {
  callData: CallData;
  localStream: any;
  remoteStream: any;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'connecting';
}

export const CallScreen: React.FC<CallScreenProps> = ({
  callData,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onToggleCamera,
  isMuted,
  isVideoEnabled,
  isSpeakerOn,
  callDuration,
  connectionQuality,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isLocalVideoLarge, setIsLocalVideoLarge] = useState(false);
  const { width, height } = Dimensions.get('window');

  // Auto-hide controls after 3 seconds in video calls
  useEffect(() => {
    if (callData.type === 'video' && showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, callData.type]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get connection quality color
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'poor': return '#EF4444';
      case 'connecting': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Toggle video view (switch between caller and receiver)
  const toggleVideoView = () => {
    setIsLocalVideoLarge(!isLocalVideoLarge);
  };

  // Show/hide controls
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Call Layout */}
      {callData.type === 'video' ? (
        <TouchableOpacity 
          style={styles.videoContainer} 
          onPress={toggleControls}
          activeOpacity={1}
        >
          {/* Remote Video (Main) */}
          {remoteStream && !isLocalVideoLarge && (
            <View style={styles.remoteVideo}>
              <RTCView
                {...({
                  streamURL: remoteStream.toURL(),
                  objectFit: "cover",
                  style: { flex: 1 }
                } as any)}
              />
            </View>
          )}

          {/* Local Video (Main when toggled) */}
          {localStream && isLocalVideoLarge && (
            <View style={styles.remoteVideo}>
              <RTCView
                {...({
                  streamURL: localStream.toURL(),
                  objectFit: "cover",
                  style: { flex: 1 }
                } as any)}
              />
            </View>
          )}

          {/* Picture-in-Picture Video */}
          {localStream && !isLocalVideoLarge && (
            <TouchableOpacity
              style={styles.localVideoContainer}
              onPress={toggleVideoView}
            >
              <View style={styles.localVideo}>
                <RTCView
                  {...({
                    streamURL: localStream.toURL(),
                    objectFit: "cover",
                    style: { flex: 1 }
                  } as any)}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* Remote Video (PiP when local is main) */}
          {remoteStream && isLocalVideoLarge && (
            <TouchableOpacity
              style={styles.localVideoContainer}
              onPress={toggleVideoView}
            >
              <View style={styles.localVideo}>
                <RTCView
                  {...({
                    streamURL: remoteStream.toURL(),
                    objectFit: "cover",
                    style: { flex: 1 }
                  } as any)}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* Video disabled overlay */}
          {!isVideoEnabled && (
            <View style={styles.videoDisabledOverlay}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: callData.receiverAvatar }} 
                  style={styles.avatar}
                />
                <Text style={styles.videoDisabledText}>Camera is off</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        /* Voice Call Layout */
        <View style={styles.voiceCallContainer}>
          <View style={styles.voiceCallContent}>
            {/* Contact Avatar */}
            <Image 
              source={{ uri: callData.receiverAvatar }} 
              style={styles.voiceAvatar}
            />
            
            {/* Contact Name */}
            <Text style={styles.contactName}>{callData.receiverName}</Text>
            
            {/* Call Status */}
            <Text style={styles.callStatus}>
              {callData.status === 'connected' ? 'Connected' : 'Calling...'}
            </Text>
          </View>
        </View>
      )}

      {/* Call Info Overlay */}
      {showControls && (
        <View style={styles.callInfoOverlay}>
          <View style={styles.callInfo}>
            <Text style={styles.contactNameOverlay}>{callData.receiverName}</Text>
            <View style={styles.callStatusRow}>
              <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
              <View style={[styles.qualityIndicator, { backgroundColor: getQualityColor() }]} />
            </View>
          </View>
        </View>
      )}

      {/* Call Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {/* Mute Button */}
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={onToggleMute}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={24} 
                color={isMuted ? "#EF4444" : "#FFFFFF"} 
              />
            </TouchableOpacity>

            {/* Video Toggle (only for video calls) */}
            {callData.type === 'video' && (
              <TouchableOpacity 
                style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
                onPress={onToggleVideo}
              >
                <Ionicons 
                  name={isVideoEnabled ? "videocam" : "videocam-off"} 
                  size={24} 
                  color={!isVideoEnabled ? "#EF4444" : "#FFFFFF"} 
                />
              </TouchableOpacity>
            )}

            {/* Speaker Button */}
            <TouchableOpacity 
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={onToggleSpeaker}
            >
              <Ionicons 
                name={isSpeakerOn ? "volume-high" : "volume-low"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            {/* Camera Switch (only for video calls) */}
            {callData.type === 'video' && (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={onToggleCamera}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* End Call Button */}
            <TouchableOpacity 
              style={styles.endCallButton}
              onPress={onEndCall}
            >
              <Ionicons name="call" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000000',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  localVideo: {
    flex: 1,
  },
  videoDisabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  videoDisabledText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  voiceCallContainer: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCallContent: {
    alignItems: 'center',
  },
  voiceAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 32,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contactName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  callInfoOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
  },
  callInfo: {
    alignItems: 'center',
  },
  contactNameOverlay: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  callStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  callDuration: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
