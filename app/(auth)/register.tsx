import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch } from "react-redux";
import PhoneNumberInput from "../../src/components/ui/PhoneNumberInput";
import ProfilePicturePicker from "../../src/components/ui/ProfilePicturePicker";
import { setUser } from "../../src/redux/userSlice";
import { createUserAccount } from "../../src/services/authService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+256"); // Default to Uganda
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  // Create account directly without SMS verification
  const createAccount = async () => {
    console.log("Creating account for:", countryCode + phoneNumber);

    // Clear any previous errors
    setError("");

    // Validation
    if (!name.trim()) {
      const errorMsg = "Please enter your name";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (name.trim().length < 2) {
      const errorMsg = "Name must be at least 2 characters long";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (!username.trim()) {
      const errorMsg = "Please enter a username";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (username.trim().length < 3) {
      const errorMsg = "Username must be at least 3 characters long";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    // Username validation (must start with @ and contain only lowercase letters)
    if (!username.startsWith("@")) {
      const errorMsg = "Username must start with @";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    const usernameWithoutAt = username.slice(1); // Remove @ symbol
    const usernameRegex = /^[a-z]+$/;
    if (!usernameRegex.test(usernameWithoutAt)) {
      const errorMsg = "Username can only contain lowercase letters after @";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (!phoneNumber.trim()) {
      const errorMsg = "Please enter your phone number";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, "");

    setLoading(true);
    try {
      // Create account using auth service
      const result = await createUserAccount({
        name: name.trim(),
        username: username.trim(),
        phoneNumber: fullPhoneNumber,
        bio: bio.trim() || "I Love IraChat",
        avatar: profilePicture,
      });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      // Update Redux store immediately
      dispatch(setUser(result.user));

      console.log("✅ Account created successfully:", result.user.name);
      console.log("🔄 Redux state updated with user:", result.user.id);

      // Clear form
      setName("");
      setUsername("");
      setPhoneNumber("");
      setBio("");
      setProfilePicture("");
      setError("");

      // Navigate to main tabs - let AuthNavigator handle the rest
      console.log("🎯 Account creation complete - navigating to main tabs");

      // Use replace to avoid back navigation to registration
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("❌ Create account failed:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);

      // Show specific error messages for phone/username conflicts
      if (error.message.includes("phone number is already registered")) {
        const errorMessage =
          "This phone number is already registered. Each phone number can only have one account for security reasons.";
        setError(errorMessage);
        Alert.alert(
          "Phone Number Already Registered",
          "This phone number is already associated with an account. Each phone number can only have one account for security reasons.\n\nIf this is your phone number, please contact support.",
          [{ text: "OK", style: "default" }],
        );
      } else if (error.message.includes("username is already taken")) {
        const errorMessage =
          "This username is already taken. Please choose a different username.";
        setError(errorMessage);
        Alert.alert(
          "Username Taken",
          "This username is already taken. Please choose a different username.",
          [{ text: "OK", style: "default" }],
        );
      } else {
        // Show the actual error message for debugging
        const errorMessage =
          error.message || "Failed to create account. Please try again.";
        setError(errorMessage);
        Alert.alert("Error", `Registration failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#667eea" }}
      accessible={true}
      accessibilityLabel="Create account screen"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100 // Extra space at bottom
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        accessible={true}
        accessibilityLabel="Registration form"
        style={{ backgroundColor: "#667eea" }}
        bounces={true}
        overScrollMode="always"
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-start',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 40,
          minHeight: '100%',
          backgroundColor: "#667eea"
        }}>
          {/* Simplified Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: '800',
                color: 'white',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
                marginBottom: 12
              }}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="IraChat heading"
            >
              IraChat
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontWeight: '500'
              }}
              accessible={true}
              accessibilityLabel="Join IraChat today"
            >
              Join IraChat today
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={{
              marginBottom: 16,
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderWidth: 2,
              borderColor: '#EF4444',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Text style={{
                color: '#DC2626',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600'
              }}>{error}</Text>
            </View>
          ) : null}

          {/* Enhanced Registration Form */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: 20,
            padding: 32,
            marginHorizontal: 8,
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
            minHeight: 600,
          }}>
            {/* Enhanced Profile Picture Section */}
            <View style={{
              alignItems: 'center',
              marginBottom: 36,
              paddingVertical: 20,
              backgroundColor: '#F8FAFC',
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#E2E8F0',
              borderStyle: 'dashed'
            }}>
              <ProfilePicturePicker
                currentImage={profilePicture}
                onImageSelect={setProfilePicture}
                size={120}
              />
              <Text style={{
                color: '#475569',
                fontSize: 14,
                marginTop: 12,
                textAlign: 'center',
                fontWeight: '600'
              }}>
                Tap to add profile photo
              </Text>
              <Text style={{
                color: '#64748B',
                fontSize: 12,
                marginTop: 4,
                textAlign: 'center',
                fontWeight: '400'
              }}>
                Camera or Gallery
              </Text>
            </View>

            {/* Name Field */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8
              }}>
                Full Name
              </Text>
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError("");
                }}
                style={{
                  borderWidth: 2,
                  borderColor: error && !name.trim() ? "#EF4444" : "#D1D5DB",
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                  borderRadius: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  fontWeight: '500',
                  minHeight: 56
                }}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                autoComplete="name"
                textContentType="name"
                accessible={true}
                accessibilityLabel="Full name input field"
                accessibilityHint="Enter your full name"
                accessibilityRole="text"
              />
            </View>

            {/* Username Field */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8
              }}>
                Username
              </Text>
              <TextInput
                placeholder="@username"
                value={username}
                onChangeText={(text) => {
                  // Ensure it starts with @ and only contains lowercase letters
                  let cleanText = text.toLowerCase().replace(/\s/g, "");
                  if (!cleanText.startsWith("@")) {
                    cleanText = "@" + cleanText.replace("@", "");
                  }
                  // Remove any non-letter characters after @
                  const atIndex = cleanText.indexOf("@");
                  const afterAt = cleanText
                    .slice(atIndex + 1)
                    .replace(/[^a-z]/g, "");
                  cleanText = "@" + afterAt;

                  setUsername(cleanText);
                  if (error) setError("");
                }}
                style={{
                  borderWidth: 2,
                  borderColor: error && !username.trim() ? "#EF4444" : "#D1D5DB",
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                  borderRadius: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  fontWeight: '500',
                  minHeight: 56
                }}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={{
                color: '#6B7280',
                fontSize: 12,
                marginTop: 4,
                fontWeight: '500'
              }}>
                Must start with @ and contain only lowercase letters
              </Text>
            </View>

            {/* Phone Number Field */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8
              }}>
                Phone Number
              </Text>
              <PhoneNumberInput
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (error) setError("");
                }}
                onCountryChange={setCountryCode}
                placeholder="Enter phone number"
                editable={!loading}
                error={!!(error && !phoneNumber.trim())}
              />
            </View>

            {/* Bio Field - Optional */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8
              }}>
                Bio (Optional)
              </Text>
              <TextInput
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={(text) => {
                  if (text.length <= 100) {
                    setBio(text);
                  }
                  if (error) setError("");
                }}
                style={{
                  borderWidth: 2,
                  borderColor: "#D1D5DB",
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                  borderRadius: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  minHeight: 70,
                  fontWeight: '500',
                  textAlignVertical: 'top'
                }}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={100}
              />
              <Text style={{
                color: '#6B7280',
                fontSize: 12,
                marginTop: 4,
                fontWeight: '500'
              }}>
                {bio.length}/100 characters
              </Text>
            </View>

          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={createAccount}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9CA3AF" : "white",
              marginTop: 32,
              paddingVertical: 18,
              paddingHorizontal: 32,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create Account button"
            accessibilityHint="Tap to create your account"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={{
              color: loading ? 'white' : '#667eea',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '700',
            }}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
