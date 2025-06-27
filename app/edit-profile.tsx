import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";

export default function EditProfileScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  // Form state
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.avatar || null);

  const handleSave = () => {
    // TODO: Implement save functionality with Redux/Firebase
    Alert.alert("Success", "Profile saved successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: () => console.log("Open camera") },
        { text: "Gallery", onPress: () => console.log("Open gallery") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header with Safe Area and Gradient */}
      <View
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 5,
          paddingBottom: 12,
          paddingHorizontal: 20,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
              Edit Profile
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={{ padding: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF'
            }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Photo Section */}
          <View style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 20,
            marginTop: 25,
            borderRadius: 20,
            paddingVertical: 35,
            alignItems: 'center',
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Profile Picture
            </Text>
            <TouchableOpacity onPress={handleChangePhoto} style={{ alignItems: 'center' }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: 'rgba(102, 126, 234, 0.2)',
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}>
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={{
                      width: 114,
                      height: 114,
                      borderRadius: 57,
                    }}
                  />
                ) : (
                  <Ionicons name="person" size={50} color="#667eea" />
                )}
                {/* Camera Icon Overlay */}
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#667eea',
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#667eea',
                textAlign: 'center',
              }}>
                Change Photo
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#9CA3AF',
                marginTop: 4,
                textAlign: 'center',
              }}>
                Tap to update your profile picture
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 20,
            marginTop: 25,
            borderRadius: 20,
            padding: 25,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            {/* Full Name */}
            <View style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="person-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Full Name
                </Text>
              </View>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={{
                  borderWidth: 2,
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 15,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#374151',
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  shadowColor: '#667eea',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Username */}
            <View style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="at-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Username
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'rgba(102, 126, 234, 0.2)',
                borderRadius: 15,
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <View style={{
                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                  borderTopLeftRadius: 13,
                  borderBottomLeftRadius: 13,
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: '#667eea',
                    fontWeight: '600',
                  }}>
                    @
                  </Text>
                </View>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={{
                    flex: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: '#374151',
                    backgroundColor: 'transparent',
                  }}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Bio */}
            <View style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="document-text-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Bio
                </Text>
              </View>
              <TextInput
                value={bio}
                onChangeText={setBio}
                style={{
                  borderWidth: 2,
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 15,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#374151',
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  minHeight: 120,
                  maxHeight: 240,
                  textAlignVertical: 'top',
                  shadowColor: '#667eea',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                maxLength={500}
              />
            </View>

            {/* Phone Number (Read-only) */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Phone Number
                </Text>
                <View style={{
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginLeft: 8,
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: '#9CA3AF',
                    fontWeight: '500',
                  }}>
                    READ ONLY
                  </Text>
                </View>
              </View>
              <View style={{
                borderWidth: 2,
                borderColor: 'rgba(156, 163, 175, 0.3)',
                borderRadius: 15,
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: 'rgba(156, 163, 175, 0.05)',
                opacity: 0.8,
              }}>
                <Text style={{
                  fontSize: 16,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  {currentUser?.phoneNumber || "+256 XXX XXX XXX"}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="lock-closed" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
                <Text style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  fontStyle: 'italic',
                }}>
                  Phone number cannot be changed for security
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
