import React, { createContext, useContext, ReactNode } from 'react';
import { useIncomingCalls, IncomingCall } from '../hooks/useIncomingCalls';
import { IncomingCallModal } from './CallUI/IncomingCallModal';

interface IncomingCallContextType {
  incomingCall: IncomingCall | null;
  isListening: boolean;
  answerCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  startListening: () => (() => void) | undefined;
  stopListening: () => void;
}

const IncomingCallContext = createContext<IncomingCallContextType | undefined>(undefined);

interface IncomingCallProviderProps {
  children: ReactNode;
}

export const IncomingCallProvider: React.FC<IncomingCallProviderProps> = ({ children }) => {
  const incomingCallHook = useIncomingCalls();

  return (
    <IncomingCallContext.Provider value={incomingCallHook}>
      {children}
      
      {/* Global Incoming Call Modal */}
      <IncomingCallModal
        visible={!!incomingCallHook.incomingCall}
        callerName={incomingCallHook.incomingCall?.callerName || ''}
        callerAvatar={incomingCallHook.incomingCall?.callerAvatar || ''}
        callType={incomingCallHook.incomingCall?.callType || 'voice'}
        onAnswer={incomingCallHook.answerCall}
        onDecline={incomingCallHook.declineCall}
      />
    </IncomingCallContext.Provider>
  );
};

export const useIncomingCallContext = (): IncomingCallContextType => {
  const context = useContext(IncomingCallContext);
  if (context === undefined) {
    throw new Error('useIncomingCallContext must be used within an IncomingCallProvider');
  }
  return context;
};
