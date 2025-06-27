import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface GroupHeaderProps {
  groupName: string;
  groupAvatar: string;
  memberCount: number;
  admins: Array<{ id: string; name: string; username: string }>;
  mostActiveUser?: {
    id: string;
    name: string;
    avatar: string;
    isVisible: boolean; // 24-hour visibility cycle
  };
  onGroupProfilePress: () => void;
  onBack: () => void;
  isScrolled: boolean; // For scroll-aware hiding
}

export const AdvancedGroupHeader: React.FC<GroupHeaderProps> = ({
  groupName,
  groupAvatar,
  memberCount,
  admins,
  mostActiveUser,
  onGroupProfilePress,
  onBack,
  isScrolled,
}) => {
  const [showAdminList, setShowAdminList] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [showMostActiveText, setShowMostActiveText] = useState(false);
  const [mostActiveTextTaps, setMostActiveTextTaps] = useState(0);

  // Animations
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const adminListAnimation = useRef(new Animated.Value(0)).current;
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const mostActiveTextAnimation = useRef(new Animated.Value(0)).current;

  // Scroll-aware header hiding
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: isScrolled ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isScrolled]);

  // Handle most active member avatar tap
  const handleMostActiveTap = () => {
    const newTapCount = mostActiveTextTaps + 1;
    setMostActiveTextTaps(newTapCount);

    if (newTapCount % 2 === 1) {
      // Odd taps: Show text
      setShowMostActiveText(true);
      Animated.timing(mostActiveTextAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Even taps: Hide text
      Animated.timing(mostActiveTextAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowMostActiveText(false);
      });
    }
  };

  // Toggle admin list
  const toggleAdminList = () => {
    const newState = !showAdminList;
    setShowAdminList(newState);

    Animated.timing(adminListAnimation, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Toggle dropdown menu
  const toggleDropdownMenu = () => {
    const newState = !showDropdownMenu;
    setShowDropdownMenu(newState);

    Animated.timing(dropdownAnimation, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: headerOpacity,
        backgroundColor: "#667eea",
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Left Side - Group Profile & Most Active */}
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {/* Back Button */}
        <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Group Profile Picture */}
        <TouchableOpacity
          onPress={onGroupProfilePress}
          style={{ position: "relative" }}
        >
          <Image
            source={{ uri: groupAvatar }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#8B9FEE",
            }}
          />

          {/* Most Active Member Avatar (Stacked 50% overlap) */}
          {mostActiveUser?.isVisible && (
            <TouchableOpacity
              onPress={handleMostActiveTap}
              style={{
                position: "absolute",
                right: -10,
                bottom: -5,
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "white",
              }}
            >
              <Image
                source={{ uri: mostActiveUser.avatar }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#8B9FEE",
                }}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Group Info */}
        <TouchableOpacity
          onPress={onGroupProfilePress}
          style={{ marginLeft: 12, flex: 1 }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {groupName}
          </Text>
          <Text style={{ color: "#E0E7FF", fontSize: 12 }}>
            {memberCount} members
          </Text>
        </TouchableOpacity>

      {/* Right Side - Admin Toggle & Menu */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Admin Toggle Icon */}
        <TouchableOpacity onPress={toggleAdminList} style={{ marginRight: 12 }}>
          <Ionicons name="shield-checkmark" size={20} color="white" />
        </TouchableOpacity>

        {/* 3-Dot Menu */}
        <TouchableOpacity onPress={toggleDropdownMenu}>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Most Active Member Text (Positioned to the right) */}
      {showMostActiveText && mostActiveUser && (
        <Animated.View
          style={{
            position: "absolute",
            right: 16,
            top: 80,
            backgroundColor: "rgba(135, 206, 235, 0.9)", // Sky blue
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: mostActiveTextAnimation,
            transform: [
              {
                translateY: mostActiveTextAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>
            This is the most active member in the group in the last seven days.
          </Text>
        </Animated.View>
      )}

      {/* Admin List Overlay */}
      {showAdminList && (
        <Animated.View
          style={{
            position: "absolute",
            top: 70,
            right: 50,
            backgroundColor: "white",
            borderRadius: 8,
            padding: 12,
            minWidth: 150,
            opacity: adminListAnimation,
            transform: [
              {
                scale: adminListAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
              color: "#333",
            }}
          >
            Admins
          </Text>
          {admins.map((admin, index) => (
            <Text
              key={admin.id}
              style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
            >
              {admin.username}
            </Text>
          ))}
        </Animated.View>
      )}

      {/* Dropdown Menu */}
      {showDropdownMenu && (
        <Animated.View
          style={{
            position: "absolute",
            top: 70,
            right: 16,
            backgroundColor: "white",
            borderRadius: 8,
            padding: 8,
            minWidth: 120,
            opacity: dropdownAnimation,
            transform: [
              {
                scale: dropdownAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            style={{ paddingVertical: 8, paddingHorizontal: 12 }}
          >
            <Text style={{ fontSize: 14, color: "#333" }}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 8, paddingHorizontal: 12 }}
          >
            <Text style={{ fontSize: 14, color: "#333" }}>Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};
