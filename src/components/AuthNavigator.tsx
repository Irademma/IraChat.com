import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthPersistence } from '../hooks/useAuthPersistence';
import { isFirstLaunch, markAppLaunched } from '../services/authStorageSimple';

interface AuthNavigatorProps {
  children: React.ReactNode;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);
  const { isInitializing, isAuthenticated: userIsAuthenticated } = useAuthPersistence();

  // Reset navigation state when authentication status changes
  useEffect(() => {
    console.log('🔄 AuthNavigator: Auth status changed, resetting navigation state');
    setHasNavigated(false);
  }, [userIsAuthenticated]);

  useEffect(() => {
    const handleNavigation = async () => {
      // Only navigate after auth check is complete and hasn't navigated yet
      if (isInitializing || hasNavigated) {
        console.log(`🔄 AuthNavigator: Waiting... isInitializing=${isInitializing}, hasNavigated=${hasNavigated}, userIsAuthenticated=${userIsAuthenticated}`);
        return;
      }

      try {
        console.log(`🎯 AuthNavigator: Making navigation decision - userIsAuthenticated=${userIsAuthenticated}`);

        const isFirstTime = await isFirstLaunch();
        console.log(`📱 First launch check result: ${isFirstTime ? 'YES - New user' : 'NO - Returning user'}`);

        // Check if we're already on the auth screen
        const isAuthScreen = segments[0] === '(auth)';

        if (userIsAuthenticated) {
          // User has valid authentication - go directly to chat tab
          console.log('✅ User is authenticated, navigating to homepage...');
          if (!isAuthScreen) {
            router.replace('/(tabs)');
          }
          setHasNavigated(true);
        } else if (isFirstTime) {
          // Brand new user - show welcome screen and mark app as launched
          console.log('🎯 New user detected, navigating to welcome screen...');
          await markAppLaunched();
          router.replace('/welcome');
          setHasNavigated(true);
        } else {
          // Returning user who logged out - show auth screen
          console.log('🔄 Returning user (logged out), navigating to auth screen...');
          router.replace('/(auth)');
          setHasNavigated(true);
        }
      } catch (error) {
        console.error('❌ Error in navigation logic:', error);
        // Fallback to welcome screen
        router.replace('/welcome');
        setHasNavigated(true);
      }
    };

    // Add a small delay to ensure Redux state has been updated after account creation
    const timeoutId = setTimeout(() => {
      handleNavigation();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isInitializing, userIsAuthenticated, hasNavigated, router, segments]);

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#667eea'
      }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  // Render children when ready
  return <>{children}</>;
};

export default AuthNavigator;
