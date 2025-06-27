// Incoming Call Screen Route
import React from 'react';
import { View } from 'react-native';
import { IncomingCallScreen } from '../src/components/IncomingCallScreen';
import { useCallManager } from '../src/hooks/useCallManager';
import { auth } from '../src/services/firebaseSimple';

export default function IncomingCallScreenPage() {
  const currentUser = auth?.currentUser;
  const { callState, answerCall, declineCall } = useCallManager(currentUser?.uid || '');

  if (!callState.isIncomingCall || !callState.callData) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <IncomingCallScreen
      callData={callState.callData}
      onAnswer={answerCall}
      onDecline={declineCall}
    />
  );
}
