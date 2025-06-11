import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { fontSizes } from '../../utils/responsive';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accessible?: boolean;
}

export default function ErrorState({ 
  title = 'Something went wrong',
  message = 'Please try again later',
  actionText = 'Retry',
  onAction,
  icon = 'alert-circle-outline',
  accessible = true 
}: ErrorStateProps) {
  const { isXSmall } = useResponsiveDimensions();
  
  return (
    <View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isXSmall ? 16 : 24
      }}
      accessible={accessible}
      accessibilityLabel={`Error screen. ${title}. ${message}`}
    >
      <Ionicons 
        name={icon} 
        size={isXSmall ? 48 : 64} 
        color="#EF4444" 
        style={{ marginBottom: 16 }}
        accessible={true}
        accessibilityLabel="Error icon"
      />
      
      <Text 
        style={{
          fontSize: isXSmall ? fontSizes.lg : fontSizes.xl,
          fontWeight: '600',
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: 8
        }}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={title}
      >
        {title}
      </Text>
      
      <Text 
        style={{
          fontSize: isXSmall ? fontSizes.sm : fontSizes.base,
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: (isXSmall ? fontSizes.sm : fontSizes.base) * 1.5
        }}
        accessible={true}
        accessibilityLabel={message}
      >
        {message}
      </Text>
      
      {onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: '#667eea',
            paddingHorizontal: isXSmall ? 16 : 24,
            paddingVertical: isXSmall ? 10 : 12,
            borderRadius: 8,
            minHeight: 44 // Accessibility minimum touch target
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${actionText} button`}
          accessibilityHint="Tap to retry the action"
        >
          <Text 
            style={{
              color: '#FFFFFF',
              fontSize: isXSmall ? fontSizes.sm : fontSizes.base,
              fontWeight: '600',
              textAlign: 'center'
            }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
