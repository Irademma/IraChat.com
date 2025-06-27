// Enhanced WebRTC Calling Service with Real Implementation
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import { db } from "./firebaseSimple";

// Type definitions for WebRTC configuration
interface RTCConfiguration {
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
}

export interface CallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: "voice" | "video" | "group_voice" | "group_video";
  status: "calling" | "ringing" | "connected" | "ended" | "declined" | "missed";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  chatId?: string; // Chat ID for adding call messages
  groupId?: string; // Group ID for group calls
  groupName?: string; // Group name for group calls
  participants?: string[]; // Participant IDs for group calls
  admins?: string[]; // Admin IDs for group calls
}

export interface GroupCallParticipant {
  userId: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
  videoStream?: any;
  audioStream?: any;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'connecting';
}

export interface GroupCallParticipant {
  userId: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
  videoStream?: any;
  audioStream?: any;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'connecting';
}

export interface CallOffer {
  sdp: string;
  type: "offer";
}

export interface CallAnswer {
  sdp: string;
  type: "answer";
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
  private signalUnsubscribers: (() => void)[] = [];

  // WebRTC Configuration
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  /**
   * Initialize WebRTC peer connection
   */
  private async initializePeerConnection(): Promise<void> {
    try {
      console.log("🔗 Initializing WebRTC peer connection...");

      // Initialize real WebRTC peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfig);

      // Set up event handlers (using type assertions for react-native-webrtc)
      (this.peerConnection as any).onicecandidate = (event: any) => {
        if (event.candidate && this.callId) {
          this.sendIceCandidate(event.candidate);
        }
      };

      (this.peerConnection as any).onaddstream = (event: any) => {
        console.log('📹 Remote stream received');
        this.remoteStream = event.stream;
      };

      (this.peerConnection as any).oniceconnectionstatechange = () => {
        console.log('🔗 ICE connection state:', this.peerConnection?.iceConnectionState);
      };

      console.log("✅ WebRTC peer connection initialized");
    } catch (error) {
      console.error("❌ Failed to initialize peer connection:", error);
      throw error;
    }
  }

  /**
   * Get user media (camera/microphone)
   */
  private async getUserMedia(isVideo: boolean): Promise<MediaStream> {
    try {
      console.log(`🎥 Getting user media (video: ${isVideo})...`);

      const stream = await mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      // Add stream to peer connection
      if (this.peerConnection) {
        this.peerConnection.addStream(stream);
      }

      console.log("✅ User media obtained");
      return stream;
    } catch (error) {
      console.error("❌ Failed to get user media:", error);
      throw error;
    }
  }

  /**
   * Send ICE candidate through Firebase signaling
   */
  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.callId) return;

    try {
      await addDoc(collection(db, "calls", this.callId, "iceCandidates"), {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        timestamp: new Date(),
      });
      console.log("🧊 ICE candidate sent");
    } catch (error) {
      console.error("❌ Failed to send ICE candidate:", error);
    }
  }

  /**
   * Send offer through Firebase signaling
   */
  private async sendOffer(offer: RTCSessionDescription): Promise<void> {
    if (!this.callId) return;

    try {
      await setDoc(doc(db, "calls", this.callId), {
        offer: {
          sdp: offer.sdp,
          type: offer.type,
        },
      }, { merge: true });
      console.log("📝 Offer sent");
    } catch (error) {
      console.error("❌ Failed to send offer:", error);
    }
  }

  /**
   * Send answer through Firebase signaling
   */
  private async sendAnswer(answer: RTCSessionDescription): Promise<void> {
    if (!this.callId) return;

    try {
      await setDoc(doc(db, "calls", this.callId), {
        answer: {
          sdp: answer.sdp,
          type: answer.type,
        },
      }, { merge: true });
      console.log("📝 Answer sent");
    } catch (error) {
      console.error("❌ Failed to send answer:", error);
    }
  }

  /**
   * Listen for signaling data (offers, answers, ICE candidates)
   */
  private listenForSignaling(): void {
    if (!this.callId) return;

    // Listen for offers/answers
    const unsubscribeCall = onSnapshot(doc(db, "calls", this.callId), async (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        // Handle incoming offer (for receiver)
        if (data.offer && !this.isInitiator && this.peerConnection) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await this.peerConnection.createAnswer({});
            await this.peerConnection.setLocalDescription(answer as any);
            await this.sendAnswer(answer as RTCSessionDescription);
          } catch (error) {
            console.error("❌ Failed to handle offer:", error);
          }
        }

        // Handle incoming answer (for caller)
        if (data.answer && this.isInitiator && this.peerConnection) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (error) {
            console.error("❌ Failed to handle answer:", error);
          }
        }
      }
    });

    // Listen for ICE candidates
    const unsubscribeIce = onSnapshot(
      collection(db, "calls", this.callId, "iceCandidates"),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added" && this.peerConnection) {
            const candidateData = change.doc.data();
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate({
                candidate: candidateData.candidate,
                sdpMLineIndex: candidateData.sdpMLineIndex,
                sdpMid: candidateData.sdpMid,
              }));
              console.log("🧊 ICE candidate added");
            } catch (error) {
              console.error("❌ Failed to add ICE candidate:", error);
            }
          }
        });
      }
    );

    // Store unsubscribe functions for cleanup
    this.signalUnsubscribers = [unsubscribeCall, unsubscribeIce];
  }

  /**
   * Start a call
   */
  async startCall(
    receiverId: string,
    receiverName: string,
    receiverAvatar: string,
    callType: "voice" | "video",
    callerId: string,
    callerName: string,
    callerAvatar: string,
  ): Promise<string> {
    try {
      console.log("📞 Starting call...", { receiverId, callType });

      // Initialize WebRTC
      await this.initializePeerConnection();

      // Get user media
      this.localStream = await this.getUserMedia(callType === "video");

      // Create call document in Firestore
      const callData: Omit<CallData, "id"> = {
        callerId,
        callerName,
        callerAvatar,
        receiverId,
        receiverName,
        receiverAvatar,
        type: callType,
        status: "calling",
        startTime: new Date(),
      };

      const callRef = await addDoc(collection(db, "calls"), callData);
      this.callId = callRef.id;
      this.isInitiator = true;

      // Create and send offer
      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer({});
        await this.peerConnection.setLocalDescription(offer as any);
        await this.sendOffer(offer as RTCSessionDescription);
      }

      // Listen for answer and ICE candidates
      this.listenForSignaling();

      console.log("✅ Call started with ID:", this.callId);
      return this.callId;
    } catch (error) {
      console.error("❌ Failed to start call:", error);
      throw error;
    }
  }

  /**
   * Answer a call
   */
  async answerCall(callId: string, isVideo: boolean = true): Promise<void> {
    try {
      console.log("📱 Answering call:", callId);

      this.callId = callId;
      this.isInitiator = false;

      // Initialize WebRTC
      await this.initializePeerConnection();

      // Get user media
      this.localStream = await this.getUserMedia(isVideo);

      // Listen for signaling data
      this.listenForSignaling();

      // Update call status
      await setDoc(
        doc(db, "calls", callId),
        {
          status: "connected",
        },
        { merge: true },
      );

      console.log("✅ Call answered");
    } catch (error) {
      console.error("❌ Failed to answer call:", error);
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(): Promise<void> {
    try {
      console.log("📴 Ending call...");

      if (this.callId) {
        // Update call status
        await setDoc(
          doc(db, "calls", this.callId),
          {
            status: "ended",
            endTime: new Date(),
          },
          { merge: true },
        );

        // Clean up call document after a delay
        setTimeout(async () => {
          if (this.callId) {
            await deleteDoc(doc(db, "calls", this.callId));
          }
        }, 5000);
      }

      // Clean up signaling listeners
      this.signalUnsubscribers.forEach(unsubscribe => unsubscribe());
      this.signalUnsubscribers = [];

      // Clean up WebRTC resources
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }

      if (this.remoteStream) {
        this.remoteStream = null;
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.callId = null;
      this.isInitiator = false;

      console.log("✅ Call ended");
    } catch (error) {
      console.error("❌ Failed to end call:", error);
    }
  }

  /**
   * Decline a call
   */
  async declineCall(callId: string): Promise<void> {
    try {
      console.log("❌ Declining call:", callId);

      await setDoc(
        doc(db, "calls", callId),
        {
          status: "declined",
          endTime: new Date(),
        },
        { merge: true },
      );

      console.log("✅ Call declined");
    } catch (error) {
      console.error("❌ Failed to decline call:", error);
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
          console.log(`🔇 Audio ${isMuted ? "unmuted" : "muted"}`);
          return !isMuted;
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Failed to toggle mute:", error);
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
          console.log(`📹 Video ${isVideoOff ? "enabled" : "disabled"}`);
          return !isVideoOff;
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Failed to toggle video:", error);
      return false;
    }
  }

  /**
   * Listen for incoming calls
   */
  listenForIncomingCalls(
    userId: string,
    onIncomingCall: (callData: CallData) => void,
  ): () => void {
    console.log("👂 Listening for incoming calls for user:", userId);

    const unsubscribe = onSnapshot(
      collection(db, "calls"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const callData = {
              id: change.doc.id,
              ...change.doc.data(),
            } as CallData;

            if (
              callData.receiverId === userId &&
              callData.status === "calling"
            ) {
              console.log("📞 Incoming call detected:", callData);
              onIncomingCall(callData);
            }
          }
        });
      },
      (error) => {
        console.error("❌ Error listening for calls:", error);
      },
    );

    return unsubscribe;
  }

  /**
   * Initialize the calling service
   */
  async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing calling service...");

      // Request permissions for camera and microphone
      const { Camera } = await import('expo-camera');
      const { Audio } = await import('expo-av');

      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        console.warn('⚠️ Camera permission not granted');
      }

      // Request audio permission
      const audioPermission = await Audio.requestPermissionsAsync();
      if (audioPermission.status !== 'granted') {
        console.warn('⚠️ Audio permission not granted');
      }

      console.log("✅ Calling service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize calling service:", error);
    }
  }

  /**
   * Get call history for a user
   */
  async getCallHistory(userId: string): Promise<CallData[]> {
    try {
      console.log("📞 Getting call history for user:", userId);

      const { getDocs, query, where, orderBy, or } = await import(
        "firebase/firestore"
      );

      // Query calls where user is either caller or receiver
      const callsQuery = query(
        collection(db, "calls"),
        or(where("callerId", "==", userId), where("receiverId", "==", userId)),
        orderBy("startTime", "desc"),
      );

      const snapshot = await getDocs(callsQuery);
      const callHistory = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate(),
      })) as CallData[];

      console.log(`✅ Found ${callHistory.length} calls in history`);
      return callHistory;
    } catch (error) {
      console.error("❌ Failed to get call history:", error);
      return [];
    }
  }

  /**
   * Listen to call status changes
   */
  listenToCall(callId: string, callback: (call: CallData) => void): () => void {
    console.log("👂 Listening to call status:", callId);

    return onSnapshot(
      doc(db, "calls", callId),
      (doc) => {
        if (doc.exists()) {
          const callData = {
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(),
            endTime: doc.data().endTime?.toDate(),
          } as CallData;
          callback(callData);
        }
      },
      (error) => {
        console.error("❌ Error listening to call:", error);
      },
    );
  }

  /**
   * Get current call ID
   */
  getCurrentCallId(): string | null {
    return this.callId;
  }

  /**
   * Get local and remote streams
   */
  getStreams(): { localStream: MediaStream | null; remoteStream: MediaStream | null } {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
    };
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if user is in a call
   */
  isInCall(): boolean {
    return this.callId !== null;
  }
}

// Export singleton instance
export const callingService = new CallingService();
export default callingService;
