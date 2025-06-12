import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Switch,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface GroupMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastSeen: Date;
}

interface SharedMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  timestamp: Date;
}

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  timestamp: Date;
}

interface SharedLink {
  id: string;
  url: string;
  title: string;
  description: string;
  timestamp: Date;
}

interface GroupEvent {
  id: string;
  type: 'joined' | 'left' | 'removed' | 'promoted' | 'demoted';
  userId: string;
  userName: string;
  timestamp: Date;
  byUserId?: string;
  byUserName?: string;
}

interface GroupProfilePanelProps {
  visible: boolean;
  onClose: () => void;
  groupInfo: {
    id: string;
    name: string;
    avatar: string;
    description: string;
    memberCount: number;
    createdAt: Date;
  };
  members: GroupMember[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  sharedMedia: SharedMedia[];
  sharedFiles: SharedFile[];
  sharedLinks: SharedLink[];
  recentEvents: GroupEvent[];
  groupSettings: {
    isMuted: boolean;
    allowMemberAdditions: boolean;
  };
  onUpdateGroupSettings: (settings: any) => void;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
  onPromoteMember: (memberId: string) => void;
  onDemoteMember: (memberId: string) => void;
  onChangeGroupPhoto: () => void;
  onChangeGroupName: () => void;
  onMediaPress: (mediaUri: string, mediaType: string) => void;
}

export const GroupProfilePanel: React.FC<GroupProfilePanelProps> = ({
  visible,
  onClose,
  groupInfo,
  members,
  currentUserId,
  isCurrentUserAdmin,
  sharedMedia,
  sharedFiles,
  sharedLinks,
  recentEvents,
  groupSettings,
  onUpdateGroupSettings,
  onAddMember,
  onRemoveMember,
  onPromoteMember,
  onDemoteMember,
  onChangeGroupPhoto,
  onChangeGroupName,
  onMediaPress,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'files' | 'links' | 'events'>('info');
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnimation.setValue(0);
    }
  }, [visible]);

  const handleMemberAction = (member: GroupMember, action: 'promote' | 'demote' | 'remove') => {
    const actionText = action === 'promote' ? 'promote' : action === 'demote' ? 'demote' : 'remove';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Member`,
      `Are you sure you want to ${actionText} ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === 'remove' ? 'destructive' : 'default',
          onPress: () => {
            switch (action) {
              case 'promote':
                onPromoteMember(member.id);
                break;
              case 'demote':
                onDemoteMember(member.id);
                break;
              case 'remove':
                onRemoveMember(member.id);
                break;
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={{ padding: 16 }}>
            {/* Group Info */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={isCurrentUserAdmin ? onChangeGroupPhoto : undefined}>
                <Image
                  source={{ uri: groupInfo.avatar }}
                  style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }}
                />
                {isCurrentUserAdmin && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: '#667eea',
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={isCurrentUserAdmin ? onChangeGroupName : undefined}>
                <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 4 }}>
                  {groupInfo.name}
                </Text>
              </TouchableOpacity>
              
              <Text style={{ color: '#666', fontSize: 14 }}>
                {groupInfo.memberCount} members
              </Text>
            </View>

            {/* Admins List */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Admins ({members.filter(m => m.role === 'admin').length})
              </Text>
              {members
                .filter(member => member.role === 'admin')
                .map(admin => (
                  <Text key={admin.id} style={{ fontSize: 14, color: '#667eea', marginBottom: 4 }}>
                    {admin.username}
                  </Text>
                ))}
            </View>

            {/* Members List */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  Members ({members.length})
                </Text>
                {isCurrentUserAdmin && (
                  <TouchableOpacity onPress={onAddMember}>
                    <Ionicons name="add-circle" size={24} color="#667eea" />
                  </TouchableOpacity>
                )}
              </View>
              
              {members.map(member => (
                <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image
                    source={{ uri: member.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500' }}>{member.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{member.username}</Text>
                  </View>
                  
                  {member.role === 'admin' && (
                    <View style={{ backgroundColor: '#667eea', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 }}>
                      <Text style={{ color: 'white', fontSize: 10 }}>Admin</Text>
                    </View>
                  )}
                  
                  {isCurrentUserAdmin && member.id !== currentUserId && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Member Actions',
                          `Choose an action for ${member.name}`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            ...(member.role === 'member' ? [
                              { text: 'Promote to Admin', onPress: () => handleMemberAction(member, 'promote') }
                            ] : [
                              { text: 'Remove Admin Rights', onPress: () => handleMemberAction(member, 'demote') }
                            ]),
                            { text: 'Remove from Group', style: 'destructive', onPress: () => handleMemberAction(member, 'remove') },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Group Settings (Admin Only) */}
            {isCurrentUserAdmin && (
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                  Group Settings
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 14 }}>Mute Group</Text>
                  <Switch
                    value={groupSettings.isMuted}
                    onValueChange={(value) => onUpdateGroupSettings({ ...groupSettings, isMuted: value })}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14 }}>Allow Members to Add Others</Text>
                  <Switch
                    value={groupSettings.allowMemberAdditions}
                    onValueChange={(value) => onUpdateGroupSettings({ ...groupSettings, allowMemberAdditions: value })}
                  />
                </View>
              </View>
            )}
          </View>
        );

      case 'media':
        return (
          <FlatList
            data={sharedMedia}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onMediaPress(item.uri, item.type)}
                style={{ flex: 1, margin: 2, aspectRatio: 1 }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: '100%', height: '100%', borderRadius: 4 }}
                  resizeMode="cover"
                />
                {item.type === 'video' && (
                  <View style={{ position: 'absolute', top: 4, right: 4 }}>
                    <Ionicons name="play-circle" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        );

      case 'files':
        return (
          <ScrollView style={{ padding: 16 }}>
            {sharedFiles.map((file, index) => (
              <View key={file.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginRight: 8 }}>
                  {index + 1}.
                </Text>
                <Ionicons name="document" size={20} color="#666" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500' }}>{file.name}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>{file.size}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'links':
        return (
          <ScrollView style={{ padding: 16 }}>
            {sharedLinks.map((link, index) => (
              <View key={link.id} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                  {index + 1}. {link.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#667eea' }}>{link.url}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{link.description}</Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'events':
        return (
          <ScrollView style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Last 7 Days Events
            </Text>
            {recentEvents.map(event => (
              <View key={event.id} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14 }}>
                  <Text style={{ fontWeight: '500' }}>{event.userName}</Text>
                  {' '}
                  {event.type === 'joined' && 'joined the group'}
                  {event.type === 'left' && 'left the group'}
                  {event.type === 'removed' && `was removed by ${event.byUserName}`}
                  {event.type === 'promoted' && `was promoted to admin by ${event.byUserName}`}
                  {event.type === 'demoted' && `was removed as admin by ${event.byUserName}`}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {event.timestamp.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <BlurView intensity={50} style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: 100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            transform: [{
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [500, 0],
              }),
            }],
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Group Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
              {[
                { key: 'info', label: 'Info' },
                { key: 'media', label: 'Media' },
                { key: 'files', label: 'Files' },
                { key: 'links', label: 'Links' },
                { key: 'events', label: 'Events' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 2,
                    borderBottomColor: activeTab === tab.key ? '#667eea' : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: activeTab === tab.key ? '#667eea' : '#666',
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {renderTabContent()}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};
