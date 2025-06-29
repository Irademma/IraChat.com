import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
    Switch,
    ScrollView,
} from "react-native";
import { useCallManager } from "../hooks/useCallManager";
import { auth, db, storage } from "../services/firebaseSimple";
import { realGroupService } from "../services/realGroupService";
import MessageStatusIndicator from "./MessageStatusIndicator";
import TypingIndicator from "./TypingIndicator";
import MessageSearch from "./MessageSearch";
import { realTimeMessagingService } from "../services/realTimeMessagingService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced Group Message Interface
interface GroupMessage {
  id: string;
  text?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "audio" | "document" | "voice" | "call" | "location" | "contact" | "poll" | "announcement";
  mediaUrl?: string;
  mediaThumbnail?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
  // Group-specific properties
  mentions?: string[]; // User IDs mentioned in message
  isAnnouncement?: boolean;
  announcementPriority?: "low" | "medium" | "high";
  // Reply functionality
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
    type: string;
  };
  reactions?: {
    [userId: string]: string; // emoji
  };
  isEdited?: boolean;
  editedAt?: any;
  isForwarded?: boolean;
  forwardedFrom?: string;
  // Location data
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  // Contact data
  contact?: {
    name: string;
    phoneNumbers: string[];
    emails: string[];
  };
  // Poll data
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: string[]; // User IDs who voted
    }>;
    allowMultipleVotes: boolean;
    expiresAt?: Date;
  };
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  isOnline: boolean;
  lastSeen?: Date;
  joinedAt: Date;
  permissions: {
    canSendMessages: boolean;
    canSendMedia: boolean;
    canAddMembers: boolean;
    canDeleteMessages: boolean;
    canPinMessages: boolean;
    canCreatePolls: boolean;
    canMakeAnnouncements: boolean;
  };
}

interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdBy: string;
  createdAt: Date;
  memberCount: number;
  settings: {
    whoCanSendMessages: 'everyone' | 'admins_only';
    whoCanAddMembers: 'everyone' | 'admins_only';
    whoCanEditGroupInfo: 'admins_only';
    disappearingMessages: boolean;
    disappearingMessagesDuration: number; // in hours
    allowMemberInvites: boolean;
    requireAdminApproval: boolean;
    muteNotifications: boolean;
    showReadReceipts: boolean;
  };
  pinnedMessages: string[];
  rules?: string[];
  category?: string;
  isPublic: boolean;
  inviteLink?: string;
}

interface ComprehensiveGroupChatRoomProps {
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  isAdmin: boolean;
}

export const ComprehensiveGroupChatRoom: React.FC<ComprehensiveGroupChatRoomProps> = ({
  groupId,
  groupName,
  groupAvatar,
  isAdmin,
}) => {
  const router = useRouter();
  const currentUser = auth?.currentUser;
  
  // Core State
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  
  // Group State
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'member'>('member');
  
  // Media & Voice State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState<{ [messageId: string]: boolean }>({});
  
  // UI State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GroupMessage | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<GroupMessage | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Group Management State
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showAnnouncementCreator, setShowAnnouncementCreator] = useState(false);
  
  // Poll Creation State
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [pollExpiresIn, setPollExpiresIn] = useState<number>(24); // hours
  
  // Announcement State
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState<"low" | "medium" | "high">("medium");
  
  // Animation Values
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const replyAnimation = useRef(new Animated.Value(0)).current;
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Call Manager
  const callManager = useCallManager(currentUser?.uid || '');

  // Load group data on mount
  useEffect(() => {
    if (groupId && currentUser) {
      loadGroupInfo();
      loadMembers();
      loadMessages();
      setupRealtimeListeners();
    }
  }, [groupId, currentUser]);

  const loadGroupInfo = async () => {
    try {
      // Mock group info for now - replace with actual service call
      const mockGroupInfo: GroupInfo = {
        id: groupId,
        name: groupName,
        description: 'Group description',
        avatar: groupAvatar,
        createdBy: currentUser?.uid || '',
        createdAt: new Date(),
        memberCount: members.length,
        settings: {
          whoCanSendMessages: 'everyone',
          whoCanAddMembers: 'admins_only',
          whoCanEditGroupInfo: 'admins_only',
          disappearingMessages: false,
          disappearingMessagesDuration: 24,
          allowMemberInvites: true,
          requireAdminApproval: false,
          muteNotifications: false,
          showReadReceipts: true,
        },
        pinnedMessages: [],
        rules: [],
        isPublic: false,
      };
      setGroupInfo(mockGroupInfo);
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const loadMembers = async () => {
    try {
      // Mock members for now - replace with actual service call
      const mockMembers: GroupMember[] = [
        {
          id: currentUser?.uid || '',
          name: currentUser?.displayName || 'You',
          avatar: currentUser?.photoURL || undefined,
          role: isAdmin ? 'admin' : 'member',
          isOnline: true,
          joinedAt: new Date(),
          permissions: {
            canSendMessages: true,
            canSendMedia: true,
            canAddMembers: isAdmin,
            canDeleteMessages: isAdmin,
            canPinMessages: isAdmin,
            canCreatePolls: true,
            canMakeAnnouncements: isAdmin,
          },
        },
      ];
      setMembers(mockMembers);

      // Determine current user role
      const currentMember = mockMembers.find((m: GroupMember) => m.id === currentUser?.uid);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Load messages from Firestore
      const messagesRef = collection(db, `groups/${groupId}/messages`);
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const loadedMessages: GroupMessage[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as GroupMessage);
        });
        
        setMessages(loadedMessages.reverse());
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeListeners = () => {
    // Set up typing indicators
    const typingRef = collection(db, `groups/${groupId}/typing`);
    const typingQuery = query(typingRef, where('isTyping', '==', true));
    
    const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
      const typingUsersList: { userId: string; userName: string }[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userId !== currentUser?.uid) {
          typingUsersList.push({
            userId: data.userId,
            userName: data.userName,
          });
        }
      });
      setTypingUsers(typingUsersList);
    });

    // Set up online status
    const onlineRef = collection(db, `groups/${groupId}/online`);
    const unsubscribeOnline = onSnapshot(onlineRef, (snapshot) => {
      const onlineUserIds: string[] = [];
      snapshot.docs.forEach((doc) => {
        onlineUserIds.push(doc.id);
      });
      setOnlineMembers(onlineUserIds);
    });

    return () => {
      unsubscribeTyping();
      unsubscribeOnline();
    };
  };

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageData: Partial<GroupMessage> = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown User',
        senderAvatar: currentUser.photoURL || undefined,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "text",
      };

      // Add reply data if replying
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text || "Media",
          senderName: replyingTo.senderName,
          type: replyingTo.type,
        };
      }

      // Add mentions if any
      const mentions = extractMentions(newMessage);
      if (mentions.length > 0) {
        messageData.mentions = mentions;
      }

      await addDoc(collection(db, `groups/${groupId}/messages`), messageData);
      
      setNewMessage("");
      setIsTyping(false);
      setReplyingTo(null);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  // Extract mentions from message text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedUser = members.find((m: GroupMember) =>
        m.name.toLowerCase().includes(match![1].toLowerCase())
      );
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }

    return mentions;
  };

  // Create poll function
  const createPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
      Alert.alert('Error', 'Please provide a question and at least 2 options');
      return;
    }

    if (!currentUser) return;

    try {
      const pollData: Partial<GroupMessage> = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown User',
        senderAvatar: currentUser.photoURL || undefined,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "poll",
        poll: {
          question: pollQuestion.trim(),
          options: pollOptions
            .filter(opt => opt.trim())
            .map((opt, index) => ({
              id: `option_${index}`,
              text: opt.trim(),
              votes: [],
            })),
          allowMultipleVotes,
          expiresAt: new Date(Date.now() + pollExpiresIn * 60 * 60 * 1000),
        },
      };

      await addDoc(collection(db, `groups/${groupId}/messages`), pollData);
      
      // Reset poll state
      setPollQuestion("");
      setPollOptions(["", ""]);
      setAllowMultipleVotes(false);
      setPollExpiresIn(24);
      setShowPollCreator(false);
      
      Alert.alert('Success', 'Poll created successfully!');
    } catch (error) {
      console.error("Error creating poll:", error);
      Alert.alert("Error", "Failed to create poll");
    }
  };

  // Vote on poll function
  const voteOnPoll = async (messageId: string, optionId: string) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, `groups/${groupId}/messages/${messageId}`);
      const message = messages.find(m => m.id === messageId);
      
      if (message && message.poll) {
        const updatedOptions = message.poll.options.map(option => {
          if (option.id === optionId) {
            const hasVoted = option.votes.includes(currentUser.uid);
            if (hasVoted) {
              // Remove vote
              return {
                ...option,
                votes: option.votes.filter(userId => userId !== currentUser.uid),
              };
            } else {
              // Add vote (and remove from other options if single vote)
              let newVotes = [...option.votes, currentUser.uid];
              return { ...option, votes: newVotes };
            }
          } else if (!message.poll!.allowMultipleVotes) {
            // Remove vote from other options if single vote allowed
            return {
              ...option,
              votes: option.votes.filter(userId => userId !== currentUser.uid),
            };
          }
          return option;
        });

        await updateDoc(messageRef, {
          'poll.options': updatedOptions,
        });
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
      Alert.alert("Error", "Failed to vote on poll");
    }
  };

  // Create announcement function
  const createAnnouncement = async () => {
    if (!announcementText.trim()) {
      Alert.alert('Error', 'Please enter announcement text');
      return;
    }

    if (!currentUser || (currentUserRole !== 'admin' && currentUserRole !== 'owner')) {
      Alert.alert('Permission Denied', 'Only admins can create announcements');
      return;
    }

    try {
      const announcementData: Partial<GroupMessage> = {
        text: announcementText.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown User',
        senderAvatar: currentUser.photoURL || undefined,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "announcement",
        isAnnouncement: true,
        announcementPriority,
      };

      await addDoc(collection(db, `groups/${groupId}/messages`), announcementData);
      
      setAnnouncementText("");
      setAnnouncementPriority("medium");
      setShowAnnouncementCreator(false);
      
      Alert.alert('Success', 'Announcement posted successfully!');
    } catch (error) {
      console.error("Error creating announcement:", error);
      Alert.alert("Error", "Failed to create announcement");
    }
  };

  // Add member function
  const addMember = async (userId: string, userName: string) => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'owner') {
      Alert.alert('Permission Denied', 'Only admins can add members');
      return;
    }

    try {
      // Mock add member functionality
      Alert.alert('Success', `${userName} has been added to the group`);
      loadMembers(); // Refresh members list
    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Error", "Failed to add member");
    }
  };

  // Remove member function
  const removeMember = async (userId: string, userName: string) => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'owner') {
      Alert.alert('Permission Denied', 'Only admins can remove members');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${userName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock remove member functionality
              Alert.alert('Success', `${userName} has been removed from the group`);
              loadMembers(); // Refresh members list
            } catch (error) {
              console.error("Error removing member:", error);
              Alert.alert("Error", "Failed to remove member");
            }
          }
        }
      ]
    );
  };

  // Message rendering function
  const renderMessage = (message: GroupMessage, index: number) => {
    const isMyMessage = message.senderId === currentUser?.uid;
    const showAvatar = !isMyMessage && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
    const reactions = message.reactions || {};
    const hasReactions = Object.keys(reactions).length > 0;

    return (
      <View style={{ marginVertical: 4, paddingHorizontal: 16 }}>
        {/* Announcement Banner */}
        {message.isAnnouncement && (
          <View style={{
            backgroundColor: message.announcementPriority === 'high' ? '#FEE2E2' :
                           message.announcementPriority === 'medium' ? '#FEF3C7' : '#DBEAFE',
            borderLeftWidth: 4,
            borderLeftColor: message.announcementPriority === 'high' ? '#EF4444' :
                            message.announcementPriority === 'medium' ? '#F59E0B' : '#3B82F6',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name="megaphone"
                size={16}
                color={message.announcementPriority === 'high' ? '#EF4444' :
                       message.announcementPriority === 'medium' ? '#F59E0B' : '#3B82F6'}
              />
              <Text style={{
                marginLeft: 8,
                fontSize: 12,
                fontWeight: 'bold',
                color: message.announcementPriority === 'high' ? '#EF4444' :
                       message.announcementPriority === 'medium' ? '#F59E0B' : '#3B82F6',
              }}>
                ANNOUNCEMENT
              </Text>
            </View>
          </View>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <View style={{
            marginLeft: isMyMessage ? 50 : 0,
            marginRight: isMyMessage ? 0 : 50,
            marginBottom: 4,
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            borderLeftWidth: 3,
            borderLeftColor: '#87CEEB',
            paddingLeft: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, color: "#87CEEB", fontWeight: "600" }}>
              {message.replyTo.senderName}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }} numberOfLines={1}>
              {message.replyTo.text}
            </Text>
          </View>
        )}

        <Pressable
          onLongPress={() => handleMessageLongPress(message)}
          style={{ flexDirection: 'row', alignItems: 'flex-end' }}
        >
          {/* Avatar for group messages */}
          {showAvatar && (
            <View style={{ marginRight: 8, marginBottom: 4 }}>
              {message.senderAvatar ? (
                <Image
                  source={{ uri: message.senderAvatar }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              ) : (
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#87CEEB',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {message.senderName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{
            flex: 1,
            alignItems: isMyMessage ? 'flex-end' : 'flex-start',
            marginLeft: !isMyMessage && !showAvatar ? 40 : 0,
          }}>
            {/* Sender name for group messages */}
            {!isMyMessage && showAvatar && (
              <Text style={{
                fontSize: 12,
                color: '#87CEEB',
                fontWeight: '600',
                marginBottom: 2,
                marginLeft: 12,
              }}>
                {message.senderName}
              </Text>
            )}

            {/* Message Bubble */}
            <View style={{
              backgroundColor: isMyMessage ? '#87CEEB' : '#FFFFFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              maxWidth: SCREEN_WIDTH * 0.75,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderTopLeftRadius: isMyMessage ? 16 : (showAvatar ? 4 : 16),
              borderTopRightRadius: isMyMessage ? (showAvatar ? 4 : 16) : 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}>
              {/* Poll Rendering */}
              {message.type === "poll" && message.poll && (
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isMyMessage ? '#FFFFFF' : '#333',
                    marginBottom: 12,
                  }}>
                    📊 {message.poll.question}
                  </Text>

                  {message.poll.options.map((option, optionIndex) => {
                    const totalVotes = message.poll!.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                    const hasVoted = option.votes.includes(currentUser?.uid || '');

                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => voteOnPoll(message.id, option.id)}
                        style={{
                          backgroundColor: hasVoted ? 'rgba(135, 206, 235, 0.3)' : 'rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 8,
                          borderWidth: hasVoted ? 2 : 1,
                          borderColor: hasVoted ? '#87CEEB' : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{
                            flex: 1,
                            fontSize: 14,
                            color: isMyMessage ? '#FFFFFF' : '#333',
                            fontWeight: hasVoted ? 'bold' : 'normal',
                          }}>
                            {option.text}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: isMyMessage ? 'rgba(255,255,255,0.8)' : '#666',
                            marginLeft: 8,
                          }}>
                            {option.votes.length} ({percentage.toFixed(0)}%)
                          </Text>
                        </View>

                        {/* Progress bar */}
                        <View style={{
                          height: 4,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderRadius: 2,
                          marginTop: 8,
                          overflow: 'hidden',
                        }}>
                          <View style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: '#87CEEB',
                            borderRadius: 2,
                          }} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <Text style={{
                    fontSize: 10,
                    color: isMyMessage ? 'rgba(255,255,255,0.6)' : '#999',
                    marginTop: 4,
                  }}>
                    {message.poll.allowMultipleVotes ? 'Multiple votes allowed' : 'Single vote only'} •
                    Total votes: {message.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)}
                  </Text>
                </View>
              )}

              {/* Text Message */}
              {message.type === "text" && message.text && (
                <Text style={{
                  fontSize: 16,
                  color: isMyMessage ? '#FFFFFF' : '#333',
                  lineHeight: 22,
                }}>
                  {message.text}
                </Text>
              )}

              {/* Message Info */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: message.text ? 4 : 0,
              }}>
                <Text style={{
                  fontSize: 11,
                  color: isMyMessage ? "rgba(255,255,255,0.8)" : "#999",
                }}>
                  {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) || 'Now'}
                  {message.isEdited && " • edited"}
                </Text>

                {isMyMessage && (
                  <View style={{ marginLeft: 8 }}>
                    <MessageStatusIndicator status={message.status} isMyMessage={isMyMessage} />
                  </View>
                )}
              </View>
            </View>

            {/* Reactions */}
            {hasReactions && (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginTop: 4,
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}>
                <Text style={{ fontSize: 12 }}>
                  {getReactionSummary(reactions)}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  // Helper functions
  const handleMessageLongPress = (message: GroupMessage) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
    Vibration.vibrate(50);
  };

  const getReactionSummary = (reactions: { [userId: string]: string } = {}) => {
    const reactionCounts: { [emoji: string]: number } = {};
    Object.values(reactions).forEach((emoji) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });

    return Object.entries(reactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emoji, count]) => `${emoji}${count > 1 ? count : ""}`)
      .join(" ");
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#87CEEB" />
      
      {/* Group Header */}
      <View style={{
        backgroundColor: '#87CEEB',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setShowGroupInfo(true)}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          {groupAvatar ? (
            <Image
              source={{ uri: groupAvatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
              }}
            />
          ) : (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              {groupName}
            </Text>
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
            }}>
              {members.length} members • {onlineMembers.length} online
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setShowMessageSearch(true)}
          style={{ marginLeft: 8, marginRight: 8 }}
        >
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Group Call',
              'Start a group call?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Voice Call', onPress: () => console.log('Starting voice call') },
                { text: 'Video Call', onPress: () => console.log('Starting video call') },
              ]
            );
          }}
        >
          <Ionicons name="videocam" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderMessage(item, index)}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            {/* Attachment Button */}
            <TouchableOpacity
              onPress={() => setShowAttachmentMenu(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
            >
              <Ionicons name="add" size={24} color="#87CEEB" />
            </TouchableOpacity>

            {/* Text Input */}
            <View style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              maxHeight: 100,
            }}>
              <TextInput
                ref={textInputRef}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                style={{
                  fontSize: 16,
                  color: "#333",
                  minHeight: 24,
                }}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={sendMessage}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#87CEEB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#ccc",
                alignSelf: "center",
                marginTop: 12,
                borderRadius: 2,
              }}
            />

            <Text style={{
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 20,
              color: "#333",
            }}>
              Share Content
            </Text>

            {/* First Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                paddingVertical: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  // Camera functionality
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="camera" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  // Gallery functionality
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="images" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  // Document functionality
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="document" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Document</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                paddingVertical: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  // Location sharing
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="location" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  // Contact sharing
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="person" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentMenu(false);
                  setShowPollCreator(true);
                }}
                style={{ alignItems: "center", padding: 16 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#87CEEB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="bar-chart" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Poll</Text>
              </TouchableOpacity>
            </View>

            {/* Third Row - Group Specific */}
            {(currentUserRole === 'admin' || currentUserRole === 'owner') && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  paddingVertical: 20,
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowAttachmentMenu(false);
                    setShowAnnouncementCreator(true);
                  }}
                  style={{ alignItems: "center", padding: 16 }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#F59E0B",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="megaphone" size={30} color="white" />
                  </View>
                  <Text style={{ fontSize: 12, color: "#666" }}>Announcement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowAttachmentMenu(false);
                    setShowAddMembers(true);
                  }}
                  style={{ alignItems: "center", padding: 16 }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#10B981",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="person-add" size={30} color="white" />
                  </View>
                  <Text style={{ fontSize: 12, color: "#666" }}>Add Member</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowAttachmentMenu(false);
                    setShowGroupSettings(true);
                  }}
                  style={{ alignItems: "center", padding: 16 }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#6B7280",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="settings" size={30} color="white" />
                  </View>
                  <Text style={{ fontSize: 12, color: "#666" }}>Settings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Poll Creator Modal */}
      <Modal
        visible={showPollCreator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPollCreator(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            width: "100%",
            maxHeight: "80%",
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
              color: "#333",
            }}>
              Create Poll
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>
                Question
              </Text>
              <TextInput
                placeholder="What's your question?"
                value={pollQuestion}
                onChangeText={setPollQuestion}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  marginBottom: 16,
                }}
                multiline
              />

              <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>
                Options
              </Text>
              {pollOptions.map((option, index) => (
                <View key={index} style={{ flexDirection: "row", marginBottom: 8 }}>
                  <TextInput
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = text;
                      setPollOptions(newOptions);
                    }}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      marginRight: 8,
                    }}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      onPress={() => {
                        const newOptions = pollOptions.filter((_, i) => i !== index);
                        setPollOptions(newOptions);
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#EF4444",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <Ionicons name="remove" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {pollOptions.length < 6 && (
                <TouchableOpacity
                  onPress={() => setPollOptions([...pollOptions, ""])}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#87CEEB",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="add" size={20} color="#87CEEB" />
                  <Text style={{ marginLeft: 8, color: "#87CEEB", fontWeight: "600" }}>
                    Add Option
                  </Text>
                </TouchableOpacity>
              )}

              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 16, color: "#333" }}>Allow multiple votes</Text>
                <Switch
                  value={allowMultipleVotes}
                  onValueChange={setAllowMultipleVotes}
                  trackColor={{ false: '#E5E7EB', true: '#87CEEB' }}
                  thumbColor={allowMultipleVotes ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setShowPollCreator(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f0f0f0",
                  padding: 16,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#666",
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={createPoll}
                style={{
                  flex: 1,
                  backgroundColor: "#87CEEB",
                  padding: 16,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "white",
                }}>
                  Create Poll
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Announcement Creator Modal */}
      <Modal
        visible={showAnnouncementCreator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAnnouncementCreator(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            width: "100%",
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
              color: "#333",
            }}>
              Create Announcement
            </Text>

            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>
              Message
            </Text>
            <TextInput
              placeholder="Enter your announcement..."
              value={announcementText}
              onChangeText={setAnnouncementText}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
                minHeight: 100,
              }}
              multiline
            />

            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>
              Priority
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  onPress={() => setAnnouncementPriority(priority)}
                  style={{
                    flex: 1,
                    backgroundColor: announcementPriority === priority ? '#87CEEB' : '#f0f0f0',
                    padding: 12,
                    borderRadius: 8,
                    marginHorizontal: 4,
                  }}
                >
                  <Text style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "600",
                    color: announcementPriority === priority ? 'white' : '#666',
                    textTransform: 'capitalize',
                  }}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => setShowAnnouncementCreator(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f0f0f0",
                  padding: 16,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#666",
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={createAnnouncement}
                style={{
                  flex: 1,
                  backgroundColor: "#87CEEB",
                  padding: 16,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "white",
                }}>
                  Post Announcement
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
