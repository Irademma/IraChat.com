import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from "firebase/analytics";
import { app } from "./firebase";

// Initialize Analytics
let analytics: any = null;

try {
  if (typeof (global as any).window !== "undefined") {
    analytics = getAnalytics(app);
    console.log("✅ Firebase Analytics initialized");
  }
} catch (error) {
  console.log("⚠️ Analytics not available in this environment:", error);
}

// Analytics Events for IraChat
export const AnalyticsEvents = {
  // Authentication Events
  USER_SIGN_UP: "user_sign_up",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",

  // Messaging Events
  MESSAGE_SENT: "message_sent",
  MESSAGE_RECEIVED: "message_received",
  VOICE_MESSAGE_SENT: "voice_message_sent",
  MEDIA_SHARED: "media_shared",

  // Group Events
  GROUP_CREATED: "group_created",
  GROUP_JOINED: "group_joined",
  GROUP_LEFT: "group_left",
  MEMBER_ADDED: "member_added",
  MEMBER_REMOVED: "member_removed",

  // Call Events
  VOICE_CALL_STARTED: "voice_call_started",
  VIDEO_CALL_STARTED: "video_call_started",
  CALL_ENDED: "call_ended",

  // Profile Events
  PROFILE_UPDATED: "profile_updated",
  AVATAR_CHANGED: "avatar_changed",
  STATUS_UPDATED: "status_updated",

  // App Usage Events
  APP_OPENED: "app_opened",
  TAB_SWITCHED: "tab_switched",
  SEARCH_PERFORMED: "search_performed",
  SETTINGS_OPENED: "settings_opened",

  // Feature Usage
  SWIPE_ACTION_USED: "swipe_action_used",
  MEDIA_VIEWER_OPENED: "media_viewer_opened",
  GROUP_PROFILE_OPENED: "group_profile_opened",
} as const;

// Track user authentication
export const trackUserAuth = (userId: string, method: "phone" | "email") => {
  if (!analytics) return;

  try {
    setUserId(analytics, userId);
    logEvent(analytics, AnalyticsEvents.USER_LOGIN, {
      method,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: User login tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track user signup
export const trackUserSignup = (userId: string, method: "phone" | "email") => {
  if (!analytics) return;

  try {
    setUserId(analytics, userId);
    logEvent(analytics, AnalyticsEvents.USER_SIGN_UP, {
      method,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: User signup tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track messaging activity
export const trackMessage = (
  type: "text" | "voice" | "media",
  isGroup: boolean = false,
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, AnalyticsEvents.MESSAGE_SENT, {
      message_type: type,
      is_group_message: isGroup,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Message tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track group activities
export const trackGroupActivity = (
  action: "created" | "joined" | "left",
  groupId: string,
) => {
  if (!analytics) return;

  try {
    const eventMap = {
      created: AnalyticsEvents.GROUP_CREATED,
      joined: AnalyticsEvents.GROUP_JOINED,
      left: AnalyticsEvents.GROUP_LEFT,
    };

    logEvent(analytics, eventMap[action], {
      group_id: groupId,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Group activity tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track call activities
export const trackCall = (type: "voice" | "video", duration?: number) => {
  if (!analytics) return;

  try {
    const event =
      type === "voice"
        ? AnalyticsEvents.VOICE_CALL_STARTED
        : AnalyticsEvents.VIDEO_CALL_STARTED;

    logEvent(analytics, event, {
      call_type: type,
      duration: duration || 0,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Call tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track app navigation
export const trackNavigation = (tab: string) => {
  if (!analytics) return;

  try {
    logEvent(analytics, AnalyticsEvents.TAB_SWITCHED, {
      tab_name: tab,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Navigation tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track feature usage
export const trackFeatureUsage = (
  feature: string,
  details?: Record<string, any>,
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, "feature_used", {
      feature_name: feature,
      ...details,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Feature usage tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track swipe actions
export const trackSwipeAction = (
  action: "reply" | "archive",
  messageType: string,
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, AnalyticsEvents.SWIPE_ACTION_USED, {
      action_type: action,
      message_type: messageType,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Swipe action tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track media interactions
export const trackMediaInteraction = (
  action: "view" | "download" | "share",
  mediaType: string,
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, AnalyticsEvents.MEDIA_VIEWER_OPENED, {
      action_type: action,
      media_type: mediaType,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Media interaction tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Set user properties
export const setUserAnalyticsProperties = (properties: Record<string, any>) => {
  if (!analytics) return;

  try {
    setUserProperties(analytics, properties);
    console.log("📊 Analytics: User properties set");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track app performance
export const trackPerformance = (metric: string, value: number) => {
  if (!analytics) return;

  try {
    logEvent(analytics, "performance_metric", {
      metric_name: metric,
      metric_value: value,
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Performance tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track errors
export const trackError = (error: string, context?: string) => {
  if (!analytics) return;

  try {
    logEvent(analytics, "app_error", {
      error_message: error,
      error_context: context || "unknown",
      timestamp: new Date().toISOString(),
    });
    console.log("📊 Analytics: Error tracked");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

export default {
  trackUserAuth,
  trackUserSignup,
  trackMessage,
  trackGroupActivity,
  trackCall,
  trackNavigation,
  trackFeatureUsage,
  trackSwipeAction,
  trackMediaInteraction,
  setUserAnalyticsProperties,
  trackPerformance,
  trackError,
};
