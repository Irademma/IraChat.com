import { Ionicons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import { useCameraPermissions } from 'expo-camera';
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

// Define CameraType enum since it's not exported in newer versions
const CameraType = {
  front: 'front' as const,
  back: 'back' as const,
};

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUsingFrontCamera, setIsUsingFrontCamera] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  // Request camera permissions using the hook
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (permission === null) {
          const result = await requestPermission();
          setHasPermission(result?.granted || false);
        } else {
          setHasPermission(permission?.granted || false);
        }
      } catch (error) {
        console.log('Permission error:', error);
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, [permission, requestPermission]);

  // Load and play ringtone
  useEffect(() => {
    async function loadRingtone() {
      try {
        // Skip ringtone for now to prevent crashes
        console.log('Video call connecting...');
        // const { sound } = await Audio.Sound.createAsync(
        //   require('../assets/sounds/video-ringtone.mp3'),
        //   { shouldPlay: true, isLooping: true }
        // );
        // setSound(sound);
      } catch (error) {
        console.log('Error loading video ringtone:', error);
      }
    }

    if (callStatus === 'connecting') {
      loadRingtone();
    }

    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.log);
      }
    };
  }, [callStatus, sound]);

  // Call duration timer
  useEffect(() => {
    let durationTimer: any;
    if (callStatus === 'connected') {
      durationTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationTimer) {
        clearInterval(durationTimer);
      }
    };
  }, [callStatus]);

  // Simulate call connection
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      if (sound) {
        sound.stopAsync();
      }
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, [sound]);

  // Pulse animation for connecting state
  useEffect(() => {
    if (callStatus === 'connecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [callStatus, pulseAnim]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const switchCamera = () => {
    setIsUsingFrontCamera(!isUsingFrontCamera);
    console.log(`Switched to ${!isUsingFrontCamera ? 'front' : 'rear'} camera`);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      console.log("Started recording video call");
    } else {
      setIsRecording(false);
      console.log("Stopped recording video call");
      
      try {
        const fileName = `IraChat_VideoCall_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
        console.log(`Saving recording as: ${fileName}`);
      } catch (error) {
        console.log("Error saving recording");
      }
    }
  };

  const inviteToCall = () => {
    const callLink = `https://irachat.app/join-call/${params.contactId}`;
    console.log("Generated call link:", callLink);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (sound) {
      sound.stopAsync();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{
      flex: 1,
      backgroundColor: '#000000',
      opacity: fadeAnim,
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={{
        position: 'absolute',
        top: insets.top + 20,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: 4,
        }}>
          {params.contactName || 'Unknown'}
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#CCCCCC',
        }}>
          {callStatus === 'connecting' ? 'Connecting...' : 
           callStatus === 'connected' ? formatDuration(callDuration) : 'Call Ended'}
        </Text>
      </View>

      {/* Main Video Area */}
      <View style={{
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {hasPermission && !isVideoOff ? (
          <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              Camera View ({isUsingFrontCamera ? 'Front' : 'Back'})
            </Text>
          </View>
        ) : (
          <Animated.View style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pulseAnim }],
          }}>
            <View style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: '#333333',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: '#FFFFFF',
              }}>
                {(params.contactName as string)?.charAt(0) || 'U'}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Local Video View (Picture-in-Picture) */}
      <View style={{
        position: 'absolute',
        top: 60,
        right: 20,
        width: 120,
        height: 160,
        backgroundColor: '#333333',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: isRecording ? '#EF4444' : '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isVideoOff ? (
          <Ionicons name="videocam-off" size={30} color="#CCCCCC" />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 4,
            }}>
              You
            </Text>
            <Text style={{
              fontSize: 10,
              color: '#CCCCCC',
            }}>
              {isUsingFrontCamera ? 'Front' : 'Rear'}
            </Text>
          </View>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <View style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#EF4444',
          }} />
        )}
      </View>

      {/* Control Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 150,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
      }}>
        {/* Mute Button */}
        <TouchableOpacity
          onPress={toggleMute}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* Video Toggle Button */}
        <TouchableOpacity
          onPress={toggleVideo}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isVideoOff ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isVideoOff ? "videocam-off" : "videocam"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* End Call Button */}
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
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          onPress={toggleSpeaker}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isSpeakerOn ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isSpeakerOn ? "volume-high" : "volume-medium"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* Switch Camera Button */}
        <TouchableOpacity
          onPress={switchCamera}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: isUsingFrontCamera ? 0 : 2,
            borderColor: isUsingFrontCamera ? 'transparent' : '#10B981',
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isUsingFrontCamera ? "camera-reverse" : "camera"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Additional Controls */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
      }}>
        <TouchableOpacity
          onPress={toggleRecording}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: isRecording ? 1 : 0,
            borderColor: isRecording ? '#EF4444' : 'transparent',
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isRecording ? "stop-circle" : "radio-button-on"} 
            size={16} 
            color="#EF4444" 
            style={{ marginRight: 6 }} 
          />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '500',
          }}>
            {isRecording ? "Stop" : "Record"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={inviteToCall}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '500',
          }}>
            Invite
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}