// Group Call Screen - Telegram-style Group Video/Voice Calling
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { CallData, GroupCallParticipant } from '../services/callingService';

interface GroupCallScreenProps {
  callData: CallData;
  localStream: any;
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
  currentUserId: string;
}

export const GroupCallScreen: React.FC<GroupCallScreenProps> = ({
  callData,
  localStream,
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
  currentUserId,
}) => {
  const [participants, setParticipants] = useState<GroupCallParticipant[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [gridColumns, setGridColumns] = useState(2);
  const { width, height } = Dimensions.get('window');

  // Auto-hide controls after 3 seconds in video calls
  useEffect(() => {
    if (callData.type === 'group_video' && showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, callData.type]);

  // Calculate grid layout based on participant count
  useEffect(() => {
    const participantCount = participants.length + 1; // +1 for local user
    if (participantCount <= 2) {
      setGridColumns(1);
    } else if (participantCount <= 4) {
      setGridColumns(2);
    } else if (participantCount <= 9) {
      setGridColumns(3);
    } else {
      setGridColumns(4);
    }
  }, [participants.length]);

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

  // Show/hide controls
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Calculate participant item size
  const getParticipantSize = () => {
    const padding = 16;
    const spacing = 8;
    const itemWidth = (width - padding * 2 - spacing * (gridColumns - 1)) / gridColumns;
    const itemHeight = callData.type === 'group_video' ? itemWidth * 1.2 : 120;
    return { width: itemWidth, height: itemHeight };
  };

  // Render participant item
  const renderParticipant = ({ item, index }: { item: GroupCallParticipant; index: number }) => {
    const { width: itemWidth, height: itemHeight } = getParticipantSize();
    const isCurrentUser = item.userId === currentUserId;

    return (
      <View style={[styles.participantItem, { width: itemWidth, height: itemHeight }]}>
        {/* Video Stream */}
        {callData.type === 'group_video' && item.videoStream && item.isVideoEnabled ? (
          <View style={styles.participantVideo}>
            <RTCView
              {...({
                streamURL: item.videoStream.toURL(),
                objectFit: "cover",
                style: { flex: 1 }
              } as any)}
            />
          </View>
        ) : (
          /* Avatar for voice calls or disabled video */
          <View style={styles.participantAvatar}>
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            {!item.isVideoEnabled && callData.type === 'group_video' && (
              <View style={styles.videoDisabledOverlay}>
                <Ionicons name="videocam-off" size={20} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {/* Participant Info */}
        <View style={styles.participantInfo}>
          <Text style={styles.participantName} numberOfLines={1}>
            {isCurrentUser ? 'You' : item.name}
          </Text>
          
          {/* Status Indicators */}
          <View style={styles.statusIndicators}>
            {item.isMuted && (
              <View style={styles.statusIcon}>
                <Ionicons name="mic-off" size={12} color="#EF4444" />
              </View>
            )}
            {item.isSpeaking && (
              <View style={[styles.statusIcon, styles.speakingIcon]}>
                <Ionicons name="volume-high" size={12} color="#10B981" />
              </View>
            )}
            <View style={[styles.connectionDot, { backgroundColor: getQualityColor() }]} />
          </View>
        </View>

        {/* Admin Badge */}
        {item.isAdmin && (
          <View style={styles.adminBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
          </View>
        )}
      </View>
    );
  };

  // Render local user
  const renderLocalUser = () => {
    const { width: itemWidth, height: itemHeight } = getParticipantSize();

    return (
      <View style={[styles.participantItem, { width: itemWidth, height: itemHeight }]}>
        {/* Local Video Stream */}
        {callData.type === 'group_video' && localStream && isVideoEnabled ? (
          <View style={styles.participantVideo}>
            <RTCView
              {...({
                streamURL: localStream.toURL(),
                objectFit: "cover",
                style: { flex: 1 }
              } as any)}
            />
          </View>
        ) : (
          /* Local Avatar */
          <View style={styles.participantAvatar}>
            <Image source={{ uri: callData.callerAvatar }} style={styles.avatarImage} />
            {!isVideoEnabled && callData.type === 'group_video' && (
              <View style={styles.videoDisabledOverlay}>
                <Ionicons name="videocam-off" size={20} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {/* Local User Info */}
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>You</Text>
          <View style={styles.statusIndicators}>
            {isMuted && (
              <View style={styles.statusIcon}>
                <Ionicons name="mic-off" size={12} color="#EF4444" />
              </View>
            )}
            <View style={[styles.connectionDot, { backgroundColor: getQualityColor() }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Group Call Header */}
      {showControls && (
        <View style={styles.header}>
          <View style={styles.callInfo}>
            <Text style={styles.groupName}>{callData.groupName || 'Group Call'}</Text>
            <View style={styles.callStatusRow}>
              <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
              <Text style={styles.participantCount}>
                {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Participants Grid */}
      <TouchableOpacity 
        style={styles.participantsContainer} 
        onPress={toggleControls}
        activeOpacity={1}
      >
        <FlatList
          data={[{ isLocalUser: true }, ...participants]}
          renderItem={({ item, index }) =>
            (item as any).isLocalUser ? renderLocalUser() : renderParticipant({ item: item as GroupCallParticipant, index })
          }
          keyExtractor={(item, index) =>
            (item as any).isLocalUser ? 'local-user' : (item as GroupCallParticipant).userId || index.toString()
          }
          numColumns={gridColumns}
          key={gridColumns} // Force re-render when columns change
          contentContainerStyle={styles.participantsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </TouchableOpacity>

      {/* Call Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {/* Add Participant Button */}
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

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
            {callData.type === 'group_video' && (
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
            {callData.type === 'group_video' && (
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
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  callInfo: {
    alignItems: 'center',
  },
  groupName: {
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
    marginRight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  participantCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  participantsContainer: {
    flex: 1,
    paddingTop: 120,
    paddingBottom: 120,
  },
  participantsList: {
    padding: 16,
    alignItems: 'center',
  },
  participantItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  participantVideo: {
    flex: 1,
  },
  participantAvatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  videoDisabledOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 4,
  },
  speakingIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 2,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  adminBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 10,
    padding: 4,
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
