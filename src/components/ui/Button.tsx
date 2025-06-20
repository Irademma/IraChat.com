import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  Animated,
  ActivityIndicator,
  View,
  GestureResponderEvent,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider";
import {
  useResponsiveDimensions,
  useResponsiveSpacing,
  useResponsiveFontSizes,
} from "../../hooks/useResponsiveDimensions";
import {
  createSpringAnimation,
  getAnimationConfig,
} from "../../utils/animations";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
}: ButtonProps): React.JSX.Element {
  const { colors } = useTheme();
  const { width } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();
  const fontSizes = useResponsiveFontSizes();
  const animConfig = getAnimationConfig();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // No animation
    scaleAnim.setValue(1);
  };

  const handlePressOut = () => {
    // No animation
    scaleAnim.setValue(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled ? colors.textMuted : colors.primary,
          borderColor: disabled ? colors.textMuted : colors.primary,
          textColor: colors.messageTextOwn,
        };
      case "secondary":
        return {
          backgroundColor: disabled ? colors.backgroundMuted : colors.secondary,
          borderColor: disabled ? colors.backgroundMuted : colors.secondary,
          textColor: colors.messageTextOwn,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: disabled ? colors.textMuted : colors.primary,
          textColor: disabled ? colors.textMuted : colors.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: disabled ? colors.textMuted : colors.primary,
        };
      case "danger":
        return {
          backgroundColor: disabled ? colors.textMuted : colors.error,
          borderColor: disabled ? colors.textMuted : colors.error,
          textColor: colors.messageTextOwn,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.messageTextOwn,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: spacing.buttonPadding.vertical * 0.75,
          paddingHorizontal: spacing.buttonPadding.horizontal * 0.75,
          fontSize: fontSizes.sm,
          iconSize: 16,
        };
      case "large":
        return {
          paddingVertical: spacing.buttonPadding.vertical * 1.25,
          paddingHorizontal: spacing.buttonPadding.horizontal * 1.25,
          fontSize: fontSizes.lg,
          iconSize: 24,
        };
      default:
        return {
          paddingVertical: spacing.buttonPadding.vertical,
          paddingHorizontal: spacing.buttonPadding.horizontal,
          fontSize: fontSizes.base,
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          style={{
            marginRight: iconPosition === "left" ? 8 : 0,
            marginLeft: iconPosition === "right" ? 8 : 0,
          }}
        />
      );
    }

    if (icon) {
      return (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.textColor}
          style={{
            marginRight: iconPosition === "left" ? 8 : 0,
            marginLeft: iconPosition === "right" ? 8 : 0,
          }}
        />
      );
    }

    return null;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        className={`rounded-lg border flex-row items-center justify-center ${className}`}
        style={{
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <View className="flex-row items-center">
          {iconPosition === "left" && renderIcon()}
          <Text
            className="text-center"
            style={{
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
              fontWeight: "600",
            }}
          >
            {title}
          </Text>
          {iconPosition === "right" && renderIcon()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
