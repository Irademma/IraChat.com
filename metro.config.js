
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ULTRA-STRICT MOBILE-ONLY CONFIGURATION
config.resolver.platforms = ['ios', 'android', 'native'];

// Aggressive bundle optimization
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
    toplevel: true,
  },
  compress: {
    drop_console: true, // Remove console.logs in production
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
  },
};

// Strict asset handling - only bundle what's explicitly listed
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Exclude development files from bundling
config.resolver.blacklistRE = /.*\.(md|backup|log|tmp)$/;

// Tree shaking optimization
config.transformer.enableBabelRCLookup = false;

module.exports = config;
