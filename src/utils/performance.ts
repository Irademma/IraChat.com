/**
 * Performance utilities for IraChat
 * Optimized for React Native performance
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Memoized screen dimensions
export const useScreenDimensions = () => {
  return useMemo(
    () => ({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      isSmall: SCREEN_WIDTH < 375,
      isLarge: SCREEN_WIDTH > 414,
    }),
    [],
  );
};

// Optimized list rendering
export const useOptimizedList = () => {
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 80, // Estimated item height
      offset: 80 * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback(
    (item: any) => item.id?.toString() || item.key,
    [],
  );

  return { getItemLayout, keyExtractor };
};

// Debounced search
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized image loading
export const useImageCache = () => {
  const cache = useRef(new Map()).current;

  const getCachedImage = useCallback(
    (uri: string) => {
      return cache.get(uri);
    },
    [cache],
  );

  const setCachedImage = useCallback(
    (uri: string, image: any) => {
      cache.set(uri, image);
    },
    [cache],
  );

  return { getCachedImage, setCachedImage };
};

// Memory optimization
export const useMemoryOptimization = () => {
  const cleanup = useCallback(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }, []);

  return { cleanup };
};

// Batch updates for better performance
export const useBatchUpdates = () => {
  const batchRef = useRef<any[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const addToBatch = useCallback((update: any) => {
    batchRef.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Process batch
      const batch = [...batchRef.current];
      batchRef.current = [];

      // Apply all updates at once
      batch.forEach((update) => update());
    }, 16); // One frame
  }, []);

  return { addToBatch };
};

export default {
  useScreenDimensions,
  useOptimizedList,
  useDebounce,
  useImageCache,
  useMemoryOptimization,
  useBatchUpdates,
};
