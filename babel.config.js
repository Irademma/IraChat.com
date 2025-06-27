
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Mobile-only plugins
      'react-native-reanimated/plugin',
    ],
  };
};
