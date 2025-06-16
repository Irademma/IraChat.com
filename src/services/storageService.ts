import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "./firebaseSimple";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface MediaUploadResult {
  url: string;
  path: string;
  metadata: {
    size: number;
    contentType: string;
    timeCreated: string;
  };
}

class StorageService {
  /**
   * Upload media file to Firebase Storage with progress tracking
   */
  async uploadMedia(
    file: Blob | File,
    path: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaUploadResult> {
    try {
      if (!storage) {
        throw new Error("Firebase Storage not initialized");
      }

      console.log("📤 Starting media upload to:", path);

      const storageRef = ref(storage, path);

      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress:
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error("❌ Upload error:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref,
                );
                const metadata = uploadTask.snapshot.metadata;

                resolve({
                  url: downloadURL,
                  path: uploadTask.snapshot.ref.fullPath,
                  metadata: {
                    size: metadata.size || 0,
                    contentType:
                      metadata.contentType || "application/octet-stream",
                    timeCreated:
                      metadata.timeCreated || new Date().toISOString(),
                  },
                });
              } catch (urlError) {
                console.error("❌ Error getting download URL:", urlError);
                reject(urlError);
              }
            },
          );
        });
      } else {
        // Simple upload without progress
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
          url: downloadURL,
          path: snapshot.ref.fullPath,
          metadata: {
            size: snapshot.metadata.size || 0,
            contentType:
              snapshot.metadata.contentType || "application/octet-stream",
            timeCreated:
              snapshot.metadata.timeCreated || new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error("❌ Media upload failed:", error);
      throw error;
    }
  }

  /**
   * Generate unique file path for media uploads
   */
  generateMediaPath(
    userId: string,
    type: "images" | "videos" | "audio" | "documents",
    fileName: string,
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split(".").pop() || "";

    return `media/${type}/${userId}/${timestamp}_${randomId}.${extension}`;
  }

  /**
   * Generate unique path for profile pictures
   */
  generateProfilePicturePath(userId: string, fileName: string): string {
    const timestamp = Date.now();
    const extension = fileName.split(".").pop() || "jpg";

    return `profiles/${userId}/avatar_${timestamp}.${extension}`;
  }

  /**
   * Generate unique path for group pictures
   */
  generateGroupPicturePath(groupId: string, fileName: string): string {
    const timestamp = Date.now();
    const extension = fileName.split(".").pop() || "jpg";

    return `groups/${groupId}/avatar_${timestamp}.${extension}`;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    userId: string,
    file: Blob | File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaUploadResult> {
    const fileName = file instanceof File ? file.name : "profile.jpg";
    const path = this.generateProfilePicturePath(userId, fileName);

    return this.uploadMedia(file, path, onProgress);
  }

  /**
   * Upload group picture
   */
  async uploadGroupPicture(
    groupId: string,
    file: Blob | File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaUploadResult> {
    const fileName = file instanceof File ? file.name : "group.jpg";
    const path = this.generateGroupPicturePath(groupId, fileName);

    return this.uploadMedia(file, path, onProgress);
  }

  /**
   * Upload chat media (images, videos, documents)
   */
  async uploadChatMedia(
    userId: string,
    file: Blob | File,
    type: "images" | "videos" | "audio" | "documents",
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaUploadResult> {
    const fileName =
      file instanceof File
        ? file.name
        : `media.${type === "images" ? "jpg" : type === "videos" ? "mp4" : type === "audio" ? "mp3" : "bin"}`;
    const path = this.generateMediaPath(userId, type, fileName);

    return this.uploadMedia(file, path, onProgress);
  }

  /**
   * Upload update media (for Updates/Stories feature)
   */
  async uploadUpdateMedia(
    userId: string,
    file: Blob | File,
    type: "images" | "videos",
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaUploadResult> {
    const fileName =
      file instanceof File
        ? file.name
        : `update.${type === "images" ? "jpg" : "mp4"}`;
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split(".").pop() || "";

    const path = `updates/${userId}/${timestamp}_${randomId}.${extension}`;

    return this.uploadMedia(file, path, onProgress);
  }
}

export const storageService = new StorageService();
export default storageService;
