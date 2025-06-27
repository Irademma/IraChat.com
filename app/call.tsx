// Active Call Screen Route
import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { CallScreen } from '../src/components/CallScreen';
import { GroupCallScreen } from '../src/components/GroupCallScreen';
import { useCallManager } from '../src/hooks/useCallManager';
import { callingService } from '../src/services/callingService';
import { auth } from '../src/services/firebaseSimple';

export default function CallScreenPage() {
  const currentUser = auth?.currentUser;
  const {
    callState,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    toggleCamera
  } = useCallManager(currentUser?.uid || '');

  const [streams, setStreams] = useState<{
    localStream: any;
    remoteStream: any;
  }>({ localStream: null, remoteStream: null });

  // Get streams from calling service
  useEffect(() => {
    const updateStreams = () => {
      const { localStream, remoteStream } = callingService.getStreams();
      setStreams({ localStream, remoteStream });
    };

    // Update streams initially
    updateStreams();

    // Update streams periodically during call
    const interval = setInterval(updateStreams, 1000);

    return () => clearInterval(interval);
  }, [callState.isInCall]);

  // Prevent back button during call
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Don't allow back button to close call screen
      return true;
    });

    return () => backHandler.remove();
  }, []);

  if (!callState.isInCall || !callState.callData) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  // Check if this is a group call
  const isGroupCall = callState.callData.type === 'group_voice' || callState.callData.type === 'group_video';

  if (isGroupCall) {
    return (
      <GroupCallScreen
        callData={callState.callData}
        localStream={streams.localStream}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleSpeaker={toggleSpeaker}
        onToggleCamera={toggleCamera}
        isMuted={callState.isMuted}
        isVideoEnabled={callState.isVideoEnabled}
        isSpeakerOn={callState.isSpeakerOn}
        callDuration={callState.callDuration}
        connectionQuality={callState.connectionQuality}
        currentUserId={currentUser?.uid || ''}
      />
    );
  }

  return (
    <CallScreen
      callData={callState.callData}
      localStream={streams.localStream}
      remoteStream={streams.remoteStream}
      onEndCall={endCall}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
      onToggleSpeaker={toggleSpeaker}
      onToggleCamera={toggleCamera}
      isMuted={callState.isMuted}
      isVideoEnabled={callState.isVideoEnabled}
      isSpeakerOn={callState.isSpeakerOn}
      callDuration={callState.callDuration}
      connectionQuality={callState.connectionQuality}
    />
  );
}


