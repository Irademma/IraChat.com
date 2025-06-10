import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../services/firebaseSimple';
import { MessageStatus } from './MessageStatus';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatRoomProps {
  chatId: string;
  partnerName: string;
  partnerAvatar: string;
  isOnline: boolean;
  partnerId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  chatId,
  partnerName,
  partnerAvatar,
  isOnline,
  partnerId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      console.warn('No authenticated user found');
      return;
    }

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'sent',
      });

      // Update message status to delivered
      setTimeout(async () => {
        await updateDoc(doc(db, `chats/${chatId}/messages/${messageRef.id}`), {
          status: 'delivered',
        });
      }, 1000);

      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setNewMessage(text);
    setIsTyping(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <Image
          source={{ uri: partnerAvatar }}
          className="w-10 h-10 rounded-full"
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {partnerName}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${
              message.senderId === currentUser?.uid ? 'items-end' : 'items-start'
            }`}
          >
            <View
              className={`max-w-[80%] rounded-lg p-3 ${
                message.senderId === currentUser?.uid
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`${
                  message.senderId === currentUser?.uid
                    ? 'text-white'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {message.text}
              </Text>
              <View className="flex-row items-center justify-end mt-1">
                <Text
                  className={`text-xs ${
                    message.senderId === currentUser?.uid
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp?.toDate().toLocaleTimeString()}
                </Text>
                {message.senderId === currentUser?.uid && (
                  <MessageStatus status={message.status} />
                )}
              </View>
            </View>
          </View>
        ))}
        {isTyping && (
          <View className="items-start mb-4">
            <View className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {partnerName} is typing...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View className="p-4 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <TouchableOpacity className="p-2">
            <Ionicons name="attach" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 mx-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white"
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={newMessage}
            onChangeText={handleTextChange}
            multiline
          />
          <TouchableOpacity
            className="p-2 bg-blue-500 rounded-full"
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}; 