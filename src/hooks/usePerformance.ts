import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";
import { useAnalytics } from "./useAnalytics";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  context?: string;
  timestamp: number;
}

interface UsePerformanceProps {
  currentUserId: string;
  onError?: (error: Error) => void;
}

export const usePerformance = ({
  currentUserId,
  onError,
}: UsePerformanceProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { trackPerformance } = useAnalytics({ currentUserId, onError });
  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);
  const fpsHistory = useRef<number[]>([]);
  const memoryUsage = useRef<number>(0);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    frameCount.current = 0;
    lastFrameTime.current = Date.now();
    fpsHistory.current = [];
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const measureFPS = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastFrameTime.current;
    frameCount.current++;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift();
      }

      const averageFPS =
        fpsHistory.current.reduce((a, b) => a + b, 0) /
        fpsHistory.current.length;
      const metric: PerformanceMetric = {
        name: "fps",
        value: averageFPS,
        unit: "fps",
        timestamp: now,
      };

      setMetrics((prev) => [...prev, metric]);
      trackPerformance(metric);
      frameCount.current = 0;
      lastFrameTime.current = now;
    }

    if (isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  }, [isMonitoring, trackPerformance]);

  const measureMemoryUsage = useCallback(async () => {
    if (Platform.OS === "web") {
      if (
        typeof global !== "undefined" &&
        global.performance &&
        "memory" in global.performance
      ) {
        const { usedJSHeapSize, totalJSHeapSize } = (performance as any).memory;
        memoryUsage.current = usedJSHeapSize;
        const metric: PerformanceMetric = {
          name: "memory",
          value: usedJSHeapSize,
          unit: "bytes",
          context: `Total: ${totalJSHeapSize}`,
          timestamp: Date.now(),
        };
        setMetrics((prev) => [...prev, metric]);
        trackPerformance(metric);
      }
    }
  }, [trackPerformance]);

  const measureNetworkLatency = useCallback(async () => {
    try {
      const start = Date.now();
      const response = await fetch("https://www.google.com/favicon.ico");
      const end = Date.now();
      const latency = end - start;

      const metric: PerformanceMetric = {
        name: "network_latency",
        value: latency,
        unit: "ms",
        timestamp: end,
      };

      setMetrics((prev) => [...prev, metric]);
      trackPerformance(metric);
    } catch (error) {
      console.error("Error measuring network latency:", error);
    }
  }, [trackPerformance]);

  const measureRenderTime = useCallback(
    (componentName: string, startTime: number) => {
      const endTime = Date.now();
      const renderTime = endTime - startTime;

      const metric: PerformanceMetric = {
        name: "render_time",
        value: renderTime,
        unit: "ms",
        context: componentName,
        timestamp: endTime,
      };

      setMetrics((prev) => [...prev, metric]);
      trackPerformance(metric);
    },
    [trackPerformance],
  );

  const measureInteractionTime = useCallback(
    (interactionName: string, startTime: number) => {
      InteractionManager.runAfterInteractions(() => {
        const endTime = Date.now();
        const interactionTime = endTime - startTime;

        const metric: PerformanceMetric = {
          name: "interaction_time",
          value: interactionTime,
          unit: "ms",
          context: interactionName,
          timestamp: endTime,
        };

        setMetrics((prev) => [...prev, metric]);
        trackPerformance(metric);
      });
    },
    [trackPerformance],
  );

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    fpsHistory.current = [];
    memoryUsage.current = 0;
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      requestAnimationFrame(measureFPS);
      const memoryInterval = setInterval(measureMemoryUsage, 5000);
      const networkInterval = setInterval(measureNetworkLatency, 30000);

      return () => {
        clearInterval(memoryInterval);
        clearInterval(networkInterval);
      };
    }
  }, [isMonitoring, measureFPS, measureMemoryUsage, measureNetworkLatency]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
    measureInteractionTime,
    clearMetrics,
  };
};
