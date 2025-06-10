import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={16} color="#9CA3AF" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={16} color="#9CA3AF" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={16} color="#3B82F6" />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-row items-center ml-1">
      {getStatusIcon()}
    </View>
  );
}; 