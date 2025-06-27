import React from 'react';
import { View, ImageBackground, Dimensions, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatWallpaperProps {
  children: React.ReactNode;
  opacity?: number;
}

export const ChatWallpaper: React.FC<ChatWallpaperProps> = ({ 
  children, 
  opacity = 0.1 
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  
  // Get the status bar height
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0;
  
  // Calculate total height including status bar and safe areas
  const totalHeight = height + statusBarHeight;

  return (
    <View style={{ flex: 1 }}>
      {/* Tiled Background - covers entire screen including behind status bar */}
      <View 
        style={{
          position: 'absolute',
          top: -statusBarHeight, // Start from behind status bar
          left: 0,
          right: 0,
          height: totalHeight,
          zIndex: -1,
        }}
      >
        <ImageBackground
          source={require('../../assets/images/BACKGROUND.png')}
          style={{
            width: '100%',
            height: '100%',
            opacity: opacity,
          }}
          resizeMode="repeat" // This creates the tiled effect
          imageStyle={{
            // Ensure the image tiles properly
            resizeMode: 'repeat',
          }}
        />
        
        {/* Optional overlay for better text readability */}
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light overlay
          }}
        />
      </View>

      {/* Content with safe area */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default ChatWallpaper;
