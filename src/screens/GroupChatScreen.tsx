import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    AccessibilityInfo,
    Animated,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupDetails } from '../components/GroupDetails';
import { GroupHeader } from '../components/GroupHeader';
import { GroupSettings } from '../components/GroupSettings';
import { useGroupChat } from '../hooks/useGroupChat';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { useMentionNotifications } from '../hooks/useMentionNotifications';
import { useResponsive } from '../hooks/useResponsive';
import { GroupMessage } from '../types/groupChat';
import { handleError, validateGroupAction, validateMessage } from '../utils/errorHandler';
import { GroupMemberPreferences } from '../utils/groupManagement';
import { fontSize, isSmallDevice, isTablet, spacing } from '../utils/responsive';
import {
    getSearchResults
} from '../utils/searchUtils';
import { animations, modalConfig, shadows } from '../utils/visualEffects';

interface GroupChatScreenProps {
  groupId: string;
  currentUserId: string;
  isAdmin: boolean;
  onBack: () => void;
  navigation: any;
}

export const GroupChatScreen: React.FC<GroupChatScreenProps> = ({
  groupId,
  currentUserId,
  isAdmin,
  onBack,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, wp, hp } = useResponsive();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [showMediaGrid, setShowMediaGrid] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [preferences, setPreferences] = useState<GroupMemberPreferences>(defaultMemberPreferences);
  const [showSettings, setShowSettings] = useState(false);
  const [members, setMembers] = useState<Array<{
    id: string;
    name: string;
    isAdmin: boolean;
    isBlocked: boolean;
  }>>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [groupDetails, setGroupDetails] = useState<{
    info: GroupChat;
    stats: {
      memberCount: number;
      messageCount: number;
      mediaCount: number;
      adminCount: number;
    };
    recentActivity: Array<{
      type: 'message' | 'member' | 'media';
      timestamp: number;
      description: string;
    }>;
  } | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(100)).current;
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    messages: true,
    members: true,
    contacts: true,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [typingMembers, setTypingMembers] = useState<string[]>([]);
  const [recordingMembers, setRecordingMembers] = useState<string[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingVoiceMessage, setPlayingVoiceMessage] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    group,
    messages,
    loading,
    sendMessage,
    sendMedia,
    reactToMessage,
    replyToMessage,
    deleteMessage,
    editMessage,
    pinMessage,
    loadMoreMessages,
  } = useGroupChat(groupId, currentUserId);

  const { uploadMedia, uploading } = useMediaUpload();
  const { sendMentionNotifications } = useMentionNotifications({
    currentUserId,
  });

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: animations.timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: animations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();

    loadMessages();
    loadMembers();
    loadMemberPreferences();
    loadGroupDetails();
  }, []);

  const loadMessages = async () => {
    try {
      // ... existing loadMessages logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const loadMembers = async () => {
    try {
      // ... existing loadMembers logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const loadMemberPreferences = async () => {
    try {
      // ... existing loadMemberPreferences logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const loadGroupDetails = async () => {
    try {
      // ... existing loadGroupDetails logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleSendMessage = async () => {
    try {
      validateMessage(message);
      validateGroupAction('send', isAdmin, preferences?.isBlocked || false);

      // ... existing handleSendMessage logic ...

      setMessage('');
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleGroupAction = async (action: string) => {
    try {
      validateGroupAction(action, isAdmin, preferences?.isBlocked || false);

      // ... existing handleGroupAction logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleHideContent = async (contentId: string, contentType: 'message' | 'update') => {
    try {
      // ... existing handleHideContent logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      validateGroupAction('deleteMessage', isAdmin, preferences?.isBlocked || false);

      // ... existing handleDeleteMessage logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleShareGroup = async () => {
    try {
      // ... existing handleShareGroup logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleCopyLink = async () => {
    try {
      // ... existing handleCopyLink logic ...
    } catch (error) {
      handleError(error, shakeAnimation);
    }
  };

  const handleViewMembers = () => {
    setShowSettings(true);
  };

  const handleViewMedia = () => {
    setShowMediaGrid(true);
  };

  const handleSearch = async (query: string) => {
    try {
      const results = await getSearchResults(
        query,
        messages,
        members,
        contacts
      );
      return results;
    } catch (error) {
      handleError(error);
      return [];
    }
  };

  const handleSearchResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'message':
        // Find the message index and scroll to it
        const messageIndex = messages.findIndex((m) => m.id === result.id);
        if (messageIndex !== -1) {
          flatListRef.current?.scrollToIndex({
            index: messageIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }
        break;
      case 'member':
        setSelectedMember(members.find((m) => m.id === result.id));
        setShowMemberProfile(true);
        break;
      case 'contact':
        setSelectedContact(contacts.find((c) => c.id === result.id));
        setShowContactProfile(true);
        break;
      case 'username':
        // Find the user in either members or contacts
        const user = members.find((m) => m.id === result.id) || 
                    contacts.find((c) => c.id === result.id);
        if (user) {
          if ('role' in user) {
            setSelectedMember(user as GroupMember);
            setShowMemberProfile(true);
          } else {
            setSelectedContact(user);
            setShowContactProfile(true);
          }
        }
        break;
    }
  };

  const handleSearchFilterChange = (filters: { [key: string]: boolean }) => {
    // Update search filters if needed
    console.log('Search filters updated:', filters);
  };

  // Function to handle voice message recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setTypingMembers(prev => [...prev, currentUserId]);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      setTypingMembers(prev => prev.filter(id => id !== currentUserId));

      if (uri) {
        // Here you would typically upload the voice message to your backend
        // and send it as a message
        const voiceMessage = {
          id: Date.now().toString(),
          type: 'voice',
          uri,
          duration: 0, // You would calculate this
          sender: currentUserId,
          timestamp: new Date().toISOString(),
        };
        // Add the voice message to your messages
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Function to play voice messages
  const playVoiceMessage = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingVoiceMessage(uri);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingVoiceMessage(null);
        }
      });
    } catch (error) {
      console.error('Failed to play voice message:', error);
    }
  };

  // Function to stop playing voice message
  const stopVoiceMessage = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingVoiceMessage(null);
    }
  };

  // Cleanup audio resources
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  // Function to render voice message
  const renderVoiceMessage = (message: GroupMessage) => {
    const isPlaying = playingVoiceMessage === message.media?.[0]?.url;
    
    return (
      <TouchableOpacity
        style={styles.voiceMessageContainer}
        onPress={() => isPlaying ? stopVoiceMessage() : playVoiceMessage(message.media[0].url)}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={colors.primary}
        />
        <View style={styles.voiceMessageInfo}>
          <Text style={styles.voiceMessageDuration}>
            {message.media[0].duration}s
          </Text>
          <View style={styles.voiceMessageWaveform}>
            {/* Here you would render a waveform visualization */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Check screen reader status
  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };
    checkScreenReader();
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };
    const keyboardWillHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Optimize performance for long lists
  const getItemLayout = (data: any, index: number) => ({
    length: isTablet ? hp(12) : hp(10),
    offset: (isTablet ? hp(12) : hp(10)) * index,
    index,
  });

  const renderMessage = ({ item: message }: { item: GroupMessage }) => {
    const isCurrentUser = message.sender.id === currentUserId;
    const messageStyle = isCurrentUser ? styles.sentMessage : styles.receivedMessage;
    const containerStyle = isCurrentUser ? styles.sentContainer : styles.receivedContainer;

    const handleProfilePress = () => {
      const member = members.find(m => m.id === message.sender.id);
      if (member) {
        setSelectedMember(member);
        setShowMemberProfile(true);
      }
    };

    return (
      <View 
        style={[styles.messageContainer, containerStyle]}
        accessible={isScreenReaderEnabled}
        accessibilityLabel={`${message.sender.name}: ${message.content}`}
        accessibilityRole="text"
      >
        {!isCurrentUser && (
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleProfilePress}
            accessibilityLabel={`View ${message.sender.name}'s profile`}
            accessibilityRole="button"
          >
            <Image
              source={{ uri: message.sender.avatar }}
              style={[
                styles.avatar,
                isTablet && styles.avatarTablet,
                isSmallDevice && styles.avatarSmall
              ]}
            />
          </TouchableOpacity>
        )}
        <View style={[styles.messageBubble, messageStyle]}>
          {!isCurrentUser && (
            <TouchableOpacity 
              onPress={handleProfilePress}
              style={styles.senderInfo}
              accessibilityLabel={`View ${message.sender.name}'s profile`}
              accessibilityRole="button"
            >
              <Text style={[
                styles.senderName,
                isTablet && styles.senderNameTablet,
                isSmallDevice && styles.senderNameSmall
              ]}>
                {message.sender.name}
              </Text>
              <Text style={[
                styles.senderUsername,
                isTablet && styles.senderUsernameTablet,
                isSmallDevice && styles.senderUsernameSmall
              ]}>
                @{message.sender.username}
              </Text>
            </TouchableOpacity>
          )}
          {message.type === 'voice' ? (
            renderVoiceMessage(message)
          ) : (
            <Text style={[
              styles.messageText,
              isTablet && styles.messageTextTablet,
              isSmallDevice && styles.messageTextSmall
            ]}>
              {message.content}
            </Text>
          )}
          <Text style={[
            styles.timestamp,
            isTablet && styles.timestampTablet,
            isSmallDevice && styles.timestampSmall
          ]}>
            {message.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const isBlocked = members.find(m => m.id === currentUserId)?.isBlocked;

  // Function to mark messages as read
  const markMessagesAsRead = useCallback(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setLastReadMessageId(lastMessage.id);
      setUnreadCount(0);
      // Here you would typically update the backend to mark messages as read
    }
  }, [messages]);

  // Update unread count when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && lastReadMessageId) {
      const unreadMessages = messages.filter(
        (message) => message.id > lastReadMessageId
      );
      setUnreadCount(unreadMessages.length);
    }
  }, [messages, lastReadMessageId]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      markMessagesAsRead();
    });

    return unsubscribe;
  }, [navigation, markMessagesAsRead]);

  // Mark messages as read when scrolling to bottom
  const handleScrollToBottom = () => {
    markMessagesAsRead();
  };

  return (
    <View style={styles.container}>
      <GroupHeader
        group={group}
        unreadCount={unreadCount}
        typingMembers={typingMembers}
        recordingMembers={recordingMembers}
        onlineMembers={onlineMembers}
        onBackPress={() => navigation.goBack()}
        onInfoPress={() => setShowDetails(true)}
        onSettingsPress={() => setShowSettings(true)}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.listContent,
            isKeyboardVisible && { paddingBottom: keyboardHeight }
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScrollToBottom}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          initialNumToRender={10}
        />

        <View style={[
          styles.inputContainer,
          isKeyboardVisible && styles.inputContainerKeyboardVisible
        ]}>
          <TouchableOpacity
            style={styles.voiceButton}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
            accessibilityRole="button"
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={isTablet ? 28 : 24}
              color={isRecording ? colors.error : colors.primary}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              isTablet && styles.inputTablet,
              isSmallDevice && styles.inputSmall
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            accessibilityLabel="Message input"
            accessibilityRole="textbox"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !message.trim() }}
          >
            <Ionicons
              name="send"
              size={isTablet ? 28 : 24}
              color={message.trim() ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showDetails}
        animationType={modalConfig.default.animationType}
        transparent={modalConfig.default.transparent}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GroupDetails
              group={groupDetails?.info}
              stats={groupDetails?.stats}
              recentActivity={groupDetails?.recentActivity}
              onShare={handleShareGroup}
              onCopyLink={handleCopyLink}
              onViewMembers={handleViewMembers}
              onViewMedia={handleViewMedia}
              onClose={() => setShowDetails(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSettings}
        animationType={modalConfig.default.animationType}
        transparent={modalConfig.default.transparent}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GroupSettings
              preferences={preferences}
              isAdmin={isAdmin}
              groupId={groupId}
              members={members}
              onAction={handleGroupAction}
              onHideContent={handleHideContent}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onPromoteMember={handlePromoteMember}
              onDemoteMember={handleDemoteMember}
              onBlockMember={handleBlockMember}
              onUnblockMember={handleUnblockMember}
              onClose={() => setShowSettings(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMemberProfile}
        animationType={modalConfig.default.animationType}
        transparent={modalConfig.default.transparent}
        onRequestClose={() => setShowMemberProfile(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Member profile content */}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showContactProfile}
        animationType={modalConfig.default.animationType}
        transparent={modalConfig.default.transparent}
        onRequestClose={() => setShowContactProfile(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Contact profile content */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.xs,
  },
  groupInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  groupName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  memberCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarTablet: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 4,
  },
  senderInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  senderNameTablet: {
    fontSize: 12,
  },
  senderNameSmall: {
    fontSize: 10,
  },
  senderUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  senderUsernameTablet: {
    fontSize: 10,
  },
  senderUsernameSmall: {
    fontSize: 8,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextTablet: {
    fontSize: 12,
    lineHeight: 16,
  },
  messageTextSmall: {
    fontSize: 10,
    lineHeight: 14,
  },
  mediaContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampTablet: {
    fontSize: 10,
  },
  timestampSmall: {
    fontSize: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainerKeyboardVisible: {
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : 0,
  },
  voiceButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputTablet: {
    fontSize: fontSize.sm,
    paddingVertical: spacing.xs,
  },
  inputSmall: {
    fontSize: fontSize.sm,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    padding: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 12,
    ...shadows.medium,
  },
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  blockedText: {
    fontSize: fontSize.lg,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  blockedSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockedText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  lockedSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    ...shadows.small,
  },
  searchFilters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
  },
  searchFilterText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  searchFilterActive: {
    backgroundColor: colors.primaryLight,
  },
  searchFilterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginVertical: 4,
  },
  voiceMessageInfo: {
    marginLeft: 12,
    flex: 1,
  },
  voiceMessageDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  voiceMessageWaveform: {
    height: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
}); 