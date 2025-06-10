import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageTime } from '../utils/dateUtils';
import { useTheme } from './ThemeProvider';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    senderId: string;
    senderEmail: string;
    timestamp: any;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
  };
  isMyMessage: boolean;
  currentUserId: string;
  onLongPress?: () => void;
  showSender?: boolean;
}

export default function MessageBubble({
  message,
  isMyMessage,
  onLongPress,
  showSender = true
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate message appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusIcon = () => {
    if (!isMyMessage || !message.status) return null;

    switch (message.status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color={colors.textMuted} />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={colors.textMuted} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={colors.textMuted} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      className={`mx-4 my-1 max-w-[80%] ${isMyMessage ? 'self-end' : 'self-start'}`}
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {!isMyMessage && showSender && (
        <Text
          className="text-xs mb-1 ml-3"
          style={{ color: colors.textMuted }}
        >
          {message.senderEmail?.split('@')[0] || 'Unknown'}
        </Text>
      )}

      <TouchableOpacity
        onLongPress={onLongPress}
        activeOpacity={0.8}
        className={`px-4 py-3 rounded-2xl shadow-sm ${
          isMyMessage ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: isMyMessage ? colors.messageBubbleOwn : colors.messageBubbleOther,
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          } : {
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          } as any),
        }}
      >
        <Text
          className="text-base leading-5"
          style={{
            color: isMyMessage ? colors.messageTextOwn : colors.messageTextOther,
          }}
        >
          {message.text}
        </Text>
      </TouchableOpacity>

      <View className={`flex-row items-center mt-1 ${
        isMyMessage ? 'justify-end mr-2' : 'justify-start ml-2'
      }`}>
        <Text
          className="text-xs"
          style={{ color: colors.textMuted }}
        >
          {formatMessageTime(message.timestamp)}
        </Text>
        {isMyMessage && (
          <View className="ml-1">
            {getStatusIcon()}
          </View>
        )}
      </View>
    </Animated.View>
  );
}