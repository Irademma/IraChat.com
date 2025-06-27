/**
 * Profile Avatar Component for IraChat
 * 
 * Enhanced avatar component specifically for profile screens
 * with editing capabilities and consistent styling
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, shadows, spacing } from '../styles/designSystem';
import { avatarService, UserProfile } from '../services/avatarService';
import { getAvatarStyles } from '../utils/avatarUtils';

interface ProfileAvatarProps {
  user: Partial<UserProfile>;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  editable?: boolean;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  style?: ViewStyle;
  showEditIcon?: boolean;
  showOnlineStatus?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  size = 'large',
  editable = false,
  onAvatarUpdate,
  style,
  showEditIcon = true,
  showOnlineStatus = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determine avatar size
  let avatarSize: number;
  switch (size) {
    case 'small':
      avatarSize = 48;
      break;
    case 'medium':
      avatarSize = 64;
      break;
    case 'large':
      avatarSize = 96;
      break;
    case 'xlarge':
      avatarSize = 128;
      break;
    default:
      avatarSize = typeof size === 'number' ? size : 96;
  }
  
  const { containerStyle, textStyle, initials, hasValidImage } = getAvatarStyles({
    imageUrl: user.avatar,
    name: user.name || 'User',
    size: avatarSize,
  });
  
  const shouldShowImage = hasValidImage && !imageError;
  
  const handleAvatarPress = () => {
    if (!editable) return;
    
    const options = ['Take Photo', 'Choose from Library', 'Cancel'];
    const cancelButtonIndex = 2;
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Update Profile Photo',
        },
        handleActionSheetResponse
      );
    } else {
      Alert.alert(
        'Update Profile Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: () => handleActionSheetResponse(0) },
          { text: 'Choose from Library', onPress: () => handleActionSheetResponse(1) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };
  
  const handleActionSheetResponse = async (buttonIndex: number) => {
    if (buttonIndex === 2) return; // Cancel
    
    try {
      setIsUploading(true);
      let imageUri: string | null = null;
      
      if (buttonIndex === 0) {
        // Take photo
        imageUri = await avatarService.takeAvatarPhoto();
      } else if (buttonIndex === 1) {
        // Choose from library
        imageUri = await avatarService.pickAvatar();
      }
      
      if (imageUri && user.id) {
        // Upload to Firebase
        const avatarUrl = await avatarService.uploadAvatar(user.id, imageUri);
        
        // Update user profile
        if (onAvatarUpdate) {
          onAvatarUpdate(avatarUrl);
        }
        
        // Clear image error state
        setImageError(false);
        
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile photo'
      );
    } finally {
      setIsUploading(false);
    }
  };
  
  const editIconSize = Math.floor(avatarSize * 0.25);
  const editIconPosition = Math.floor(avatarSize * 0.75);
  
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <TouchableOpacity
        onPress={handleAvatarPress}
        disabled={!editable || isUploading}
        style={[
          containerStyle,
          {
            position: 'relative',
            opacity: isUploading ? 0.7 : 1,
          },
          shadows.md,
        ]}
        activeOpacity={editable ? 0.8 : 1}
      >
        {shouldShowImage ? (
          <Image
            source={{ uri: user.avatar! }}
            style={{
              width: containerStyle.width,
              height: containerStyle.height,
              borderRadius: containerStyle.borderRadius,
            }}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <Text style={textStyle}>{initials}</Text>
        )}
        
        {/* Loading overlay */}
        {isUploading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: containerStyle.borderRadius,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={colors.white} />
          </View>
        )}
        
        {/* Edit icon */}
        {editable && showEditIcon && !isUploading && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: editIconSize + 8,
              height: editIconSize + 8,
              borderRadius: (editIconSize + 8) / 2,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.white,
              ...shadows.sm,
            }}
          >
            <Ionicons
              name="camera"
              size={editIconSize}
              color={colors.white}
            />
          </View>
        )}
        
        {/* Online status indicator */}
        {showOnlineStatus && (
          <View
            style={{
              position: 'absolute',
              bottom: editable && showEditIcon ? editIconSize + 4 : 0,
              right: editable && showEditIcon ? editIconSize + 4 : 0,
              width: Math.floor(avatarSize * 0.2),
              height: Math.floor(avatarSize * 0.2),
              borderRadius: Math.floor(avatarSize * 0.1),
              backgroundColor: user.isOnline ? colors.online : colors.offline,
              borderWidth: 2,
              borderColor: colors.white,
            }}
          />
        )}
      </TouchableOpacity>
      
      {/* User name */}
      <Text
        style={{
          fontSize: Math.floor(avatarSize * 0.15),
          fontWeight: '600',
          color: colors.gray900,
          marginTop: spacing.sm,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {user.name || 'Unknown User'}
      </Text>
      
      {/* User status or phone */}
      {(user.status || user.phone) && (
        <Text
          style={{
            fontSize: Math.floor(avatarSize * 0.12),
            color: colors.gray500,
            marginTop: spacing.xs,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {user.status || user.phone}
        </Text>
      )}
    </View>
  );
};

// Preset profile avatar sizes
export const SmallProfileAvatar: React.FC<Omit<ProfileAvatarProps, 'size'>> = (props) => (
  <ProfileAvatar {...props} size="small" />
);

export const MediumProfileAvatar: React.FC<Omit<ProfileAvatarProps, 'size'>> = (props) => (
  <ProfileAvatar {...props} size="medium" />
);

export const LargeProfileAvatar: React.FC<Omit<ProfileAvatarProps, 'size'>> = (props) => (
  <ProfileAvatar {...props} size="large" />
);

export const XLargeProfileAvatar: React.FC<Omit<ProfileAvatarProps, 'size'>> = (props) => (
  <ProfileAvatar {...props} size="xlarge" />
);

export default ProfileAvatar;
