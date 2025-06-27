// Global Call Provider - Manages calls across the entire app
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CallOverlay } from '../components/CallOverlay';
import { useCallManager } from '../hooks/useCallManager';
import { auth } from '../services/firebaseSimple';

interface CallContextType {
  isInCall: boolean;
  showCallOverlay: boolean;
  setShowCallOverlay: (show: boolean) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const currentUser = auth?.currentUser;
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  const {
    callState,
    endCall,
    toggleMute,
  } = useCallManager(currentUser?.uid || '');

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (callState.isInCall) {
          setShowCallOverlay(true);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        if (callState.isInCall) {
          setShowCallOverlay(true);
        }
      }
      setAppState(nextAppState);
    });

    return () => subscription?.remove();
  }, [appState, callState.isInCall]);

  // Show/hide overlay based on call state
  useEffect(() => {
    if (callState.isInCall && !callState.isIncomingCall) {
      // Show overlay when in call but not on call screen
      setShowCallOverlay(true);
    } else {
      setShowCallOverlay(false);
    }
  }, [callState.isInCall, callState.isIncomingCall]);

  const contextValue: CallContextType = {
    isInCall: callState.isInCall,
    showCallOverlay,
    setShowCallOverlay,
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
      
      {/* Global Call Overlay */}
      {callState.isInCall && callState.callData && showCallOverlay && (
        <CallOverlay
          callData={callState.callData}
          callDuration={callState.callDuration}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          isMuted={callState.isMuted}
          isVisible={showCallOverlay}
        />
      )}
    </CallContext.Provider>
  );
};
