import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface SearchResult {
  id: string;
  type: 'chat' | 'user' | 'group' | 'message' | 'update';
  title: string;
  subtitle: string;
  avatar?: string;
  content?: string;
}

interface IraChatHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showProfilePicture?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const IraChatHeader: React.FC<IraChatHeaderProps> = ({
  title,
  showBackButton = false,
  showProfilePicture = true,
  backgroundColor = '#667eea',
  textColor = '#FFFFFF',
  onBackPress,
  rightComponent,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleProfilePress = () => {
    console.log('🔄 Navigating to profile screen');
    router.push('/profile');
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    if (currentUser?.name) {
      return currentUser.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <>
      {/* Status Bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      
      {/* Header Container */}
      <View
        style={{
          backgroundColor: backgroundColor,
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        {/* Left Section - Back Button or Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                padding: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          ) : (
            <View style={{ marginRight: 12 }}>
              {/* IraChat Logo */}
              <Image
                source={require('../../assets/images/LOGO.png')}
                style={{
                  width: 36,
                  height: 36,
                  resizeMode: 'contain',
                }}
                accessibilityLabel="IraChat Logo"
              />
            </View>
          )}

          {/* Title or App Name */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: title ? 20 : 24,
                fontWeight: '700',
                color: textColor,
                letterSpacing: title ? 0 : 0.5,
              }}
              numberOfLines={1}
            >
              {title || 'IraChat'}
            </Text>
            {!title && (
              <Text
                style={{
                  fontSize: 12,
                  color: `${textColor}CC`,
                  fontWeight: '500',
                  marginTop: 1,
                }}
              >
                Connect • Share • Chat
              </Text>
            )}
          </View>
        </View>

        {/* Right Section - Custom Component or Profile Picture */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {rightComponent ? (
            rightComponent
          ) : showProfilePicture ? (
            <TouchableOpacity
              onPress={handleProfilePress}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              accessibilityHint="Tap to view and edit your profile"
            >
              {currentUser?.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  >
                    {getUserInitials()}
                  </Text>
                </View>
              )}
              
              {/* Online indicator */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#10B981',
                  borderWidth: 2,
                  borderColor: backgroundColor,
                }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
};

export default IraChatHeader;
