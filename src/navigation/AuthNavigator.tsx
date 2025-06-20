import { useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../services/firebaseSimple";

export function AuthNavigator() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(auth)";

      if (!user && !inAuthGroup) {
        // Redirect to the sign-in page if not signed in
        router.replace("/(auth)");
      } else if (user && inAuthGroup) {
        // Redirect to the main app if signed in
        router.replace("/(tabs)");
      }
    });

    return () => unsubscribe();
  }, [segments]);

  return null;
}
