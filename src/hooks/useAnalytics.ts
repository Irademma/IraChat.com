import { arrayUnion, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import { db } from '../services/firebaseSimple';

interface UseAnalyticsProps {
  currentUserId?: string;
  onError?: (error: Error) => void;
}

export const useAnalytics = ({ currentUserId, onError }: UseAnalyticsProps) => {
  const trackView = useCallback(async (params: { type: string; contentId: string }) => {
    if (!currentUserId) return;

    const { type, contentId } = params;
    try {
      if (!db) return; // Skip if db is not available

      const analyticsRef = doc(db, 'analytics', 'views');
      await updateDoc(analyticsRef, {
        [`${type}s.${contentId}.count`]: increment(1),
        [`${type}s.${contentId}.viewers`]: arrayUnion(currentUserId),
        [`${type}s.${contentId}.lastViewed`]: Date.now(),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
      onError?.(error as Error);
    }
  }, [currentUserId, onError]);

  const trackEngagement = useCallback(async (params: {
    type: string;
    contentId: string;
    contentType: string;
  }) => {
    try {
      const { type, contentId, contentType } = params;
      const analyticsRef = doc(db, 'analytics', 'engagement');
      await updateDoc(analyticsRef, {
        [`${contentType}s.${contentId}.${type}s`]: increment(1),
        [`${contentType}s.${contentId}.engagedUsers`]: arrayUnion(currentUserId),
        [`${contentType}s.${contentId}.lastEngagement`]: Date.now(),
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
      onError?.(error as Error);
    }
  }, [currentUserId, onError]);

  const trackUserAction = useCallback(async (
    action: 'follow' | 'unfollow' | 'block' | 'unblock' | 'mute' | 'unmute',
    targetUserId: string
  ) => {
    try {
      const analyticsRef = doc(db, 'analytics', 'userActions');
      await updateDoc(analyticsRef, {
        [`${action}s.${targetUserId}.count`]: increment(1),
        [`${action}s.${targetUserId}.users`]: arrayUnion(currentUserId),
        [`${action}s.${targetUserId}.lastAction`]: Date.now(),
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
      onError?.(error as Error);
    }
  }, [currentUserId, onError]);

  const trackSession = useCallback(async (sessionData: {
    startTime: number;
    endTime: number;
    duration: number;
    screenViews: { screen: string; duration: number }[];
    actions: { type: string; timestamp: number }[];
  }) => {
    try {
      const sessionRef = doc(collection(db, 'sessions'));
      await updateDoc(sessionRef, {
        userId: currentUserId,
        ...sessionData,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Error tracking session:', error);
      onError?.(error as Error);
    }
  }, [currentUserId, onError]);

  const trackError = useCallback(async (error: Error, context: string) => {
    try {
      const errorRef = doc(collection(db, 'errors'));
      await updateDoc(errorRef, {
        userId: currentUserId,
        message: error.message,
        stack: error.stack,
        context,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('Error tracking error:', err);
      onError?.(err as Error);
    }
  }, [currentUserId, onError]);

  const trackPerformance = useCallback(async (metric: {
    name: string;
    value: number;
    unit: string;
    context?: string;
  }) => {
    try {
      const performanceRef = doc(collection(db, 'performance'));
      await updateDoc(performanceRef, {
        userId: currentUserId,
        ...metric,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
      onError?.(error as Error);
    }
  }, [currentUserId, onError]);

  return {
    trackView,
    trackEngagement,
    trackUserAction,
    trackSession,
    trackError,
    trackPerformance,
  };
}; 