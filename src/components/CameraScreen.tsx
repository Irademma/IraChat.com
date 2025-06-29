// 📸 REAL CAMERA IMPLEMENTATION - Actually works!
// Users can now take photos and videos for Updates

import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraScreenProps {
  onMediaCaptured: (uri: string, type: 'photo' | 'video') => void;
  onClose: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onMediaCaptured,
  onClose,
}) => {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // Request permissions on mount
  React.useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permission
      if (!permission?.granted) {
        const cameraResult = await requestPermission();
        if (!cameraResult.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos and videos.');
          return;
        }
      }

      // Request media library permission
      if (!mediaPermission?.granted) {
        const mediaResult = await requestMediaPermission();
        if (!mediaResult.granted) {
          Alert.alert('Permission Required', 'Media library permission is required to save photos and videos.');
        }
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;

      console.log('📸 Taking picture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (photo?.uri) {
        console.log('✅ Photo taken:', photo.uri);
        
        // Save to media library
        if (mediaPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          console.log('✅ Photo saved to gallery');
        }

        // Call the callback with the photo URI
        onMediaCaptured(photo.uri, 'photo');
        
        Alert.alert(
          'Photo Taken!',
          'Your photo has been captured and saved.',
          [
            { text: 'Take Another', style: 'default' },
            { text: 'Use This Photo', onPress: onClose }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const startVideoRecording = async () => {
    try {
      if (!cameraRef.current || isRecording) return;

      console.log('🎥 Starting video recording...');
      setIsRecording(true);

      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60, // 60 seconds max
        mute: false,
      });

      if (video?.uri) {
        console.log('✅ Video recorded:', video.uri);
        
        // Save to media library
        if (mediaPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(video.uri);
          console.log('✅ Video saved to gallery');
        }

        // Call the callback with the video URI
        onMediaCaptured(video.uri, 'video');
        
        Alert.alert(
          'Video Recorded!',
          'Your video has been recorded and saved.',
          [
            { text: 'Record Another', style: 'default' },
            { text: 'Use This Video', onPress: onClose }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const stopVideoRecording = async () => {
    try {
      if (!cameraRef.current || !isRecording) return;

      console.log('⏹️ Stopping video recording...');
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('❌ Error stopping video recording:', error);
      setIsRecording(false);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9, 16], // Vertical aspect ratio for stories
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'photo';
        
        console.log('✅ Media selected from gallery:', asset.uri);
        onMediaCaptured(asset.uri, mediaType);
        
        Alert.alert(
          'Media Selected!',
          `Your ${mediaType} has been selected from gallery.`,
          [{ text: 'Use This Media', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
      >
        {/* Header Controls */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={[styles.captureButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopVideoRecording : takePicture}
            onLongPress={startVideoRecording}
            delayLongPress={500}
          >
            <View style={[styles.captureInner, isRecording && styles.recordingInner]} />
          </TouchableOpacity>

          {/* Video Mode Button */}
          <TouchableOpacity style={styles.videoButton} onPress={startVideoRecording}>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  recordingInner: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  videoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
