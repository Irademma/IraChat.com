// Phone-Based Registration Screen for IraChat with International Support
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import phoneAuthService from '../../src/services/phoneAuthService';
import PhoneNumberInput from '../../src/components/ui/PhoneNumberInput';

// Phone number validation utility
const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Basic validation based on country code
  switch (countryCode) {
    case '+1': // US/Canada
      return cleaned.length === 10;
    case '+44': // UK
      return cleaned.length >= 10 && cleaned.length <= 11;
    case '+33': // France
      return cleaned.length === 9;
    case '+49': // Germany
      return cleaned.length >= 10 && cleaned.length <= 12;
    case '+91': // India
      return cleaned.length === 10;
    case '+86': // China
      return cleaned.length === 11;
    case '+81': // Japan
      return cleaned.length >= 10 && cleaned.length <= 11;
    case '+234': // Nigeria
      return cleaned.length === 10;
    case '+254': // Kenya
    case '+256': // Uganda
    case '+255': // Tanzania
    case '+250': // Rwanda
      return cleaned.length === 9;
    case '+971': // UAE
      return cleaned.length === 9;
    case '+966': // Saudi Arabia
      return cleaned.length === 9;
    case '+20': // Egypt
      return cleaned.length >= 10 && cleaned.length <= 11;
    case '+90': // Turkey
      return cleaned.length === 10;
    default:
      // Generic validation for other countries (6-15 digits)
      return cleaned.length >= 6 && cleaned.length <= 15;
  }
};

export default function PhoneRegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+256'); // Default to Uganda
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Refs for auto-focus
  const codeInputRef = useRef<TextInput>(null);

  // Send verification code
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber, countryCode)) {
      Alert.alert('Error', 'Please enter a valid phone number for the selected country');
      return;
    }

    setIsLoading(true);
    
    try {
      // Format phone number for Firebase
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `${countryCode}${cleanPhone}`;

      console.log('📱 Sending code to:', formattedPhone);

      const result = await phoneAuthService.sendVerificationCode(formattedPhone);

      if (result.success) {
        setStep('verification');
        startCountdown();
        setTimeout(() => {
          codeInputRef.current?.focus();
        }, 500);
      } else {
        Alert.alert('Error', result.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify SMS code
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const result = await phoneAuthService.verifyCode(verificationCode);

      if (result.success) {
        console.log('✅ Phone authentication successful');
        Alert.alert(
          'Welcome to IraChat!',
          'Your phone number has been verified successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Invalid verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown for resend
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend verification code
  const resendCode = async () => {
    if (countdown > 0) return;
    
    setVerificationCode('');
    await sendVerificationCode();
  };

  // Format display phone number
  const getDisplayPhoneNumber = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `${countryCode} ${cleanPhone}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#87CEEB'
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600',
            color: 'white',
            marginRight: 24
          }}>
            {step === 'phone' ? 'Enter Phone Number' : 'Verify Phone Number'}
          </Text>
        </View>

        <View style={{ flex: 1, padding: 24 }}>
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#87CEEB',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>
                I
              </Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              IraChat
            </Text>
          </View>

          {step === 'phone' ? (
            // Phone Number Step
            <>
              <Text style={{
                fontSize: 16,
                color: '#374151',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 24
              }}>
                Enter your phone number to get started.{'\n'}
                We'll send you a verification code.
              </Text>

              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Phone Number
                </Text>
                <PhoneNumberInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onCountryChange={setCountryCode}
                  placeholder="Enter phone number"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                onPress={sendVerificationCode}
                disabled={isLoading || !validatePhoneNumber(phoneNumber, countryCode)}
                style={{
                  backgroundColor: validatePhoneNumber(phoneNumber, countryCode) ? '#87CEEB' : '#d1d5db',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Send Verification Code
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Verification Code Step
            <>
              <Text style={{
                fontSize: 16,
                color: '#374151',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 24
              }}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={{ fontWeight: '600' }}>{getDisplayPhoneNumber()}</Text>
              </Text>

              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Verification Code
                </Text>
                <TextInput
                  ref={codeInputRef}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 18,
                    textAlign: 'center',
                    letterSpacing: 4,
                    backgroundColor: 'white'
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                style={{
                  backgroundColor: verificationCode.length === 6 ? '#87CEEB' : '#d1d5db',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 16
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                onPress={resendCode}
                disabled={countdown > 0}
                style={{ alignItems: 'center' }}
              >
                <Text style={{
                  color: countdown > 0 ? '#9ca3af' : '#87CEEB',
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* reCAPTCHA container (invisible) */}
        <View id="recaptcha-container" style={{ height: 0, width: 0 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
