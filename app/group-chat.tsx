import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GroupMessage {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'video' | 'document' | 'audio';
    uri: string;
    name: string;
    size?: number;
    thumbnail?: string;
  }[];
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export default function GroupChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const attachmentMenuAnimation = useRef(new Animated.Value(0)).current;

  const groupName = params.groupName as string || "Group Chat";
  const groupAvatar = params.groupAvatar as string || "";
  const currentUserId = "current-user";

  // Sample group members for testing
  useEffect(() => {
    const sampleMembers: GroupMember[] = [
      {
        id: 'current-user',
        name: 'You',
        isOnline: true,
      },
      {
        id: 'alice',
        name: 'Alice Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=10B981&color=fff',
        isOnline: true,
      },
      {
        id: 'bob',
        name: 'Bob Smith',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=3B82F6&color=fff',
        isOnline: false,
      },
    ];
    setMembers(sampleMembers);
  }, []);

  // Sample messages for testing
  useEffect(() => {
    const sampleMessages: GroupMessage[] = [
      {
        id: '1',
        text: 'Hey everyone! Welcome to our group chat 🎉',
        timestamp: new Date(Date.now() - 7200000),
        senderId: 'alice',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=10B981&color=fff',
        isOwn: false,
        status: 'read'
      },
      {
        id: '2',
        text: 'Thanks for creating this! This will be really helpful for our project.',
        timestamp: new Date(Date.now() - 7100000),
        senderId: 'current-user',
        senderName: 'You',
        isOwn: true,
        status: 'read'
      },
      {
        id: '3',
        text: 'Absolutely! Looking forward to collaborating with everyone.',
        timestamp: new Date(Date.now() - 7000000),
        senderId: 'bob',
        senderName: 'Bob Smith',
        senderAvatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=3B82F6&color=fff',
        isOwn: false,
        status: 'read'
      },
      {
        id: '4',
        text: 'Should we schedule a meeting for next week?',
        timestamp: new Date(Date.now() - 6900000),
        senderId: 'alice',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=10B981&color=fff',
        isOwn: false,
        status: 'read'
      },
      {
        id: '5',
        text: 'Great idea! I\'m free Tuesday and Wednesday afternoons.',
        timestamp: new Date(Date.now() - 300000),
        senderId: 'current-user',
        senderName: 'You',
        isOwn: true,
        status: 'delivered'
      },
      {
        id: '6',
        text: 'Here are some photos from our last project:',
        timestamp: new Date(Date.now() - 240000),
        senderId: 'bob',
        senderName: 'Bob Smith',
        senderAvatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=3B82F6&color=fff',
        isOwn: false,
        status: 'read',
        attachments: [
          {
            type: 'image',
            uri: 'https://picsum.photos/300/200?random=1',
            name: 'project_photo_1.jpg',
            size: 245760
          }
        ]
      },
      {
        id: '7',
        text: 'And here\'s the project document:',
        timestamp: new Date(Date.now() - 180000),
        senderId: 'current-user',
        senderName: 'You',
        isOwn: true,
        status: 'delivered',
        attachments: [
          {
            type: 'document',
            uri: 'file://project_proposal.pdf',
            name: 'Project_Proposal_2024.pdf',
            size: 2048000
          }
        ]
      }
    ];
    setMessages(sampleMessages);
  }, []);

  const sendMessage = () => {
    if (inputText.trim()) {
      sendMessageWithAttachments(inputText.trim(), []);
    }
  };

  const sendMessageWithAttachments = (text: string, attachments: any[]) => {
    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      text: text,
      timestamp: new Date(),
      senderId: currentUserId,
      senderName: 'You',
      isOwn: true,
      status: 'sent',
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Attachment functionality
  const toggleAttachmentMenu = () => {
    const toValue = showAttachmentMenu ? 0 : 1;
    setShowAttachmentMenu(!showAttachmentMenu);

    Animated.spring(attachmentMenuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to share images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const attachments = result.assets.map(asset => ({
          type: 'image' as const,
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize,
        }));

        sendMessageWithAttachments('', attachments);
        toggleAttachmentMenu();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to share videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const attachment = {
          type: 'video' as const,
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `video_${Date.now()}.mp4`,
          size: result.assets[0].fileSize,
        };

        sendMessageWithAttachments('', [attachment]);
        toggleAttachmentMenu();
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const attachment = {
          type: 'image' as const,
          uri: result.assets[0].uri,
          name: `photo_${Date.now()}.jpg`,
          size: result.assets[0].fileSize,
        };

        sendMessageWithAttachments('', [attachment]);
        toggleAttachmentMenu();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const attachments = result.assets.map(asset => ({
          type: 'document' as const,
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        }));

        sendMessageWithAttachments('', attachments);
        toggleAttachmentMenu();
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const renderMessage = ({ item }: { item: GroupMessage }) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: item.isOwn ? 'flex-end' : 'flex-start',
      marginVertical: 4,
      marginHorizontal: 16,
    }}>
      {!item.isOwn && (
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#E5E7EB',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          marginTop: 4,
        }}>
          {item.senderAvatar ? (
            <Image
              source={{ uri: item.senderAvatar }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{
              color: '#6B7280',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              {item.senderName.charAt(0)}
            </Text>
          )}
        </View>
      )}
      
      <View style={{
        maxWidth: '70%',
        backgroundColor: item.isOwn ? '#667eea' : '#F3F4F6',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomRightRadius: item.isOwn ? 4 : 18,
        borderBottomLeftRadius: item.isOwn ? 18 : 4,
      }}>
        {!item.isOwn && (
          <Text style={{
            color: '#667eea',
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
          }}>
            {item.senderName}
          </Text>
        )}
        
        {item.text ? (
          <Text style={{
            color: item.isOwn ? '#FFFFFF' : '#374151',
            fontSize: 16,
            lineHeight: 22,
            marginBottom: item.attachments ? 8 : 0,
          }}>
            {item.text}
          </Text>
        ) : null}

        {/* Render Attachments */}
        {item.attachments && item.attachments.map((attachment, index) => (
          <View key={index} style={{ marginBottom: index < item.attachments!.length - 1 ? 8 : 0 }}>
            {attachment.type === 'image' ? (
              <TouchableOpacity
                onPress={() => Alert.alert("Image Viewer", "Open full-screen image viewer")}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  maxWidth: 250,
                  maxHeight: 200,
                }}
              >
                <Image
                  source={{ uri: attachment.uri }}
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
                <View style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: 'white', fontSize: 10 }}>
                    {attachment.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : attachment.type === 'video' ? (
              <TouchableOpacity
                onPress={() => Alert.alert("Video Player", "Open video player")}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  maxWidth: 250,
                  height: 150,
                  backgroundColor: '#000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="play-circle" size={50} color="white" />
                <View style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: 'white', fontSize: 10 }}>
                    📹 {attachment.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => Alert.alert("Document", `Open ${attachment.name}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: item.isOwn ? 'rgba(255, 255, 255, 0.2)' : '#F3F4F6',
                  padding: 12,
                  borderRadius: 8,
                  maxWidth: 250,
                }}
              >
                <Ionicons
                  name="document"
                  size={24}
                  color={item.isOwn ? 'white' : '#667eea'}
                />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={{
                    color: item.isOwn ? 'white' : '#374151',
                    fontSize: 14,
                    fontWeight: '600',
                  }} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  {attachment.size && (
                    <Text style={{
                      color: item.isOwn ? 'rgba(255, 255, 255, 0.7)' : '#6B7280',
                      fontSize: 12,
                    }}>
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 4,
        }}>
          <Text style={{
            color: item.isOwn ? 'rgba(255, 255, 255, 0.7)' : '#9CA3AF',
            fontSize: 12,
            marginRight: item.isOwn ? 4 : 0,
          }}>
            {formatTime(item.timestamp)}
          </Text>
          
          {item.isOwn && (
            <Ionicons 
              name={
                item.status === 'sent' ? 'checkmark' :
                item.status === 'delivered' ? 'checkmark-done' :
                'checkmark-done'
              }
              size={14}
              color={item.status === 'read' ? '#10B981' : 'rgba(255, 255, 255, 0.7)'}
            />
          )}
        </View>
      </View>
    </View>
  );

  const onlineMembers = members.filter(m => m.isOnline);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#667eea',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => {
            console.log("🔄 Group header clicked - navigating to group settings NOW");
            console.log("📋 Navigation params:", {
              groupId: params.groupId || "default-group",
              groupName: groupName,
              groupAvatar: groupAvatar,
            });

            try {
              router.push({
                pathname: "/group-settings",
                params: {
                  groupId: params.groupId || "default-group",
                  groupName: groupName,
                  groupAvatar: groupAvatar,
                }
              });
              console.log("✅ Navigation initiated successfully");
            } catch (error) {
              console.error("❌ Navigation error:", error);
              Alert.alert("Navigation Error", "Failed to open group settings");
            }
          }}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            {groupAvatar ? (
              <Image
                source={{ uri: groupAvatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="people" size={20} color="#FFFFFF" />
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
            }}>
              {groupName}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }}>
              {onlineMembers.length} online • {members.length} members
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Group Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Group Call", "Start group voice call");
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Group Video Call", "Start group video call");
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="videocam" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              style={{
                flex: 1,
                fontSize: 16,
                color: '#374151',
                maxHeight: 100,
              }}
              multiline
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity
              onPress={toggleAttachmentMenu}
              style={{ marginLeft: 8 }}
            >
              <Ionicons
                name={showAttachmentMenu ? "close" : "attach"}
                size={20}
                color={showAttachmentMenu ? "#667eea" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? '#667eea' : '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="none"
        onRequestClose={toggleAttachmentMenu}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={toggleAttachmentMenu}
        >
          <Animated.View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 40,
              transform: [
                {
                  translateY: attachmentMenuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
              opacity: attachmentMenuAnimation,
            }}
          >
            {/* Handle Bar */}
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: '#E5E7EB',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }} />

            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: 24,
            }}>
              Share Content
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginBottom: 20,
            }}>
              {/* Camera */}
              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  alignItems: 'center',
                  padding: 16,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Ionicons name="camera" size={28} color="white" />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  Camera
                </Text>
              </TouchableOpacity>

              {/* Gallery */}
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  alignItems: 'center',
                  padding: 16,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#10B981',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Ionicons name="images" size={28} color="white" />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  Gallery
                </Text>
              </TouchableOpacity>

              {/* Video */}
              <TouchableOpacity
                onPress={pickVideo}
                style={{
                  alignItems: 'center',
                  padding: 16,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#8B5CF6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Ionicons name="videocam" size={28} color="white" />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  Video
                </Text>
              </TouchableOpacity>

              {/* Document */}
              <TouchableOpacity
                onPress={pickDocument}
                style={{
                  alignItems: 'center',
                  padding: 16,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#F59E0B',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Ionicons name="document" size={28} color="white" />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  Document
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
