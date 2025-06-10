import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeProvider';

interface ChatInputProps {
  onSend: (type: string, content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (text.trim() && !disabled) {
      // Animate send button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onSend('text', text.trim());
      setText('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-white border-t border-gray-200 px-4 py-3"
      style={{ backgroundColor: colors.background, borderTopColor: colors.border }}
    >
      <View className="flex-row items-end space-x-3">
        {/* Text Input Container */}
        <Animated.View
          className="flex-1 min-h-[44px] max-h-[120px]"
          style={{
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: 22,
            backgroundColor: colors.surface,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="center"
            editable={!disabled}
            className="px-4 py-3 text-base"
            style={{
              color: colors.text,
              fontSize: 16,
              lineHeight: 20,
            }}
            maxLength={1000}
          />
        </Animated.View>

        {/* Send Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              canSend ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            style={{
              backgroundColor: canSend ? colors.primary : colors.textMuted,
            }}
          >
            <Ionicons
              name="send"
              size={20}
              color={canSend ? '#FFFFFF' : colors.background}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
