// Keyboard-aware tab bar hook
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

interface KeyboardInfo {
  isVisible: boolean;
  height: number;
}

export const useKeyboardAwareTabBar = () => {
  const [keyboard, setKeyboard] = useState<KeyboardInfo>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      setKeyboard({
        isVisible: true,
        height: event.endCoordinates.height,
      });
    };

    const keyboardWillHide = () => {
      setKeyboard({
        isVisible: false,
        height: 0,
      });
    };

    const keyboardDidShow = (event: any) => {
      setKeyboard({
        isVisible: true,
        height: event.endCoordinates.height,
      });
    };

    const keyboardDidHide = () => {
      setKeyboard({
        isVisible: false,
        height: 0,
      });
    };

    // Use appropriate events for each platform
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideListener = Keyboard.addListener(hideEvent, keyboardWillHide);

    // Also listen to the other events for better coverage
    const didShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const didHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showListener?.remove();
      hideListener?.remove();
      didShowListener?.remove();
      didHideListener?.remove();
    };
  }, []);

  return keyboard;
};

// Hook specifically for tab bar visibility
export const useTabBarVisibility = () => {
  const keyboard = useKeyboardAwareTabBar();
  
  // Hide tab bar when keyboard is visible
  const shouldHideTabBar = keyboard.isVisible;
  
  return {
    shouldHideTabBar,
    keyboardHeight: keyboard.height,
    isKeyboardVisible: keyboard.isVisible,
  };
};
