import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { markAppLaunched } from "../../src/services/authStorageSimple";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleCreateAccount = async () => {
    console.log("Create Account button clicked");
    // Mark that the user has interacted with the app (no longer a first-time user)
    await markAppLaunched();
    router.push("/register");
  };

  return (
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
        }}
      >
        <Image
          source={require("../../assets/images/LOGO.png")}
          style={{
            width: 140,
            height: 140,
            marginBottom: 40,
            borderRadius: 70, // Half of width/height for perfect circle
            borderWidth: 3,
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
          resizeMode="cover"
        />
      </View>

      <Text
        style={{
          color: "white",
          fontSize: 42, // Increased from 32
          fontWeight: "bold",
          marginBottom: 25,
          textAlign: "center",
          letterSpacing: 1,
          textShadowColor: "rgba(0, 0, 0, 0.3)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        Welcome to IraChat
      </Text>

      <Text
        style={{
          color: "white",
          fontSize: 20, // Increased from 16
          marginBottom: 50,
          textAlign: "center",
          lineHeight: 28,
          fontWeight: "500",
          opacity: 0.95,
          paddingHorizontal: 10,
        }}
      >
        Connect with friends and family through secure messaging
      </Text>

      <TouchableOpacity
        onPress={handleCreateAccount}
        style={{
          backgroundColor: "#3B82F6",
          paddingVertical: 18, // Increased padding
          paddingHorizontal: 40, // Increased padding
          borderRadius: 30, // Perfectly rounded pill shape
          minWidth: 250, // Wider button
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
          borderWidth: 2,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 22, // Increased from 18
            fontWeight: "700", // Bolder
            letterSpacing: 0.5,
          }}
        >
          Create Account
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#E2E8F0",
          fontSize: 14, // Increased from 12
          textAlign: "center",
          marginTop: 40,
          paddingHorizontal: 20,
          lineHeight: 20, // Increased line height
          fontWeight: "400",
          opacity: 0.9,
        }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}
