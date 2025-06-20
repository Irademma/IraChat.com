import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = "@offline_queue";
const MAX_RETRY_COUNT = 3;

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        setQueue(JSON.parse(storedQueue));
      }
    } catch (error) {
      console.error("Error loading offline queue:", error);
    }
  }, []);

  const saveQueue = useCallback(async (newQueue: QueuedAction[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
      setQueue(newQueue);
    } catch (error) {
      console.error("Error saving offline queue:", error);
    }
  }, []);

  const addToQueue = useCallback(
    async (action: Omit<QueuedAction, "id" | "timestamp" | "retryCount">) => {
      const newAction: QueuedAction = {
        ...action,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        retryCount: 0,
      };

      const newQueue = [...queue, newAction];
      await saveQueue(newQueue);
    },
    [queue, saveQueue],
  );

  const removeFromQueue = useCallback(
    async (actionId: string) => {
      const newQueue = queue.filter((action) => action.id !== actionId);
      await saveQueue(newQueue);
    },
    [queue, saveQueue],
  );

  const processQueue = useCallback(async () => {
    if (!isOnline || isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    const action = queue[0];

    try {
      // Process the action based on its type
      switch (action.type) {
        case "LIKE_UPDATE":
          // Handle like action
          break;
        case "ADD_COMMENT":
          // Handle comment action
          break;
        case "FOLLOW_USER":
          // Handle follow action
          break;
        // Add more action types as needed
      }

      await removeFromQueue(action.id);
    } catch (error) {
      console.error("Error processing queued action:", error);

      if (action.retryCount < MAX_RETRY_COUNT) {
        const newQueue = queue.map((q) =>
          q.id === action.id ? { ...q, retryCount: q.retryCount + 1 } : q,
        );
        await saveQueue(newQueue);
      } else {
        await removeFromQueue(action.id);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline, isProcessing, queue, removeFromQueue, saveQueue]);

  useEffect(() => {
    loadQueue();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadQueue]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue.length, processQueue]);

  return {
    isOnline,
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    processQueue,
  };
};
