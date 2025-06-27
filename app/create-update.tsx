import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

const { width, height } = Dimensions.get('window');

export default function CreateUpdateScreen() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  React.useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select media.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16], // Vertical aspect ratio for stories
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('photo');
      setVideoThumbnail(null);
    }
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60, // 60 seconds max
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('video');
      
      // Generate thumbnail for video
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(result.assets[0].uri, {
          time: 1000, // 1 second into video
        });
        setVideoThumbnail(uri);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('photo');
      setVideoThumbnail(null);
    }
  };

  const takeVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to record videos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('video');
      
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(result.assets[0].uri, {
          time: 1000,
        });
        setVideoThumbnail(uri);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }
  };

  const handleMediaSelection = () => {
    Alert.alert(
      "Select Media",
      "Choose how you want to add media to your update",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Take Video", onPress: takeVideo },
        { text: "Choose Photo", onPress: pickImage },
        { text: "Choose Video", onPress: pickVideo },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handlePost = async () => {
    if (!selectedMedia) {
      Alert.alert("No Media", "Please select a photo or video to post.");
      return;
    }

    setIsPosting(true);
    
    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Simulate posting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Success!",
        "Your update has been posted successfully!",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to post update. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Animated.View style={{
      flex: 1,
      backgroundColor: '#F0F9FF',
      opacity: fadeAnim,
    }}>
      {/* Header */}
      <View 
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 5,
          paddingBottom: 12,
          paddingHorizontal: 20,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8 }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#FFFFFF',
          }}>
            Create Update
          </Text>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handlePost}
              disabled={isPosting || !selectedMedia}
              style={{
                backgroundColor: (!selectedMedia || isPosting) ? 'rgba(255, 255, 255, 0.3)' : '#FFFFFF',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
              }}
            >
              <Text style={{
                color: (!selectedMedia || isPosting) ? 'rgba(255, 255, 255, 0.7)' : '#667eea',
                fontSize: 14,
                fontWeight: '600',
              }}>
                {isPosting ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Selection */}
        {!selectedMedia ? (
          <TouchableOpacity
            onPress={handleMediaSelection}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 40,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderColor: 'rgba(102, 126, 234, 0.2)',
              borderStyle: 'dashed',
            }}
          >
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="camera" size={40} color="#667eea" />
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}>
              Add Photo or Video
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
            }}>
              Tap to select from gallery or take a new photo/video
            </Text>
          </TouchableOpacity>
        ) : (
          /* Media Preview */
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
          }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: mediaType === 'video' ? videoThumbnail || selectedMedia : selectedMedia }}
                style={{
                  width: '100%',
                  height: 300,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
              
              {/* Video Play Indicator */}
              {mediaType === 'video' && (
                <View style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: -25 }, { translateY: -25 }],
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
              )}
              
              {/* Change Media Button */}
              <TouchableOpacity
                onPress={handleMediaSelection}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption Input */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 20,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="text" size={20} color="#667eea" style={{ marginRight: 8 }} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#374151',
            }}>
              Add Caption
            </Text>
          </View>
          
          <TextInput
            placeholder="What's on your mind?"
            value={caption}
            onChangeText={setCaption}
            style={{
              borderWidth: 2,
              borderColor: 'rgba(102, 126, 234, 0.2)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#374151',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            textAlign: 'right',
            marginTop: 8,
          }}>
            {caption.length}/500
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
