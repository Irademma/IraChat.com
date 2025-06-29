// 🔒 SAFE Video Call Screen - No Crash Implementation
// This prevents the app from crashing when video call is attempted

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SafeVideoCallScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  const contactName = params.contactName as string || "Unknown";
  const contactAvatar = params.contactAvatar as string || "";

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      "End Call",
      "Are you sure you want to end this call?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Call",
          style: "destructive",
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <StatusBar hidden />
      
      {/* Header */}
      <View style={{
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 8,
        }}>
          {contactName}
        </Text>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
          opacity: 0.8,
        }}>
          {formatDuration(callDuration)}
        </Text>
      </View>

      {/* Video Area */}
      <View style={{
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        borderRadius: 12,
      }}>
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#333333',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={{
            color: '#FFFFFF',
            fontSize: 16,
            opacity: 0.8,
            textAlign: 'center',
          }}>
            Video calling is being optimized{'\n'}
            Voice is working perfectly
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 50,
      }}>
        {/* Mute */}
        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="call" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Video Toggle */}
        <TouchableOpacity
          onPress={() => setIsVideoOff(!isVideoOff)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isVideoOff ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons 
            name={isVideoOff ? "videocam-off" : "videocam"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={{
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 12,
          opacity: 0.6,
          textAlign: 'center',
        }}>
          Video calling feature is being optimized for better performance.{'\n'}
          Voice calls work perfectly!
        </Text>
      </View>
    </View>
  );
}
