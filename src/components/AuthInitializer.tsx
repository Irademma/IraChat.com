import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { auth } from '../services/firebaseSimple';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing Auth...');
        
        // Check if auth is available
        if (!auth) {
          console.warn('⚠️ Auth instance not available, continuing without auth');
          setIsAuthReady(true);
          return;
        }

        // Wait a moment for auth to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to sign in anonymously for development/testing
        try {
          if (!auth.currentUser) {
            console.log('🔐 Signing in anonymously for development...');
            const { signInAnonymously } = await import('firebase/auth');
            await signInAnonymously(auth);
            console.log('✅ Anonymous sign-in successful');
          } else {
            console.log('✅ User already authenticated');
          }
        } catch (authError) {
          console.warn('⚠️ Anonymous sign-in failed, continuing without auth:', authError);
        }

        console.log('✅ Auth initialized successfully');
        setIsAuthReady(true);
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        setError('Auth initialization failed');
        setIsAuthReady(true); // Continue anyway
      }
    };

    initializeAuth();
  }, []);

  if (!isAuthReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#667eea'
      }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ 
          color: 'white', 
          marginTop: 16, 
          fontSize: 16,
          fontWeight: '500'
        }}>
          Initializing IraChat...
        </Text>
        {error && (
          <Text style={{ 
            color: 'rgba(255,255,255,0.8)', 
            marginTop: 8, 
            fontSize: 14 
          }}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
};
