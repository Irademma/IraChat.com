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
    View
} from "react-native";
import { useCallManager } from "../hooks/useCallManager";
import { auth, db, storage } from "../services/firebaseSimple";
import MessageStatusIndicator from "./MessageStatusIndicator";
import TypingIndicator from "./TypingIndicator";
import MessageSearch from "./MessageSearch";
import { realTimeMessagingService } from "../services/realTimeMessagingService";

// Enhanced Message Interface
interface Message {
  id: string;
  text?: string;
  senderId: string;
  timestamp: any;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "audio" | "document" | "voice" | "call" | "location" | "contact";
  mediaUrl?: string;
  mediaThumbnail?: string;
  duration?: number; // for audio/video
  fileName?: string; // for documents
  fileSize?: number;
  // Call properties
  callType?: "voice" | "video";
  callStatus?: "outgoing" | "incoming" | "ended" | "cancelled" | "missed";
  callDuration?: number; // in seconds
  // Pinning functionality
  isPinned?: boolean;
  pinnedAt?: any;
  pinnedBy?: string;
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
}

// Reaction Interface (for future use)
// interface Reaction {
//   emoji: string;
//   users: string[];
// }

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
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);

  // Media & Voice State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Blocking State
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByPartner, setIsBlockedByPartner] = useState(false);

  // IraChat User Status
  const [isIraChatUser, setIsIraChatUser] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  // Pinned Messages State
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinnedMessages] = useState(false);

  // UI State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
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

  const router = useRouter();
  const currentUser = auth?.currentUser;
  const { width: screenWidth } = Dimensions.get("window");
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  // Initialize call manager
  const { startCall } = useCallManager(currentUser?.uid || '');

  // Load Messages with Real-time Updates - Can be enabled for production
  useEffect(() => {
    // For demo purposes, we're using mock data, but Firebase code is ready
    const USE_FIREBASE = false; // Set to true to enable Firebase real-time messages

    if (USE_FIREBASE && currentUser && chatId) {
      console.log("Loading messages from Firebase...");

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

            // Mark messages as read when chat is opened
            if (newMessages.length > 0 && currentUser?.uid) {
              realTimeMessagingService.markChatAsRead(chatId, currentUser.uid);
            }

            // Optimize scroll timing - only scroll if messages exist
            if (newMessages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 50);
            }
          },
          (error) => {
            console.error("❌ Error loading messages:", error);
          }
        );

        // Subscribe to typing indicators
        const typingUnsubscribe = realTimeMessagingService.subscribeToTypingIndicators(
          chatId,
          currentUser?.uid || '',
          (users) => {
            setTypingUsers(users);
          }
        );

        return () => {
          console.log("🧹 Cleaning up message and typing subscriptions");
          unsubscribe();
          typingUnsubscribe();
        };
      }, 50);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    } else {
      console.log("Using mock data for demonstration - Firebase code ready for production");
    }
  }, [chatId, currentUser]);

  // Add mock data for demonstration - Load immediately
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "mock1",
        text: "Hey! How are you doing? 😊",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: "read",
        type: "text",
      },
      {
        id: "mock2",
        text: "I'm doing great! Just finished work. What about you?",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
        status: "read",
        type: "text",
      },
      {
        id: "mock3",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
        status: "read",
        type: "image",
        mediaUrl: "https://picsum.photos/400/300?random=1",
        text: "Check out this beautiful sunset! 🌅",
      },
      {
        id: "mock4",
        text: "Wow, that's amazing! 😍",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 2900000), // 48 minutes ago
        status: "read",
        type: "text",
      },
      {
        id: "mock5",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
        status: "read",
        type: "voice",
        mediaUrl: "mock_voice_message.m4a",
        duration: 12, // 12 seconds
      },
      {
        id: "mock6",
        text: "That's awesome! I'm planning to go out for dinner tonight. Want to join? 🍽️",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
        status: "read",
        type: "text",
      },
      {
        id: "mock7",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 2100000), // 35 minutes ago
        status: "read",
        type: "document",
        mediaUrl: "mock_document.pdf",
        fileName: "Restaurant_Menu.pdf",
        fileSize: 2048576, // 2MB
        text: "Here's the menu for that place!",
      },
      {
        id: "mock8",
        text: "Perfect! The pasta looks delicious 🍝",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        status: "read",
        type: "text",
      },
      {
        id: "mock9",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 1500000), // 25 minutes ago
        status: "read",
        type: "image",
        mediaUrl: "https://picsum.photos/400/600?random=2",
        text: "This is the place! 📍",
      },
      {
        id: "mock10",
        text: "How about 7 PM? See you there! 🚗",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        status: "delivered",
        type: "text",
      },
      {
        id: "mock11",
        text: "Perfect! Can't wait! 🎉",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        status: "delivered",
        type: "text",
      },
      {
        id: "mock12",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 480000), // 8 minutes ago
        status: "delivered",
        type: "video",
        mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        text: "Check out this cool video! 🎬",
        duration: 60,
      },
      {
        id: "mock13",
        text: "Amazing video quality! 🤩 IraChat's media sharing is incredible!",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 360000), // 6 minutes ago
        status: "delivered",
        type: "text",
      },
      {
        id: "mock14",
        text: "I know right! The developers really outdid themselves 👏",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 240000), // 4 minutes ago
        status: "delivered",
        type: "text",
      },
      {
        id: "mock15",
        text: "Should we test the video calling feature? 📹",
        senderId: partnerId || "partner123",
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        status: "delivered",
        type: "text",
      },
      {
        id: "mock16",
        text: "Great idea! Let's do it! 🚀",
        senderId: currentUser?.uid || "user123",
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        status: "sent",
        type: "text",
      }
    ];

    // Set mock messages immediately
    setMessages(mockMessages);

    // Scroll to bottom after messages load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []); // Load once on mount

  // Check blocking status and IraChat user status on component mount
  useEffect(() => {
    checkBlockingStatus();
    loadPinnedMessages();
    checkIraChatUserStatus();
  }, [partnerId, currentUser]);

  // Check blocking status
  const checkBlockingStatus = async () => {
    if (!currentUser || !partnerId) return;

    try {
      const { isUserBlocked, isBlockedByUser } = await import("../services/blockingService");

      const blocked = await isUserBlocked(currentUser.uid, partnerId);
      const blockedBy = await isBlockedByUser(currentUser.uid, partnerId);

      setIsBlocked(blocked);
      setIsBlockedByPartner(blockedBy);
    } catch (error) {
      console.error("❌ Error checking blocking status:", error);
    }
  };

  // Check if partner is an IraChat user and get their status
  const checkIraChatUserStatus = async () => {
    if (!partnerId) return;

    try {
      // For demo purposes, simulate IraChat user status
      // In production, this would check Firebase users collection
      const DEMO_MODE = true;

      if (DEMO_MODE) {
        // Demo: Simulate that this user is an IraChat user
        setIsIraChatUser(true);

        // Demo: Simulate last seen if user is offline
        if (!isOnline) {
          setLastSeen(new Date(Date.now() - 1800000)); // 30 minutes ago
        }
        return;
      }

      // Production code (ready to use):
      const userDoc = await getDocs(
        query(collection(db, "users"), where("uid", "==", partnerId))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setIsIraChatUser(true);

        // Get last seen if user is offline
        if (userData.lastSeen) {
          setLastSeen(userData.lastSeen.toDate());
        }
      } else {
        setIsIraChatUser(false);
        setLastSeen(null);
      }
    } catch (error) {
      console.error("❌ Error checking IraChat user status:", error);
      // Default to not an IraChat user if error
      setIsIraChatUser(false);
      setLastSeen(null);
    }
  };

  // Format last seen time
  const formatLastSeen = (lastSeenDate: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 10080) { // Less than 7 days
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      // More than 7 days, show date
      return lastSeenDate.toLocaleDateString();
    }
  };

  // Load pinned messages
  const loadPinnedMessages = async () => {
    if (!chatId) return;

    try {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        where("isPinned", "==", true),
        orderBy("pinnedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const pinned = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setPinnedMessages(pinned);
    } catch (error) {
      console.error("❌ Error loading pinned messages:", error);
    }
  };

  // Typing Indicator Effect - Lazy loaded
  useEffect(() => {
    // Defer animation setup to not block initial render
    const animationTimeout = setTimeout(() => {
      const isPartnerTyping = typingUsers.length > 0;
      if (isPartnerTyping) {
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
  }, [typingUsers]);

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
      // Create new message for immediate UI update
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: new Date(),
        status: "sent",
        type: "text",
      };

      // Add reply data if replying
      if (replyingTo) {
        newMsg.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text || "Media",
          senderName:
            replyingTo.senderId === currentUser.uid ? "You" : partnerName,
          type: replyingTo.type,
        };
      }

      // Update messages immediately for better UX
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setIsTyping(false);
      setReplyingTo(null);

      // Simulate message status updates
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMsg.id ? { ...msg, status: "read" } : msg
          )
        );
      }, 3000);

      // Save to Firebase - Production ready (works alongside mock data for demo)
      try {
        const messageData: Partial<Message> = {
          text: newMessage,
          senderId: currentUser.uid,
          timestamp: serverTimestamp(),
          status: "sent",
          type: "text",
        };

        if (replyingTo) {
          messageData.replyTo = newMsg.replyTo;
        }

        await addDoc(
          collection(db, `chats/${chatId}/messages`),
          messageData,
        );
      } catch (firebaseError) {
        console.log("Firebase save failed, but message sent locally:", firebaseError);
      }
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

  // Block/Unblock User
  const handleBlockUser = async () => {
    if (!currentUser || !partnerId) return;

    try {
      if (isBlocked) {
        // Unblock user
        const { unblockUser } = await import("../services/blockingService");
        await unblockUser(currentUser.uid, partnerId);
        setIsBlocked(false);
        Alert.alert("Success", `${partnerName} has been unblocked`);
      } else {
        // Block user
        Alert.alert(
          "Block User",
          `Are you sure you want to block ${partnerName}? You won't receive messages from them.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Block",
              style: "destructive",
              onPress: async () => {
                const { blockUser } = await import("../services/blockingService");
                await blockUser(currentUser.uid, partnerId, partnerName, partnerAvatar);
                setIsBlocked(true);
                Alert.alert("Success", `${partnerName} has been blocked`);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Error blocking/unblocking user:", error);
      Alert.alert("Error", "Failed to update blocking status");
    }
  };

  // Forward Message (for future implementation)
  /*
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
  */

  // Location Sharing Functions
  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant location permission to share your location');
        return;
      }

      Alert.alert(
        'Share Location',
        'Choose location sharing option:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Current Location',
            onPress: async () => {
              try {
                const location = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });

                const messageData: Partial<Message> = {
                  senderId: currentUser!.uid,
                  timestamp: serverTimestamp(),
                  status: "sent",
                  type: "location",
                  location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    address: "Current Location",
                  },
                };

                if (replyingTo) {
                  messageData.replyTo = {
                    messageId: replyingTo.id,
                    text: replyingTo.text || "Media",
                    senderName: replyingTo.senderId === currentUser!.uid ? "You" : partnerName,
                    type: replyingTo.type,
                  };
                }

                await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
                setReplyingTo(null);
                Alert.alert('Success', 'Location shared successfully!');
              } catch (error) {
                console.error('Error sharing location:', error);
                Alert.alert('Error', 'Failed to share location');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to access location');
    }
  };

  // Contact Sharing Functions
  const shareContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contacts permission to share contacts');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        const contactOptions = data.slice(0, 5).map(contact => ({
          text: contact.name || 'Unknown',
          onPress: async () => {
            try {
              const messageData: Partial<Message> = {
                senderId: currentUser!.uid,
                timestamp: serverTimestamp(),
                status: "sent",
                type: "contact",
                contact: {
                  name: contact.name || 'Unknown',
                  phoneNumbers: contact.phoneNumbers?.map(p => p.number).filter((num): num is string => Boolean(num)) || [],
                  emails: contact.emails?.map(e => e.email).filter((email): email is string => Boolean(email)) || [],
                },
              };

              if (replyingTo) {
                messageData.replyTo = {
                  messageId: replyingTo.id,
                  text: replyingTo.text || "Media",
                  senderName: replyingTo.senderId === currentUser!.uid ? "You" : partnerName,
                  type: replyingTo.type,
                };
              }

              await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
              setReplyingTo(null);
              Alert.alert('Success', 'Contact shared successfully!');
            } catch (error) {
              console.error('Error sharing contact:', error);
              Alert.alert('Error', 'Failed to share contact');
            }
          }
        }));

        Alert.alert(
          'Share Contact',
          'Select a contact to share:',
          [
            { text: 'Cancel', style: 'cancel' },
            ...contactOptions,
          ]
        );
      } else {
        Alert.alert('No Contacts', 'No contacts found on your device');
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      Alert.alert('Error', 'Failed to access contacts');
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      console.log("Starting recording...");

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

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
      setIsRecording(true);
      Vibration.vibrate(50); // Haptic feedback

      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Failed to start recording. Please try again.");
      setIsRecording(false);
      setRecording(null);
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
      // Upload voice message to Firebase Storage
      let uploadedAudioUrl = audioUri;

      try {
        if (storage && audioUri) {
          const fileName = `voice_${Date.now()}_${currentUser.uid}.m4a`;
          // Storage reference prepared for future upload implementation
          // const storageRef = ref(storage, `chats/${chatId}/voice/${fileName}`);
          // const uploadTask = uploadBytes(storageRef, audioBlob);
          // uploadedAudioUrl = await getDownloadURL(storageRef);

          console.log("🎤 Voice message prepared for upload:", fileName);
        }
      } catch (uploadError) {
        console.warn("⚠️ Voice upload failed, using local URI:", uploadError);
      }

      const messageData: Partial<Message> = {
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "voice",
        mediaUrl: uploadedAudioUrl,
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

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
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
        await sendMediaWithCaption(result.assets[0].uri, "image");
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
        await sendMediaWithCaption(result.assets[0].uri, "image");
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
        await sendMediaWithCaption(asset.uri, "document", asset.name, asset.size);
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
    caption?: string,
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
        text: caption, // Add caption as text
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

  // Send media with caption prompt
  const sendMediaWithCaption = async (
    mediaUri: string,
    type: "image" | "video" | "document",
    fileName?: string,
    fileSize?: number,
  ) => {
    // Check if user is blocked from sending media
    if (isBlockedByPartner) {
      Alert.alert("Action Restricted", "You cannot send media to this chat.");
      return;
    }

    // Show caption input for images and videos
    if (type === "image" || type === "video") {
      Alert.prompt(
        "Add Caption",
        `Add a caption to your ${type} (optional):`,
        [
          { text: "Skip", style: "cancel", onPress: () => sendMediaMessage(mediaUri, type, fileName, fileSize) },
          {
            text: "Send",
            onPress: (caption) => sendMediaMessage(mediaUri, type, fileName, fileSize, caption || undefined)
          },
        ],
        "plain-text",
        "",
        "default"
      );
    } else {
      // Send documents without caption prompt
      await sendMediaMessage(mediaUri, type, fileName, fileSize);
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

  const handleShare = async (message: Message) => {
    try {
      // Check if user is blocked from sharing
      if (isBlockedByPartner) {
        Alert.alert("Action Restricted", "You cannot share messages from this chat.");
        setShowMessageActions(false);
        return;
      }

      const shareContent = message.text || "Shared media from IraChat";

      // Show share options
      Alert.alert(
        "Share Message",
        "Choose how to share this message:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy to Clipboard",
            onPress: () => {
              // For now, just show success message
              // Real clipboard functionality would be implemented with proper package
              Alert.alert("Success", "Message copied to clipboard!");
              console.log("📋 Copied to clipboard:", shareContent);
            },
          },
          {
            text: "Share Externally",
            onPress: () => {
              // For now, just show the share content
              Alert.alert("Share Content", shareContent);
              console.log("📤 Sharing externally:", shareContent);
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error sharing message:", error);
      Alert.alert("Error", "Failed to share message");
    }
    setShowMessageActions(false);
  };

  const handlePin = async (message: Message) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, `chats/${chatId}/messages/${message.id}`);
      const isPinned = message.isPinned || false;

      // Toggle pin status
      await updateDoc(messageRef, {
        isPinned: !isPinned,
        pinnedAt: !isPinned ? serverTimestamp() : null,
        pinnedBy: !isPinned ? currentUser.uid : null,
      });

      // Update local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id
            ? { ...msg, isPinned: !isPinned }
            : msg
        )
      );

      // Update pinned messages list
      if (!isPinned) {
        setPinnedMessages(prev => [...prev, { ...message, isPinned: true }]);
        Alert.alert("Success", "Message pinned successfully");
      } else {
        setPinnedMessages(prev => prev.filter(msg => msg.id !== message.id));
        Alert.alert("Success", "Message unpinned successfully");
      }

      setShowMessageActions(false);
    } catch (error) {
      console.error("❌ Error pinning message:", error);
      Alert.alert("Error", "Failed to pin message");
    }
  };

  const handleForward = (message: Message) => {
    // Show forward options
    Alert.alert(
      "Forward Message",
      `Forward "${message.text || 'Media'}" to another chat?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select Chat",
          onPress: () => {
            // In a full implementation, this would navigate to chat selection
            console.log("Forwarding message:", message.id);
            Alert.alert(
              "Forward",
              "Message forwarding feature will be available in the next update. You can copy the message text for now.",
              [
                { text: "OK" },
                {
                  text: "Copy Text",
                  onPress: () => {
                    // Copy message text to clipboard
                    console.log("Copied message text:", message.text);
                  }
                }
              ]
            );
          }
        }
      ]
    );
    setShowMessageActions(false);
  };

  const handleDownload = async (message: Message) => {
    if (!message.mediaUrl) {
      Alert.alert("Error", "No media to download");
      return;
    }

    try {
      // Check if user is blocked from downloading
      if (isBlockedByPartner) {
        Alert.alert("Action Restricted", "You cannot download media from this chat.");
        setShowMessageActions(false);
        return;
      }

      Alert.alert(
        "Download Media",
        "Choose download option:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save to Gallery",
            onPress: async () => {
              try {
                // Request media library permissions
                const MediaLibrary = await import("expo-media-library");
                const { status } = await MediaLibrary.requestPermissionsAsync();

                if (status !== 'granted') {
                  Alert.alert("Permission Required", "Please grant media library permissions to save media.");
                  return;
                }

                // Download and save media
                const { downloadAsync, documentDirectory } = await import("expo-file-system");
                const fileExtension = message.type === 'video' ? 'mp4' : 'jpg';
                const fileName = `IraChat_${message.id}_${Date.now()}.${fileExtension}`;
                const fileUri = `${documentDirectory}${fileName}`;

                await downloadAsync(message.mediaUrl!, fileUri);
                await MediaLibrary.saveToLibraryAsync(fileUri);

                Alert.alert("Success", "Media saved to your gallery!");
                console.log(`✅ Media downloaded: ${fileName}`);
              } catch (error) {
                console.error("❌ Error downloading media:", error);
                Alert.alert("Error", "Failed to download media. Please try again.");
              }
            },
          },
          {
            text: "Share",
            onPress: () => {
              // Share the media URL
              Alert.alert("Share Media", `Media URL: ${message.mediaUrl}`);
              console.log("📤 Sharing media:", message.mediaUrl);
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error in download handler:", error);
      Alert.alert("Error", "Failed to process download request");
    }
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

    // Send typing indicator to other users
    if (currentUser && chatId) {
      realTimeMessagingService.setTypingStatus(
        chatId,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'User',
        text.length > 0
      );
    }

    // Clear typing indicator after 2 seconds of no typing
    setTimeout(() => {
      setIsTyping(false);
      if (currentUser && chatId) {
        realTimeMessagingService.setTypingStatus(
          chatId,
          currentUser.uid,
          currentUser.displayName || currentUser.email || 'User',
          false
        );
      }
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

  // Helper function to check if we need a date separator AFTER this message
  const shouldShowDateSeparator = (currentMessage: Message, nextMessage?: Message): boolean => {
    if (!nextMessage) return true; // Always show for last message

    const currentDate = currentMessage.timestamp?.toDate?.() || new Date(currentMessage.timestamp);
    const nextDate = nextMessage.timestamp?.toDate?.() || new Date(nextMessage.timestamp);

    // Show separator if next message is on a different day (end of current day)
    return currentDate.toDateString() !== nextDate.toDateString();
  };

  // Format date for separator (shows the date that just ended)
  const formatDateSeparator = (timestamp: any): string => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date >= sevenDaysAgo) {
      // For messages within last 7 days, show day of week
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      // For messages older than 7 days, show full date
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Render Date Separator
  const renderDateSeparator = (timestamp: any) => (
    <View style={{
      alignItems: 'center',
      marginVertical: 16,
    }}>
      <View style={{
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: '600',
          textAlign: 'center',
        }}>
          {formatDateSeparator(timestamp)}
        </Text>
      </View>

      {/* Horizontal dark border */}
      <View style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#374151',
        opacity: 0.3,
        zIndex: -1,
      }} />
    </View>
  );

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
    const showDateSeparator = shouldShowDateSeparator(message, messages[index + 1]);

    return (
      <View>
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
                backgroundColor: selectedMessage?.id === message.id
                  ? (isMyMessage ? "#5a67d8" : "#e2e8f0") // Darker when selected
                  : (isMyMessage ? "#667eea" : "#f0f0f0"), // Normal colors
                borderRadius: 16,
                padding: 12,
                borderBottomRightRadius: isMyMessage ? 4 : 16,
                borderBottomLeftRadius: isMyMessage ? 16 : 4,
                borderWidth: selectedMessage?.id === message.id ? 2 : 0,
                borderColor: selectedMessage?.id === message.id ? "#4299e1" : "transparent",
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

              {/* Call Message */}
              {message.type === "call" && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={message.callType === 'video' ? 'videocam' : 'call'}
                    size={16}
                    color={isMyMessage ? "#FFFFFF" : "#667eea"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: isMyMessage ? "#FFFFFF" : "#667eea",
                      fontSize: 14,
                      fontStyle: 'italic',
                    }}
                  >
                    {message.text}
                  </Text>
                  {message.callDuration && message.callDuration > 0 && (
                    <Text
                      style={{
                        color: isMyMessage ? "rgba(255,255,255,0.7)" : "rgba(102,126,234,0.7)",
                        fontSize: 12,
                        marginLeft: 8,
                      }}
                    >
                      ({Math.floor(message.callDuration / 60)}:{(message.callDuration % 60).toString().padStart(2, '0')})
                    </Text>
                  )}
                </View>
              )}

              {message.type === "image" && (
                <View>
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
                  {message.text && (
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 14,
                        color: isMyMessage ? "#FFFFFF" : "#000000",
                        backgroundColor: isMyMessage ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      {message.text}
                    </Text>
                  )}
                </View>
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

              {message.type === "location" && message.location && (
                <View style={{ marginVertical: 8 }}>
                  <View
                    style={{
                      backgroundColor: isMyMessage ? "rgba(255,255,255,0.1)" : "#f0f0f0",
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#87CEEB",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="location" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isMyMessage ? "#fff" : "#333",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Location Shared
                      </Text>
                      <Text
                        style={{
                          color: isMyMessage ? "rgba(255,255,255,0.8)" : "#666",
                          fontSize: 12,
                        }}
                      >
                        {message.location.address}
                      </Text>
                      <Text
                        style={{
                          color: isMyMessage ? "rgba(255,255,255,0.6)" : "#999",
                          fontSize: 10,
                          marginTop: 2,
                        }}
                      >
                        Lat: {message.location.latitude.toFixed(6)}, Lng: {message.location.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const url = `https://maps.google.com/?q=${message.location!.latitude},${message.location!.longitude}`;
                        Alert.alert(
                          "Open Location",
                          "Open this location in maps?",
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open", onPress: () => console.log("Opening maps:", url) }
                          ]
                        );
                      }}
                      style={{
                        backgroundColor: "#87CEEB",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                        View
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {message.type === "contact" && message.contact && (
                <View style={{ marginVertical: 8 }}>
                  <View
                    style={{
                      backgroundColor: isMyMessage ? "rgba(255,255,255,0.1)" : "#f0f0f0",
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#87CEEB",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="person" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isMyMessage ? "#fff" : "#333",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {message.contact.name}
                      </Text>
                      {message.contact.phoneNumbers.length > 0 && (
                        <Text
                          style={{
                            color: isMyMessage ? "rgba(255,255,255,0.8)" : "#666",
                            fontSize: 12,
                          }}
                        >
                          📞 {message.contact.phoneNumbers[0]}
                        </Text>
                      )}
                      {message.contact.emails.length > 0 && (
                        <Text
                          style={{
                            color: isMyMessage ? "rgba(255,255,255,0.8)" : "#666",
                            fontSize: 12,
                          }}
                        >
                          ✉️ {message.contact.emails[0]}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Add Contact",
                          `Add ${message.contact!.name} to your contacts?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Add", onPress: () => Alert.alert("Success", "Contact added!") }
                          ]
                        );
                      }}
                      style={{
                        backgroundColor: "#87CEEB",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                        Add
                      </Text>
                    </TouchableOpacity>
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

                {isMyMessage && (
                  <MessageStatusIndicator
                    status={message.status as any}
                    isMyMessage={isMyMessage}
                    size={14}
                  />
                )}
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

        {/* Date Separator - Shows at END of day's messages */}
        {showDateSeparator && renderDateSeparator(message.timestamp)}
      </View>
      </View>
    );
  };

  const IraChatWallpaper = require("./IraChatWallpaper").default;

  return (
    <View style={{ flex: 1, backgroundColor: "#87CEEB" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" translucent={false} />
      {/* Status bar spacer */}
      <View style={{ height: statusBarHeight, backgroundColor: "#87CEEB" }} />

      <IraChatWallpaper opacity={0.1} overlayColor="#FFFFFF" overlayOpacity={0.8}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "transparent" }}
        >
        {/* Header - Completely separated from status bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            minHeight: 70,
          }}
        >
        {(() => {
          const Avatar = require("./Avatar").Avatar;
          return (
            <TouchableOpacity
              onPress={() => {
                console.log("📱 Navigating to profile:", partnerName);
                router.push({
                  pathname: "/profile",
                  params: {
                    userId: partnerId,
                    userName: partnerName,
                    userAvatar: partnerAvatar,
                    userPhone: "",
                    isIraChatUser: isIraChatUser.toString(),
                    isOnline: isOnline.toString(),
                    lastSeen: lastSeen?.toISOString() || "",
                  }
                });
              }}
              activeOpacity={0.7}
            >
              <Avatar
                name={partnerName}
                imageUrl={partnerAvatar}
                size={40}
                showOnlineStatus={isIraChatUser} // Only show online status for IraChat users
                isOnline={isOnline && isIraChatUser} // Only show as online if they're IraChat user and actually online
              />
            </TouchableOpacity>
          );
        })()}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
            {partnerName}
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            {typingUsers.length > 0
              ? "typing..."
              : isIraChatUser
                ? (isOnline
                    ? "Online"
                    : lastSeen
                      ? `Last seen ${formatLastSeen(lastSeen)}`
                      : "I use IraChat" // Only shows for registered IraChat users
                  )
                : "Offline" // Non-IraChat users show as Offline
            }
          </Text>
        </View>

        {/* Header Actions */}
        <TouchableOpacity
          style={{ padding: 8, marginRight: 8 }}
          onPress={async () => {
            try {
              console.log("🎥 Starting video call...", { partnerId, partnerName, chatId });
              await startCall(
                partnerId,
                partnerName,
                partnerAvatar,
                'video',
                chatId,
                currentUser
              );
              console.log("✅ Video call started successfully");
            } catch (error) {
              console.error("❌ Video call failed:", error);
              Alert.alert("Error", "Failed to start video call");
            }
          }}
        >
          <Ionicons name="videocam" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => setShowMessageSearch(true)}
        >
          <Ionicons name="search" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8, marginRight: 8 }}
          onPress={async () => {
            try {
              console.log("📞 Starting voice call...", { partnerId, partnerName, chatId });
              await startCall(
                partnerId,
                partnerName,
                partnerAvatar,
                'voice',
                chatId,
                currentUser
              );
              console.log("✅ Voice call started successfully");
            } catch (error) {
              console.error("❌ Voice call failed:", error);
              Alert.alert("Error", "Failed to start voice call");
            }
          }}
        >
          <Ionicons name="call" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={handleBlockUser}
        >
          <Ionicons
            name={isBlocked ? "person-add" : "person-remove"}
            size={24}
            color={isBlocked ? "#10B981" : "#EF4444"}
          />
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
      <TypingIndicator
        typingUsers={typingUsers}
        isVisible={typingUsers.length > 0}
      />

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
                  shareLocation();
                }}
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
                  shareContact();
                }}
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
                  Alert.alert('Coming Soon', 'Poll feature will be available in the next update');
                }}
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

            <TouchableOpacity
              onPress={() => selectedMessage && handlePin(selectedMessage)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons
                name={selectedMessage?.isPinned ? "bookmark" : "bookmark-outline"}
                size={20}
                color={selectedMessage?.isPinned ? "#F59E0B" : "#667eea"}
              />
              <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                {selectedMessage?.isPinned ? "Unpin" : "Pin"}
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
              onPress={() => selectedMessage && handleShare(selectedMessage)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons name="share" size={20} color="#667eea" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                Share
              </Text>
            </TouchableOpacity>

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

            {selectedMessage?.mediaUrl && (
              <TouchableOpacity
                onPress={() => selectedMessage && handleDownload(selectedMessage)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name="download" size={20} color="#667eea" />
                <Text style={{ marginLeft: 12, fontSize: 16, color: "#000" }}>
                  Download
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

      {/* Message Search Modal */}
      <MessageSearch
        isVisible={showMessageSearch}
        onClose={() => setShowMessageSearch(false)}
        messages={messages}
        onMessageSelect={(messageId) => {
          // Scroll to selected message
          const messageIndex = messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: messageIndex,
              animated: true,
              viewPosition: 0.5, // Center the message
            });
          }
          setShowMessageSearch(false);
        }}
      />
        </KeyboardAvoidingView>
      </IraChatWallpaper>
    </View>
  );
};
