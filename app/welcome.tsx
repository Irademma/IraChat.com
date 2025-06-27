// Welcome Screen for IraChat
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Dimensions,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <StatusBar barStyle="light-content" backgroundColor="#87CEEB" />
      
      {/* Background Gradient Effect */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#87CEEB',
      }} />

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Logo Section */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            overflow: 'hidden',
          }}>
            <Image
              source={require('../assets/images/LOGO.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
              resizeMode="cover"
            />
          </View>

          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 8,
          }}>
            IraChat
          </Text>

          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 48,
          }}>
            Connect with friends and family{'\n'}
            Share moments, make memories
          </Text>

          {/* Features List */}
          <View style={{ alignItems: 'flex-start', marginBottom: 48 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: 12, fontSize: 16 }}>
                Secure messaging
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="call" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: 12, fontSize: 16 }}>
                Voice & video calls
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="images" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: 12, fontSize: 16 }}>
                Share photos & videos
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: 12, fontSize: 16 }}>
                Group conversations
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={{
              backgroundColor: 'white',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{
              color: '#87CEEB',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)')}
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'white',
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '500',
            }}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
