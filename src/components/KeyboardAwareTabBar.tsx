// Keyboard-aware tab bar wrapper component
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

interface KeyboardAwareTabBarProps {
  children: React.ReactNode;
}

export const KeyboardAwareTabBar: React.FC<KeyboardAwareTabBarProps> = ({ children }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = () => {
      setIsKeyboardVisible(true);
    };

    const keyboardWillHide = () => {
      setIsKeyboardVisible(false);
    };

    const keyboardDidShow = () => {
      setIsKeyboardVisible(true);
    };

    const keyboardDidHide = () => {
      setIsKeyboardVisible(false);
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

  // Clone children and pass keyboard visibility as prop
  const childElement = children as React.ReactElement;
  const existingProps = childElement.props || {};
  return React.cloneElement(childElement, {
    ...existingProps,
    shouldHideTabBar: isKeyboardVisible,
  } as any);
};

export default KeyboardAwareTabBar;
