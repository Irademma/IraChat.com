import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import EmptyState from '../../src/components/EmptyState';
import { RootState } from '../../src/redux/store';
import { db, getAuthInstance } from '../../src/services/firebaseSimple';
import { formatMessageTime } from '../../src/utils/dateUtils';
import {
  fontSizes,
  inputSizes,
  isCompactDevice,
  isVerySmallDevice
} from '../../src/utils/responsive';

// Message type definition
type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderPhoneNumber?: string;
  timestamp: any;
};

export default function ChatRoomScreen() {
  const { id: chatId, name: chatName, isGroup } = useLocalSearchParams();
  const navigation = useNavigation();
  const isGroupChat = isGroup === 'true';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<{uid: string; email: string | null} | null>(null);
  const [isInitializingUser, setIsInitializingUser] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Group members and participants
  const [participants, setParticipants] = useState<string[]>(
    isGroupChat ? ['+256701234567', '+256701234568', '+256701234569'] : []
  );
  const [members, setMembers] = useState<Array<{id: string; name: string; avatar: string}>>(
    isGroupChat ? [
      { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
      { id: '2', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
      { id: '3', name: 'Mike Wilson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
    ] : []
  );
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  // Initialize Firebase Auth and create user if needed
  useEffect(() => {
    const initializeFirebaseUser = async () => {
      if (!currentUser) {
        setIsInitializingUser(false);
        return;
      }

      setIsInitializingUser(true);
      try {
        console.log('🔥 Initializing Firebase user for:', currentUser.phoneNumber);
        const auth = getAuthInstance();

        // Check if auth instance is available
        if (!auth) {
          console.warn('⚠️ Firebase Auth not available, skipping user initialization');
          setIsInitializingUser(false);
          return;
        }

        // Check if user is already signed in
        if (auth.currentUser) {
          console.log('✅ Firebase user already exists');
          setFirebaseUser(auth.currentUser);
          setIsInitializingUser(false);
          return;
        }

        // Create Firebase user with email/password (using phone as email)
        const email = `${currentUser.phoneNumber.replace('+', '')}@irachat.app`;
        // Generate secure random password
        const password = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;

        try {
          // Try to sign in first
          const signInResult = await signInWithEmailAndPassword(auth, email, password);
          console.log('✅ Firebase user signed in successfully');
          setFirebaseUser(signInResult.user);
        } catch (signInError: unknown) {
          const error = signInError as {code?: string; message?: string};
          if (error.code === 'auth/user-not-found') {
            // Create new user
            const createResult = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase user created successfully');
            
            // Store user data in Firestore
            await setDoc(doc(db, 'users', createResult.user.uid), {
              uid: createResult.user.uid,
              phoneNumber: currentUser.phoneNumber,
              name: currentUser.name,
              displayName: currentUser.displayName,
              avatar: currentUser.avatar,
              status: currentUser.status,
              bio: currentUser.bio,
              isOnline: true,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            });
            
            setFirebaseUser(createResult.user);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('❌ Firebase user initialization failed:', error);
      } finally {
        setIsInitializingUser(false);
      }
    };

    initializeFirebaseUser();
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isGroupChat ? `👥 ${chatName || 'Group Chat'}` : (chatName || 'Chat'),
      headerStyle: {
        backgroundColor: isGroupChat ? '#059669' : '#667eea',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: isGroupChat ? () => (
        <TouchableOpacity
          onPress={() => {
            // Show group info with members
            Alert.alert(
              'Group Info',
              `${chatName}\n\nMembers (${members.length}):\n${members.map(m => m.name).join('\n')}`,
              [{ text: 'OK' }]
            );
          }}
          style={{ marginRight: 15 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Group information"
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ) : undefined,
    });
  }, [navigation, chatName, isGroupChat]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = (event: {endCoordinates: {height: number}}) => {
      console.log('🎹 Keyboard will show:', event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardWillHide = () => {
      console.log('🎹 Keyboard will hide');
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const keyboardDidShow = (event: {endCoordinates: {height: number}}) => {
      console.log('🎹 Keyboard did show:', event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardDidHide = () => {
      console.log('🎹 Keyboard did hide');
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    // Use different events for iOS and Android
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideListener = Keyboard.addListener(hideEvent, keyboardWillHide);
    const didShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const didHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showListener?.remove();
      hideListener?.remove();
      didShowListener?.remove();
      didHideListener?.remove();
    };
  }, []);

  // Load messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId as string, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          senderId: data.senderId || '',
          senderName: data.senderName,
          senderPhoneNumber: data.senderPhoneNumber,
          timestamp: data.timestamp
        } as Message;
      });
      setMessages(messagesData);

      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !firebaseUser) {
      console.log('❌ Cannot send message - missing data:', {
        hasInput: !!input.trim(),
        hasChatId: !!chatId,
        hasFirebaseUser: !!firebaseUser
      });
      return;
    }

    try {
      // Sending message (sensitive data removed from logs)
      console.log('📤 Sending message...');

      await addDoc(collection(db, 'chats', chatId as string, 'messages'), {
        text: input,
        senderId: firebaseUser.uid,
        senderEmail: firebaseUser.email,
        senderName: currentUser?.name || 'Unknown',
        senderPhoneNumber: currentUser?.phoneNumber || '',
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chats', chatId as string), {
        lastMessage: input,
        lastMessageAt: serverTimestamp(),
      });

      setInput('');

      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === firebaseUser?.uid;
    const horizontalMargin = isVerySmallDevice() ? 12 : 16;
    const verticalMargin = isVerySmallDevice() ? 6 : 8;
    const bubblePadding = isVerySmallDevice() ? 12 : 16;
    const borderRadius = isVerySmallDevice() ? 12 : 16;

    return (
      <View
        style={{
          marginHorizontal: horizontalMargin,
          marginVertical: verticalMargin,
          maxWidth: isVerySmallDevice() ? '85%' : '80%',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {!isMyMessage && isGroupChat && (
          <Text style={{
            fontSize: fontSizes.xs,
            color: '#059669',
            marginBottom: 4,
            marginLeft: 8,
            fontWeight: '600'
          }}>
            {item.senderName || item.senderPhoneNumber || 'Unknown'}
          </Text>
        )}
        <View
          style={{
            paddingHorizontal: bubblePadding,
            paddingVertical: isVerySmallDevice() ? 10 : 12,
            borderRadius: borderRadius,
            backgroundColor: isMyMessage ? '#667eea' : '#f3f4f6',
            borderBottomRightRadius: isMyMessage ? 4 : borderRadius,
            borderBottomLeftRadius: isMyMessage ? borderRadius : 4,
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.md,
              color: isMyMessage ? '#ffffff' : '#1f2937',
              lineHeight: fontSizes.md * 1.4,
            }}
          >
            {item.text}
          </Text>
        </View>
        <Text
          style={{
            fontSize: fontSizes.xs,
            color: '#9CA3AF',
            marginTop: 4,
            textAlign: isMyMessage ? 'right' : 'left',
            marginHorizontal: 8,
          }}
        >
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      accessible={true}
      accessibilityLabel={`Chat room with ${chatName || 'contact'}`}
    >
      <View
        style={{ flex: 1, backgroundColor: '#f1f5f9' }}
        accessible={true}
        accessibilityLabel="Chat messages area"
      >
        {/* Messages Container */}
        <View style={{ flex: 1 }}>
          {isInitializingUser ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Connecting to chat...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={require('../../assets/images/comment.png')}
              title="No messages yet"
              description="Start the conversation by sending a message"
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              getItemLayout={(_data, index) => ({
                length: 60, // Approximate height of each message
                offset: 60 * index,
                index,
              })}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={20}
              windowSize={10}
              contentContainerStyle={{
                paddingVertical: 16,
                paddingBottom: 20,
              }}
              onContentSizeChange={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel="Chat messages"
              accessibilityHint="Scroll to view more messages"
              overScrollMode="never"
              scrollEventThrottle={16}
            />
          )}
        </View>

        {/* Input Container */}
        <View
          style={{
            backgroundColor: '#f8fafc',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingHorizontal: isVerySmallDevice() ? 12 : isCompactDevice() ? 14 : 16,
            paddingVertical: isVerySmallDevice() ? 8 : 12,
            paddingBottom: Platform.OS === 'ios' ? (isVerySmallDevice() ? 8 : 12) : 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: '#f8fafc',
              minHeight: inputSizes.height,
            }}
          >
            {/* Text Input */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: inputSizes.borderRadius,
                borderWidth: 1,
                borderColor: '#cbd5e1',
                marginRight: isVerySmallDevice() ? 8 : 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <TextInput
                placeholder="Type your message..."
                value={input}
                onChangeText={setInput}
                style={{
                  paddingHorizontal: inputSizes.padding,
                  paddingVertical: inputSizes.padding,
                  fontSize: inputSizes.fontSize,
                  lineHeight: inputSizes.fontSize * 1.4,
                  maxHeight: isVerySmallDevice() ? 100 : 120,
                  minHeight: inputSizes.height,
                  color: '#1e293b',
                  textAlignVertical: 'center',
                }}
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={1000}
                onFocus={() => {
                  console.log('🎯 Input focused - scrolling to bottom');
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 300);
                }}
                accessibilityLabel="Type your message"
                accessibilityHint="Enter text to send a message"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!input.trim() || !firebaseUser}
              style={{
                width: inputSizes.height,
                height: inputSizes.height,
                borderRadius: inputSizes.height / 2,
                backgroundColor: (input.trim() && firebaseUser) ? '#667eea' : '#cbd5e1',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
              }}
              accessibilityLabel="Send message"
              accessibilityHint="Tap to send your message"
            >
              <Ionicons
                name="send"
                size={isVerySmallDevice() ? 16 : 20}
                color={(input.trim() && firebaseUser) ? '#ffffff' : '#64748b'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
