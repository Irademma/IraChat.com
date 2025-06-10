import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Button from '../components/ui/Button';
import { useTheme } from '../components/ThemeProvider';

interface CreateGroupScreenProps {
  navigation: any;
}

export default function CreateGroupScreen({ navigation }: CreateGroupScreenProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'chats'), {
        name: groupName,
        description: groupDescription.trim() || '',
        isGroup: true,
        participants: [],
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: colors.background
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 32
        }}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: 32
          }}>
            <Image
              source={require('../../assets/images/groups.png')}
              style={{
                width: 64,
                height: 64,
                marginBottom: 16,
                tintColor: colors.primary
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 8,
              color: colors.text
            }}>
              Create New Group
            </Text>
            <Text style={{
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              Start a group conversation
            </Text>
          </View>

          {/* Input Fields */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontWeight: '500',
                marginBottom: 8,
                color: colors.text
              }}>
                Group Name *
              </Text>
              <TextInput
                placeholder="Enter group name..."
                value={groupName}
                onChangeText={setGroupName}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
                editable={!loading}
                placeholderTextColor={colors.textMuted}
                maxLength={50}
              />
            </View>

            <View>
              <Text style={{
                fontWeight: '500',
                marginBottom: 8,
                color: colors.text
              }}>
                Description (Optional)
              </Text>
              <TextInput
                placeholder="Enter group description..."
                value={groupDescription}
                onChangeText={setGroupDescription}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  height: 80,
                }}
                editable={!loading}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Create Button */}
          <View style={{ marginBottom: 24 }}>
            <Button
              title={loading ? "Creating Group..." : "Create Group"}
              onPress={handleCreateGroup}
              disabled={loading || !groupName.trim()}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
              icon="people-outline"
            />
          </View>

          {/* Info */}
          <View style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: colors.backgroundSecondary
          }}>
            <Text style={{
              fontSize: 14,
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              You can add members to the group after creating it
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
