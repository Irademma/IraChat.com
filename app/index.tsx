import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { useAuthPersistence } from "../src/hooks/useAuthPersistence";
import {
    isFirstLaunch,
    markAppLaunched,
} from "../src/services/authStorageSimple";

export default function Index() {
  console.log("🚀 Index.tsx is being rendered on platform:", Platform.OS);
  console.log("🚀 App bundle mode:", __DEV__ ? "Development" : "Production");

  const [isLoading, setIsLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  const [authTimeout, setAuthTimeout] = useState(false);

  // Use auth persistence but with timeout handling
  const { isInitializing, isAuthenticated } = useAuthPersistence();

  useEffect(() => {
    const determineRoute = async () => {
      // If auth timed out, bypass auth check
      if (authTimeout) {
        console.log("⚠️ Auth timed out, bypassing to welcome");
        setDebugInfo("Auth timeout, showing welcome...");
        setRedirectTo("/welcome");
        setIsLoading(false);
        return;
      }

      // Wait for auth initialization to complete
      if (isInitializing && !authTimeout) {
        console.log("⏳ Waiting for auth initialization...");
        setDebugInfo("Waiting for authentication...");
        return;
      }

      try {
        console.log("🔍 Determining initial route...");
        console.log("🔐 User authenticated:", isAuthenticated);
        setDebugInfo("Determining route...");

        if (isAuthenticated) {
          // User is logged in, go to main app
          console.log("✅ User authenticated, redirecting to tabs");
          setDebugInfo("User authenticated, loading app...");
          setRedirectTo("/(tabs)");
        } else {
          // Check if it's first launch
          setDebugInfo("Checking if first launch...");
          const isFirstTime = await isFirstLaunch();
          console.log("👋 First time user:", isFirstTime);

          if (isFirstTime) {
            // New user, show welcome screen
            console.log("🎉 New user, redirecting to welcome");
            setDebugInfo("New user, showing welcome...");
            await markAppLaunched();
            setRedirectTo("/welcome");
          } else {
            // Returning user who logged out, show auth
            console.log("🔄 Returning user, redirecting to auth");
            setDebugInfo("Returning user, showing login...");
            setRedirectTo("/welcome");
          }
        }
      } catch (error) {
        console.error("❌ Error determining route:", error);
        setDebugInfo("Error occurred, showing welcome...");
        // Fallback to welcome screen
        setRedirectTo("/welcome");
      } finally {
        setIsLoading(false);
      }
    };

    determineRoute();
  }, [isInitializing, isAuthenticated, authTimeout]);

  // Add aggressive timeout for auth initialization - reduced for faster UX
  useEffect(() => {
    const authInitTimeout = setTimeout(() => {
      if (isInitializing) {
        console.log("⚠️ Auth initialization timeout, forcing bypass");
        setAuthTimeout(true);
        setDebugInfo("Auth timeout, bypassing to welcome...");
        setRedirectTo("/welcome");
        setIsLoading(false);
      }
    }, 1500); // 1.5 second timeout for auth (reduced for faster registration flow)

    return () => clearTimeout(authInitTimeout);
  }, [isInitializing]);

  // Add general loading timeout fallback - reduced for faster UX
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading && !redirectTo) {
        console.log(
          "⚠️ General loading timeout reached, forcing redirect to welcome",
        );
        setDebugInfo("Loading timeout, showing welcome...");
        setRedirectTo("/welcome");
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout (reduced from 8 seconds for faster registration flow)

    return () => clearTimeout(loadingTimeout);
  }, [isLoading, redirectTo]);

  // Show loading screen while determining route
  if (isLoading || isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#667eea",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          style={{
            color: "#667eea ",
            fontSize: 18,
            fontWeight: "600",
            marginTop: 16,
          }}
        >
          Loading IraChat...
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {debugInfo}
        </Text>
        {__DEV__ && (
          <Text
            style={{
              color: "#E2E8F0",
              fontSize: 12,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Debug: Auth Init: {isInitializing ? "Yes" : "No"} | Authenticated:{" "}
            {isAuthenticated ? "Yes" : "No"}
          </Text>
        )}
      </View>
    );
  }

  // Redirect to determined route
  if (redirectTo) {
    console.log("🎯 Redirecting to:", redirectTo);
    return <Redirect href={redirectTo as any} />;
  }

  // Fallback - Force redirect to welcome if nothing else works
  console.log("⚠️ No redirect determined, forcing welcome screen");
  return <Redirect href="/welcome" />;
}
