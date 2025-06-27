import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function VoiceCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const contactName = params.contactName as string || "Unknown Contact";
  const contactAvatar = params.contactAvatar as string || "";

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);

    // Start call duration timer when connected
    let durationTimer: NodeJS.Timeout;
    if (callStatus === 'connected') {
      durationTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    // Pulse animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave animation for audio visualization
    if (callStatus === 'connected') {
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }

    return () => {
      clearTimeout(connectTimer);
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <Animated.View style={{
      flex: 1,
      backgroundColor: '#667eea',
      opacity: fadeAnim,
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Background Gradient Effect */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }} />

      {/* Main Content */}
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}>
        {/* Contact Avatar */}
        <Animated.View style={{
          transform: [{ scale: pulseAnim }],
          marginBottom: 40,
        }}>
          <View style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 16,
          }}>
            <Text style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Audio Wave Rings */}
          {callStatus === 'connected' && (
            <>
              <Animated.View style={{
                position: 'absolute',
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                borderRadius: 120,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                opacity: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 0],
                }),
                transform: [{
                  scale: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  })
                }],
              }} />
              <Animated.View style={{
                position: 'absolute',
                top: -40,
                left: -40,
                right: -40,
                bottom: -40,
                borderRadius: 140,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                opacity: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0],
                }),
                transform: [{
                  scale: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  })
                }],
              }} />
            </>
          )}
        </Animated.View>

        {/* Contact Name */}
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          {contactName}
        </Text>

        {/* Call Status */}
        <Text style={{
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: 60,
          textAlign: 'center',
        }}>
          {callStatus === 'connecting' ? 'Connecting...' : 
           callStatus === 'connected' ? formatDuration(callDuration) : 'Call Ended'}
        </Text>

        {/* Audio Visualizer */}
        {callStatus === 'connected' && !isMuted && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 40,
          }}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={{
                  width: 4,
                  height: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 30],
                  }),
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  marginHorizontal: 2,
                  borderRadius: 2,
                  transform: [{
                    scaleY: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    })
                  }],
                }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
      }}>
        {/* Chat Button */}
        <TouchableOpacity
          onPress={() => {
            // Navigate to chat while keeping call persistent
            router.push({
              pathname: "/individual-chat",
              params: {
                contactId: params.contactId,
                contactName: params.contactName,
                contactAvatar: params.contactAvatar,
                callInProgress: "voice",
              }
            });
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Mute Button */}
        <TouchableOpacity
          onPress={toggleMute}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <Ionicons name="call" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          onPress={toggleSpeaker}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: isSpeakerOn ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <Ionicons
            name={isSpeakerOn ? "volume-high" : "volume-medium"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 12,
          fontWeight: '500',
        }}>
          IraChat Voice Call
        </Text>
      </View>
    </Animated.View>
  );
}
