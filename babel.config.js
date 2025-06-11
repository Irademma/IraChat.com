module.exports = function(api) {
  api.cache(true);
  return {
    // Mobile-only preset (no web support)
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated (must be last)
      'react-native-reanimated/plugin',
      // NativeWind for mobile styling
      'nativewind/babel',
      // Environment variables for mobile
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }]
    ],
    // Mobile-only environment settings
    env: {
      production: {
        plugins: [
          'react-native-reanimated/plugin',
          'nativewind/babel'
        ]
      }
    }
  };
};
