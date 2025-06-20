import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ErrorBoundary from "../src/components/ErrorBoundary";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { persistor, store } from "../src/redux/store";
import { waitForAuth } from "../src/services/firebaseSimple";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

console.log("🚀 IraChat App starting on platform:", Platform.OS);

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for Firebase Auth to initialize
        console.log("Waiting for Firebase Auth initialization...");
        const auth = await waitForAuth();
        console.log("Firebase Auth initialized:", auth ? "success" : "failed");
        setIsAuthenticated(!!auth);
      } catch (error) {
        console.warn("Error during initialization:", error);
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
      <SafeAreaProvider>
        <StatusBar style="light" translucent />
        {/* Status bar background view for edge-to-edge */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 50, // Covers status bar area
            backgroundColor: '#667eea',
            zIndex: -1,
          }}
        />
        {/* Removed absolute positioned status bar background that was hiding the logo */}
        <GestureHandlerRootView
          style={{ flex: 1 }}
          accessible={true}
          accessibilityLabel="IraChat application root"
        >
          <Provider store={store}>
            <PersistGate
              loading={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#667eea",
                    paddingHorizontal: 20,
                  }}
                >
                  {/* IraChat Logo - Perfectly Rounded */}
                  <View
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                      marginBottom: 25,
                    }}
                  >
                    <Image
                      source={require("../assets/images/LOGO.png")}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60, // Half of width/height for perfect circle
                        borderWidth: 3,
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* App Name */}
                  <Text
                    style={{
                      color: "white",
                      fontSize: 32,
                      fontWeight: "bold",
                      marginBottom: 10,
                      textAlign: "center",
                      letterSpacing: 1,
                      textShadowColor: "rgba(0, 0, 0, 0.3)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}
                  >
                    IraChat
                  </Text>

                  {/* Loading Text */}
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: 16,
                      fontWeight: "500",
                      textAlign: "center",
                      opacity: 0.8,
                    }}
                  >
                    Loading...
                  </Text>
                </View>
              }
              persistor={persistor}
            >
              <ThemeProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
              </ThemeProvider>
            </PersistGate>
          </Provider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
