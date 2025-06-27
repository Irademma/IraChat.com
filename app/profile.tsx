import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area



  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleDownloadedMedia = () => {
    router.push("/downloaded-media");
  };

  const handlePinnedMessages = () => {
    router.push("/pinned-messages");
  };

  const handleArchives = () => {
    router.push("/archives");
  };

  const handleInviteFriends = () => {
    router.push("/invite-friends");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🚪 Starting logout process...");

            // Dispatch logout action to clear Redux state
            dispatch(logout());

            // Navigate to welcome screen
            router.replace("/welcome");

            console.log("✅ Logout successful");
          } catch (error) {
            console.error("❌ Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header with Safe Area */}
      <View
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 5,
          paddingBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginTop: -3,
          }}>
            Profile
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Profile screen"
      >

        {/* Profile Info */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          marginTop: 15,
          borderRadius: 16,
          paddingVertical: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          {/* Avatar */}
          {(() => {
            const ProfileAvatar = require("../src/components/ProfileAvatar").ProfileAvatar;
            return (
              <ProfileAvatar
                user={{
                  id: currentUser?.id,
                  name: currentUser?.name || currentUser?.displayName || 'User',
                  avatar: currentUser?.avatar,
                  isOnline: true,
                }}
                size="xlarge"
                editable={true}
                onAvatarUpdate={(newAvatarUrl: string) => {
                  // Handle avatar update
                  console.log('Avatar updated:', newAvatarUrl);
                }}
                showOnlineStatus={false}
              />
            );
          })()}

          {/* User Info */}
          <Text style={{
            fontSize: 16,
            color: '#667eea',
            marginTop: 12,
            textAlign: 'center',
            fontWeight: '500',
          }}>
            {currentUser?.username || "@username"}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            marginTop: 4,
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            {currentUser?.phoneNumber || "+256 XXX XXX XXX"}
          </Text>
          {currentUser?.bio && (
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              marginTop: 6,
              paddingHorizontal: 20,
            }}>
              {currentUser.bio}
            </Text>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity
            onPress={() => router.push('/edit-profile')}
            style={{
              marginTop: 12,
              paddingHorizontal: 24,
              paddingVertical: 8,
              backgroundColor: '#667eea',
              borderRadius: 25,
              alignSelf: 'center',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: '500',
              fontSize: 16,
              textAlign: 'center',
            }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          marginTop: 15,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={handleEditProfile}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
          >
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: '#F0F9FF',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="create-outline" size={24} color="#667eea" />
            </View>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: '500',
              color: '#374151',
            }}>
              Edit Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Downloaded Media */}
          <TouchableOpacity
            onPress={handleDownloadedMedia}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Downloaded Media"
          >
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: '#DBEAFE',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="download-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: '500',
              color: '#374151',
            }}>
              Downloaded Media
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Pinned Messages */}
          <TouchableOpacity
            onPress={handlePinnedMessages}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Pinned Messages"
          >
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: '#FEF3C7',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="bookmark-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: '500',
              color: '#374151',
            }}>
              Pinned Messages
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Archives */}
          <TouchableOpacity
            onPress={handleArchives}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Archives"
          >
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: '#ECFDF5',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="archive-outline" size={24} color="#10B981" />
            </View>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: '500',
              color: '#374151',
            }}>
              Archives
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Invite Friends */}
          <TouchableOpacity
            onPress={handleInviteFriends}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Invite Friends"
          >
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: '#FDF2F8',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="share-outline" size={24} color="#EC4899" />
            </View>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: '500',
              color: '#374151',
            }}>
              Invite Friends
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={{
          alignItems: 'center',
          marginTop: 15,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              minWidth: 120,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <View style={{
              width: 32,
              height: 32,
              backgroundColor: '#FEE2E2',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={{
              fontSize: 16,
              fontWeight: '500',
              color: '#EF4444',
            }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
