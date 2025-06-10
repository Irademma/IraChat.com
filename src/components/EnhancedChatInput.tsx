import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import { useRouter } from 'expo-router';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia: (uri: string, type: 'image' | 'video') => void;
  onSendVoice: (uri: string, duration: number) => void;
  onSendFile: (uri: string, name: string, type: string) => void;
  placeholder?: string;
  chatId?: string;
}

export default function EnhancedChatInput({
  onSendMessage,
  onSendMedia,
  onSendVoice,
  onSendFile,
  placeholder = "Type a message...",
  chatId
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const router = useRouter();
  
  const attachmentMenuAnim = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const toggleAttachmentMenu = () => {
    const toValue = showAttachmentMenu ? 0 : 1;
    setShowAttachmentMenu(!showAttachmentMenu);
    
    Animated.spring(attachmentMenuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onSendMedia(asset.uri, asset.type === 'video' ? 'video' : 'image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
    setShowAttachmentMenu(false);
  };

  const handleGallery = () => {
    router.push({
      pathname: '/media-gallery',
      params: { chatId: chatId || '' }
    });
    setShowAttachmentMenu(false);
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onSendFile(asset.uri, asset.name, asset.mimeType || 'application/octet-stream');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
    setShowAttachmentMenu(false);
  };

  const handleLocation = () => {
    Alert.alert('Location Sharing', 'Location sharing will be available soon');
    setShowAttachmentMenu(false);
  };

  const handleVoiceMessage = (uri: string, duration: number) => {
    onSendVoice(uri, duration);
    setShowVoiceRecorder(false);
  };

  const AttachmentButton = ({ 
    icon, 
    label, 
    onPress, 
    color = '#3B82F6' 
  }: { 
    icon: string; 
    label: string; 
    onPress: () => void; 
    color?: string; 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="items-center py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
    </TouchableOpacity>
  );

  if (showVoiceRecorder) {
    return (
      <VoiceMessageRecorder
        onSendVoiceMessage={handleVoiceMessage}
        onCancel={() => setShowVoiceRecorder(false)}
      />
    );
  }

  return (
    <View className="bg-white border-t border-gray-200">
      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <Animated.View
          style={{
            transform: [{
              translateY: attachmentMenuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              })
            }],
            opacity: attachmentMenuAnim,
          }}
          className="px-4 py-3 bg-gray-50 border-b border-gray-200"
        >
          <View className="flex-row justify-around">
            <AttachmentButton
              icon="camera"
              label="Camera"
              onPress={handleCamera}
              color="#10B981"
            />
            <AttachmentButton
              icon="images"
              label="Gallery"
              onPress={handleGallery}
              color="#3B82F6"
            />
            <AttachmentButton
              icon="document"
              label="Document"
              onPress={handleDocument}
              color="#F59E0B"
            />
            <AttachmentButton
              icon="location"
              label="Location"
              onPress={handleLocation}
              color="#EF4444"
            />
          </View>
        </Animated.View>
      )}

      {/* Input Row */}
      <View className="flex-row items-end px-4 py-3">
        {/* Attachment Button */}
        <TouchableOpacity
          onPress={toggleAttachmentMenu}
          className="w-10 h-10 items-center justify-center mr-2"
        >
          <Ionicons 
            name={showAttachmentMenu ? "close" : "add"} 
            size={24} 
            color="#6B7280" 
          />
        </TouchableOpacity>

        {/* Text Input */}
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            className="text-gray-800 text-base max-h-24"
            style={{ minHeight: 20 }}
          />
        </View>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowVoiceRecorder(true)}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <Ionicons name="mic" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
