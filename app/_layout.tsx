import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { persistor, store } from '../src/redux/store';
import { waitForAuth } from '../src/services/firebaseSimple';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

console.log('🚀 IraChat App starting on platform:', Platform.OS);

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for Firebase Auth to initialize
        console.log('Waiting for Firebase Auth initialization...');
        const auth = await waitForAuth();
        console.log('Firebase Auth initialized:', auth ? 'success' : 'failed');
        setIsAuthenticated(!!auth);
      } catch (error) {
        console.warn('Error during initialization:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView
        style={{ flex: 1 }}
        accessible={true}
        accessibilityLabel="IraChat application root"
      >
        <Provider store={store}>
          <PersistGate
            loading={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Loading IraChat...</Text>
              </View>
            }
            persistor={persistor}
          >
            <ThemeProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
