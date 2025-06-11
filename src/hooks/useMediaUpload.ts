import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { useCallback, useState } from 'react';
import { storage } from '../services/firebase';

interface UploadProgress {
  progress: number;
  totalBytes: number;
  bytesTransferred: number;
}

interface UseMediaUploadProps {
  onUploadComplete?: (url: string, thumbnailUrl?: string) => void;
  onUploadError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export const useMediaUpload = ({
  onUploadComplete,
  onUploadError,
  onProgress,
}: UseMediaUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const pickMedia = useCallback(async (type: 'image' | 'video') => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Error picking media:', error);
      onUploadError?.(error as Error);
      return null;
    }
  }, [onUploadError]);

  const compressImage = useCallback(async (uri: string) => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }, []);

  const generateVideoThumbnail = useCallback(async (uri: string) => {
    try {
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 0,
        quality: 0.8,
      });
      return thumbnailUri;
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      return null;
    }
  }, []);

  const uploadMedia = useCallback(async (uri: string, type: 'image' | 'video') => {
    try {
      setIsUploading(true);
      setUploadProgress(null);

      // Compress image if needed
      const mediaUri = type === 'image' ? await compressImage(uri) : uri;

      // Generate thumbnail for video
      const thumbnailUri = type === 'video' ? await generateVideoThumbnail(uri) : null;

      // Upload media
      const mediaRef = ref(storage, `updates/${Date.now()}_${Math.random().toString(36).substring(7)}`);
      const response = await fetch(mediaUri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(mediaRef, blob);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = {
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              totalBytes: snapshot.totalBytes,
              bytesTransferred: snapshot.bytesTransferred,
            };
            setUploadProgress(progress);
            onProgress?.(progress);
          },
          (error) => {
            setIsUploading(false);
            setUploadProgress(null);
            reject(error);
            onUploadError?.(error);
          },
          async () => {
            const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
            let thumbnailUrl: string | undefined;

            if (thumbnailUri) {
              const thumbnailRef = ref(storage, `thumbnails/${Date.now()}_${Math.random().toString(36).substring(7)}`);
              const thumbnailResponse = await fetch(thumbnailUri);
              const thumbnailBlob = await thumbnailResponse.blob();
              await uploadBytes(thumbnailRef, thumbnailBlob);
              thumbnailUrl = await getDownloadURL(thumbnailRef);
            }

            setIsUploading(false);
            setUploadProgress(null);
            onUploadComplete?.(mediaUrl, thumbnailUrl);
            resolve(mediaUrl);
          }
        );
      });
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(null);
      console.error('Error uploading media:', error);
      onUploadError?.(error as Error);
      throw error;
    }
  }, [compressImage, generateVideoThumbnail, onProgress, onUploadComplete, onUploadError]);

  return {
    isUploading,
    uploadProgress,
    pickMedia,
    uploadMedia,
  };
}; 