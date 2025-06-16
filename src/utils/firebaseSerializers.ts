// Firebase Timestamp Serialization Utilities
import { Timestamp } from "firebase/firestore";

/**
 * Converts Firebase Timestamp to serializable ISO string
 */
export const serializeTimestamp = (timestamp: any): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  // Handle Firebase Timestamp
  if (
    timestamp &&
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    "nanoseconds" in timestamp
  ) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toISOString();
  }

  // Handle Firestore Timestamp
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }

  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  // Handle ISO string (already serialized)
  if (typeof timestamp === "string") {
    return timestamp;
  }

  // Handle number (Unix timestamp)
  if (typeof timestamp === "number") {
    return new Date(timestamp).toISOString();
  }

  // Fallback to current time
  console.warn("Unknown timestamp format, using current time:", timestamp);
  return new Date().toISOString();
};

/**
 * Converts ISO string back to Date object
 */
export const deserializeTimestamp = (isoString: string): Date => {
  try {
    return new Date(isoString);
  } catch (error) {
    console.warn("Invalid ISO string, using current time:", isoString);
    return new Date();
  }
};

/**
 * Converts Firebase Timestamp to Firestore Timestamp for database operations
 */
export const toFirestoreTimestamp = (timestamp: any): Timestamp => {
  if (!timestamp) {
    return Timestamp.now();
  }

  // Handle Firebase Timestamp (already correct)
  if (timestamp instanceof Timestamp) {
    return timestamp;
  }

  // Handle Date object
  if (timestamp instanceof Date) {
    return Timestamp.fromDate(timestamp);
  }

  // Handle ISO string
  if (typeof timestamp === "string") {
    return Timestamp.fromDate(new Date(timestamp));
  }

  // Handle number (Unix timestamp)
  if (typeof timestamp === "number") {
    return Timestamp.fromDate(new Date(timestamp));
  }

  // Handle Firebase Timestamp object
  if (
    timestamp &&
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    "nanoseconds" in timestamp
  ) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds);
  }

  // Fallback to current time
  console.warn(
    "Unknown timestamp format for Firestore, using current time:",
    timestamp,
  );
  return Timestamp.now();
};

/**
 * Serializes a Chat object for Redux state
 */
export const serializeChat = (chat: any): any => {
  return {
    ...chat,
    lastMessageAt: chat.lastMessageAt
      ? serializeTimestamp(chat.lastMessageAt)
      : undefined,
    timestamp: serializeTimestamp(chat.timestamp),
  };
};

/**
 * Serializes an array of Chat objects for Redux state
 */
export const serializeChats = (chats: any[]): any[] => {
  return chats.map(serializeChat);
};

/**
 * Deserializes a Chat object from Redux state for display
 */
export const deserializeChat = (chat: any): any => {
  return {
    ...chat,
    lastMessageAt: chat.lastMessageAt
      ? deserializeTimestamp(chat.lastMessageAt)
      : undefined,
    timestamp: deserializeTimestamp(chat.timestamp),
  };
};

/**
 * Gets a human-readable time string from a timestamp
 */
export const getTimeString = (timestamp: any): string => {
  try {
    const date =
      typeof timestamp === "string"
        ? deserializeTimestamp(timestamp)
        : timestamp instanceof Date
          ? timestamp
          : new Date();

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.warn("Error formatting time string:", error);
    return "Unknown";
  }
};

export default {
  serializeTimestamp,
  deserializeTimestamp,
  toFirestoreTimestamp,
  serializeChat,
  serializeChats,
  deserializeChat,
  getTimeString,
};
