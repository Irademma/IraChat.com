import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useCallback } from 'react';
import { db } from '../services/firebaseSimple';
import { ParsedMention } from '../utils/parseMentions';
import { useAnalytics } from './useAnalytics';

interface UseMentionNotificationsProps {
  currentUserId?: string;
  onError?: (error: Error) => void;
}

export const useMentionNotifications = ({
  currentUserId,
  onError,
}: UseMentionNotificationsProps) => {
  const { trackEngagement } = useAnalytics({ currentUserId });

  const sendMentionNotifications = useCallback(
    async (
      contentId: string,
      contentType: 'update' | 'comment',
      mentions: ParsedMention[],
      contentPreview: string
    ) => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const timestamp = serverTimestamp();

        // Create notifications for each mentioned user
        const notificationPromises = mentions.map(async (mention) => {
          if (mention.userId === currentUserId) return; // Don't notify self

          const notification = {
            userId: mention.userId,
            type: 'mention',
            contentId,
            contentType,
            contentPreview,
            mentionedBy: currentUserId,
            read: false,
            createdAt: timestamp,
          };

          await addDoc(notificationsRef, notification);

          // Track the mention engagement
          if (currentUserId) {
            trackEngagement({ type: 'mention', contentId, contentType: 'message' });
          }
        });

        await Promise.all(notificationPromises);
      } catch (error) {
        console.error('Error sending mention notifications:', error);
        onError?.(error as Error);
      }
    },
    [currentUserId, trackEngagement, onError]
  );

  return {
    sendMentionNotifications,
  };
}; 