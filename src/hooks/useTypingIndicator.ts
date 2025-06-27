import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../services/firebaseSimple";

export const useTypingIndicator = (chatId: string, userId: string) => {
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up any existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!db || !chatId || !userId) {
      console.warn("⚠️ Missing required parameters for typing indicator");
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        doc(db, `chats/${chatId}/typing/${userId}`),
        (doc) => {
          setIsPartnerTyping(doc.exists() && doc.data()?.isTyping);
        },
        (error) => {
          console.error("❌ Error in typing indicator listener:", error);
          setIsPartnerTyping(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("❌ Failed to set up typing indicator listener:", error);
      setIsPartnerTyping(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
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
      console.error("Error updating typing status:", error);
    }
  };

  return {
    isPartnerTyping,
    setTyping,
  };
};
