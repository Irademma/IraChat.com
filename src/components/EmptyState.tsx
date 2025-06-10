import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, ImageSourcePropType } from 'react-native';
import { useTheme } from './ThemeProvider';

interface EmptyStateProps {
  icon: ImageSourcePropType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  size = 'medium'
}: EmptyStateProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 'w-16 h-16',
          titleSize: 'text-lg',
          descriptionSize: 'text-sm',
          spacing: 'mb-4',
        };
      case 'large':
        return {
          iconSize: 'w-28 h-28',
          titleSize: 'text-2xl',
          descriptionSize: 'text-lg',
          spacing: 'mb-8',
        };
      default:
        return {
          iconSize: 'w-20 h-20',
          titleSize: 'text-xl',
          descriptionSize: 'text-base',
          spacing: 'mb-6',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      className="flex-1 justify-center items-center px-8"
      style={{
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Image
        source={icon}
        className={`${sizeStyles.iconSize} ${sizeStyles.spacing} opacity-60`}
        style={{ tintColor: colors.textMuted }}
        resizeMode="contain"
      />

      <Text
        className={`${sizeStyles.titleSize} mb-3 text-center`}
        style={{
          color: colors.textSecondary,
          fontWeight: '600'
        }}
      >
        {title}
      </Text>

      <Text
        className={`${sizeStyles.descriptionSize} text-center ${sizeStyles.spacing} leading-6`}
        style={{ color: colors.textMuted }}
      >
        {description}
      </Text>

      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="px-6 py-3 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.primary }}
          activeOpacity={0.8}
        >
          <Text
            className="text-base"
            style={{
              color: colors.messageTextOwn,
              fontWeight: '600'
            }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
