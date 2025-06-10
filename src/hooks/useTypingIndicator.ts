import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebaseSimple';

export const useTypingIndicator = (chatId: string, userId: string) => {
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `chats/${chatId}/typing/${userId}`), (doc) => {
      setIsPartnerTyping(doc.exists() && doc.data()?.isTyping);
    });

    return () => unsubscribe();
  }, [chatId, userId]);

  const setTyping = async (isTyping: boolean) => {
    try {
      await updateDoc(doc(db, `chats/${chatId}/typing/${userId}`), {
        isTyping,
        timestamp: new Date(),
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to automatically set typing to false after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  return {
    isPartnerTyping,
    setTyping,
  };
}; 