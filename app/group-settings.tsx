import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isAdmin: boolean;
  lastSeen?: Date;
}

interface GroupSettings {
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  notifications: boolean;
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const groupName = params.groupName as string || "Group Settings";
  const groupAvatar = params.groupAvatar as string || "";
  const groupId = params.groupId as string || "";

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [settings, setSettings] = useState<GroupSettings>({
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    notifications: true,
  });
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(true);

  // Sample members data
  useEffect(() => {
    const sampleMembers: GroupMember[] = [
      {
        id: 'current-user',
        name: 'You',
        isOnline: true,
        isAdmin: true,
      },
      {
        id: 'alice',
        name: 'Alice Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=10B981&color=fff',
        isOnline: true,
        isAdmin: false,
      },
      {
        id: 'bob',
        name: 'Bob Smith',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=3B82F6&color=fff',
        isOnline: false,
        isAdmin: false,
        lastSeen: new Date(Date.now() - 3600000),
      },
      {
        id: 'charlie',
        name: 'Charlie Brown',
        avatar: 'https://ui-avatars.com/api/?name=Charlie+Brown&background=F59E0B&color=fff',
        isOnline: true,
        isAdmin: false,
      },
    ];
    setMembers(sampleMembers);
  }, []);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSettingToggle = (setting: keyof GroupSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleMemberPress = (member: GroupMember) => {
    if (member.id === 'current-user') return;
    
    Alert.alert(
      member.name,
      `What would you like to do?`,
      [
        { text: "View Profile", onPress: () => console.log("View profile") },
        { text: "Send Message", onPress: () => console.log("Send message") },
        ...(isCurrentUserAdmin && member.id !== 'current-user' ? [
          { text: member.isAdmin ? "Remove Admin" : "Make Admin", onPress: () => console.log("Toggle admin") },
          { text: "Remove from Group", style: "destructive" as const, onPress: () => console.log("Remove member") }
        ] : []),
        { text: "Cancel", style: "cancel" as const }
      ]
    );
  };

  const renderMember = (member: GroupMember) => (
    <TouchableOpacity
      key={member.id}
      onPress={() => handleMemberPress(member)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 2,
        borderRadius: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {member.avatar ? (
          <Image
            source={{ uri: member.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{
            color: '#6B7280',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            {member.name.charAt(0)}
          </Text>
        )}
        
        {member.isOnline && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#10B981',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }} />
        )}
      </View>
      
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1F2937',
            marginRight: 8,
          }}>
            {member.name}
          </Text>
          {member.isAdmin && (
            <View style={{
              backgroundColor: '#667eea',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '600',
              }}>
                ADMIN
              </Text>
            </View>
          )}
        </View>
        
        <Text style={{
          fontSize: 14,
          color: member.isOnline ? '#10B981' : '#6B7280',
          marginTop: 2,
        }}>
          {member.isOnline ? 'Online' : member.lastSeen ? 
            `Last seen ${member.lastSeen.toLocaleDateString()}` : 'Offline'}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: () => void,
    icon: string
  ) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: '#FFFFFF',
      marginHorizontal: 16,
      marginVertical: 2,
      borderRadius: 12,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={20} color="#667eea" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1F2937',
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          marginTop: 2,
        }}>
          {subtitle}
        </Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#667eea' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header */}
      <Animated.View style={{
        backgroundColor: '#667eea',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        opacity: fadeAnim,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={{
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: '600',
          flex: 1,
        }}>
          Group Settings
        </Text>
        
        {isCurrentUserAdmin && (
          <TouchableOpacity
            onPress={() => Alert.alert("Edit Group", "Edit group functionality")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </Animated.View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Group Info Section */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 16,
            marginTop: 20,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <TouchableOpacity
              onPress={() => isCurrentUserAdmin && Alert.alert("Change Photo", "Change group photo functionality")}
              style={{ position: 'relative' }}
            >
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                {groupAvatar ? (
                  <Image
                    source={{ uri: groupAvatar }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="people" size={40} color="#6B7280" />
                )}
              </View>
              
              {isCurrentUserAdmin && (
                <View style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#667eea',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                }}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => isCurrentUserAdmin && Alert.alert("Change Name", "Change group name functionality")}
            >
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#1F2937',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                {groupName}
              </Text>
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {members.length} members • {members.filter(m => m.isOnline).length} online
            </Text>
            
            {/* IraChat Branding */}
            <View style={{
              backgroundColor: '#F0F9FF',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#667eea',
            }}>
              <Text style={{
                color: '#667eea',
                fontSize: 14,
                fontWeight: '600',
              }}>
                IraChat
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937',
            marginHorizontal: 20,
            marginBottom: 12,
          }}>
            Group Settings
          </Text>
          
          {renderSettingItem(
            "Mute Notifications",
            "Stop receiving notifications from this group",
            settings.isMuted,
            () => handleSettingToggle('isMuted'),
            "notifications-off"
          )}
          
          {renderSettingItem(
            "Archive Group",
            "Hide this group from your chat list",
            settings.isArchived,
            () => handleSettingToggle('isArchived'),
            "archive"
          )}
          
          {renderSettingItem(
            "Block Group",
            "Block all messages from this group",
            settings.isBlocked,
            () => handleSettingToggle('isBlocked'),
            "ban"
          )}
        </View>

        {/* Members Section */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 20,
            marginBottom: 12,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
            }}>
              Members ({members.length})
            </Text>
            
            {isCurrentUserAdmin && (
              <TouchableOpacity
                onPress={() => Alert.alert("Add Member", "Add member functionality")}
                style={{
                  backgroundColor: '#667eea',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Add Member
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {members.map(renderMember)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
