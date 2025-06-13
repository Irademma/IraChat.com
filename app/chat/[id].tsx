import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import EmptyState from '../../src/components/EmptyState';
import { RootState } from '../../src/redux/store';
import { db, getAuthInstance } from '../../src/services/firebaseSimple';
import { formatMessageTime } from '../../src/utils/dateUtils';

export default function ChatRoomScreen() {
  const { id: chatId, name: chatName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  // Initialize Firebase Auth and create user if needed
  useEffect(() => {
    const initializeFirebaseUser = async () => {
      if (!currentUser) return;

      try {
        console.log('🔥 Initializing Firebase user for:', currentUser.phoneNumber);
        const auth = getAuthInstance();

        // Check if auth instance is available
        if (!auth) {
          console.warn('⚠️ Firebase Auth not available, skipping user initialization');
          return;
        }

        // Check if user is already signed in
        if (auth.currentUser) {
          console.log('✅ Firebase user already exists:', auth.currentUser.uid);
          setFirebaseUser(auth.currentUser);
          return;
        }

        // 🔒 PHONE-BASED AUTH: Use phone number as unique identifier
        console.log('📱 Using phone-based authentication for messaging');

        // Create a consistent user ID based on phone number for messaging
        const phoneBasedUserId = `phone_${currentUser.phoneNumber.replace(/[^0-9]/g, '')}`;

        // Check if user document exists in Firestore
        try {
          const userDocRef = doc(db, 'users', phoneBasedUserId);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create user document in Firestore for messaging
            await setDoc(userDocRef, {
              uid: phoneBasedUserId,
              phoneNumber: currentUser.phoneNumber,
              name: currentUser.name,
              displayName: currentUser.displayName || currentUser.name,
              username: currentUser.username,
              avatar: currentUser.avatar,
              status: currentUser.status,
              bio: currentUser.bio,
              isOnline: true,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            });
            console.log('✅ Created user document for messaging:', phoneBasedUserId);
          } else {
            console.log('✅ User document exists for messaging:', phoneBasedUserId);
          }

          // Set a mock Firebase user object for messaging compatibility
          setFirebaseUser({
            uid: phoneBasedUserId,
            phoneNumber: currentUser.phoneNumber,
            displayName: currentUser.name,
            email: null // No email needed for phone-based auth
          });

        } catch (firestoreError) {
          console.error('❌ Error setting up user for messaging:', firestoreError);
          // Still set the user for messaging to work
          setFirebaseUser({
            uid: phoneBasedUserId,
            phoneNumber: currentUser.phoneNumber,
            displayName: currentUser.name,
            email: null
          });
        }
      } catch (error) {
        console.error('❌ Firebase user initialization failed:', error);
      }
    };

    initializeFirebaseUser();
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: chatName || 'Chat',
      headerStyle: {
        backgroundColor: '#667eea',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, chatName]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      console.log('🎹 Keyboard will show:', event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardWillHide = () => {
      console.log('🎹 Keyboard will hide');
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const keyboardDidShow = (event: any) => {
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
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      console.log('📤 Sending message with Firebase user:', {
        senderId: firebaseUser.uid,
        senderEmail: firebaseUser.email,
        text: input
      });

      await addDoc(collection(db, 'chats', chatId as string, 'messages'), {
        text: input,
        senderId: firebaseUser.uid,
        senderName: currentUser?.name || 'Unknown',
        senderPhoneNumber: currentUser?.phoneNumber || '',
        senderUsername: currentUser?.username || '',
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

  const renderItem = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === firebaseUser?.uid;

    return (
      <View
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          maxWidth: '80%',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {!isMyMessage && (
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4, marginLeft: 8 }}>
            {item.senderName || item.senderPhoneNumber || 'Unknown'}
          </Text>
        )}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: isMyMessage ? '#667eea' : '#f3f4f6',
            borderBottomRightRadius: isMyMessage ? 4 : 16,
            borderBottomLeftRadius: isMyMessage ? 16 : 4,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isMyMessage ? '#ffffff' : '#1f2937',
            }}
          >
            {item.text}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
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
    >
      <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
        {/* Messages Container */}
        <View style={{ flex: 1 }}>
          {messages.length === 0 ? (
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
              showsVerticalScrollIndicator={false}
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
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: Platform.OS === 'ios' ? 12 : 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: '#f8fafc',
              minHeight: 48,
            }}
          >
            {/* Text Input */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#cbd5e1',
                marginRight: 12,
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
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  fontSize: 16,
                  lineHeight: 22,
                  maxHeight: 120,
                  minHeight: 48,
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
                width: 48,
                height: 48,
                borderRadius: 24,
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
                size={20}
                color={(input.trim() && firebaseUser) ? '#ffffff' : '#64748b'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
