import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/services/firebaseSimple';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Navigation will be handled by AuthNavigator
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={`${isSignUp ? 'Create Account' : 'Sign In'} screen`}
    >
      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={isSignUp ? 'Create Account heading' : 'Welcome Back heading'}
      >
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessible={true}
        accessibilityLabel="Email input field"
        accessibilityHint="Enter your email address"
        accessibilityRole="text"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessible={true}
        accessibilityLabel="Password input field"
        accessibilityHint="Enter your password"
        accessibilityRole="text"
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={isLoading}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${isSignUp ? 'Create Account' : 'Sign In'} button`}
        accessibilityHint={`Tap to ${isSignUp ? 'create a new account' : 'sign in to your account'}`}
        accessibilityState={{ disabled: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator
            color="#FFFFFF"
            accessible={true}
            accessibilityLabel="Loading"
          />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(!isSignUp)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? 'Switch to Sign In' : 'Switch to Create Account'}
        accessibilityHint={isSignUp ? 'Tap to go to sign in screen' : 'Tap to go to create account screen'}
      >
        <Text style={styles.switchButtonText}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#667eea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4c51bf',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
}); 