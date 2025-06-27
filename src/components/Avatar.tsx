/**
 * Avatar Component for IraChat
 * 
 * Consistent avatar component with automatic fallbacks,
 * initials generation, and proper styling
 */

import React, { useState } from 'react';
import { Image, Text, View, ViewStyle } from 'react-native';
import { colors } from '../styles/designSystem';
import { AvatarProps, getAvatarStyles } from '../utils/avatarUtils';

interface ExtendedAvatarProps extends AvatarProps {
  style?: ViewStyle;
  onPress?: () => void;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  borderWidth?: number;
  borderColor?: string;
}

export const Avatar: React.FC<ExtendedAvatarProps> = ({
  imageUrl,
  name,
  size = 'medium',
  style,
  showOnlineStatus = false,
  isOnline = false,
  borderWidth = 0,
  borderColor = colors.white,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  
  const { containerStyle, textStyle, initials, hasValidImage } = getAvatarStyles({
    imageUrl,
    name,
    size,
  });
  
  // Determine if we should show the image
  const shouldShowImage = hasValidImage && !imageError;
  
  // Calculate online status indicator size
  const statusSize = Math.floor(containerStyle.width * 0.25);
  const statusPosition = Math.floor(containerStyle.width * 0.75);
  
  return (
    <View
      style={[
        containerStyle,
        borderWidth > 0 && {
          borderWidth,
          borderColor,
        },
        style,
      ]}
      {...props}
    >
      {shouldShowImage ? (
        <Image
          source={{ uri: imageUrl! }}
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
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
            backgroundColor: isOnline ? colors.online : colors.offline,
            borderWidth: 2,
            borderColor: colors.white,
          }}
        />
      )}
    </View>
  );
};

// Preset avatar sizes for common use cases
export const SmallAvatar: React.FC<Omit<ExtendedAvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size="small" />
);

export const MediumAvatar: React.FC<Omit<ExtendedAvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size="medium" />
);

export const LargeAvatar: React.FC<Omit<ExtendedAvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size="large" />
);

// Avatar group component for showing multiple avatars
interface AvatarGroupProps {
  users: Array<{
    name: string;
    imageUrl?: string | null;
    isOnline?: boolean;
  }>;
  maxVisible?: number;
  size?: 'small' | 'medium' | 'large' | number;
  spacing?: number;
  showOnlineStatus?: boolean;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = 'small',
  spacing = -8,
  showOnlineStatus = false,
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visibleUsers.map((user, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? spacing : 0,
            zIndex: visibleUsers.length - index,
          }}
        >
          <Avatar
            name={user.name}
            imageUrl={user.imageUrl}
            size={size}
            showOnlineStatus={showOnlineStatus}
            isOnline={user.isOnline}
            borderWidth={2}
            borderColor={colors.white}
          />
        </View>
      ))}
      
      {remainingCount > 0 && (
        <View
          style={{
            marginLeft: spacing,
            zIndex: 0,
          }}
        >
          <Avatar
            name={`+${remainingCount}`}
            size={size}
            borderWidth={2}
            borderColor={colors.white}
          />
        </View>
      )}
    </View>
  );
};

// Avatar with text component for contact lists
interface AvatarWithTextProps extends ExtendedAvatarProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

export const AvatarWithText: React.FC<AvatarWithTextProps> = ({
  title,
  subtitle,
  rightElement,
  onPress,
  ...avatarProps
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Avatar {...avatarProps} />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.gray900,
            marginBottom: subtitle ? 2 : 0,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: colors.gray500,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightElement && (
        <View style={{ marginLeft: 12 }}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

export default Avatar;
