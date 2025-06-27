import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { CallData, callingService } from '../services/callingService';
import { useAuth } from './useAuth';

export interface IncomingCall {
  id: string;
  callerName: string;
  callerAvatar: string;
  callType: 'voice' | 'video' | 'group_voice' | 'group_video';
  callData: CallData;
}

export const useIncomingCalls = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Start listening for incoming calls
  const startListening = useCallback(() => {
    if (!user?.uid || isListening) return;

    console.log('👂 Starting to listen for incoming calls for user:', user.uid);
    setIsListening(true);

    const unsubscribe = callingService.listenForIncomingCalls(
      user.uid,
      (callData: CallData) => {
        console.log('📞 Incoming call received:', callData);
        
        setIncomingCall({
          id: callData.id,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
          callType: callData.type,
          callData,
        });
      }
    );

    return unsubscribe;
  }, [user?.uid, isListening]);

  // Stop listening for incoming calls
  const stopListening = useCallback(() => {
    console.log('🔇 Stopping incoming call listener');
    setIsListening(false);
    setIncomingCall(null);
  }, []);

  // Answer the incoming call
  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      console.log('📱 Answering incoming call:', incomingCall.id);
      
      // Answer the call through the calling service
      await callingService.answerCall(incomingCall.id);
      
      // Navigate to the call screen
      router.push({
        pathname: '/call',
        params: {
          type: incomingCall.callType,
          callId: incomingCall.id,
          isIncoming: 'true',
          contacts: encodeURIComponent(JSON.stringify([{
            id: incomingCall.callData.callerId,
            name: incomingCall.callerName,
            avatar: incomingCall.callerAvatar,
            phoneNumber: '', // We don't have this from call data
          }])),
        },
      });
      
      // Clear the incoming call
      setIncomingCall(null);
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
    }
  }, [incomingCall, router]);

  // Decline the incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      console.log('❌ Declining incoming call:', incomingCall.id);
      
      // Decline the call through the calling service
      await callingService.declineCall(incomingCall.id);
      
      // Clear the incoming call
      setIncomingCall(null);
    } catch (error) {
      console.error('❌ Failed to decline call:', error);
    }
  }, [incomingCall]);

  // Auto-start listening when user is available
  useEffect(() => {
    if (user?.uid && !isListening) {
      const unsubscribe = startListening();
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        stopListening();
      };
    }
  }, [user?.uid, startListening, stopListening, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    incomingCall,
    isListening,
    answerCall,
    declineCall,
    startListening,
    stopListening,
  };
};
