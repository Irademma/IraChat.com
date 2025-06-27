// Enhanced Media Upload Service for Firebase Storage
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { storage } from "./firebaseSimple";

export interface MediaUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface MediaUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Upload media file to Firebase Storage
 */
export const uploadMedia = async (
  uri: string,
  fileName: string,
  folder: string = "updates",
  onProgress?: (progress: MediaUploadProgress) => void,
): Promise<MediaUploadResult> => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    console.log("📤 Starting media upload:", { uri, fileName, folder });

    // Convert URI to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);

    console.log("📁 Upload path:", `${folder}/${uniqueFileName}`);

    // Upload file
    const uploadTask = await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);

    console.log("✅ Media upload successful:", downloadURL);

    return {
      success: true,
      url: downloadURL,
    };
  } catch (error: any) {
    console.error("❌ Media upload failed:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
  uri: string,
  userId: string,
): Promise<MediaUploadResult> => {
  return uploadMedia(uri, `profile_${userId}.jpg`, "profiles");
};

/**
 * Upload update media (photo/video)
 */
export const uploadUpdateMedia = async (
  uri: string,
  userId: string,
  mediaType: "photo" | "video",
): Promise<MediaUploadResult> => {
  const extension = mediaType === "video" ? "mp4" : "jpg";
  return uploadMedia(uri, `update_${userId}.${extension}`, "updates");
};

/**
 * Upload chat media
 */
export const uploadChatMedia = async (
  uri: string,
  chatId: string,
  mediaType: "photo" | "video" | "document",
): Promise<MediaUploadResult> => {
  const extension =
    mediaType === "video" ? "mp4" : mediaType === "document" ? "pdf" : "jpg";
  return uploadMedia(uri, `chat_${chatId}.${extension}`, "chats");
};

/**
 * Delete media from Firebase Storage
 */
export const deleteMedia = async (url: string): Promise<boolean> => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    // Extract path from URL
    const urlParts = url.split("/");
    const pathIndex = urlParts.findIndex((part) =>
      part.includes("appspot.com"),
    );
    if (pathIndex === -1) {
      throw new Error("Invalid Firebase Storage URL");
    }

    const path = urlParts
      .slice(pathIndex + 1)
      .join("/")
      .split("?")[0];
    const decodedPath = decodeURIComponent(path);

    // Create reference and delete
    const fileRef = ref(storage, decodedPath);
    await deleteObject(fileRef);

    console.log("🗑️ Media deleted successfully:", decodedPath);
    return true;
  } catch (error: any) {
    console.error("❌ Media deletion failed:", error);
    return false;
  }
};

/**
 * Get optimized image URL with size parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  width: number = 400,
  height: number = 400,
): string => {
  if (!url || !url.includes("firebasestorage.googleapis.com")) {
    return url;
  }

  // Add size parameters for Firebase Storage images
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&h=${height}&fit=crop`;
};

/**
 * Validate media file
 */
export const validateMediaFile = (
  uri: string,
  type: "image" | "video" | "any" = "any",
): boolean => {
  if (!uri) return false;

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];

  const extension = uri.split(".").pop()?.toLowerCase();
  if (!extension) return false;

  switch (type) {
    case "image":
      return imageExtensions.includes(extension);
    case "video":
      return videoExtensions.includes(extension);
    case "any":
      return [...imageExtensions, ...videoExtensions].includes(extension);
    default:
      return false;
  }
};

/**
 * Get media type from URI
 */
export const getMediaType = (uri: string): "photo" | "video" | "unknown" => {
  const extension = uri.split(".").pop()?.toLowerCase();
  if (!extension) return "unknown";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];

  if (imageExtensions.includes(extension)) return "photo";
  if (videoExtensions.includes(extension)) return "video";
  return "unknown";
};

/**
 * Compress image before upload
 */
export const compressImage = async (
  uri: string,
  quality: number = 0.8,
): Promise<string> => {
  try {
    console.log("🗜️ Compressing image...", { uri, quality });

    // Use expo-image-manipulator for real compression
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Resize to max width of 1080px
      {
        compress: quality,
        format: SaveFormat.JPEG,
      }
    );

    console.log("✅ Image compressed successfully");
    return result.uri;
  } catch (error) {
    console.error("❌ Image compression failed:", error);
    return uri; // Return original if compression fails
  }
};

/**
 * Generate thumbnail for video
 */
export const generateVideoThumbnail = async (
  videoUri: string,
): Promise<string | null> => {
  try {
    console.log("🎬 Generating video thumbnail...", videoUri);

    // Use expo-video-thumbnails for real thumbnail generation
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // Get thumbnail at 1 second
      quality: 0.8,
    });

    console.log("✅ Video thumbnail generated successfully");
    return uri;
  } catch (error) {
    console.error("❌ Video thumbnail generation failed:", error);
    return null;
  }
};

export default {
  uploadMedia,
  uploadProfilePicture,
  uploadUpdateMedia,
  uploadChatMedia,
  deleteMedia,
  getOptimizedImageUrl,
  validateMediaFile,
  getMediaType,
  compressImage,
  generateVideoThumbnail,
};
