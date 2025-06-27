import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { GroupsHeader } from "../../src/components/GroupsHeader";

interface Group {
  id: string;
  name: string;
  description?: string; // Add description property
  logo?: string;
  avatar?: string; // Add avatar property for compatibility
  memberCount: number;
  lastMessage: string;
  lastMessageTime?: string;
  lastMessageAt?: Date; // Add for compatibility
  lastMessageBy?: string;
  usageFrequency: number; // Higher number = more frequently used
  isActive: boolean;
  isPinned?: boolean; // Add isPinned property
}

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Test groups for functionality testing
  const testGroups: Group[] = [
    {
      id: 'test-group-1',
      name: 'Project Team',
      description: 'Main project discussion group',
      avatar: 'https://ui-avatars.com/api/?name=Project+Team&background=667eea&color=fff',
      memberCount: 5,
      lastMessage: 'Let\'s schedule the meeting for tomorrow',
      lastMessageBy: 'Alice',
      lastMessageAt: new Date(Date.now() - 300000), // 5 minutes ago
      isPinned: true,
      usageFrequency: 95,
      isActive: true
    },
    {
      id: 'test-group-2',
      name: 'Friends Chat',
      description: 'Casual conversations with friends',
      avatar: 'https://ui-avatars.com/api/?name=Friends+Chat&background=10B981&color=fff',
      memberCount: 8,
      lastMessage: 'Anyone up for dinner tonight?',
      lastMessageBy: 'Bob',
      lastMessageAt: new Date(Date.now() - 1800000), // 30 minutes ago
      isPinned: false,
      usageFrequency: 78,
      isActive: true
    }
  ];

  // Mock data for testing (additive, doesn't replace live functionality)
  const { mockGroups, shouldUseMockData } = require("../../src/hooks/useMockData").useMockGroups();

  // Tab navigation with smooth animations
  // const { handleSwipeGesture } = useTabNavigation();

  // Animation for floating action button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation on mount
  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulseAnimation();
  }, []);

  // Real groups will be loaded from Firebase

  const filterGroups = useCallback(() => {
    // Start with test groups for functionality testing
    let allGroups = [...testGroups, ...groups];

    // Add mock data if enabled and available (only when no real groups exist)
    if (shouldUseMockData && mockGroups && mockGroups.length > 0 && allGroups.length === 0) {
      // Convert mock groups to Group format and add them
      const convertedMockGroups = mockGroups.map((mockGroup: any) => ({
        id: `mock_${mockGroup.id}`,
        name: mockGroup.name,
        description: mockGroup.description,
        avatar: mockGroup.avatar,
        memberCount: mockGroup.memberCount,
        lastMessage: `${mockGroup.members[0]?.name || 'Someone'}: Welcome to ${mockGroup.name}!`,
        lastMessageAt: mockGroup.lastActivity,
        lastMessageBy: mockGroup.members[0]?.name || 'Admin',
        usageFrequency: Math.floor(Math.random() * 100),
        isActive: mockGroup.lastActivity > new Date(Date.now() - 86400000) // Active if last activity within 24h
      }));

      // Only add mock groups when no real groups exist (not overriding)
      allGroups = [...convertedMockGroups];
      console.log(`📊 Added ${convertedMockGroups.length} mock groups for testing (no real groups found)`);
    }

    if (searchQuery.trim() === "") {
      setFilteredGroups(allGroups);
    } else {
      const filtered = allGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups, shouldUseMockData, mockGroups]);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [filterGroups]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      // Load real groups from Firebase
      const { collection, query, where, orderBy, getDocs } = await import(
        "firebase/firestore"
      );
      const { auth, db } = await import("../../src/services/firebaseSimple");

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        console.log("⚠️ No authenticated user, showing empty groups list");
        setGroups([]);
        setIsLoading(false);
        return;
      }

      // Query groups where user is a participant
      const groupsQuery = query(
        collection(db, "groups"),
        where("participants", "array-contains", currentUser.uid),
        orderBy("lastMessageAt", "desc"),
      );

      const snapshot = await getDocs(groupsQuery);
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];

      console.log("✅ Groups loaded from Firebase:", groupsData.length);
      setGroups(groupsData);
    } catch (error) {
      console.error("❌ Error loading groups:", error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadGroups();
      setRefreshing(false);
    }, 1000);
  };

  const handleGroupPress = (group: Group) => {
    try {
      // Navigate to enhanced group chat
      router.push({
        pathname: "/enhanced-group-chat",
        params: {
          groupId: group.id,
          groupName: group.name,
          groupAvatar: group.avatar || "",
        }
      });
    } catch (error) {
      Alert.alert("Error", "Failed to open group chat");
      console.error("Group navigation error:", error);
    }
  };

  // No animation effects
  const animatePress = () => {
    // No animation
    scaleAnim.setValue(1);
  };

  const startPulseAnimation = () => {
    // No animation
    pulseAnim.setValue(1);
  };

  useEffect(() => {
    // Start subtle pulse animation when component mounts
    startPulseAnimation();
  }, []);

  const handleCreateGroup = () => {
    animatePress();

    Alert.alert("Create Group", "Would you like to create a new group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: () => {
          try {
            router.push("/create-group");
          } catch (error) {
            Alert.alert("Error", "Failed to open group creation");
            console.error("Create group navigation error:", error);
          }
        },
      },
    ]);
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => handleGroupPress(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
      }}
      activeOpacity={0.7}
    >
      {/* Group Avatar */}
      <View style={{ position: 'relative' }}>
        {(() => {
          const Avatar = require("../../src/components/Avatar").Avatar;
          return (
            <Avatar
              name={item.name}
              imageUrl={item.logo}
              size="medium"
              showOnlineStatus={item.isActive}
              isOnline={item.isActive}
            />
          );
        })()}
      </View>

      {/* Group Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-gray-900 text-base"
            numberOfLines={1}
            style={{ fontWeight: "600" }}
          >
            {item.name}
          </Text>
          <Text className="text-gray-400 text-xs">{item.lastMessageTime}</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
            {searchQuery ? (
              <>
                <Text className="text-gray-500">
                  {item.memberCount} members •{" "}
                </Text>
                {item.lastMessageBy}: {item.lastMessage}
              </>
            ) : (
              <>
                {item.lastMessageBy}: {item.lastMessage}
              </>
            )}
          </Text>
        </View>

        {/* Usage indicator */}
        <View className="flex-row items-center mt-1">
          <View className="flex-row">
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name="ellipse"
                size={6}
                color={
                  index < Math.floor(item.usageFrequency / 20)
                    ? "#667eea"
                    : "#E5E7EB"
                }
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text className="text-xs text-gray-400 ml-2">
            {item.usageFrequency}% active
          </Text>
        </View>
      </View>

      {/* Unread indicator (if any) */}
      {item.isActive && (
        <View
          className="w-2 h-2 rounded-full ml-2"
          style={{ backgroundColor: "#667eea" }}
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (searchQuery) {
      const { SearchEmptyState } = require("../../src/components/EmptyStateImproved");
      return (
        <SearchEmptyState
          title="No groups found"
          subtitle={`No groups match "${searchQuery}"`}
          actionText="Clear Search"
          onActionPress={() => setSearchQuery("")}
        />
      );
    } else {
      const { GroupsEmptyState } = require("../../src/components/EmptyStateImproved");
      return (
        <GroupsEmptyState
          onActionPress={handleCreateGroup}
        />
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#E6F3FF', // IraChat signature background
      }}
      accessible={true}
      accessibilityLabel="Groups screen"
    >
      {/* Groups Header with Menu Icon */}
      <GroupsHeader
        groupCount={groups.length}
        onSearchResults={(results) => {
          console.log('Groups search results:', results);
          // Handle search results here
        }}
        searchPlaceholder="Search groups, members, messages..."
      />

      {/* Groups List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-4">Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          getItemLayout={(_data, index) => ({
            length: 100, // Updated height for new card design
            offset: 100 * index,
            index,
          })}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredGroups.length === 0
              ? { flex: 1 }
              : { paddingTop: 8, paddingBottom: 120 }
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        />
      )}

      {/* Beautiful Floating Action Buttons */}

      {/* Join Group Button */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 100,
          right: 24,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => {
            // Animate button press
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();

            Alert.alert(
              "Join Group",
              "Enter group invite link or scan QR code",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Enter Link", onPress: () => console.log("Enter link") },
                { text: "Scan QR", onPress: () => console.log("Scan QR") },
              ]
            );
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#10B981",
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Ionicons name="enter" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Create Group Button with Enhanced Animation */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 32,
          right: 24,
          transform: [
            { scale: pulseAnim },
            {
              rotate: pulseAnim.interpolate({
                inputRange: [0.9, 1],
                outputRange: ['3deg', '0deg'],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() => {
            // Enhanced spring animation with rotation
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 0.85,
                duration: 80,
                useNativeDriver: true,
              }),
              Animated.spring(pulseAnim, {
                toValue: 1,
                tension: 400,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start();

            setTimeout(() => {
              handleCreateGroup();
            }, 100);
          }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#667eea",
            alignItems: "center",
            justifyContent: "center",
            elevation: 12,
            shadowColor: "#667eea",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            borderWidth: 3,
            borderColor: "#FFFFFF",
          }}
          activeOpacity={0.8}
        >
          {/* Gradient overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 32,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
          />

          {/* Main icon */}
          <Ionicons name="people" size={26} color="white" />

          {/* Add indicator */}
          <View
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#4F46E5",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "white",
            }}
          >
            <Ionicons name="add" size={12} color="white" />
          </View>
        </TouchableOpacity>

        {/* Pulse ring animation */}
        <Animated.View
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 36,
            borderWidth: 2,
            borderColor: "rgba(102, 126, 234, 0.3)",
            transform: [{ scale: pulseAnim }],
          }}
        />
      </Animated.View>
    </View>
  );
}
