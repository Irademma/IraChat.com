import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Ionicons } from '@expo/vector-icons';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  showProfilePicture?: boolean;
  backgroundColor?: string;
  textColor?: string;
  logoSize?: number;
  profileSize?: number;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  style?: any;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showLogo = true,
  showProfilePicture = true,
  backgroundColor = '#667eea',
  textColor = '#FFFFFF',
  logoSize = 32,
  profileSize = 40,
  onBackPress,
  onProfilePress,
  rightComponent,
  leftComponent,
  centerComponent,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      console.log('🔄 Navigating to profile screen');
      router.push('/profile');
    }
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

  const renderLeftSection = () => {
    if (leftComponent) {
      return leftComponent;
    }

    return (
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={[styles.backButton, { backgroundColor: `${textColor}15` }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        ) : showLogo ? (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/LOGO.png')}
              style={[
                styles.logo,
                {
                  width: logoSize,
                  height: logoSize,
                }
              ]}
              accessibilityLabel="IraChat Logo"
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderCenterSection = () => {
    if (centerComponent) {
      return centerComponent;
    }

    return (
      <View style={styles.centerSection}>
        <Text
          style={[
            styles.title,
            {
              color: textColor,
              fontSize: title ? 20 : 24,
              letterSpacing: title ? 0 : 0.5,
            }
          ]}
          numberOfLines={1}
        >
          {title || 'IraChat'}
        </Text>
        {(subtitle || !title) && (
          <Text
            style={[
              styles.subtitle,
              {
                color: `${textColor}CC`,
              }
            ]}
          >
            {subtitle || 'Connect • Share • Chat'}
          </Text>
        )}
      </View>
    );
  };

  const renderRightSection = () => {
    if (rightComponent) {
      return rightComponent;
    }

    if (!showProfilePicture) {
      return <View style={styles.rightSection} />;
    }

    return (
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={[
            styles.profileButton,
            {
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              backgroundColor: `${textColor}15`,
              borderColor: `${textColor}30`,
            }
          ]}
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          accessibilityHint="Tap to view and edit your profile"
        >
          {currentUser?.avatar ? (
            <Image
              source={{ uri: currentUser.avatar }}
              style={[
                styles.profileImage,
                {
                  width: profileSize - 4,
                  height: profileSize - 4,
                  borderRadius: (profileSize - 4) / 2,
                }
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.profileFallback,
                {
                  width: profileSize - 4,
                  height: profileSize - 4,
                  borderRadius: (profileSize - 4) / 2,
                  backgroundColor: `${textColor}20`,
                }
              ]}
            >
              <Text
                style={[
                  styles.profileInitials,
                  {
                    color: textColor,
                    fontSize: profileSize * 0.35,
                  }
                ]}
              >
                {getUserInitials()}
              </Text>
            </View>
          )}
          
          {/* Online indicator */}
          <View
            style={[
              styles.onlineIndicator,
              {
                width: profileSize * 0.3,
                height: profileSize * 0.3,
                borderRadius: (profileSize * 0.3) / 2,
                borderColor: backgroundColor,
              }
            ]}
          />
        </TouchableOpacity>
      </View>
    );
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
        style={[
          styles.headerContainer,
          {
            backgroundColor: backgroundColor,
            paddingTop: insets.top + 8,
          },
          style,
        ]}
      >
        {renderLeftSection()}
        {renderCenterSection()}
        {renderRightSection()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
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
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 50,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  logoContainer: {
    marginRight: 8,
  },
  logo: {
    resizeMode: 'contain',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },
  profileButton: {
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    // Styles applied dynamically
  },
  profileFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
});

export default AppHeader;
