import { useCallback, useEffect, useRef, useState } from 'react';
import {
    mediaDevices,
    MediaStream,
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription,
    RTCView,
} from 'react-native-webrtc';

export interface WebRTCConfig {
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
}

export interface CallState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isIncomingCall: boolean;
  callType: 'voice' | 'video';
  error: string | null;
}

export interface UseWebRTCReturn {
  // Streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // State
  callState: CallState;
  
  // Actions
  startCall: (isVideo: boolean) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  
  // WebRTC specific
  createOffer: () => Promise<RTCSessionDescription>;
  createAnswer: () => Promise<RTCSessionDescription>;
  setLocalDescription: (description: RTCSessionDescription) => Promise<void>;
  setRemoteDescription: (description: RTCSessionDescription) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidate) => Promise<void>;
  
  // Event handlers
  onIceCandidate: (callback: (candidate: RTCIceCandidate) => void) => void;
  onRemoteStream: (callback: (stream: MediaStream) => void) => void;
  
  // Components
  RTCView: typeof RTCView;
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (config: WebRTCConfig = defaultConfig): UseWebRTCReturn => {
  // Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoEnabled: false,
    isIncomingCall: false,
    callType: 'voice',
    error: null,
  });
  
  // Event callback refs
  const iceCandidateCallback = useRef<((candidate: RTCIceCandidate) => void) | null>(null);
  const remoteStreamCallback = useRef<((stream: MediaStream) => void) | null>(null);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    try {
      if (peerConnection.current) {
        peerConnection.current.close();
      }

      const pc = new RTCPeerConnection(config);
      
      // Handle ICE candidates (using type assertion for react-native-webrtc)
      (pc as any).onicecandidate = (event: any) => {
        if (event.candidate && iceCandidateCallback.current) {
          iceCandidateCallback.current(event.candidate);
        }
      };

      // Handle remote stream (using type assertion for react-native-webrtc)
      (pc as any).onaddstream = (event: any) => {
        console.log('📹 Remote stream received');
        remoteStreamRef.current = event.stream;
        setRemoteStream(event.stream);

        if (remoteStreamCallback.current) {
          remoteStreamCallback.current(event.stream);
        }
      };

      // Handle connection state changes (using type assertion for react-native-webrtc)
      (pc as any).oniceconnectionstatechange = () => {
        console.log('🔗 ICE connection state:', (pc as any).iceConnectionState);

        const state = (pc as any).iceConnectionState;
        setCallState(prev => ({
          ...prev,
          isConnected: state === 'connected' || state === 'completed',
          isConnecting: state === 'connecting' || state === 'checking',
          error: state === 'failed' ? 'Connection failed' : null,
        }));
      };
      
      peerConnection.current = pc;
      console.log('✅ Peer connection initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize peer connection:', error);
      setCallState(prev => ({
        ...prev,
        error: 'Failed to initialize connection',
      }));
    }
  }, [config]);

  // Get user media
  const getUserMedia = useCallback(async (isVideo: boolean): Promise<MediaStream> => {
    try {
      console.log(`🎥 Getting user media (video: ${isVideo})...`);
      
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      // Add stream to peer connection
      if (peerConnection.current) {
        peerConnection.current.addStream(stream);
      }
      
      console.log('✅ User media obtained');
      return stream;
      
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      setCallState(prev => ({
        ...prev,
        error: 'Failed to access camera/microphone',
      }));
      throw error;
    }
  }, []);

  // Start a call
  const startCall = useCallback(async (isVideo: boolean) => {
    try {
      console.log('📞 Starting call...');
      
      setCallState(prev => ({
        ...prev,
        isConnecting: true,
        callType: isVideo ? 'video' : 'voice',
        isVideoEnabled: isVideo,
        error: null,
      }));
      
      initializePeerConnection();
      await getUserMedia(isVideo);
      
      console.log('✅ Call started');
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      setCallState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to start call',
      }));
    }
  }, [initializePeerConnection, getUserMedia]);

  // Answer a call
  const answerCall = useCallback(async () => {
    try {
      console.log('📱 Answering call...');
      
      setCallState(prev => ({
        ...prev,
        isConnecting: true,
        isIncomingCall: false,
        error: null,
      }));
      
      initializePeerConnection();
      await getUserMedia(callState.callType === 'video');
      
      console.log('✅ Call answered');
      
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      setCallState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to answer call',
      }));
    }
  }, [initializePeerConnection, getUserMedia, callState.callType]);

  // End call
  const endCall = useCallback(() => {
    try {
      console.log('📴 Ending call...');
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      // Reset remote stream
      remoteStreamRef.current = null;
      setRemoteStream(null);
      
      // Reset state
      setCallState({
        isConnected: false,
        isConnecting: false,
        isMuted: false,
        isVideoEnabled: false,
        isIncomingCall: false,
        callType: 'voice',
        error: null,
      });
      
      console.log('✅ Call ended');
      
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    try {
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          const newMutedState = !callState.isMuted;
          audioTracks[0].enabled = !newMutedState;
          
          setCallState(prev => ({
            ...prev,
            isMuted: newMutedState,
          }));
          
          console.log(`🔇 Audio ${newMutedState ? 'muted' : 'unmuted'}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to toggle mute:', error);
    }
  }, [callState.isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    try {
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
          const newVideoState = !callState.isVideoEnabled;
          videoTracks[0].enabled = newVideoState;
          
          setCallState(prev => ({
            ...prev,
            isVideoEnabled: newVideoState,
          }));
          
          console.log(`📹 Video ${newVideoState ? 'enabled' : 'disabled'}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to toggle video:', error);
    }
  }, [callState.isVideoEnabled]);

  // WebRTC specific functions
  const createOffer = useCallback(async (): Promise<RTCSessionDescription> => {
    if (!peerConnection.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const offer = await peerConnection.current.createOffer({});
      console.log('📝 Created offer');
      return offer as RTCSessionDescription;
    } catch (error) {
      console.error('❌ Failed to create offer:', error);
      throw error;
    }
  }, []);

  const createAnswer = useCallback(async (): Promise<RTCSessionDescription> => {
    if (!peerConnection.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const answer = await peerConnection.current.createAnswer({});
      console.log('📝 Created answer');
      return answer as RTCSessionDescription;
    } catch (error) {
      console.error('❌ Failed to create answer:', error);
      throw error;
    }
  }, []);

  const setLocalDescription = useCallback(async (description: RTCSessionDescription): Promise<void> => {
    if (!peerConnection.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await peerConnection.current.setLocalDescription(description);
      console.log('📝 Set local description');
    } catch (error) {
      console.error('❌ Failed to set local description:', error);
      throw error;
    }
  }, []);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescription): Promise<void> => {
    if (!peerConnection.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await peerConnection.current.setRemoteDescription(description);
      console.log('📝 Set remote description');
    } catch (error) {
      console.error('❌ Failed to set remote description:', error);
      throw error;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidate): Promise<void> => {
    if (!peerConnection.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await peerConnection.current.addIceCandidate(candidate);
      console.log('🧊 Added ICE candidate');
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
      throw error;
    }
  }, []);

  // Event handlers
  const onIceCandidate = useCallback((callback: (candidate: RTCIceCandidate) => void) => {
    iceCandidateCallback.current = callback;
  }, []);

  const onRemoteStream = useCallback((callback: (stream: MediaStream) => void) => {
    remoteStreamCallback.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // Streams
    localStream,
    remoteStream,

    // State
    callState,

    // Actions
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,

    // WebRTC specific
    createOffer,
    createAnswer,
    setLocalDescription,
    setRemoteDescription,
    addIceCandidate,

    // Event handlers
    onIceCandidate,
    onRemoteStream,

    // Components
    RTCView,
  };
};
