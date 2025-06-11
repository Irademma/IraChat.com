// WebRTC Type Definitions for React Native
// These types are needed when react-native-webrtc is not available

// Define EventListener type for compatibility
type EventListener = (event: Event) => void;

interface Event {
  type: string;
  target?: any;
}

export interface RTCConfiguration {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: 'all' | 'relay';
  bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface RTCSessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

export interface RTCIceCandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
}

export interface MediaStream {
  id: string;
  active: boolean;
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
  clone(): MediaStream;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: 'live' | 'ended';
  stop(): void;
  clone(): MediaStreamTrack;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface RTCPeerConnection {
  localDescription: RTCSessionDescription | null;
  remoteDescription: RTCSessionDescription | null;
  signalingState: 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';
  iceConnectionState: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
  iceGatheringState: 'new' | 'gathering' | 'complete';
  
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
  ontrack: ((event: RTCTrackEvent) => void) | null;
  onconnectionstatechange: (() => void) | null;
  oniceconnectionstatechange: (() => void) | null;
  
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescription>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescription>;
  setLocalDescription(description: RTCSessionDescription): Promise<void>;
  setRemoteDescription(description: RTCSessionDescription): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidate): Promise<void>;
  addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender;
  removeTrack(sender: RTCRtpSender): void;
  close(): void;
}

export interface RTCOfferOptions {
  offerToReceiveAudio?: boolean;
  offerToReceiveVideo?: boolean;
  voiceActivityDetection?: boolean;
  iceRestart?: boolean;
}

export interface RTCAnswerOptions {
  voiceActivityDetection?: boolean;
}

export interface RTCPeerConnectionIceEvent {
  candidate: RTCIceCandidate | null;
}

export interface RTCTrackEvent {
  track: MediaStreamTrack;
  streams: MediaStream[];
}

export interface RTCRtpSender {
  track: MediaStreamTrack | null;
  replaceTrack(track: MediaStreamTrack | null): Promise<void>;
}

// Mock implementations for development
class MockRTCPeerConnectionImpl implements RTCPeerConnection {
  localDescription: RTCSessionDescription | null = null;
  remoteDescription: RTCSessionDescription | null = null;
  signalingState: 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed' = 'stable';
  iceConnectionState: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed' = 'new';
  iceGatheringState: 'new' | 'gathering' | 'complete' = 'new';
  
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null = null;
  ontrack: ((event: RTCTrackEvent) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;

  async createOffer(): Promise<RTCSessionDescription> {
    return { type: 'offer', sdp: 'mock-offer-sdp' };
  }

  async createAnswer(): Promise<RTCSessionDescription> {
    return { type: 'answer', sdp: 'mock-answer-sdp' };
  }

  async setLocalDescription(description: RTCSessionDescription): Promise<void> {
    this.localDescription = description;
  }

  async setRemoteDescription(description: RTCSessionDescription): Promise<void> {
    this.remoteDescription = description;
  }

  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    console.log('Mock: Adding ICE candidate', candidate);
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender {
    return { track, replaceTrack: async () => {} };
  }

  removeTrack(sender: RTCRtpSender): void {
    console.log('Mock: Removing track', sender);
  }

  close(): void {
    this.signalingState = 'closed';
    this.iceConnectionState = 'closed';
  }
}

class MockMediaStreamImpl implements MediaStream {
  id: string = 'mock-stream-id';
  active: boolean = true;

  getTracks(): MediaStreamTrack[] {
    return [];
  }

  getAudioTracks(): MediaStreamTrack[] {
    return [];
  }

  getVideoTracks(): MediaStreamTrack[] {
    return [];
  }

  addTrack(track: MediaStreamTrack): void {
    console.log('Mock: Adding track', track);
  }

  removeTrack(track: MediaStreamTrack): void {
    console.log('Mock: Removing track', track);
  }

  clone(): MediaStream {
    return new MockMediaStreamImpl();
  }

  addEventListener(type: string, listener: EventListener): void {
    console.log('Mock: Adding event listener', type);
  }

  removeEventListener(type: string, listener: EventListener): void {
    console.log('Mock: Removing event listener', type);
  }
}

// Global declarations for when react-native-webrtc is not available
declare global {
  var RTCPeerConnection: typeof MockRTCPeerConnection;
  var MediaStream: typeof MockMediaStream;
}

// Export mock implementations with proper names
export const MockRTCPeerConnection = MockRTCPeerConnectionImpl;
export const MockMediaStream = MockMediaStreamImpl;

