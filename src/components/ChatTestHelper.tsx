// Test Helper Component for Creating Sample Chats
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatService, userService, messageService } from '../services/firestoreService';
import { auth } from '../services/firebaseSimple';

export const ChatTestHelper: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createSampleChats = async () => {
    setIsCreating(true);
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      console.log('🧪 Creating sample chats for testing...');

      // Create sample users first
      await userService.createUserProfile({
        uid: 'sample-user-1',
        email: 'alice@example.com',
        displayName: 'Alice Johnson',
        phoneNumber: '+1234567890',
        avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A'
      });

      await userService.createUserProfile({
        uid: 'sample-user-2', 
        email: 'bob@example.com',
        displayName: 'Bob Smith',
        phoneNumber: '+1234567891',
        avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=B'
      });

      await userService.createUserProfile({
        uid: 'sample-user-3',
        email: 'charlie@example.com', 
        displayName: 'Charlie Brown',
        phoneNumber: '+1234567892',
        avatar: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=C'
      });

      // Create sample chats
      const chat1Id = await chatService.createChat([currentUser.uid, 'sample-user-1'], false);
      const chat2Id = await chatService.createChat([currentUser.uid, 'sample-user-2'], false);
      const chat3Id = await chatService.createChat([currentUser.uid, 'sample-user-3'], false);
      const groupChatId = await chatService.createChat([currentUser.uid, 'sample-user-1', 'sample-user-2'], true, 'Test Group');

      // Send sample messages
      await messageService.sendMessage(chat1Id, currentUser.uid, {
        text: 'Hey Alice! How are you doing?',
        type: 'text'
      });

      await messageService.sendMessage(chat2Id, 'sample-user-2', {
        text: 'Hi there! Ready for the meeting?',
        type: 'text'
      });

      await messageService.sendMessage(chat3Id, currentUser.uid, {
        text: 'Charlie, did you see the latest updates?',
        type: 'text'
      });

      await messageService.sendMessage(groupChatId, currentUser.uid, {
        text: 'Welcome to our test group chat!',
        type: 'text'
      });

      console.log('✅ Sample chats created successfully!');
      Alert.alert(
        '✅ Success!',
        'Created 4 sample chats with messages. You can now test the delete functionality!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('❌ Error creating sample chats:', error);
      Alert.alert(
        '❌ Error',
        `Failed to create sample chats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 16, 
      margin: 16, 
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        🧪 Test Delete Functionality
      </Text>

      <Text style={{ 
        fontSize: 14, 
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 20
      }}>
        Create sample chats to test the delete feature
      </Text>

      <TouchableOpacity
        onPress={createSampleChats}
        disabled={isCreating}
        style={{
          backgroundColor: '#87CEEB',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          opacity: isCreating ? 0.7 : 1
        }}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              Create Sample Chats
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={{ 
        fontSize: 12, 
        color: '#9ca3af',
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        This will create 4 test chats with messages
      </Text>
    </View>
  );
};
