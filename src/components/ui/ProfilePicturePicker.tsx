import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePicturePickerProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
  size?: number;
}

export default function ProfilePicturePicker({
  currentImage,
  onImageSelect,
  size = 100
}: ProfilePicturePickerProps) {
  const [showModal, setShowModal] = useState(false);

  // Mock image URLs for development
  const mockImages = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
  ];

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setShowModal(false);
  };

  const removeImage = () => {
    onImageSelect('');
    setShowModal(false);
  };

  const handleCameraCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleGallerySelect = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery permission is required to select photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="relative"
        style={{ width: size, height: size }}
      >
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="bg-gray-200 items-center justify-center border-2 border-dashed border-gray-400"
            style={{
              width: size,
              height: size,
              borderRadius: size / 2
            }}
          >
            <Text className="text-gray-500 text-4xl">👤</Text>
            <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
          </View>
        )}
        
        {/* Edit overlay */}
        <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
          <Text className="text-white text-sm">✏️</Text>
        </View>
      </TouchableOpacity>

      {/* Image Selection Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <Text
              className="text-xl text-center mb-6"
              style={{ fontWeight: '700' }}
            >
              Choose Profile Picture
            </Text>

            {/* Camera and Gallery Options */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleCameraCapture}
                className="bg-blue-500 px-6 py-4 rounded-lg flex-row items-center mb-3"
              >
                <Image
                  source={require('../../../assets/images/camera.png')}
                  className="w-6 h-6 mr-3"
                  style={{ tintColor: '#FFFFFF' }}
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text
                    className="text-white text-base"
                    style={{ fontWeight: '600' }}
                  >
                    Take Photo
                  </Text>
                  <Text className="text-blue-100 text-sm">Use camera to capture a new photo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGallerySelect}
                className="px-6 py-4 rounded-lg flex-row items-center"
                style={{ backgroundColor: '#667eea' }}
              >
                <Image
                  source={require('../../../assets/images/posts.png')}
                  className="w-6 h-6 mr-3"
                  style={{ tintColor: '#FFFFFF' }}
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text
                    className="text-white text-base"
                    style={{ fontWeight: '600' }}
                  >
                    Choose from Gallery
                  </Text>
                  <Text className="text-blue-100 text-sm">Select an existing photo from your device</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">or choose avatar</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Avatar Options */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 120 }}>
              <View className="flex-row flex-wrap justify-center">
                {mockImages.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImageSelect(imageUrl)}
                    className="m-2"
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-16 h-16 rounded-full"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View className="flex-row justify-center mt-4 space-x-4">
              {currentImage && (
                <TouchableOpacity
                  onPress={removeImage}
                  className="bg-red-500 px-4 py-2 rounded-lg"
                >
                  <Text
                    className="text-white"
                    style={{ fontWeight: '500' }}
                  >
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="bg-gray-500 px-4 py-2 rounded-lg"
              >
                <Text
                  className="text-white"
                  style={{ fontWeight: '500' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
