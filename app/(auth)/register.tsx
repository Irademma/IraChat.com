import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import PhoneNumberInput from '../../src/components/ui/PhoneNumberInput';
import ProfilePicturePicker from '../../src/components/ui/ProfilePicturePicker';
import { setUser } from '../../src/redux/userSlice';
import { createUserAccount } from '../../src/services/authService';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+256'); // Default to Uganda
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();



  // Create account directly without SMS verification
  const createAccount = async () => {
    console.log('Creating account for:', countryCode + phoneNumber);

    // Clear any previous errors
    setError('');

    // Validation
    if (!name.trim()) {
      const errorMsg = 'Please enter your name';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    if (name.trim().length < 2) {
      const errorMsg = 'Name must be at least 2 characters long';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    if (!username.trim()) {
      const errorMsg = 'Please enter a username';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    if (username.trim().length < 3) {
      const errorMsg = 'Username must be at least 3 characters long';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    // Username validation (must start with @ and contain only lowercase letters)
    if (!username.startsWith('@')) {
      const errorMsg = 'Username must start with @';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    const usernameWithoutAt = username.slice(1); // Remove @ symbol
    const usernameRegex = /^[a-z]+$/;
    if (!usernameRegex.test(usernameWithoutAt)) {
      const errorMsg = 'Username can only contain lowercase letters after @';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    if (!phoneNumber.trim()) {
      const errorMsg = 'Please enter your phone number';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, '');

    setLoading(true);
    try {
      // Create account using auth service
      const result = await createUserAccount({
        name: name.trim(),
        username: username.trim(),
        phoneNumber: fullPhoneNumber,
        bio: bio.trim() || 'I Love IraChat',
        avatar: profilePicture
      });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      // Update Redux store
      dispatch(setUser(result.user));

      console.log('✅ Account created successfully:', result.user.name);

      // Clear form
      setName('');
      setUsername('');
      setPhoneNumber('');
      setBio('');
      setProfilePicture('');
      setError('');

      // Wait a moment for auth state to be properly updated, then navigate
      console.log('🎯 Account creation complete - waiting for auth state sync...');
      setTimeout(() => {
        console.log('🎯 Navigating to main tabs');
        router.replace('/(tabs)');
      }, 500); // Give 500ms for auth state to sync

    } catch (error: any) {
      console.error('❌ Create account failed:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);

      // Show specific error messages for phone/username conflicts
      if (error.message.includes('phone number is already registered')) {
        const errorMessage = 'This phone number is already registered. Each phone number can only have one account for security reasons.';
        setError(errorMessage);
        Alert.alert(
          'Phone Number Already Registered',
          'This phone number is already associated with an account. Each phone number can only have one account for security reasons.\n\nIf this is your phone number, please contact support.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (error.message.includes('username is already taken')) {
        const errorMessage = 'This username is already taken. Please choose a different username.';
        setError(errorMessage);
        Alert.alert(
          'Username Taken',
          'This username is already taken. Please choose a different username.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Show the actual error message for debugging
        const errorMessage = error.message || 'Failed to create account. Please try again.';
        setError(errorMessage);
        Alert.alert('Error', `Registration failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
      accessible={true}
      accessibilityLabel="Create account screen"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessible={true}
        accessibilityLabel="Registration form"
      >
        <View className="flex-1 justify-center px-6 py-8 min-h-screen">
          {/* Header */}
          <View className="items-center mb-8">
            <Text
              className="text-2xl text-gray-800 mb-2"
              style={{ fontWeight: '700' }}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Create Account heading"
            >
              Create Account
            </Text>
            <Text
              className="text-gray-600 text-center"
              accessible={true}
              accessibilityLabel="Enter your details to get started with IraChat"
            >
              Enter your details to get started with IraChat
            </Text>
          </View>



          {/* Error Message */}
          {/* Error Message */}
          {error ? (
            <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-600 text-center text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Registration Form */}
          <View className="space-y-4">
            {/* Profile Picture */}
            <View className="items-center mb-6">
              <ProfilePicturePicker
                currentImage={profilePicture}
                onImageSelect={setProfilePicture}
                size={120}
              />
              <Text className="text-gray-600 text-sm mt-3">
                Add your profile photo by capturing a new photo or uploading from gallery
              </Text>
            </View>

            {/* Name Field */}
            <View>
              <Text
                className="text-gray-700 mb-2"
                style={{ fontWeight: '500' }}
              >
                Full Name
              </Text>
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError('');
                }}
                className="border border-gray-300 px-4 py-3 rounded-lg text-base"
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                autoComplete="name"
                textContentType="name"
                style={{
                  borderColor: error && !name.trim() ? '#EF4444' : '#D1D5DB',
                }}
                accessible={true}
                accessibilityLabel="Full name input field"
                accessibilityHint="Enter your full name"
                accessibilityRole="text"
              />
            </View>

            {/* Username Field */}
            <View>
              <Text
                className="text-gray-700 mb-2"
                style={{ fontWeight: '500' }}
              >
                Username
              </Text>
              <TextInput
                placeholder="@username"
                value={username}
                onChangeText={(text) => {
                  // Ensure it starts with @ and only contains lowercase letters
                  let cleanText = text.toLowerCase().replace(/\s/g, '');
                  if (!cleanText.startsWith('@')) {
                    cleanText = '@' + cleanText.replace('@', '');
                  }
                  // Remove any non-letter characters after @
                  const atIndex = cleanText.indexOf('@');
                  const afterAt = cleanText.slice(atIndex + 1).replace(/[^a-z]/g, '');
                  cleanText = '@' + afterAt;

                  setUsername(cleanText);
                  if (error) setError('');
                }}
                className="border border-gray-300 px-4 py-3 rounded-lg text-base"
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  borderColor: error && !username.trim() ? '#EF4444' : '#D1D5DB',
                }}
              />
              <Text className="text-gray-500 text-xs mt-1">
                Must start with @ and contain only lowercase letters
              </Text>
            </View>

            {/* Phone Number Field */}
            <View>
              <Text
                className="text-gray-700 mb-2"
                style={{ fontWeight: '500' }}
              >
                Phone Number
              </Text>
              <PhoneNumberInput
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (error) setError('');
                }}
                onCountryChange={setCountryCode}
                placeholder="Enter phone number"
                editable={!loading}
                error={!!(error && !phoneNumber.trim())}
              />
            </View>

            {/* Bio Field */}
            <View>
              <Text
                className="text-gray-700 mb-2"
                style={{ fontWeight: '500' }}
              >
                Bio
              </Text>
              <TextInput
                placeholder="I Love IraChat"
                value={bio}
                onChangeText={(text) => {
                  if (text.length <= 100) {
                    setBio(text);
                  }
                  if (error) setError('');
                }}
                className="border border-gray-300 px-4 py-3 rounded-lg text-base"
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={100}
                style={{
                  borderColor: '#D1D5DB',
                  minHeight: 80,
                }}
              />
              <Text className="text-gray-500 text-xs mt-1">
                {bio.length}/100 characters
              </Text>
            </View>

            {/* Development Notice */}
            <View className="p-3 rounded-lg border" style={{ backgroundColor: '#F0F4FF', borderColor: '#C7D2FE' }}>
              <Text className="text-xs text-center" style={{ color: '#4338CA' }}>
                🚀 Development Mode: Account will be created instantly without SMS verification
              </Text>
            </View>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={createAccount}
            disabled={loading}
            className={`mt-6 py-3 px-6 rounded-lg ${
              loading ? 'bg-gray-400' : 'bg-blue-500'
            }`}
            style={{
              backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create Account button"
            accessibilityHint="Tap to create your account"
            accessibilityState={{ disabled: loading }}
          >
            <Text
              className="text-white text-center text-base"
              style={{ fontWeight: '600' }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
