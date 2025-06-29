// 👥 REAL GROUPS TAB - Fully functional group management
// Real group creation, member management, and group messaging

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { realGroupService, RealGroup } from "../../src/services/realGroupService";
import { formatTimeAgo } from "../../src/utils/dateUtils";

export default function GroupsScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [groups, setGroups] = useState<RealGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<RealGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Create group form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'public' | 'private'>('private');
  
  // Join group form
  const [joinCode, setJoinCode] = useState("");
  
  // Search
  const [publicGroups, setPublicGroups] = useState<RealGroup[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load groups on component mount
  useEffect(() => {
    if (currentUser?.id) {
      loadGroups();
      
      // Subscribe to real-time group updates
      const unsubscribe = realGroupService.subscribeToUserGroups(
        currentUser.id,
        (userGroups) => {
          setGroups(userGroups);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    }
  }, [currentUser?.id]);

  // Filter groups based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  // Load groups
  const loadGroups = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      const userGroups = await realGroupService.getUserGroups(currentUser.id);
      setGroups(userGroups);
      console.log('✅ Loaded groups:', userGroups.length);
    } catch (error) {
      console.error('❌ Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Refresh groups
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadGroups();
    setIsRefreshing(false);
  }, [loadGroups]);

  // Create new group
  const handleCreateGroup = async () => {
    if (!currentUser?.id || !newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      const result = await realGroupService.createGroup(
        currentUser.id,
        currentUser.name || 'Unknown',
        currentUser.avatar,
        {
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || undefined,
          privacy: newGroupPrivacy,
          allowMemberInvites: true,
          allowMemberMessages: true,
          requireApproval: newGroupPrivacy === 'private',
        }
      );

      if (result.success) {
        Alert.alert('Success!', 'Group created successfully');
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDescription("");
        setNewGroupPrivacy('private');
        
        // Navigate to the new group
        if (result.groupId) {
          router.push({
            pathname: '/group-chat' as any,
            params: {
              groupId: result.groupId,
              groupName: newGroupName,
              groupAvatar: '',
              isAdmin: 'true',
            },
          });
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('❌ Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  // Join group by code
  const handleJoinGroup = async () => {
    if (!currentUser?.id || !joinCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      const result = await realGroupService.joinGroupByCode(
        joinCode.trim().toUpperCase(),
        currentUser.id,
        currentUser.name || 'Unknown',
        currentUser.avatar
      );

      if (result.success) {
        Alert.alert('Success!', result.error || 'Joined group successfully');
        setShowJoinModal(false);
        setJoinCode("");
        
        // Navigate to the group if joined immediately
        if (result.groupId && !result.error) {
          router.push({
            pathname: '/group-chat' as any,
            params: {
              groupId: result.groupId,
              groupName: 'Group Chat',
              groupAvatar: '',
              isAdmin: 'false',
            },
          });
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('❌ Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  // Search public groups
  const searchPublicGroups = async (query: string) => {
    try {
      setSearchLoading(true);
      const results = await realGroupService.searchPublicGroups(query);
      setPublicGroups(results);
    } catch (error) {
      console.error('❌ Error searching groups:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Open group chat
  const openGroupChat = (group: RealGroup) => {
    router.push({
      pathname: '/group-chat' as any,
      params: {
        groupId: group.id,
        groupName: group.name,
        groupAvatar: group.avatar || '',
        isAdmin: (group.createdBy === currentUser?.id || group.memberRoles[currentUser?.id || ''] === 'admin' || group.memberRoles[currentUser?.id || ''] === 'owner') ? 'true' : 'false',
      },
    });
  };

  // Render group item - IRACHAT ENHANCED STYLE
  const renderGroupItem = ({ item }: { item: RealGroup }) => (
    <TouchableOpacity
      style={styles.enhancedGroupItem}
      onPress={() => openGroupChat(item)}
      activeOpacity={0.7}
    >
      {/* Group Avatar with Online Indicator */}
      <View style={styles.whatsappAvatarContainer}>
        <TouchableOpacity onPress={() => {
          // Navigate to group profile/info
          console.log('Navigate to group info:', item.name);
        }}>
          <Image
            source={{
              uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=87CEEB&color=fff`
            }}
            style={styles.whatsappGroupAvatar}
          />
        </TouchableOpacity>
        {/* Active members indicator */}
        {item.members.length > 0 && (
          <View style={styles.whatsappActiveIndicator}>
            <Text style={styles.whatsappActiveCount}>{Math.min(item.members.length, 9)}</Text>
          </View>
        )}
      </View>

      {/* Group Info */}
      <View style={styles.whatsappGroupInfo}>
        <View style={styles.whatsappGroupHeader}>
          <TouchableOpacity onPress={() => {
            // Navigate to group profile/info
            console.log('Navigate to group info:', item.name);
          }}>
            <Text style={styles.whatsappGroupName} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
          <View style={styles.whatsappTimeContainer}>
            {item.lastMessage && (
              <>
                <Text style={styles.whatsappLastMessageTime}>
                  {formatTimeAgo(item.lastMessage.timestamp)}
                </Text>
                {/* Message status indicators */}
                {item.lastMessage.senderId === currentUser?.id && (
                  <Ionicons
                    name="checkmark-done"
                    size={16}
                    color="#87CEEB"
                    style={styles.whatsappMessageStatus}
                  />
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.whatsappGroupDetails}>
          <View style={styles.whatsappLastMessageContainer}>
            {/* Group admin indicator */}
            {item.createdBy === currentUser?.id && (
              <Ionicons name="shield-checkmark" size={14} color="#87CEEB" style={styles.whatsappAdminIcon} />
            )}

            <Text style={styles.whatsappLastMessage} numberOfLines={1}>
              {item.lastMessage
                ? `${item.lastMessage.senderName === currentUser?.name ? 'You' : item.lastMessage.senderName}: ${item.lastMessage.content}`
                : `${item.members.length} members`
              }
            </Text>
          </View>

          <View style={styles.whatsappBadgeContainer}>
            {/* Member count as badge */}
            {item.members.length > 5 && (
              <View style={styles.whatsappUnreadBadge}>
                <Text style={styles.whatsappUnreadCount}>
                  {item.members.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render public group item
  const renderPublicGroupItem = ({ item }: { item: RealGroup }) => (
    <TouchableOpacity
      style={styles.publicGroupItem}
      onPress={() => {
        Alert.alert(
          'Join Group',
          `Do you want to join "${item.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Join',
              onPress: async () => {
                if (currentUser?.id) {
                  const result = await realGroupService.addMemberToGroup(
                    item.id,
                    currentUser.id,
                    currentUser.name || 'Unknown',
                    currentUser.avatar
                  );
                  
                  if (result.success) {
                    Alert.alert('Success!', 'Joined group successfully');
                    setShowSearchModal(false);
                  } else {
                    Alert.alert('Error', result.error || 'Failed to join group');
                  }
                }
              },
            },
          ]
        );
      }}
    >
      <Image
        source={{
          uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=667eea&color=fff`
        }}
        style={styles.groupAvatar}
      />
      
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.memberCount}>{item.members.length} members</Text>
      </View>
      
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create or join groups to start collaborating with others
      </Text>
      <TouchableOpacity
        style={styles.createFirstButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createFirstButtonText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Ionicons name="search" size={24} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your groups..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#667eea']}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity onPress={handleCreateGroup}>
              <Text style={styles.modalCreate}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter group name"
                value={newGroupName}
                onChangeText={setNewGroupName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What's this group about?"
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Privacy</Text>
              <View style={styles.privacyOptions}>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    newGroupPrivacy === 'private' && styles.privacyOptionSelected,
                  ]}
                  onPress={() => setNewGroupPrivacy('private')}
                >
                  <Ionicons name="lock-closed" size={20} color="#667eea" />
                  <Text style={styles.privacyOptionText}>Private</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    newGroupPrivacy === 'public' && styles.privacyOptionSelected,
                  ]}
                  onPress={() => setNewGroupPrivacy('public')}
                >
                  <Ionicons name="globe" size={20} color="#667eea" />
                  <Text style={styles.privacyOptionText}>Public</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Join Group</Text>
            <TouchableOpacity onPress={handleJoinGroup}>
              <Text style={styles.modalCreate}>Join</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invite Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 8-character code"
                value={joinCode}
                onChangeText={setJoinCode}
                maxLength={8}
                autoCapitalize="characters"
              />
              <Text style={styles.inputHint}>
                Ask a group member for the invite code
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search Public Groups Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Discover Groups</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search public groups..."
                placeholderTextColor="#9CA3AF"
                onChangeText={searchPublicGroups}
              />
            </View>

            {searchLoading ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.searchLoadingText}>Searching...</Text>
              </View>
            ) : (
              <FlatList
                data={publicGroups}
                renderItem={renderPublicGroupItem}
                keyExtractor={(item) => item.id}
                style={styles.searchResults}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No public groups found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  publicGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  memberCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  noMessages: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  lastActivity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  groupActions: {
    marginLeft: 12,
  },
  joinButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalCreate: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  privacyOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
  },
  privacyOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  searchLoadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  searchResults: {
    flex: 1,
    marginTop: 16,
  },
  noResults: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // IRACHAT ENHANCED STYLE COMPONENTS
  enhancedGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E5E9',
  },
  whatsappGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E5E9',
  },
  whatsappAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  whatsappGroupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  whatsappActiveIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  whatsappActiveCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  whatsappGroupInfo: {
    flex: 1,
    marginRight: 8,
  },
  whatsappGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  whatsappGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  whatsappTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappLastMessageTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  whatsappMessageStatus: {
    marginLeft: 2,
  },
  whatsappGroupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whatsappLastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  whatsappAdminIcon: {
    marginRight: 4,
  },
  whatsappLastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  whatsappBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappMutedIcon: {
    marginRight: 4,
  },
  whatsappUnreadBadge: {
    backgroundColor: '#87CEEB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 4,
  },
  whatsappMutedBadge: {
    backgroundColor: '#8E8E93',
  },
  whatsappUnreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  whatsappPinnedIcon: {
    marginLeft: 2,
  },
});
