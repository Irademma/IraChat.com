// Call Manager Hook - Handles call state, persistence, and navigation
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { audioService } from '../services/audioService';
import { CallData, callingService } from '../services/callingService';

export interface CallState {
  isInCall: boolean;
  callData: CallData | null;
  isIncomingCall: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'connecting';
  localStream: any;
  remoteStream: any;
}

export const useCallManager = (currentUserId: string) => {
  const router = useRouter();
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    callData: null,
    isIncomingCall: false,
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerOn: false,
    callDuration: 0,
    connectionQuality: 'connecting',
    localStream: null,
    remoteStream: null,
  });

  const [callTimer, setCallTimer] = useState<number | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Initialize call manager
  useEffect(() => {
    initializeCallManager();
    setupAppStateListener();

    return () => {
      cleanup();
    };
  }, [currentUserId]);

  // Initialize call service and listen for incoming calls
  const initializeCallManager = async () => {
    try {
      // Initialize audio service first
      await audioService.initialize();

      // Initialize calling service
      await callingService.initialize();

      // Listen for incoming calls
      const unsubscribe = callingService.listenForIncomingCalls(
        currentUserId,
        handleIncomingCall
      );

      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize call manager:', error);
    }
  };

  // Setup app state listener for call persistence
  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  // Handle app state changes (background/foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      if (callState.isInCall) {
        // Navigate back to call screen if call is active
        router.push('/call');
      }
    }
    setAppState(nextAppState);
  };

  // Handle incoming call
  const handleIncomingCall = (callData: CallData) => {
    setCallState(prev => ({
      ...prev,
      callData,
      isIncomingCall: true,
    }));

    // Play incoming call sound
    audioService.playIncomingCallSound();

    // Navigate to incoming call screen
    router.push('/incoming-call');
  };

  // Start outgoing call
  const startCall = async (
    receiverId: string,
    receiverName: string,
    receiverAvatar: string,
    callType: 'voice' | 'video',
    chatId: string,
    currentUser: any
  ) => {
    try {
      const callId = await callingService.startCall(
        receiverId,
        receiverName,
        receiverAvatar,
        callType,
        currentUser.uid,
        currentUser.displayName || 'Unknown',
        currentUser.photoURL || ''
      );

      const callData: CallData = {
        id: callId,
        callerId: currentUser.uid,
        callerName: currentUser.displayName || 'Unknown',
        callerAvatar: currentUser.photoURL || '',
        receiverId,
        receiverName,
        receiverAvatar,
        type: callType,
        status: 'calling',
        startTime: new Date(),
      };

      setCallState(prev => ({
        ...prev,
        isInCall: true,
        callData,
        isVideoEnabled: callType === 'video',
        connectionQuality: 'connecting',
      }));

      // Add outgoing call message to chat
      await addCallMessageToChat(chatId, callData, 'outgoing');

      // Play ringtone for outgoing call
      audioService.playRingtone();

      // Navigate to call screen
      router.push('/call');

      return callId;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (!callState.callData) return;

    try {
      // Stop incoming call sound
      audioService.stopIncomingCallSound();

      await callingService.answerCall(callState.callData.id, callState.callData.type === 'video');

      // Play call connect sound
      audioService.playCallConnectSound();

      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isIncomingCall: false,
        connectionQuality: 'connecting',
      }));

      // Start call timer
      startCallTimer();

      // Navigate to call screen
      router.push('/call');
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  // Decline incoming call
  const declineCall = async () => {
    if (!callState.callData) return;

    try {
      // Stop incoming call sound
      audioService.stopIncomingCallSound();

      await callingService.declineCall(callState.callData.id);

      // Add declined call message to chat
      if (callState.callData.chatId) {
        await addCallMessageToChat(
          callState.callData.chatId,
          callState.callData,
          'missed'
        );
      }

      setCallState(prev => ({
        ...prev,
        isInCall: false,
        callData: null,
        isIncomingCall: false,
      }));

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  };

  // End active call
  const endCall = async () => {
    if (!callState.callData) return;

    try {
      // Stop all sounds
      audioService.stopAllSounds();

      // Play call end sound
      audioService.playCallEndSound();

      await callingService.endCall();

      // Add call end message to chat
      if (callState.callData.chatId) {
        await addCallMessageToChat(
          callState.callData.chatId,
          callState.callData,
          'ended',
          callState.callDuration
        );
      }

      stopCallTimer();

      setCallState(prev => ({
        ...prev,
        isInCall: false,
        callData: null,
        isIncomingCall: false,
        callDuration: 0,
        localStream: null,
        remoteStream: null,
      }));

      // Navigate back to chat or home
      router.back();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuteState = callingService.toggleMute();
    setCallState(prev => ({
      ...prev,
      isMuted: newMuteState,
    }));
    return newMuteState;
  };

  // Toggle video
  const toggleVideo = () => {
    const newVideoState = callingService.toggleVideo();
    setCallState(prev => ({
      ...prev,
      isVideoEnabled: newVideoState,
    }));
    return newVideoState;
  };

  // Toggle speaker
  const toggleSpeaker = async () => {
    try {
      const newSpeakerState = !callState.isSpeakerOn;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newSpeakerState,
      });

      setCallState(prev => ({
        ...prev,
        isSpeakerOn: newSpeakerState,
      }));

      return newSpeakerState;
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
      return callState.isSpeakerOn;
    }
  };

  // Toggle camera (front/back)
  const toggleCamera = async () => {
    try {
      // Implementation would depend on WebRTC library
      console.log('Camera toggled');
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  // Start call timer
  const startCallTimer = () => {
    const timer = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        callDuration: prev.callDuration + 1,
      }));
    }, 1000);
    setCallTimer(timer);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimer !== null) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  };

  // Update connection quality
  const updateConnectionQuality = (quality: CallState['connectionQuality']) => {
    setCallState(prev => ({
      ...prev,
      connectionQuality: quality,
    }));
  };

  // Set streams
  const setStreams = (localStream: any, remoteStream: any) => {
    setCallState(prev => ({
      ...prev,
      localStream,
      remoteStream,
    }));
  };

  // Add call message to chat
  const addCallMessageToChat = async (
    chatId: string,
    callData: CallData,
    status: 'outgoing' | 'incoming' | 'ended' | 'cancelled' | 'missed',
    duration?: number
  ) => {
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../services/firebaseSimple');

      const messageData = {
        type: 'call',
        callType: callData.type,
        callStatus: status,
        callDuration: duration || 0,
        senderId: callData.callerId,
        timestamp: serverTimestamp(),
        text: getCallMessageText(callData, status, duration),
      };

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
    } catch (error) {
      console.error('Failed to add call message:', error);
    }
  };

  // Get call message text
  const getCallMessageText = (
    callData: CallData,
    status: string,
    duration?: number
  ): string => {
    const callTypeText = callData.type === 'video' ? 'Video call' : 'Voice call';

    switch (status) {
      case 'outgoing':
        return `${callTypeText} started`;
      case 'ended':
        if (duration && duration > 0) {
          const mins = Math.floor(duration / 60);
          const secs = duration % 60;
          const durationText = `${mins}:${secs.toString().padStart(2, '0')}`;
          return `${callTypeText} ended (${durationText})`;
        }
        return `${callTypeText} ended`;
      case 'cancelled':
        return `${callTypeText} cancelled`;
      case 'missed':
        return `Missed ${callTypeText.toLowerCase()}`;
      default:
        return callTypeText;
    }
  };

  // Cleanup
  const cleanup = () => {
    stopCallTimer();
    audioService.stopAllSounds();
    audioService.cleanup();
  };

  return {
    callState,
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    toggleCamera,
    updateConnectionQuality,
    setStreams,
  };
};
