import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePicturePickerProps {
  currentImage?: string | null;
  onImageSelect: (imageUri: string | null) => void;
  size?: number;
}

export const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  currentImage,
  onImageSelect,
  size = 120,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    setLoading(true);
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    setLoading(true);
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onImageSelect(null) },
      ]
    );
  };

  const showImagePicker = () => {
    if (Platform.OS === 'ios') {
      const options = ['Take Photo', 'Choose from Library'];
      if (currentImage) {
        options.push('Remove Photo');
      }
      options.push('Cancel');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: currentImage ? options.length - 2 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            pickImageFromCamera();
          } else if (buttonIndex === 1) {
            pickImageFromLibrary();
          } else if (buttonIndex === 2 && currentImage) {
            removeImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Photo',
        'Choose how you want to add your profile photo',
        [
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Library', onPress: pickImageFromLibrary },
          ...(currentImage ? [{ text: 'Remove Photo', onPress: removeImage, style: 'destructive' as const }] : []),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={showImagePicker}
      disabled={loading}
    >
      {currentImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage }}
            style={[styles.image, { width: size, height: size }]}
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </View>
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Ionicons name="person-add" size={size * 0.3} color="#9CA3AF" />
          <Text style={styles.placeholderText}>Add Photo</Text>
        </View>
      )}
      
      {loading && (
        <View style={[styles.loadingOverlay, { width: size, height: size }]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    borderRadius: 60,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#87CEEB',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ProfilePicturePicker;
