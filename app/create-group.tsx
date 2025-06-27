import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { db } from "../src/services/firebaseSimple";
import optimizedContactsService from "../src/services/optimizedContactsService";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
  userId?: string;
}

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPhoto, setGroupPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const router = useRouter();

  // Get current user from Redux
  const currentUser = { id: "current-user", name: "You" }; // Simplified for now

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select photos.');
    }
  };

  // Handle image picker
  const handleImagePicker = () => {
    Alert.alert(
      "Change Group Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () => openCamera()
        },
        {
          text: "Gallery",
          onPress: () => openGallery()
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupPhoto(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupPhoto(result.assets[0].uri);
    }
  };

  // Load contacts on component mount
  const loadContacts = async () => {
    try {
      const contactsList = await optimizedContactsService.getRegisteredContacts();
      setContacts(contactsList);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (contact: Contact) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(m => m.id === contact.id);
      if (isSelected) {
        return prev.filter(m => m.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      // Create participants array with current user and selected members
      const participants = [
        currentUser.id,
        ...selectedMembers.map(member => member.userId || member.id)
      ];

      // Create group document
      const groupDoc = await addDoc(collection(db, "groups"), {
        name: groupName.trim(),
        description: groupDescription.trim() || "",
        photo: groupPhoto || "",
        createdBy: currentUser.id,
        participants,
        admins: [currentUser.id], // Creator is admin
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        memberCount: participants.length,
        isActive: true,
      });

      // Also create a chat for this group
      await addDoc(collection(db, "chats"), {
        groupId: groupDoc.id,
        name: groupName.trim(),
        description: groupDescription.trim() || "",
        photo: groupPhoto || "",
        isGroup: true,
        participants,
        lastMessage: `Group "${groupName.trim()}" was created`,
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        createdBy: currentUser.id,
      });

      Alert.alert(
        "Success",
        `Group "${groupName.trim()}" created successfully with ${selectedMembers.length} members!`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              Create New Group
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 2,
            }}>
              Add group photo and select members
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 25,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Group Photo Picker */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 25,
            marginBottom: 20,
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
            }}>
              Group Photo
            </Text>

            <TouchableOpacity
              onPress={handleImagePicker}
              style={{ alignItems: 'center' }}
            >
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                borderWidth: 3,
                borderColor: 'rgba(102, 126, 234, 0.2)',
                borderStyle: groupPhoto ? 'solid' : 'dashed',
              }}>
                {groupPhoto ? (
                  <Image
                    source={{ uri: groupPhoto }}
                    style={{ width: 114, height: 114, borderRadius: 57 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="people" size={40} color="#667eea" />
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
                }}>
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              </View>

              <Text style={{
                fontSize: 14,
                color: '#667eea',
                fontWeight: '600',
              }}>
                {groupPhoto ? 'Change Photo' : 'Add Group Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 25,
            marginBottom: 20,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            {/* Group Name */}
            <View style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="text-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Group Name *
                </Text>
              </View>
              <TextInput
                placeholder="Enter group name..."
                value={groupName}
                onChangeText={setGroupName}
                style={{
                  borderWidth: 2,
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 15,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#374151',
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                }}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                maxLength={50}
              />
            </View>

            {/* Group Description */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="document-text-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Description (Optional)
                </Text>
              </View>
              <TextInput
                placeholder="Enter group description..."
                value={groupDescription}
                onChangeText={setGroupDescription}
                style={{
                  borderWidth: 2,
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 15,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#374151',
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  height: 80,
                  textAlignVertical: 'top',
                }}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                maxLength={200}
              textAlignVertical="top"
            />
          </View>
        </View>

          {/* Member Selection */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 25,
            marginBottom: 20,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="people-outline" size={20} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                  flex: 1,
                }}>
                  Add Members ({selectedMembers.length} selected)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/select-group-members",
                    params: {
                      selectedMembers: JSON.stringify(selectedMembers)
                    }
                  });
                }}
                style={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-add" size={16} color="#667eea" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: '#667eea',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    Select Group Members
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Selected Members Preview */}
            {selectedMembers.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginBottom: 12,
                  fontWeight: '500',
                }}>
                  Selected members:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {selectedMembers.map((member) => (
                    <View
                      key={member.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginRight: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                      }}
                    >
                      <Text style={{
                        color: '#667eea',
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        {member.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleMemberSelection(member)}
                        style={{ marginLeft: 8, padding: 2 }}
                      >
                        <Ionicons name="close-circle" size={16} color="#667eea" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}


          </View>

          {/* Create Button - Scrollable */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 25,
            marginBottom: 20,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={loading || !groupName.trim()}
              style={{
                backgroundColor: (loading || !groupName.trim()) ? '#9CA3AF' : '#667eea',
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 16,
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: (loading || !groupName.trim()) ? 0 : 0.3,
                shadowRadius: 8,
                elevation: (loading || !groupName.trim()) ? 0 : 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
              }}>
                {loading ? "Creating Group..." : "Create Group"}
              </Text>
            </TouchableOpacity>

            {/* Info */}
            <View style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
            }}>
              <Text style={{
                color: '#667eea',
                fontSize: 14,
                textAlign: 'center',
                fontWeight: '500',
              }}>
                You can add more members to the group after creating it
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
