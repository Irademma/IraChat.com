import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeProvider';

interface ChatActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onDeleteChat?: () => void;
  onMuteChat?: () => void;
  onArchiveChat?: () => void;
  onPinChat?: () => void;
  chatName?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatActionSheet({
  visible,
  onClose,
  onDeleteChat,
  onMuteChat,
  onArchiveChat,
  onPinChat,
  chatName = 'Chat',
}: ChatActionSheetProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 100); // Small delay for smooth animation
  };

  const ActionButton = ({
    icon,
    title,
    onPress,
    color = colors.text,
    destructive = false,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    color?: string;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() => handleAction(onPress)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={destructive ? '#EF4444' : color}
      />
      <Text
        style={[
          styles.actionText,
          {
            color: destructive ? '#EF4444' : colors.text,
            marginLeft: 16,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text
              style={[styles.headerTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {chatName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onPinChat && (
              <ActionButton
                icon="pin"
                title="Pin Chat"
                onPress={onPinChat}
              />
            )}
            
            {onMuteChat && (
              <ActionButton
                icon="notifications-off"
                title="Mute Notifications"
                onPress={onMuteChat}
              />
            )}
            
            {onArchiveChat && (
              <ActionButton
                icon="archive"
                title="Archive Chat"
                onPress={onArchiveChat}
              />
            )}
            
            {onDeleteChat && (
              <ActionButton
                icon="trash"
                title="Delete Chat"
                onPress={onDeleteChat}
                destructive
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
