// 📊 MESSAGE STATUS INDICATOR - Shows message delivery status
// Displays sent, delivered, and read indicators with proper icons

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageStatus } from '../services/realTimeMessagingService';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  isMyMessage: boolean;
  size?: number;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  isMyMessage,
  size = 16,
}) => {
  // Only show status for messages sent by current user
  if (!isMyMessage) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return {
          name: 'time-outline' as const,
          color: '#9CA3AF',
        };
      case 'sent':
        return {
          name: 'checkmark-outline' as const,
          color: '#9CA3AF',
        };
      case 'delivered':
        return {
          name: 'checkmark-done-outline' as const,
          color: '#9CA3AF',
        };
      case 'read':
        return {
          name: 'checkmark-done-outline' as const,
          color: '#667eea', // Blue when read
        };
      default:
        return {
          name: 'time-outline' as const,
          color: '#9CA3AF',
        };
    }
  };

  const { name, color } = getStatusIcon();

  return (
    <View style={styles.container}>
      <Ionicons 
        name={name} 
        size={size} 
        color={color}
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.8,
  },
});

export default MessageStatusIndicator;
