module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // NativeWind for styling
      "nativewind/babel",
      // React Native Reanimated (must be last)
      "react-native-reanimated/plugin",
    ],
  };
};
