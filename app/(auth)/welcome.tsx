import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { markAppLaunched } from '../../src/services/authStorageSimple';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleCreateAccount = async () => {
    console.log('Create Account button clicked');
    // Mark that the user has interacted with the app (no longer a first-time user)
    await markAppLaunched();
    router.push('/(auth)/register');
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#667eea',
      paddingHorizontal: 20
    }}>
      <Text style={{
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Welcome to IraChat
      </Text>

      <Text style={{
        color: 'white',
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24
      }}>
        Connect with friends and family through secure messaging
      </Text>

      <TouchableOpacity
        onPress={handleCreateAccount}
        style={{
          backgroundColor: '#3B82F6',
          paddingVertical: 15,
          paddingHorizontal: 30,
          borderRadius: 8,
          minWidth: 200,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '600'
        }}>
          Create Account
        </Text>
      </TouchableOpacity>

      <Text style={{
        color: '#E2E8F0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
        lineHeight: 16
      }}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}
