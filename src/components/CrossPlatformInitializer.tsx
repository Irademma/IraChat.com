// Cross-Platform Initializer Component
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { 
  isAuthReady, 
  waitForAuth, 
  getPlatformInfo,
  getCurrentUserSafely 
} from '../services/firebaseSimple';
import { isUserAuthenticated } from '../services/authService';

interface CrossPlatformInitializerProps {
  children: React.ReactNode;
  onInitializationComplete: (isAuthenticated: boolean) => void;
}

interface InitializationStatus {
  platform: string;
  firebase: 'loading' | 'ready' | 'error';
  auth: 'loading' | 'ready' | 'error';
  user: 'loading' | 'authenticated' | 'unauthenticated';
  error?: string;
}

export const CrossPlatformInitializer: React.FC<CrossPlatformInitializerProps> = ({
  children,
  onInitializationComplete
}) => {
  const [status, setStatus] = useState<InitializationStatus>({
    platform: Platform.OS,
    firebase: 'loading',
    auth: 'loading',
    user: 'loading'
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeCrossPlatform = async () => {
      try {
        console.log('🚀 Starting cross-platform initialization...');
        
        // Update status: Firebase loading
        setStatus(prev => ({ ...prev, firebase: 'loading' }));
        
        // Get platform info
        const platformInfo = getPlatformInfo();
        console.log('📱 Platform info:', platformInfo);
        
        // Wait for Firebase Auth to be ready (with timeout)
        console.log('⏳ Waiting for Firebase Auth to be ready...');
        setStatus(prev => ({ ...prev, auth: 'loading' }));
        
        try {
          await waitForAuth(15000); // 15 second timeout
          console.log('✅ Firebase Auth is ready');
          setStatus(prev => ({ ...prev, firebase: 'ready', auth: 'ready' }));
        } catch (authError) {
          console.warn('⚠️ Firebase Auth initialization timeout, continuing with stored auth only');
          setStatus(prev => ({ 
            ...prev, 
            firebase: 'ready', 
            auth: 'error',
            error: 'Auth timeout - using stored auth only'
          }));
        }
        
        // Check user authentication status
        console.log('🔍 Checking user authentication...');
        setStatus(prev => ({ ...prev, user: 'loading' }));
        
        const isAuthenticated = await isUserAuthenticated();
        console.log('🎯 User authentication status:', isAuthenticated);
        
        setStatus(prev => ({ 
          ...prev, 
          user: isAuthenticated ? 'authenticated' : 'unauthenticated'
        }));
        
        // Complete initialization
        console.log('🎉 Cross-platform initialization complete!');
        console.log('📊 Final status:', {
          platform: Platform.OS,
          authReady: isAuthReady(),
          userAuthenticated: isAuthenticated,
          currentUser: !!getCurrentUserSafely()
        });
        
        setIsReady(true);
        onInitializationComplete(isAuthenticated);
        
      } catch (error: any) {
        console.error('💥 Cross-platform initialization failed:', error);
        setStatus(prev => ({ 
          ...prev, 
          firebase: 'error',
          auth: 'error',
          user: 'unauthenticated',
          error: error.message
        }));
        
        // Still complete initialization even with errors
        setIsReady(true);
        onInitializationComplete(false);
      }
    };

    initializeCrossPlatform();
  }, [onInitializationComplete]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-lg font-medium text-gray-700">
          Initializing IraChat...
        </Text>
        <Text className="mt-2 text-sm text-gray-500">
          Platform: {status.platform}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Firebase: {status.firebase}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Auth: {status.auth}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          User: {status.user}
        </Text>
        {status.error && (
          <Text className="mt-2 text-xs text-orange-500 text-center px-4">
            {status.error}
          </Text>
        )}
      </View>
    );
  }

  // Render children when ready
  return <>{children}</>;
};

export default CrossPlatformInitializer;
