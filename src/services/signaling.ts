// Firebase WebRTC Signaling Service
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { RTCSessionDescription, RTCIceCandidate } from "react-native-webrtc";
import { db } from "./firebaseSimple";

export interface SignalingData {
  offer?: {
    sdp: string;
    type: string;
  };
  answer?: {
    sdp: string;
    type: string;
  };
  iceCandidate?: {
    candidate: string;
    sdpMLineIndex: number | null;
    sdpMid: string | null;
  };
}

export interface SignalingCallbacks {
  onOffer?: (offer: RTCSessionDescription) => void;
  onAnswer?: (answer: RTCSessionDescription) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onError?: (error: Error) => void;
}

class SignalingService {
  private unsubscribers: (() => void)[] = [];

  /**
   * Send an offer through Firebase
   */
  async sendOffer(callId: string, offer: RTCSessionDescription): Promise<void> {
    try {
      await setDoc(
        doc(db, "calls", callId),
        {
          offer: {
            sdp: offer.sdp,
            type: offer.type,
          },
          timestamp: new Date(),
        },
        { merge: true }
      );
      console.log("📝 Offer sent via Firebase signaling");
    } catch (error) {
      console.error("❌ Failed to send offer:", error);
      throw error;
    }
  }

  /**
   * Send an answer through Firebase
   */
  async sendAnswer(callId: string, answer: RTCSessionDescription): Promise<void> {
    try {
      await setDoc(
        doc(db, "calls", callId),
        {
          answer: {
            sdp: answer.sdp,
            type: answer.type,
          },
          timestamp: new Date(),
        },
        { merge: true }
      );
      console.log("📝 Answer sent via Firebase signaling");
    } catch (error) {
      console.error("❌ Failed to send answer:", error);
      throw error;
    }
  }

  /**
   * Send an ICE candidate through Firebase
   */
  async sendIceCandidate(callId: string, candidate: RTCIceCandidate): Promise<void> {
    try {
      await addDoc(collection(db, "calls", callId, "iceCandidates"), {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        timestamp: new Date(),
      });
      console.log("🧊 ICE candidate sent via Firebase signaling");
    } catch (error) {
      console.error("❌ Failed to send ICE candidate:", error);
      throw error;
    }
  }

  /**
   * Listen for signaling data (offers, answers)
   */
  listenForSignaling(callId: string, callbacks: SignalingCallbacks): () => void {
    console.log("👂 Starting Firebase signaling listener for call:", callId);

    // Listen for offers and answers
    const unsubscribeCall = onSnapshot(
      doc(db, "calls", callId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();

          // Handle incoming offer
          if (data.offer && callbacks.onOffer) {
            try {
              const offer = new RTCSessionDescription({
                sdp: data.offer.sdp,
                type: data.offer.type,
              });
              callbacks.onOffer(offer);
            } catch (error) {
              console.error("❌ Failed to parse offer:", error);
              callbacks.onError?.(error as Error);
            }
          }

          // Handle incoming answer
          if (data.answer && callbacks.onAnswer) {
            try {
              const answer = new RTCSessionDescription({
                sdp: data.answer.sdp,
                type: data.answer.type,
              });
              callbacks.onAnswer(answer);
            } catch (error) {
              console.error("❌ Failed to parse answer:", error);
              callbacks.onError?.(error as Error);
            }
          }
        }
      },
      (error) => {
        console.error("❌ Error listening for signaling data:", error);
        callbacks.onError?.(error);
      }
    );

    // Listen for ICE candidates
    const unsubscribeIce = onSnapshot(
      query(
        collection(db, "calls", callId, "iceCandidates"),
        orderBy("timestamp", "asc")
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && callbacks.onIceCandidate) {
            try {
              const candidateData = change.doc.data();
              const candidate = new RTCIceCandidate({
                candidate: candidateData.candidate,
                sdpMLineIndex: candidateData.sdpMLineIndex,
                sdpMid: candidateData.sdpMid,
              });
              callbacks.onIceCandidate(candidate);
            } catch (error) {
              console.error("❌ Failed to parse ICE candidate:", error);
              callbacks.onError?.(error as Error);
            }
          }
        });
      },
      (error) => {
        console.error("❌ Error listening for ICE candidates:", error);
        callbacks.onError?.(error);
      }
    );

    // Store unsubscribers
    this.unsubscribers.push(unsubscribeCall, unsubscribeIce);

    // Return cleanup function
    return () => {
      unsubscribeCall();
      unsubscribeIce();
      
      // Remove from stored unsubscribers
      this.unsubscribers = this.unsubscribers.filter(
        (unsub) => unsub !== unsubscribeCall && unsub !== unsubscribeIce
      );
    };
  }

  /**
   * Clean up all signaling listeners
   */
  cleanup(): void {
    console.log("🧹 Cleaning up Firebase signaling listeners");
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }

  /**
   * Delete signaling data for a call
   */
  async deleteSignalingData(callId: string): Promise<void> {
    try {
      // Delete the main call document (this will also delete subcollections)
      await deleteDoc(doc(db, "calls", callId));
      console.log("🗑️ Signaling data deleted for call:", callId);
    } catch (error) {
      console.error("❌ Failed to delete signaling data:", error);
      throw error;
    }
  }

  /**
   * Check if a call document exists
   */
  async callExists(callId: string): Promise<boolean> {
    try {
      const callDoc = await doc(db, "calls", callId);
      return callDoc !== null;
    } catch (error) {
      console.error("❌ Failed to check call existence:", error);
      return false;
    }
  }
}

// Export singleton instance
export const signalingService = new SignalingService();
export default signalingService;
