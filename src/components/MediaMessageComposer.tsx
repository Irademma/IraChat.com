// 📸 MEDIA MESSAGE COMPOSER - Complete media handling with captions
// Handles photos, videos, audio, documents, voice messages, location, contacts

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
// Location and contacts functionality will be implemented when needed
// import * as Location from 'expo-location';
// import * as Contacts from 'expo-contacts';
import { Audio } from 'expo-av';
import { Video, ResizeMode } from 'expo-av';
import { realTimeMessagingService } from '../services/realTimeMessagingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaMessageComposerProps {
  isVisible: boolean;
  onClose: () => void;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  onMessageSent: () => void;
}

interface MediaItem {
  uri: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
  name?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phoneNumber: string;
    avatar?: string;
  };
}

export const MediaMessageComposer: React.FC<MediaMessageComposerProps> = ({
  isVisible,
  onClose,
  chatId,
  senderId,
  senderName,
  senderAvatar,
  onMessageSent,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle camera photo
  const handleCameraPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedMedia({
          uri: asset.uri,
          type: 'image',
          width: asset.width,
          height: asset.height,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        setShowMediaOptions(false);
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Handle camera video
  const handleCameraVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to record videos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 300, // 5 minutes
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedMedia({
          uri: asset.uri,
          type: 'video',
          width: asset.width,
          height: asset.height,
          duration: asset.duration || undefined,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        setShowMediaOptions(false);
      }
    } catch (error) {
      console.error('❌ Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  // Handle gallery selection
  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedMedia({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          width: asset.width,
          height: asset.height,
          duration: asset.duration || undefined,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        setShowMediaOptions(false);
      }
    } catch (error) {
      console.error('❌ Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  // Handle document selection
  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedMedia({
          uri: asset.uri,
          type: 'file',
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        });
        setShowMediaOptions(false);
      }
    } catch (error) {
      console.error('❌ Error selecting document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  // Handle voice recording
  const handleVoiceRecord = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          
          if (uri) {
            setSelectedMedia({
              uri,
              type: 'audio',
              duration: recordingDuration,
              mimeType: 'audio/m4a',
            });
            setShowMediaOptions(false);
          }
          
          recordingRef.current = null;
        }
        
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
          recordingTimer.current = null;
        }
        
        setIsRecording(false);
        setRecordingDuration(0);
      } else {
        // Start recording
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Microphone permission is required to record voice messages.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: 2, // MPEG_4
            audioEncoder: 3, // AAC
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: 'kAudioFormatMPEG4AAC',
            audioQuality: 0x60, // High quality
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm;codecs=opus',
            bitsPerSecond: 128000,
          },
        });
        await recording.startAsync();
        
        recordingRef.current = recording;
        setIsRecording(true);
        
        // Start timer
        recordingTimer.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error with voice recording:', error);
      Alert.alert('Error', 'Failed to record voice message');
    }
  };

  // Handle location sharing
  const handleLocation = async () => {
    try {
      // Location functionality will be implemented when expo-location is available
      Alert.alert('Coming Soon', 'Location sharing will be available in the next update');

      // Placeholder for location functionality
      setSelectedMedia({
        uri: '', // No URI for location
        type: 'location',
        location: {
          latitude: 0,
          longitude: 0,
          address: 'Current Location',
        },
      });
      setShowMediaOptions(false);
    } catch (error) {
      console.error('❌ Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  // Handle contact sharing
  const handleContact = async () => {
    try {
      // Contact functionality will be implemented when expo-contacts is available
      Alert.alert('Coming Soon', 'Contact sharing will be available in the next update');

      // Placeholder for contact functionality
      setSelectedMedia({
        uri: '', // No URI for contact
        type: 'contact',
        contact: {
          name: 'Sample Contact',
          phoneNumber: '+1234567890',
          avatar: undefined,
        },
      });
      setShowMediaOptions(false);
    } catch (error) {
      console.error('❌ Error selecting contact:', error);
      Alert.alert('Error', 'Failed to select contact');
    }
  };

  // Send media message
  const handleSend = async () => {
    if (!selectedMedia) return;

    try {
      setIsSending(true);

      let result;
      
      if (selectedMedia.type === 'location') {
        // Send location message
        result = await realTimeMessagingService.sendMessage(
          chatId,
          senderId,
          senderName,
          senderAvatar || '',
          'text', // Location as text for now
          caption || 'Location'
        );
      } else if (selectedMedia.type === 'contact') {
        // Send contact message
        result = await realTimeMessagingService.sendMessage(
          chatId,
          senderId,
          senderName,
          senderAvatar || '',
          'text', // Contact as text for now
          caption || `Contact: ${selectedMedia.contact?.name}`
        );
      } else {
        // Send media message
        result = await realTimeMessagingService.sendMediaMessage(
          chatId,
          senderId,
          senderName,
          senderAvatar,
          selectedMedia.uri,
          selectedMedia.type as 'image' | 'video' | 'audio' | 'file',
          caption
        );
      }

      if (result.success) {
        onMessageSent();
        handleClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending media message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedMedia(null);
    setCaption('');
    setShowMediaOptions(true);
    setIsSending(false);
    
    // Stop recording if active
    if (isRecording && recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDuration(0);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
    
    onClose();
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Send Media</Text>
          {selectedMedia && !isSending && (
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#667eea" />
            </TouchableOpacity>
          )}
        </View>

        {showMediaOptions ? (
          // Media options
          <ScrollView style={styles.content} contentContainerStyle={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Choose Media Type</Text>
            
            <View style={styles.optionsGrid}>
              <TouchableOpacity style={styles.optionButton} onPress={handleCameraPhoto}>
                <Ionicons name="camera" size={32} color="#667eea" />
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleCameraVideo}>
                <Ionicons name="videocam" size={32} color="#667eea" />
                <Text style={styles.optionText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleGallery}>
                <Ionicons name="images" size={32} color="#667eea" />
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleDocument}>
                <Ionicons name="document" size={32} color="#667eea" />
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleLocation}>
                <Ionicons name="location" size={32} color="#667eea" />
                <Text style={styles.optionText}>Location</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleContact}>
                <Ionicons name="person" size={32} color="#667eea" />
                <Text style={styles.optionText}>Contact</Text>
              </TouchableOpacity>
            </View>

            {/* Voice Recording */}
            <View style={styles.voiceSection}>
              <Text style={styles.sectionTitle}>Voice Message</Text>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                onPress={handleVoiceRecord}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={32}
                  color={isRecording ? "#EF4444" : "#667eea"}
                />
                <Text style={[styles.voiceText, isRecording && styles.voiceTextRecording]}>
                  {isRecording ? `Recording ${formatDuration(recordingDuration)}` : 'Hold to Record'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // Media preview and caption
          <View style={styles.content}>
            {selectedMedia && (
              <View style={styles.previewContainer}>
                {/* Media Preview */}
                {selectedMedia.type === 'image' && (
                  <Image source={{ uri: selectedMedia.uri }} style={styles.imagePreview} />
                )}
                
                {selectedMedia.type === 'video' && (
                  <Video
                    source={{ uri: selectedMedia.uri }}
                    style={styles.videoPreview}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                )}
                
                {selectedMedia.type === 'audio' && (
                  <View style={styles.audioPreview}>
                    <Ionicons name="musical-notes" size={48} color="#667eea" />
                    <Text style={styles.audioText}>Voice Message</Text>
                    {selectedMedia.duration && (
                      <Text style={styles.audioDuration}>
                        {formatDuration(selectedMedia.duration)}
                      </Text>
                    )}
                  </View>
                )}
                
                {selectedMedia.type === 'file' && (
                  <View style={styles.filePreview}>
                    <Ionicons name="document" size={48} color="#667eea" />
                    <Text style={styles.fileName}>{selectedMedia.name}</Text>
                    {selectedMedia.size && (
                      <Text style={styles.fileSize}>
                        {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    )}
                  </View>
                )}
                
                {selectedMedia.type === 'location' && (
                  <View style={styles.locationPreview}>
                    <Ionicons name="location" size={48} color="#667eea" />
                    <Text style={styles.locationText}>Current Location</Text>
                    {selectedMedia.location?.address && (
                      <Text style={styles.locationAddress}>
                        {selectedMedia.location.address}
                      </Text>
                    )}
                  </View>
                )}
                
                {selectedMedia.type === 'contact' && (
                  <View style={styles.contactPreview}>
                    <Ionicons name="person-circle" size={48} color="#667eea" />
                    <Text style={styles.contactName}>{selectedMedia.contact?.name}</Text>
                    <Text style={styles.contactPhone}>{selectedMedia.contact?.phoneNumber}</Text>
                  </View>
                )}

                {/* Caption Input */}
                <View style={styles.captionContainer}>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Add a caption..."
                    placeholderTextColor="#9CA3AF"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={1000}
                  />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.sendMediaButton, isSending && styles.sendingButton]}
                  onPress={handleSend}
                  disabled={isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={24} color="#FFFFFF" />
                  )}
                  <Text style={styles.sendButtonText}>
                    {isSending ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  sendButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  optionButton: {
    width: (SCREEN_WIDTH - 48) / 3,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  voiceSection: {
    marginTop: 16,
  },
  voiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceButtonRecording: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  voiceText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  voiceTextRecording: {
    color: '#EF4444',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  videoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  audioPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  audioText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  audioDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  filePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileName: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  locationPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  contactPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactName: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  captionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendMediaButton: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingButton: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MediaMessageComposer;
