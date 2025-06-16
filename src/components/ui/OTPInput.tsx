import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChangeText?: (otp: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
  error?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  onChangeText,
  autoFocus = true,
  editable = true,
  error = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "");

    if (digit.length > 1) {
      // Handle paste operation
      const digits = digit.slice(0, length).split("");
      const newOtp = [...otp];

      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });

      setOtp(newOtp);

      // Focus on the next empty input or the last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);
      }

      const otpString = newOtp.join("");
      onChangeText?.(otpString);

      if (otpString.length === length) {
        onComplete(otpString);
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      const otpString = newOtp.join("");
      onChangeText?.(otpString);

      // Move to next input if digit is entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }

      // Call onComplete if all digits are filled
      if (otpString.length === length) {
        onComplete(otpString);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChangeText?.(newOtp.join(""));
      }
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const clearOTP = () => {
    setOtp(new Array(length).fill(""));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    onChangeText?.("");
  };

  return (
    <View>
      <View className="flex-row justify-center space-x-3">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: TextInput | null) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={editable}
            selectTextOnFocus
            className={`w-12 h-12 text-center text-xl border-2 rounded-lg ${
              error
                ? "border-red-400 bg-red-50"
                : activeIndex === index
                  ? "border-blue-500 bg-blue-50"
                  : digit
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
            }`}
            style={{
              fontWeight: "700",
              borderColor: error
                ? "#EF4444"
                : activeIndex === index
                  ? "#3B82F6"
                  : digit
                    ? "#667eea"
                    : "#D1D5DB",
              backgroundColor: error
                ? "#FEF2F2"
                : activeIndex === index
                  ? "#EFF6FF"
                  : digit
                    ? "#F0F4FF"
                    : "#FFFFFF",
            }}
          />
        ))}
      </View>

      {/* Clear button */}
      {otp.some((digit) => digit !== "") && (
        <TouchableOpacity onPress={clearOTP} className="mt-4 self-center">
          <Text className="text-blue-500 text-sm" style={{ fontWeight: "500" }}>
            Clear
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
