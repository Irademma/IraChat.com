// Animated Header Component for Scroll-Responsive UI
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedHeaderProps {
  title: string;
  translateY: any; // Reanimated shared value
  onBackPress?: () => void;
  onRightPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  textColor?: string;
  showBackButton?: boolean;
  height?: number;
  children?: React.ReactNode;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  translateY,
  onBackPress,
  onRightPress,
  rightIcon,
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  showBackButton = false,
  height = 60,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const totalHeight = height + insets.top;

  // Animated style for header translation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <>
      {/* Status Bar Background - Always visible to preserve space */}
      <View
        style={{
          height: insets.top,
          backgroundColor: backgroundColor,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: totalHeight,
            backgroundColor: backgroundColor,
            zIndex: 999,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          },
          animatedStyle,
        ]}
      >
        {/* Status Bar Spacer */}
        <View style={{ height: insets.top }} />

        {/* Header Content */}
        <View
          style={{
            height: height,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            justifyContent: 'space-between',
          }}
        >
          {/* Left Side - Back Button */}
          <View style={{ width: 40, alignItems: 'flex-start' }}>
            {showBackButton && onBackPress && (
              <TouchableOpacity
                onPress={onBackPress}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Center - Title or Custom Content */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            {children ? (
              children
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: textColor,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
          </View>

          {/* Right Side - Action Button */}
          <View style={{ width: 40, alignItems: 'flex-end' }}>
            {rightIcon && onRightPress && (
              <TouchableOpacity
                onPress={onRightPress}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={rightIcon} size={20} color={textColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </>
  );
};

// IraChat-specific header variants
export const IraChatHeader: React.FC<{
  translateY: any;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
}> = ({ translateY, onSearchPress, onMenuPress }) => {
  return (
    <AnimatedHeader
      title=""
      translateY={translateY}
      backgroundColor="#87CEEB"
      textColor="#ffffff"
      onRightPress={onSearchPress}
      rightIcon="search"
    >
      {/* Custom IraChat Header Content */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: 0.5,
          }}
        >
          IraChat
        </Text>
      </View>
    </AnimatedHeader>
  );
};

export const ChatHeader: React.FC<{
  translateY: any;
  contactName: string;
  isOnline?: boolean;
  onBackPress: () => void;
  onCallPress?: () => void;
  onVideoPress?: () => void;
}> = ({ translateY, contactName, isOnline, onBackPress, onCallPress, onVideoPress }) => {
  return (
    <AnimatedHeader
      title=""
      translateY={translateY}
      backgroundColor="#87CEEB"
      textColor="#ffffff"
      showBackButton={true}
      onBackPress={onBackPress}
    >
      {/* Custom Chat Header Content */}
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#ffffff',
          }}
          numberOfLines={1}
        >
          {contactName}
        </Text>
        {isOnline && (
          <Text
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 2,
            }}
          >
            Online
          </Text>
        )}
      </View>
    </AnimatedHeader>
  );
};
