// 📸 MEDIA PICKER - Share photos, videos, and files
// Full media sharing functionality like WhatsApp

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onMediaSelect: (media: MediaItem) => void;
}

export interface MediaItem {
  type: 'image' | 'video' | 'document';
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  isVisible,
  onClose,
  onMediaSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Request permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to share media.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type: 'image',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          size: asset.fileSize,
        };
        setSelectedMedia(mediaItem);
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  // Record video with camera
  const recordVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        videoMaxDuration: 60, // 1 minute max
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type: 'video',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          size: asset.fileSize,
        };
        setSelectedMedia(mediaItem);
      }
    } catch (error) {
      console.error('❌ Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    } finally {
      setIsLoading(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type: 'image',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          size: asset.fileSize,
        };
        setSelectedMedia(mediaItem);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  // Pick video from gallery
  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type: 'video',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          size: asset.fileSize,
        };
        setSelectedMedia(mediaItem);
      }
    } catch (error) {
      console.error('❌ Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    } finally {
      setIsLoading(false);
    }
  };

  // Pick document
  const pickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type: 'document',
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        };
        setSelectedMedia(mediaItem);
      }
    } catch (error) {
      console.error('❌ Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setIsLoading(false);
    }
  };

  // Send selected media
  const sendMedia = () => {
    if (selectedMedia) {
      onMediaSelect(selectedMedia);
      setSelectedMedia(null);
      onClose();
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Share Media</Text>
          <View style={styles.placeholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : selectedMedia ? (
          // Media Preview
          <View style={styles.previewContainer}>
            <View style={styles.mediaPreview}>
              {selectedMedia.type === 'image' && (
                <Image source={{ uri: selectedMedia.uri }} style={styles.imagePreview} />
              )}
              {selectedMedia.type === 'video' && (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.videoPreview}
                  useNativeControls
                  resizeMode="contain"
                />
              )}
              {selectedMedia.type === 'document' && (
                <View style={styles.documentPreview}>
                  <Ionicons name="document-text" size={64} color="#667eea" />
                  <Text style={styles.documentName}>{selectedMedia.name}</Text>
                  <Text style={styles.documentSize}>{formatFileSize(selectedMedia.size)}</Text>
                </View>
              )}
            </View>

            <View style={styles.mediaInfo}>
              {selectedMedia.type === 'video' && selectedMedia.duration && (
                <Text style={styles.infoText}>Duration: {formatDuration(selectedMedia.duration)}</Text>
              )}
              {selectedMedia.size && (
                <Text style={styles.infoText}>Size: {formatFileSize(selectedMedia.size)}</Text>
              )}
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedMedia(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={sendMedia}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Media Options
          <View style={styles.optionsContainer}>
            <View style={styles.optionsGrid}>
              <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
                <View style={[styles.optionIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="camera" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={recordVideo}>
                <View style={[styles.optionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="videocam" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <View style={[styles.optionIcon, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="images" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={pickVideo}>
                <View style={[styles.optionIcon, { backgroundColor: '#F59E0B' }]}>
                  <Ionicons name="play-circle" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Video Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={pickDocument}>
                <View style={[styles.optionIcon, { backgroundColor: '#6B7280' }]}>
                  <Ionicons name="document-text" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  optionsContainer: {
    flex: 1,
    padding: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
    marginBottom: 32,
    width: SCREEN_WIDTH / 3 - 32,
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  mediaPreview: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  documentSize: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mediaInfo: {
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default MediaPicker;
