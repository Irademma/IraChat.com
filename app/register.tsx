// Registration Screen for IraChat
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FirebaseCollectionCreator from '../src/components/FirebaseCollectionCreator';

export default function RegisterScreen() {
  const router = useRouter();
  const [showCollectionCreator, setShowCollectionCreator] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#87CEEB' }}>
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
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '700',
            color: 'white',
            marginRight: 26,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Create Account
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* IraChat Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
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
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
              marginBottom: 8
            }}>
              IraChat
            </Text>
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: 'white',
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              marginBottom: 8
            }}>
              Phone Registration Required
            </Text>
            <Text style={{
              fontSize: 18,
              color: 'white',
              textAlign: 'center',
              marginTop: 8,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              opacity: 0.95
            }}>
              IraChat uses secure phone number registration
            </Text>
          </View>

          {/* Phone Registration Notice */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 16,
            padding: 32,
            marginBottom: 40,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Ionicons name="call" size={56} color="#87CEEB" style={{ marginBottom: 20 }} />
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: 16
            }}>
              Phone Registration
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#4b5563',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 32
            }}>
              IraChat uses phone number registration for enhanced security and easier contact discovery.
              Your phone number helps friends find you on IraChat.
            </Text>

            {/* Phone Registration Button */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={{
                backgroundColor: '#87CEEB',
                paddingVertical: 18,
                paddingHorizontal: 40,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 6,
                minWidth: 200,
              }}
            >
              <Ionicons name="call" size={22} color="white" style={{ marginRight: 12 }} />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                Register with Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={{
            marginBottom: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 20,
              textAlign: 'center'
            }}>
              Why Phone Registration?
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" style={{ marginRight: 16 }} />
              <Text style={{ fontSize: 16, color: '#374151', flex: 1, fontWeight: '500' }}>
                Enhanced security with SMS verification
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="people" size={24} color="#10B981" style={{ marginRight: 16 }} />
              <Text style={{ fontSize: 16, color: '#374151', flex: 1, fontWeight: '500' }}>
                Friends can easily find you on IraChat
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="sync" size={24} color="#10B981" style={{ marginRight: 16 }} />
              <Text style={{ fontSize: 16, color: '#374151', flex: 1, fontWeight: '500' }}>
                Automatic contact synchronization
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed" size={24} color="#10B981" style={{ marginRight: 16 }} />
              <Text style={{ fontSize: 16, color: '#374151', flex: 1, fontWeight: '500' }}>
                Your phone number stays private unless you choose to share
              </Text>
            </View>
          </View>

          {/* Firebase Collections Setup */}
          <View style={{
            marginBottom: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="server" size={48} color="#87CEEB" style={{ marginBottom: 12 }} />
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: '#1F2937',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                🔥 Setup Database
              </Text>
            </View>

            {/* Collections Button */}
            <TouchableOpacity
              onPress={() => setShowCollectionCreator(true)}
              style={{
                backgroundColor: '#87CEEB',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <Ionicons name="cloud-upload" size={22} color="white" style={{ marginRight: 12 }} />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                Create Collections
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Firebase Collection Creator Modal */}
      <Modal
        visible={showCollectionCreator}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <FirebaseCollectionCreator
          visible={showCollectionCreator}
          onClose={() => setShowCollectionCreator(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}
