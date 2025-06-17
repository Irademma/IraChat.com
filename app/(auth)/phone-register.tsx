// Phone-Based Registration Screen for IraChat
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import phoneAuthService from '../../src/services/phoneAuthService';

export default function PhoneRegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Refs for auto-focus
  const phoneInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);

  // Format phone number as user types
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as +1 (234) 567-8900
    if (cleaned.length >= 10) {
      const formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
      return formatted;
    } else if (cleaned.length >= 7) {
      const formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      return formatted;
    } else if (cleaned.length >= 4) {
      const formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
      return formatted;
    } else if (cleaned.length >= 1) {
      const formatted = `+1 (${cleaned.slice(1)}`;
      return formatted;
    }
    return '+1 ';
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract just the digits for Firebase
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+${cleanPhone}`;

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
                <TextInput
                  ref={phoneInputRef}
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                  placeholder="+1 (234) 567-8900"
                  keyboardType="phone-pad"
                  autoFocus
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 16,
                    backgroundColor: 'white'
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={sendVerificationCode}
                disabled={isLoading || phoneNumber.length < 10}
                style={{
                  backgroundColor: phoneNumber.length >= 10 ? '#87CEEB' : '#d1d5db',
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
                <Text style={{ fontWeight: '600' }}>{phoneNumber}</Text>
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
