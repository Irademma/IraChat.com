import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FirebaseSetupChecker from "../src/components/FirebaseSetupChecker";
import { auth } from "../src/config/firebaseAuth";
import { db } from "../src/services/firebaseSimple";

export default function FirebaseTestScreen() {
  const router = useRouter();
  const [testEmail, setTestEmail] = useState("test@irachat.com");
  const [testPassword, setTestPassword] = useState("testpassword123");
  const [testMessage, setTestMessage] = useState("Hello Firebase!");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string, success: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = success ? "✅" : "❌";
    setResults((prev) => [`${icon} ${timestamp}: ${message}`, ...prev]);
  };

  const testFirebaseAuth = async () => {
    setLoading(true);
    try {
      // Test user creation
      addResult("Testing user creation...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        testEmail,
        testPassword,
      );
      addResult(`User created successfully: ${userCredential.user.email}`);

      // Test sign out
      addResult("Testing sign out...");
      await signOut(auth);
      addResult("User signed out successfully");

      // Test sign in
      addResult("Testing sign in...");
      const signInCredential = await signInWithEmailAndPassword(
        auth,
        testEmail,
        testPassword,
      );
      addResult(`User signed in successfully: ${signInCredential.user.email}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        // Email exists, try to sign in
        try {
          addResult("Email exists, trying to sign in...");
          const signInCredential = await signInWithEmailAndPassword(
            auth,
            testEmail,
            testPassword,
          );
          addResult(
            `User signed in successfully: ${signInCredential.user.email}`,
          );
        } catch (signInError: any) {
          addResult(`Sign in failed: ${signInError.message}`, false);
        }
      } else {
        addResult(`Auth test failed: ${error.message}`, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    setLoading(true);
    try {
      // Test writing to Firestore
      addResult("Testing Firestore write...");
      const docRef = await addDoc(collection(db, "test_messages"), {
        message: testMessage,
        timestamp: serverTimestamp(),
        testId: Date.now(),
      });
      addResult(`Document written with ID: ${docRef.id}`);

      // Test reading from Firestore
      addResult("Testing Firestore read...");
      const querySnapshot = await getDocs(collection(db, "test_messages"));
      addResult(`Read ${querySnapshot.size} documents from Firestore`);
    } catch (error: any) {
      addResult(`Firestore test failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testAuthStateListener = () => {
    addResult("Setting up auth state listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        addResult(`Auth state: User is signed in (${user.email})`);
      } else {
        addResult("Auth state: User is signed out");
      }
    });

    // Clean up after 5 seconds
    setTimeout(() => {
      unsubscribe();
      addResult("Auth state listener removed");
    }, 5000);
  };

  const clearResults = () => {
    setResults([]);
  };

  const TestButton = ({
    title,
    onPress,
    icon,
    disabled = false,
  }: {
    title: string;
    onPress: () => void;
    icon: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center py-3 px-4 rounded-lg mb-3 ${
        disabled || loading ? "bg-gray-200" : "bg-blue-500"
      }`}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={disabled || loading ? "#9CA3AF" : "white"}
      />
      <Text
        className={`ml-3 font-medium ${
          disabled || loading ? "text-gray-500" : "text-white"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Firebase Test</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Firebase Setup Checker */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Setup Status
          </Text>
          <FirebaseSetupChecker />
        </View>

        {/* Test Configuration */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Test Configuration
          </Text>

          <Text className="text-gray-600 text-sm mb-2">Test Email:</Text>
          <TextInput
            value={testEmail}
            onChangeText={setTestEmail}
            placeholder="test@example.com"
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-gray-600 text-sm mb-2">Test Password:</Text>
          <TextInput
            value={testPassword}
            onChangeText={setTestPassword}
            placeholder="password"
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            secureTextEntry
          />

          <Text className="text-gray-600 text-sm mb-2">Test Message:</Text>
          <TextInput
            value={testMessage}
            onChangeText={setTestMessage}
            placeholder="Hello Firebase!"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </View>

        {/* Test Actions */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Firebase Tests
          </Text>

          <TestButton
            title="Test Authentication"
            onPress={testFirebaseAuth}
            icon="person-circle"
          />

          <TestButton
            title="Test Firestore Database"
            onPress={testFirestore}
            icon="server"
          />

          <TestButton
            title="Test Auth State Listener"
            onPress={testAuthStateListener}
            icon="radio"
          />

          <TouchableOpacity
            onPress={clearResults}
            className="bg-gray-100 py-3 px-4 rounded-lg"
          >
            <Text className="text-gray-700 text-center font-medium">
              Clear Results
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Test Results
          </Text>

          {results.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No test results yet. Run a test to see results here.
            </Text>
          ) : (
            <ScrollView className="max-h-64">
              {results.map((result, index) => (
                <Text
                  key={index}
                  className="text-sm text-gray-700 py-1 font-mono"
                >
                  {result}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
            <View className="bg-white rounded-lg p-6 items-center">
              <View className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <Text className="text-gray-700">Running Firebase test...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
