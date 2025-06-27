import React from 'react';
import { 
  View, 
  ImageBackground, 
  Dimensions, 
  StatusBar, 
  Platform,
  StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IraChatWallpaperProps {
  children: React.ReactNode;
  opacity?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  tileSize?: 'small' | 'medium' | 'large' | 'original';
  blur?: boolean;
}

export const IraChatWallpaper: React.FC<IraChatWallpaperProps> = ({ 
  children, 
  opacity = 0.15,
  overlayColor = '#FFFFFF',
  overlayOpacity = 0.7,
  tileSize = 'medium',
  blur = false
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('screen'); // Use 'screen' to include status bar
  
  // Calculate the tile scale based on tileSize prop
  const getTileScale = () => {
    switch (tileSize) {
      case 'small': return 0.5;
      case 'medium': return 1;
      case 'large': return 1.5;
      case 'original': return 1;
      default: return 1;
    }
  };

  const tileScale = getTileScale();

  return (
    <View style={styles.container}>
      {/* Full Screen Tiled Background */}
      <View style={[styles.backgroundContainer, { width, height }]}>
        <ImageBackground
          source={require('../../assets/images/BACKGROUND.png')}
          style={[
            styles.backgroundImage,
            {
              opacity: opacity,
              transform: [{ scale: tileScale }],
            }
          ]}
          resizeMode="repeat"
          imageStyle={[
            styles.imageStyle,
            blur && styles.blurEffect
          ]}
        >
          {/* Overlay for better readability */}
          <View 
            style={[
              styles.overlay,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              }
            ]}
          />
        </ImageBackground>
      </View>

      {/* Content Container with Safe Area */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'repeat',
  },
  blurEffect: {
    // Note: For actual blur effect, you'd need react-native-blur or similar
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
});

export default IraChatWallpaper;
