import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdvancedGroupHeader } from "../components/AdvancedGroupHeader";
import { SwipeableMessage } from "../components/SwipeableMessage";
import { XStyleMediaViewer } from "../components/XStyleMediaViewer";
import { GroupProfilePanel } from "../components/GroupProfilePanel";
import { ScrollAwareLayout } from "../components/ScrollAwareLayout";

interface EnhancedGroupChatScreenProps {
  groupId: string;
  currentUserId: string;
  onBack: () => void;
}

export const EnhancedGroupChatScreen: React.FC<
  EnhancedGroupChatScreenProps
> = ({ groupId, currentUserId, onBack }) => {
  // State management
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showGroupProfile, setShowGroupProfile] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Mock data - replace with real data from your backend
  const groupInfo = {
    id: groupId,
    name: "IraChat Team",
    avatar: "https://via.placeholder.com/100",
    description: "Official IraChat development team",
    memberCount: 12,
    createdAt: new Date(),
  };

  const members = [
    {
      id: "1",
      name: "John Admin",
      username: "@johnadmin",
      avatar: "https://via.placeholder.com/40",
      role: "admin" as const,
      joinedAt: new Date(),
      lastSeen: new Date(),
    },
    {
      id: "2",
      name: "Jane Member",
      username: "@janemember",
      avatar: "https://via.placeholder.com/40",
      role: "member" as const,
      joinedAt: new Date(),
      lastSeen: new Date(),
    },
  ];

  const mostActiveUser = {
    id: "2",
    name: "Jane Member",
    avatar: "https://via.placeholder.com/24",
    isVisible: true, // 24-hour visibility cycle
  };

  const admins = members
    .filter((m) => m.role === "admin")
    .map((admin) => ({
      id: admin.id,
      name: admin.name,
      username: admin.username,
    }));

  const groupSettings = {
    isMuted: false,
    allowMemberAdditions: true,
  };

  const flatListRef = useRef<FlatList>(null);

  // Mock messages
  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: "Welcome to the IraChat team group!",
        sender: {
          id: "1",
          name: "John Admin",
          avatar: "https://via.placeholder.com/32",
        },
        timestamp: new Date(Date.now() - 3600000),
        type: "text",
      },
      {
        id: "2",
        content: "Thanks for adding me!",
        sender: {
          id: "2",
          name: "Jane Member",
          avatar: "https://via.placeholder.com/32",
        },
        timestamp: new Date(Date.now() - 1800000),
        type: "text",
      },
      {
        id: "3",
        content: "Check out this screenshot of the new feature",
        sender: {
          id: "1",
          name: "John Admin",
          avatar: "https://via.placeholder.com/32",
        },
        timestamp: new Date(Date.now() - 900000),
        type: "image",
        media: [
          {
            id: "media1",
            uri: "https://via.placeholder.com/300x200",
            type: "image",
          },
        ],
      },
    ]);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: {
        id: currentUserId,
        name: "You",
        avatar: "https://via.placeholder.com/32",
      },
      timestamp: new Date(),
      type: "text",
      replyTo: replyingTo,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setReplyingTo(null);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReply = (message: any) => {
    setReplyingTo(message);
    Alert.alert("Reply", `Replying to: ${message.content.substring(0, 50)}...`);
  };

  const handleArchive = (message: any) => {
    Alert.alert(
      "Archive",
      `Message archived: ${message.content.substring(0, 50)}...`,
    );
  };

  const handleMediaPress = (mediaUri: string, mediaType: string) => {
    setSelectedMedia({
      uri: mediaUri,
      type: mediaType,
      id: Date.now().toString(),
    });
    setShowMediaViewer(true);
  };

  const handleGroupProfilePress = () => {
    setShowGroupProfile(true);
  };

  const renderMessage = ({ item }: { item: any }) => (
    <SwipeableMessage
      message={item}
      isOwnMessage={item.sender.id === currentUserId}
      onReply={handleReply}
      onArchive={handleArchive}
      onMediaPress={handleMediaPress}
    />
  );

  const renderHeader = () => (
    <AdvancedGroupHeader
      groupName={groupInfo.name}
      groupAvatar={groupInfo.avatar}
      memberCount={groupInfo.memberCount}
      admins={admins}
      mostActiveUser={mostActiveUser}
      onGroupProfilePress={handleGroupProfilePress}
      onBack={onBack}
      isScrolled={!isHeaderVisible}
    />
  );

  const renderFooter = () => (
    <View
      style={{
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
      }}
    >
      {/* Reply indicator */}
      {replyingTo && (
        <View
          style={{
            backgroundColor: "#f0f0f0",
            padding: 8,
            borderRadius: 8,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 12, color: "#666" }}>
            Replying to: {replyingTo.content.substring(0, 30)}...
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input area */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            maxHeight: 100,
          }}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={{
            backgroundColor: "#667eea",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollAwareLayout
        headerComponent={renderHeader()}
        footerComponent={renderFooter()}
        onHeaderVisibilityChange={setIsHeaderVisible}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </ScrollAwareLayout>

      {/* Group Profile Panel */}
      <GroupProfilePanel
        visible={showGroupProfile}
        onClose={() => setShowGroupProfile(false)}
        groupInfo={groupInfo}
        members={members}
        currentUserId={currentUserId}
        isCurrentUserAdmin={
          members.find((m) => m.id === currentUserId)?.role === "admin"
        }
        sharedMedia={[]}
        sharedFiles={[]}
        sharedLinks={[]}
        recentEvents={[]}
        groupSettings={groupSettings}
        onUpdateGroupSettings={() => {}}
        onAddMember={() =>
          Alert.alert("Add Member", "Add member functionality")
        }
        onRemoveMember={() =>
          Alert.alert("Remove Member", "Remove member functionality")
        }
        onPromoteMember={() =>
          Alert.alert("Promote Member", "Promote member functionality")
        }
        onDemoteMember={() =>
          Alert.alert("Demote Member", "Demote member functionality")
        }
        onChangeGroupPhoto={() =>
          Alert.alert("Change Photo", "Change group photo functionality")
        }
        onChangeGroupName={() =>
          Alert.alert("Change Name", "Change group name functionality")
        }
        onMediaPress={handleMediaPress}
      />

      {/* X-Style Media Viewer */}
      <XStyleMediaViewer
        visible={showMediaViewer}
        mediaItem={selectedMedia}
        onClose={() => setShowMediaViewer(false)}
        onDelete={() => Alert.alert("Delete", "Delete media functionality")}
        canDelete={selectedMedia?.sender?.id === currentUserId}
      />
    </KeyboardAvoidingView>
  );
};
