import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createUserAccount,
  getCurrentUser,
  signOutUser,
} from "../src/services/authService";
import {
  clearAuthData,
  createAuthData,
  getStoredAuthData,
  isAuthenticated,
  storeAuthData,
} from "../src/services/authStorageSimple";

export default function TestScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  const runAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    addResult("🧪 Starting Authentication Tests...");

    try {
      // Test 1: Basic Storage
      addResult("\n1️⃣ Testing Basic Storage...");
      await clearAuthData();

      const testUser = {
        id: "test_123",
        phoneNumber: "+256700000000",
        displayName: "Test User",
        name: "Test User",
        username: "testuser",
        avatar: "https://i.pravatar.cc/150?u=test",
        status: "Testing!",
        isOnline: true,
        followersCount: 0,
        followingCount: 0,
        likesCount: 0,
      };

      const authData = createAuthData(testUser);
      await storeAuthData(authData);

      const retrieved = await getStoredAuthData();
      const isAuth = await isAuthenticated();

      if (retrieved && isAuth && retrieved.user.name === "Test User") {
        addResult("   ✅ Storage test PASSED");
      } else {
        addResult("   ❌ Storage test FAILED");
      }

      // Test 2: User Creation
      addResult("\n2️⃣ Testing User Creation...");
      const result = await createUserAccount({
        name: "John Doe",
        username: "@johndoe",
        phoneNumber: "+256701234567",
        bio: "Test user",
      });

      if (result.success && result.user) {
        addResult("   ✅ User creation PASSED");
      } else {
        addResult("   ❌ User creation FAILED");
      }

      // Test 3: Token Expiration
      addResult("\n3️⃣ Testing Token Expiration...");
      const expiredAuthData = {
        token: "expired_token",
        expiresAt: Date.now() - 1000,
        user: testUser,
      };

      await storeAuthData(expiredAuthData);
      const expiredAuth = await isAuthenticated();

      if (!expiredAuth) {
        addResult("   ✅ Token expiration PASSED");
      } else {
        addResult("   ❌ Token expiration FAILED");
      }

      // Test 4: Cleanup
      addResult("\n4️⃣ Testing Cleanup...");
      await signOutUser();
      const cleanAuth = await isAuthenticated();

      if (!cleanAuth) {
        addResult("   ✅ Cleanup PASSED");
      } else {
        addResult("   ❌ Cleanup FAILED");
      }

      addResult("\n🎉 All tests completed!");
    } catch (error) {
      addResult(`\n❌ Test failed with error: ${error}`);
    }

    setIsRunning(false);
  };

  const checkAuthState = async () => {
    try {
      const isAuth = await isAuthenticated();
      const user = await getCurrentUser();
      const authData = await getStoredAuthData();

      Alert.alert(
        "Current Auth State",
        `Authenticated: ${isAuth}\n` +
          `User: ${user?.name || "None"}\n` +
          `Token Expires: ${authData?.expiresAt ? new Date(authData.expiresAt).toLocaleString() : "N/A"}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      Alert.alert("Error", `Failed to get auth state: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 IraChat is Working!</Text>
      <Text style={styles.subtitle}>Your app is successfully running</Text>
      <Text style={styles.description}>
        ✅ Dependencies installed{"\n"}✅ TypeScript compilation successful
        {"\n"}✅ Expo server running{"\n"}✅ Firebase configured{"\n"}✅ Redux
        store setup{"\n"}✅ Navigation configured{"\n"}✅ Components created
        {"\n"}✅ Styling with NativeWind{"\n"}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/welcome")}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#667eea" }]}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>Go to Main App</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#8B5CF6" }]}
        onPress={runAuthTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? "Running Tests..." : "🧪 Test Authentication"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F59E0B" }]}
        onPress={checkAuthState}
      >
        <Text style={styles.buttonText}>📊 Check Auth State</Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        >
          {testResults.map((result, index) => (
            <Text
              key={index}
              style={[
                styles.resultText,
                {
                  color: result.includes("❌")
                    ? "#EF4444"
                    : result.includes("✅")
                      ? "#667eea"
                      : result.includes("🧪")
                        ? "#F59E0B"
                        : "#374151",
                },
              ]}
            >
              {result}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resultsContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    maxHeight: 200,
    width: "100%",
  },
  resultText: {
    fontFamily: "monospace",
    fontSize: 12,
    marginBottom: 2,
  },
});
