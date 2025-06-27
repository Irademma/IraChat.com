import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  fontSize: number;
  highContrast: boolean;
  autoplayVideos: boolean;
  showCaptions: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isInvertColorsEnabled: false,
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  fontSize: 1,
  highContrast: false,
  autoplayVideos: true,
  showCaptions: true,
};

const STORAGE_KEY = "@accessibility_settings";

export const useAccessibility = () => {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading accessibility settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(
    async (newSettings: Partial<AccessibilitySettings>) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedSettings),
        );
        setSettings(updatedSettings);
      } catch (error) {
        console.error("Error saving accessibility settings:", error);
      }
    },
    [settings],
  );

  const updateFontSize = useCallback(
    (size: number) => {
      saveSettings({ fontSize: Math.max(0.8, Math.min(2, size)) });
    },
    [saveSettings],
  );

  const toggleHighContrast = useCallback(() => {
    saveSettings({ highContrast: !settings.highContrast });
  }, [settings.highContrast, saveSettings]);

  const toggleAutoPlayVideos = useCallback(() => {
    saveSettings({ autoplayVideos: !settings.autoplayVideos });
  }, [settings.autoplayVideos, saveSettings]);

  const toggleCaptions = useCallback(() => {
    saveSettings({ showCaptions: !settings.showCaptions });
  }, [settings.showCaptions, saveSettings]);

  const resetSettings = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Error resetting accessibility settings:", error);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (isEnabled) => {
        setSettings((prev) => ({ ...prev, isScreenReaderEnabled: isEnabled }));
      },
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (isEnabled) => {
        setSettings((prev) => ({ ...prev, isReduceMotionEnabled: isEnabled }));
      },
    );

    const reduceTransparencySubscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (isEnabled) => {
        setSettings((prev) => ({
          ...prev,
          isReduceTransparencyEnabled: isEnabled,
        }));
      },
    );

    const invertColorsSubscription = AccessibilityInfo.addEventListener(
      "invertColorsChanged",
      (isEnabled) => {
        setSettings((prev) => ({ ...prev, isInvertColorsEnabled: isEnabled }));
      },
    );

    const boldTextSubscription = AccessibilityInfo.addEventListener(
      "boldTextChanged",
      (isEnabled) => {
        setSettings((prev) => ({ ...prev, isBoldTextEnabled: isEnabled }));
      },
    );

    const grayscaleSubscription = AccessibilityInfo.addEventListener(
      "grayscaleChanged",
      (isEnabled) => {
        setSettings((prev) => ({ ...prev, isGrayscaleEnabled: isEnabled }));
      },
    );

    // Initial values
    Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isReduceTransparencyEnabled(),
      AccessibilityInfo.isInvertColorsEnabled(),
      AccessibilityInfo.isBoldTextEnabled(),
      AccessibilityInfo.isGrayscaleEnabled(),
    ]).then(
      ([
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        isReduceTransparencyEnabled,
        isInvertColorsEnabled,
        isBoldTextEnabled,
        isGrayscaleEnabled,
      ]) => {
        setSettings((prev) => ({
          ...prev,
          isScreenReaderEnabled,
          isReduceMotionEnabled,
          isReduceTransparencyEnabled,
          isInvertColorsEnabled,
          isBoldTextEnabled,
          isGrayscaleEnabled,
        }));
      },
    );

    return () => {
      screenReaderSubscription.remove();
      reduceMotionSubscription.remove();
      reduceTransparencySubscription.remove();
      invertColorsSubscription.remove();
      boldTextSubscription.remove();
      grayscaleSubscription.remove();
    };
  }, [loadSettings]);

  const getAccessibilityStyles = useCallback(() => {
    const styles: any = {};

    if (settings.isReduceMotionEnabled) {
      styles.animationDuration = "0s";
    }

    if (settings.isReduceTransparencyEnabled) {
      styles.opacity = 1;
    }

    if (settings.isInvertColorsEnabled) {
      styles.filter = "invert(100%)";
    }

    if (settings.isBoldTextEnabled) {
      styles.fontWeight = "bold";
    }

    if (settings.isGrayscaleEnabled) {
      styles.filter = "grayscale(100%)";
    }

    if (settings.highContrast) {
      styles.backgroundColor = "#000000";
      styles.color = "#FFFFFF";
    }

    if (settings.fontSize !== 1) {
      styles.fontSize = `${settings.fontSize}em`;
    }

    return styles;
  }, [settings]);

  return {
    settings,
    isLoading,
    updateFontSize,
    toggleHighContrast,
    toggleAutoPlayVideos,
    toggleCaptions,
    resetSettings,
    getAccessibilityStyles,
  };
};
