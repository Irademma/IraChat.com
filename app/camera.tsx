// 📸 Camera Route - For standalone camera access
// This allows direct navigation to camera from anywhere in the app

import { useRouter } from 'expo-router';
import React from 'react';
import { CameraScreen } from '../src/components/CameraScreen';

export default function CameraRoute() {
  const router = useRouter();

  const handleMediaCaptured = (uri: string, type: 'photo' | 'video') => {
    console.log('📸 Media captured from camera route:', { uri, type });
    
    // Navigate back with the captured media
    router.back();
    
    // You can pass the media data back to the calling screen
    // This would typically be handled through navigation params or global state
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CameraScreen
      onMediaCaptured={handleMediaCaptured}
      onClose={handleClose}
    />
  );
}
