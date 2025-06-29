// 🔧 MESSAGE ACTIONS - Delete, Forward, Copy, Reply, etc.
// WhatsApp-style message actions with long press menu

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Clipboard,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RealMessage } from '../services/realTimeMessagingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MessageActionsProps {
  message: RealMessage;
  isVisible: boolean;
  onClose: () => void;
  onDelete: (messageId: string, deleteType: 'self' | 'everyone') => void;
  onForward: (message: RealMessage) => void;
  onReply: (message: RealMessage) => void;
  onCopy: (text: string) => void;
  onEdit?: (message: RealMessage) => void;
  currentUserId: string;
  position: { x: number; y: number };
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isVisible,
  onClose,
  onDelete,
  onForward,
  onReply,
  onCopy,
  onEdit,
  currentUserId,
  position,
}) => {
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const isMyMessage = message.senderId === currentUserId;
  const canEdit = isMyMessage && message.type === 'text' && !message.deletedForEveryone;
  const canDeleteForEveryone = isMyMessage && !message.deletedForEveryone;

  // Handle copy message
  const handleCopy = () => {
    Clipboard.setString(message.content);
    onCopy(message.content);
    onClose();
  };

  // Handle reply to message
  const handleReply = () => {
    onReply(message);
    onClose();
  };

  // Handle forward message
  const handleForward = () => {
    onForward(message);
    onClose();
  };

  // Handle edit message
  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
    onClose();
  };

  // Handle delete message
  const handleDelete = () => {
    if (canDeleteForEveryone) {
      setShowDeleteOptions(true);
    } else {
      // Only option is delete for self
      confirmDelete('self');
    }
  };

  // Confirm delete action
  const confirmDelete = (deleteType: 'self' | 'everyone') => {
    const title = deleteType === 'everyone' ? 'Delete for Everyone?' : 'Delete for You?';
    const message = deleteType === 'everyone' 
      ? 'This message will be deleted for everyone in this chat.'
      : 'This message will be deleted for you only.';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(message.id, deleteType);
            setShowDeleteOptions(false);
            onClose();
          }
        },
      ]
    );
  };

  // Calculate menu position
  const menuStyle = {
    position: 'absolute' as const,
    top: Math.max(50, position.y - 100),
    left: Math.max(10, Math.min(position.x - 100, SCREEN_WIDTH - 220)),
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Actions Menu */}
      <Modal
        visible={isVisible && !showDeleteOptions}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={[styles.actionsMenu, menuStyle]}>
            {/* Reply */}
            <TouchableOpacity style={styles.actionItem} onPress={handleReply}>
              <Ionicons name="arrow-undo" size={20} color="#374151" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            {/* Copy */}
            {message.type === 'text' && (
              <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
                <Ionicons name="copy" size={20} color="#374151" />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            )}

            {/* Forward */}
            <TouchableOpacity style={styles.actionItem} onPress={handleForward}>
              <Ionicons name="arrow-forward" size={20} color="#374151" />
              <Text style={styles.actionText}>Forward</Text>
            </TouchableOpacity>

            {/* Edit (only for own text messages) */}
            {canEdit && (
              <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
                <Ionicons name="create" size={20} color="#374151" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}

            {/* Delete */}
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#EF4444" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Options Menu */}
      <Modal
        visible={showDeleteOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteOptions(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowDeleteOptions(false)}
        >
          <View style={styles.deleteOptionsMenu}>
            <View style={styles.deleteHeader}>
              <Text style={styles.deleteTitle}>Delete Message</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteOption}
              onPress={() => confirmDelete('self')}
            >
              <Ionicons name="person" size={24} color="#6B7280" />
              <View style={styles.deleteOptionContent}>
                <Text style={styles.deleteOptionTitle}>Delete for Me</Text>
                <Text style={styles.deleteOptionSubtitle}>
                  This message will be deleted for you only
                </Text>
              </View>
            </TouchableOpacity>

            {canDeleteForEveryone && (
              <TouchableOpacity
                style={styles.deleteOption}
                onPress={() => confirmDelete('everyone')}
              >
                <Ionicons name="people" size={24} color="#EF4444" />
                <View style={styles.deleteOptionContent}>
                  <Text style={[styles.deleteOptionTitle, styles.deleteForEveryoneText]}>
                    Delete for Everyone
                  </Text>
                  <Text style={styles.deleteOptionSubtitle}>
                    This message will be deleted for everyone in this chat
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDeleteOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  deleteOptionsMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  deleteHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deleteOptionContent: {
    flex: 1,
    marginLeft: 16,
  },
  deleteOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  deleteForEveryoneText: {
    color: '#EF4444',
  },
  deleteOptionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default MessageActions;
