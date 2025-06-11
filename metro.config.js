const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ===== MOBILE-ONLY CONFIGURATION =====
// Platforms: Android & iOS only (no web support)
config.resolver.platforms = ['ios', 'android', 'native'];

// Mobile performance optimizations
config.transformer.hermesCommand = 'hermes';
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Mobile-specific asset extensions
config.resolver.assetExts.push(
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
);

// Mobile-specific source extensions
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Exclude web-specific files and directories
config.resolver.blockList = [
  /web-build\/.*/,
  /dist\/.*/,
  /public\/.*/,
  /\.expo\/web\/.*/
];

// Mobile-only transformer settings
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;