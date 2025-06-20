import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
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
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { auth, db } from "../services/firebaseSimple";
import { MessageStatus } from "./MessageStatus";

// Enhanced Message Interface
interface Message {
  id: string;
  text?: string;
  senderId: string;
  timestamp: any;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "audio" | "document" | "voice";
  mediaUrl?: string;
  mediaThumbnail?: string;
  duration?: number; // for audio/video
  fileName?: string; // for documents
  fileSize?: number;
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
}

// Reaction Interface
interface Reaction {
  emoji: string;
  users: string[];
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
  // Core State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // Media & Voice State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // UI State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Animation Values
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const replyAnimation = useRef(new Animated.Value(0)).current;

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentUser = auth?.currentUser;
  const { width: screenWidth } = Dimensions.get("window");

  // Load Messages with Real-time Updates - Optimized for faster loading
  useEffect(() => {
    if (!currentUser || !chatId) {
      console.warn("Missing required data for message loading");
      return;
    }

    // Add a small delay to allow UI to render first
    const timeoutId = setTimeout(() => {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy("timestamp", "asc"),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];

          setMessages(newMessages);

          // Optimize scroll timing - only scroll if messages exist
          if (newMessages.length > 0) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false }); // Disable animation for faster loading
            }, 50); // Reduced timeout
          }

          // Defer read marking to not block UI
          setTimeout(() => {
            markMessagesAsRead(newMessages);
          }, 100);
        },
        (error) => {
          console.error("❌ Message listener error:", error);
        }
      );

      return () => unsubscribe();
    }, 50); // Small delay to let UI render first

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [chatId, currentUser]);

  // Typing Indicator Effect - Lazy loaded
  useEffect(() => {
    // Defer animation setup to not block initial render
    const animationTimeout = setTimeout(() => {
      if (partnerTyping) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingAnimation, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(typingAnimation, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      } else {
        typingAnimation.setValue(0);
      }
    }, 100);

    return () => clearTimeout(animationTimeout);
  }, [partnerTyping]);

  // Reply Animation Effect - Lazy loaded
  useEffect(() => {
    // Defer animation setup to not block initial render
    const animationTimeout = setTimeout(() => {
      if (replyingTo) {
        Animated.spring(replyAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(replyAnimation, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }, 100);

    return () => clearTimeout(animationTimeout);
  }, [replyingTo]);

  // Recording Animation Effect - Only when needed
  useEffect(() => {
    if (isRecording) {
      // Start animation immediately when recording starts
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      recordingAnimation.setValue(1);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  // Mark Messages as Read
  const markMessagesAsRead = useCallback(
    async (messagesToMark: Message[]) => {
      if (!currentUser) return;

      const unreadMessages = messagesToMark.filter(
        (msg) => msg.senderId !== currentUser.uid && msg.status !== "read",
      );

      for (const message of unreadMessages) {
        try {
          await updateDoc(doc(db, `chats/${chatId}/messages/${message.id}`), {
            status: "read",
          });
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    },
    [currentUser, chatId],
  );

  // Send Text Message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageData: Partial<Message> = {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "text",
      };

      // Add reply data if replying
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text || "Media",
          senderName:
            replyingTo.senderId === currentUser.uid ? "You" : partnerName,
          type: replyingTo.type,
        };
      }

      const messageRef = await addDoc(
        collection(db, `chats/${chatId}/messages`),
        messageData,
      );

      // Update message status to delivered after 1 second
      setTimeout(async () => {
        await updateDoc(doc(db, `chats/${chatId}/messages/${messageRef.id}`), {
          status: "delivered",
        });
      }, 1000);

      // Mark as read after 3 seconds (simulating partner reading)
      setTimeout(async () => {
        await updateDoc(doc(db, `chats/${chatId}/messages/${messageRef.id}`), {
          status: "read",
        });
      }, 3000);

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

  // Edit Message
  const editMessage = async (messageId: string, newText: string) => {
    if (!currentUser || !newText.trim()) return;

    try {
      await updateDoc(doc(db, `chats/${chatId}/messages/${messageId}`), {
        text: newText,
        isEdited: true,
        editedAt: serverTimestamp(),
      });

      setEditingMessage(null);
      setShowMessageActions(false);
    } catch (error) {
      console.error("Error editing message:", error);
      Alert.alert("Error", "Failed to edit message");
    }
  };

  // Delete Message
  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, `chats/${chatId}/messages/${messageId}`));
      setShowMessageActions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Failed to delete message");
    }
  };

  // Forward Message
  const forwardMessage = async (message: Message, targetChatId: string) => {
    if (!currentUser) return;

    try {
      const forwardedMessage: Partial<Message> = {
        text: message.text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent",
        type: message.type,
        mediaUrl: message.mediaUrl,
        fileName: message.fileName,
        isForwarded: true,
        forwardedFrom: partnerName,
      };

      await addDoc(
        collection(db, `chats/${targetChatId}/messages`),
        forwardedMessage,
      );
      Alert.alert("Success", "Message forwarded");
    } catch (error) {
      console.error("Error forwarding message:", error);
      Alert.alert("Error", "Failed to forward message");
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to record voice messages",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);
      Vibration.vibrate(50); // Haptic feedback
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Send voice message
        await sendVoiceMessage(uri);
      }

      Vibration.vibrate(50); // Haptic feedback
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const sendVoiceMessage = async (audioUri: string) => {
    if (!currentUser) return;

    try {
      // In a real app, you'd upload to Firebase Storage first
      // For now, we'll store the local URI
      const messageData: Partial<Message> = {
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "voice",
        mediaUrl: audioUri,
        duration: recordingDuration,
      };

      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text || "Media",
          senderName:
            replyingTo.senderId === currentUser.uid ? "You" : partnerName,
          type: replyingTo.type,
        };
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending voice message:", error);
      Alert.alert("Error", "Failed to send voice message");
    }
  };

  // Play Voice Message
  const playVoiceMessage = async (uri: string, messageId: string) => {
    try {
      if (playingAudio === messageId) {
        // Stop current audio
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
          setPlayingAudio(null);
        }
        return;
      }

      // Stop any currently playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
      );

      setSound(newSound);
      setPlayingAudio(messageId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ((status as any).didJustFinish) {
          setPlayingAudio(null);
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing voice message:", error);
      Alert.alert("Error", "Failed to play voice message");
    }
  };

  // Media Functions
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library permission",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMediaMessage(result.assets[0].uri, "image");
      }

      setShowAttachmentMenu(false);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera permission");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMediaMessage(result.assets[0].uri, "image");
      }

      setShowAttachmentMenu(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await sendMediaMessage(asset.uri, "document", asset.name, asset.size);
      }

      setShowAttachmentMenu(false);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const sendMediaMessage = async (
    mediaUri: string,
    type: "image" | "video" | "document",
    fileName?: string,
    fileSize?: number,
  ) => {
    if (!currentUser) return;

    try {
      const messageData: Partial<Message> = {
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent",
        type,
        mediaUrl: mediaUri,
        fileName,
        fileSize,
      };

      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text || "Media",
          senderName:
            replyingTo.senderId === currentUser.uid ? "You" : partnerName,
          type: replyingTo.type,
        };
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending media message:", error);
      Alert.alert("Error", "Failed to send media");
    }
  };

  // Reaction Functions
  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`);
      const message = messages.find((m) => m.id === messageId);

      if (message) {
        const currentReactions = message.reactions || {};
        const updatedReactions = { ...currentReactions };

        // Toggle reaction
        if (updatedReactions[currentUser.uid] === emoji) {
          delete updatedReactions[currentUser.uid];
        } else {
          updatedReactions[currentUser.uid] = emoji;
        }

        await updateDoc(messageRef, {
          reactions: updatedReactions,
        });
      }

      setShowMessageActions(false);
    } catch (error) {
      console.error("Error adding reaction:", error);
      Alert.alert("Error", "Failed to add reaction");
    }
  };

  // Message Actions
  const handleMessageLongPress = (message: Message) => {
    if (message.senderId === currentUser?.uid || message.type === "text") {
      setSelectedMessage(message);
      setShowMessageActions(true);
      Vibration.vibrate(50); // Haptic feedback
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowMessageActions(false);
    textInputRef.current?.focus();
  };

  const handleEdit = (message: Message) => {
    if (message.senderId === currentUser?.uid && message.type === "text") {
      setEditingMessage(message);
      setNewMessage(message.text || "");
      setShowMessageActions(false);
      textInputRef.current?.focus();
    }
  };

  const handleDelete = (message: Message) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage(message.id),
        },
      ],
    );
  };

  const handleForward = (message: Message) => {
    // In a real app, you'd show a chat selection screen
    Alert.alert(
      "Forward Message",
      "Forward functionality would show chat selection",
    );
    setShowMessageActions(false);
  };

  const handleCopy = (message: Message) => {
    if (message.text) {
      // In React Native, you'd use Clipboard API
      Alert.alert("Copied", "Message copied to clipboard");
    }
    setShowMessageActions(false);
  };

  // Emoji reactions
  const commonEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥"];

  const handleTextChange = (text: string) => {
    setNewMessage(text);
    setIsTyping(true);

    // Clear typing indicator after 2 seconds of no typing
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Format duration for voice messages
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get reaction summary
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

  // Render Message Component
  const renderMessage = ({
    item: message,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    const isMyMessage = message.senderId === currentUser?.uid;
    const showAvatar =
      !isMyMessage &&
      (index === 0 || messages[index - 1]?.senderId !== message.senderId);
    const reactions = message.reactions || {};
    const hasReactions = Object.keys(reactions).length > 0;

    return (
      <View style={{ marginVertical: 4, paddingHorizontal: 16 }}>
        {/* Reply Preview */}
        {message.replyTo && (
          <View
            style={{
              marginLeft: isMyMessage ? 50 : 0,
              marginRight: isMyMessage ? 0 : 50,
              marginBottom: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "#f0f0f0",
                borderLeftWidth: 3,
                borderLeftColor: "#667eea",
                paddingLeft: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#667eea", fontWeight: "600" }}
              >
                {message.replyTo.senderName}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }} numberOfLines={1}>
                {message.replyTo.text}
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: isMyMessage ? "flex-end" : "flex-start",
            alignItems: "flex-end",
          }}
        >
          {/* Partner Avatar */}
          {showAvatar && !isMyMessage && (
            <Image
              source={{ uri: partnerAvatar }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 8,
              }}
            />
          )}

          {/* Message Bubble */}
          <Pressable
            onLongPress={() => handleMessageLongPress(message)}
            style={{
              maxWidth: screenWidth * 0.75,
              marginLeft: !isMyMessage && !showAvatar ? 40 : 0,
            }}
          >
            <View
              style={{
                backgroundColor: isMyMessage ? "#667eea" : "#f0f0f0",
                borderRadius: 16,
                padding: 12,
                borderBottomRightRadius: isMyMessage ? 4 : 16,
                borderBottomLeftRadius: isMyMessage ? 16 : 4,
              }}
            >
              {/* Forwarded Label */}
              {message.isForwarded && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={isMyMessage ? "#fff" : "#666"}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: isMyMessage ? "#fff" : "#666",
                      marginLeft: 4,
                      fontStyle: "italic",
                    }}
                  >
                    Forwarded from {message.forwardedFrom}
                  </Text>
                </View>
              )}

              {/* Message Content */}
              {message.type === "text" && (
                <Text
                  style={{
                    color: isMyMessage ? "#fff" : "#000",
                    fontSize: 16,
                    lineHeight: 20,
                  }}
                >
                  {message.text}
                </Text>
              )}

              {message.type === "image" && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImage(message.mediaUrl || "");
                    setShowImageViewer(true);
                  }}
                >
                  <Image
                    source={{ uri: message.mediaUrl }}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 8,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}

              {message.type === "voice" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 150,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      playVoiceMessage(message.mediaUrl || "", message.id)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isMyMessage ? "#fff" : "#667eea",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Ionicons
                      name={playingAudio === message.id ? "pause" : "play"}
                      size={16}
                      color={isMyMessage ? "#667eea" : "#fff"}
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        height: 2,
                        backgroundColor: isMyMessage
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(102,126,234,0.3)",
                        borderRadius: 1,
                      }}
                    >
                      <View
                        style={{
                          height: 2,
                          backgroundColor: isMyMessage ? "#fff" : "#667eea",
                          borderRadius: 1,
                          width: "30%", // This would be dynamic based on playback progress
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      color: isMyMessage ? "#fff" : "#666",
                      fontSize: 12,
                      marginLeft: 8,
                    }}
                  >
                    {formatDuration(message.duration || 0)}
                  </Text>
                </View>
              )}

              {message.type === "document" && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isMyMessage ? "#fff" : "#667eea",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="document"
                      size={20}
                      color={isMyMessage ? "#667eea" : "#fff"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isMyMessage ? "#fff" : "#000",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                      numberOfLines={1}
                    >
                      {message.fileName || "Document"}
                    </Text>
                    <Text
                      style={{
                        color: isMyMessage ? "rgba(255,255,255,0.8)" : "#666",
                        fontSize: 12,
                      }}
                    >
                      {message.fileSize
                        ? `${(message.fileSize / 1024).toFixed(1)} KB`
                        : "Unknown size"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Message Info */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: isMyMessage ? "rgba(255,255,255,0.8)" : "#999",
                  }}
                >
                  {message.timestamp
                    ?.toDate()
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  {message.isEdited && " • edited"}
                </Text>

                {isMyMessage && <MessageStatus status={message.status} />}
              </View>
            </View>

            {/* Reactions */}
            {hasReactions && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginTop: 4,
                  alignSelf: isMyMessage ? "flex-end" : "flex-start",
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                }}
              >
                <Text style={{ fontSize: 12 }}>
                  {getReactionSummary(reactions)}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e0e0e0",
        }}
      >
        <Image
          source={{ uri: partnerAvatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
            {partnerName}
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            {partnerTyping ? "typing..." : isOnline ? "Online" : "Offline"}
          </Text>
        </View>

        {/* Header Actions */}
        <TouchableOpacity style={{ padding: 8, marginRight: 8 }}>
          <Ionicons name="videocam" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="call" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Reply Bar */}
      {replyingTo && (
        <Animated.View
          style={{
            transform: [
              {
                translateY: replyAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: replyAnimation,
            backgroundColor: "#f0f0f0",
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 12, color: "#667eea", fontWeight: "600" }}
              >
                Replying to{" "}
                {replyingTo.senderId === currentUser?.uid
                  ? "yourself"
                  : partnerName}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }} numberOfLines={1}>
                {replyingTo.text || "Media message"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      />

      {/* Typing Indicator */}
      {partnerTyping && (
        <Animated.View
          style={{
            opacity: typingAnimation,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#f0f0f0",
              borderRadius: 16,
              padding: 12,
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#666", fontSize: 14 }}>
              {partnerName} is typing
            </Text>
            <View style={{ marginLeft: 8, flexDirection: "row" }}>
              <Animated.View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#666",
                  marginHorizontal: 1,
                  transform: [{ scale: typingAnimation }],
                }}
              />
              <Animated.View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#666",
                  marginHorizontal: 1,
                  transform: [{ scale: typingAnimation }],
                }}
              />
              <Animated.View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#666",
                  marginHorizontal: 1,
                  transform: [{ scale: typingAnimation }],
                }}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Input Bar */}
      <View
        style={{
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Platform.OS === "ios" ? 34 : 12,
        }}
      >
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
            <Ionicons name="add" size={24} color="#667eea" />
          </TouchableOpacity>

          {/* Text Input Container */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              marginRight: 8,
              minHeight: 40,
              maxHeight: 120,
              justifyContent: "center",
            }}
          >
            <TextInput
              ref={textInputRef}
              placeholder={
                editingMessage ? "Edit message..." : "Type a message..."
              }
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={handleTextChange}
              multiline
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 16,
                color: "#000",
                textAlignVertical: "center",
              }}
            />
          </View>

          {/* Emoji Button */}
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
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
            <Ionicons name="happy" size={24} color="#667eea" />
          </TouchableOpacity>

          {/* Send/Voice Button */}
          {newMessage.trim() || editingMessage ? (
            <TouchableOpacity
              onPress={
                editingMessage
                  ? () => {
                      if (editingMessage && newMessage.trim()) {
                        editMessage(editingMessage.id, newMessage);
                      }
                    }
                  : sendMessage
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#667eea",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={editingMessage ? "checkmark" : "send"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          ) : (
            <Animated.View
              style={{ transform: [{ scale: recordingAnimation }] }}
            >
              <TouchableOpacity
                onPressIn={startRecording}
                onPressOut={stopRecording}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isRecording ? "#ff4444" : "#667eea",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
              padding: 8,
              backgroundColor: "#fff5f5",
              borderRadius: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#ff4444",
                marginRight: 8,
              }}
            />
            <Text style={{ color: "#ff4444", fontSize: 14, fontWeight: "600" }}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}
      </View>

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
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 20,
                color: "#000",
              }}
            >
              Send Media
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#667eea",
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
                onPress={pickImage}
                style={{
                  alignItems: "center",
                  padding: 16,
                }}
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
                  <Ionicons name="images" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickDocument}
                style={{
                  alignItems: "center",
                  padding: 16,
                }}
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
                  <Ionicons name="document" size={30} color="white" />
                </View>
                <Text style={{ fontSize: 12, color: "#666" }}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Message Actions Modal */}
      <Modal
        visible={showMessageActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMessageActions(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowMessageActions(false)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              margin: 20,
              minWidth: 250,
            }}
          >
            {/* Reactions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 20,
                paddingVertical: 10,
              }}
            >
              {commonEmojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() =>
                    selectedMessage && addReaction(selectedMessage.id, emoji)
                  }
                  style={{
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={() => selectedMessage && handleReply(selectedMessage)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons name="arrow-undo" size={20} color="#667eea" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                Reply
              </Text>
            </TouchableOpacity>

            {selectedMessage?.senderId === currentUser?.uid &&
              selectedMessage?.type === "text" && (
                <TouchableOpacity
                  onPress={() => selectedMessage && handleEdit(selectedMessage)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Ionicons name="create" size={20} color="#667eea" />
                  <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              onPress={() => selectedMessage && handleForward(selectedMessage)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons name="arrow-forward" size={20} color="#667eea" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                Forward
              </Text>
            </TouchableOpacity>

            {selectedMessage?.type === "text" && (
              <TouchableOpacity
                onPress={() => selectedMessage && handleCopy(selectedMessage)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name="copy" size={20} color="#667eea" />
                <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                  Copy
                </Text>
              </TouchableOpacity>
            )}

            {selectedMessage?.senderId === currentUser?.uid && (
              <TouchableOpacity
                onPress={() => selectedMessage && handleDelete(selectedMessage)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name="trash" size={20} color="#ff4444" />
                <Text
                  style={{ marginLeft: 12, fontSize: 16, color: "#ff4444" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageViewer(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowImageViewer(false)}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 1,
              padding: 10,
            }}
            onPress={() => setShowImageViewer(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: screenWidth,
                height: screenWidth,
              }}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};
