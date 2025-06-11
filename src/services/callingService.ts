// Real WebRTC Calling Service
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type {
    MediaStream,
    RTCConfiguration,
    RTCPeerConnection
} from '../types/webrtc';
import { db } from './firebaseSimple';

export interface CallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended' | 'declined' | 'missed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface CallOffer {
  sdp: string;
  type: 'offer';
}

export interface CallAnswer {
  sdp: string;
  type: 'answer';
}

export interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

class CallingService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private isInitiator: boolean = false;

  // WebRTC Configuration
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  /**
   * Initialize WebRTC peer connection
   */
  private async initializePeerConnection(): Promise<void> {
    try {
      console.log('🔗 Initializing WebRTC peer connection...');

      // Try to use real WebRTC if available, otherwise use mock
      try {
        // Import WebRTC dynamically
        const { RTCPeerConnection: RealRTCPeerConnection } = await import('react-native-webrtc');
        this.peerConnection = new RealRTCPeerConnection(this.rtcConfig) as any;
      } catch (importError) {
        // Fallback to mock implementation
        const { MockRTCPeerConnection } = await import('../types/webrtc');
        this.peerConnection = new MockRTCPeerConnection() as RTCPeerConnection;
        console.log('📱 Using mock WebRTC implementation');
      }

      console.log('✅ WebRTC peer connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize peer connection:', error);
      throw error;
    }
  }

  /**
   * Get user media (camera/microphone)
   */
  private async getUserMedia(isVideo: boolean): Promise<MediaStream> {
    try {
      console.log(`🎥 Getting user media (video: ${isVideo})...`);

      try {
        // Try to use real media devices
        const { mediaDevices } = await import('react-native-webrtc');
        return await mediaDevices.getUserMedia({
          video: isVideo,
          audio: true,
        }) as any;
      } catch (importError) {
        // Fallback to mock implementation
        const { MockMediaStream } = await import('../types/webrtc');
        const mockStream = new MockMediaStream();
        console.log('📱 Using mock media stream');
        return mockStream as MediaStream;
      }
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      throw error;
    }
  }

  /**
   * Start a call
   */
  async startCall(
    receiverId: string,
    receiverName: string,
    receiverAvatar: string,
    callType: 'voice' | 'video',
    callerId: string,
    callerName: string,
    callerAvatar: string
  ): Promise<string> {
    try {
      console.log('📞 Starting call...', { receiverId, callType });

      // Initialize WebRTC
      await this.initializePeerConnection();

      // Get user media
      this.localStream = await this.getUserMedia(callType === 'video');

      // Create call document in Firestore
      const callData: Omit<CallData, 'id'> = {
        callerId,
        callerName,
        callerAvatar,
        receiverId,
        receiverName,
        receiverAvatar,
        type: callType,
        status: 'calling',
        startTime: new Date(),
      };

      const callRef = await addDoc(collection(db, 'calls'), callData);
      this.callId = callRef.id;
      this.isInitiator = true;

      console.log('✅ Call started with ID:', this.callId);
      return this.callId;
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }

  /**
   * Answer a call
   */
  async answerCall(callId: string): Promise<void> {
    try {
      console.log('📱 Answering call:', callId);

      this.callId = callId;
      this.isInitiator = false;

      // Initialize WebRTC
      await this.initializePeerConnection();

      // Get user media
      this.localStream = await this.getUserMedia(true); // Assume video for now

      // Update call status
      await setDoc(doc(db, 'calls', callId), {
        status: 'connected',
      }, { merge: true });

      console.log('✅ Call answered');
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(): Promise<void> {
    try {
      console.log('📴 Ending call...');

      if (this.callId) {
        // Update call status
        await setDoc(doc(db, 'calls', this.callId), {
          status: 'ended',
          endTime: new Date(),
        }, { merge: true });

        // Clean up call document after a delay
        setTimeout(async () => {
          if (this.callId) {
            await deleteDoc(doc(db, 'calls', this.callId));
          }
        }, 5000);
      }

      // Clean up WebRTC resources
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.callId = null;
      this.isInitiator = false;

      console.log('✅ Call ended');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
    }
  }

  /**
   * Decline a call
   */
  async declineCall(callId: string): Promise<void> {
    try {
      console.log('❌ Declining call:', callId);

      await setDoc(doc(db, 'calls', callId), {
        status: 'declined',
        endTime: new Date(),
      }, { merge: true });

      console.log('✅ Call declined');
    } catch (error) {
      console.error('❌ Failed to decline call:', error);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    try {
      if (this.localStream) {
        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          const isMuted = !audioTracks[0].enabled;
          audioTracks[0].enabled = isMuted;
          console.log(`🔇 Audio ${isMuted ? 'unmuted' : 'muted'}`);
          return !isMuted;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to toggle mute:', error);
      return false;
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(): boolean {
    try {
      if (this.localStream) {
        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length > 0) {
          const isVideoOff = !videoTracks[0].enabled;
          videoTracks[0].enabled = isVideoOff;
          console.log(`📹 Video ${isVideoOff ? 'enabled' : 'disabled'}`);
          return !isVideoOff;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to toggle video:', error);
      return false;
    }
  }

  /**
   * Listen for incoming calls
   */
  listenForIncomingCalls(userId: string, onIncomingCall: (callData: CallData) => void): () => void {
    console.log('👂 Listening for incoming calls for user:', userId);

    const unsubscribe = onSnapshot(
      collection(db, 'calls'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const callData = { id: change.doc.id, ...change.doc.data() } as CallData;
            
            if (callData.receiverId === userId && callData.status === 'calling') {
              console.log('📞 Incoming call detected:', callData);
              onIncomingCall(callData);
            }
          }
        });
      },
      (error) => {
        console.error('❌ Error listening for calls:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Get call history for a user
   */
  async getCallHistory(userId: string): Promise<CallData[]> {
    try {
      // In a real implementation, this would query Firestore
      // For now, return mock data
      const mockHistory: CallData[] = [
        {
          id: 'call_1',
          callerId: 'user_1',
          callerName: 'John Doe',
          callerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          receiverId: userId,
          receiverName: 'Current User',
          receiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          type: 'video',
          status: 'ended',
          startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          endTime: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
          duration: 5 * 60, // 5 minutes
        },
      ];

      return mockHistory;
    } catch (error) {
      console.error('❌ Failed to get call history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const callingService = new CallingService();
export default callingService;
