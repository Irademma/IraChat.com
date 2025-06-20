import { signOut } from "firebase/auth";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import { auth } from "../services/firebaseSimple";
import { RootState } from "../types";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Profile editing will be available soon.");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            if (auth) {
              if (auth) {
                await signOut(auth);
              }
            }
            dispatch(logout());
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="bg-blue-500 px-6 py-8">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            {currentUser?.avatar ? (
              <Image
                source={{ uri: currentUser.avatar }}
                className="w-20 h-20 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text
                className="text-blue-500 text-2xl"
                style={{ fontWeight: "700" }}
              >
                {(currentUser?.name || currentUser?.displayName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            )}
          </View>
          <Text
            className="text-white text-xl mb-1"
            style={{ fontWeight: "700" }}
          >
            {currentUser?.name || currentUser?.displayName || "User"}
          </Text>
          <Text className="text-blue-100 text-sm">
            {currentUser?.phoneNumber}
          </Text>
          <Text className="text-blue-200 text-xs mt-2 text-center">
            {currentUser?.status || "I Love IraChat"}
          </Text>
        </View>
      </View>

      {/* Profile Options */}
      <View className="px-4 py-6">
        <TouchableOpacity
          onPress={handleEditProfile}
          className="flex-row items-center py-4 px-4 bg-gray-50 rounded-lg mb-3"
        >
          <Image
            source={require("../../assets/images/profile.png")}
            className="w-6 h-6 mr-4"
            style={{ tintColor: "#6B7280" }}
            resizeMode="contain"
          />
          <Text
            className="text-gray-800 text-base flex-1"
            style={{ fontWeight: "500" }}
          >
            Edit Profile
          </Text>
          <Text className="text-gray-400 text-lg">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Privacy settings will be available soon.",
            )
          }
          className="flex-row items-center py-4 px-4 bg-gray-50 rounded-lg mb-3"
        >
          <Image
            source={require("../../assets/images/setting.png")}
            className="w-6 h-6 mr-4"
            style={{ tintColor: "#6B7280" }}
            resizeMode="contain"
          />
          <Text
            className="text-gray-800 text-base flex-1"
            style={{ fontWeight: "500" }}
          >
            Privacy
          </Text>
          <Text className="text-gray-400 text-lg">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Notification settings will be available soon.",
            )
          }
          className="flex-row items-center py-4 px-4 bg-gray-50 rounded-lg mb-3"
        >
          <Image
            source={require("../../assets/images/notification.png")}
            className="w-6 h-6 mr-4"
            style={{ tintColor: "#6B7280" }}
            resizeMode="contain"
          />
          <Text
            className="text-gray-800 text-base flex-1"
            style={{ fontWeight: "500" }}
          >
            Notifications
          </Text>
          <Text className="text-gray-400 text-lg">›</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="px-4 py-4 border-t border-gray-200">
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/images/LOGO.png")}
            className="w-12 h-12 mb-2"
            resizeMode="contain"
          />
          <Text className="text-gray-600 text-sm">IraChat v1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-3 px-6 rounded-lg mx-4"
        >
          <Text
            className="text-white text-center text-base"
            style={{ fontWeight: "600" }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
