import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
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
} from "firebase/firestore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import EmptyState from "../../src/components/EmptyState";
import IraChatWallpaper from "../../src/components/IraChatWallpaper";
import { RootState } from "../../src/redux/store";
import { db, getAuthInstance, storage } from "../../src/services/firebaseSimple";
import { formatMessageTime } from "../../src/utils/dateUtils";

export default function ChatRoomScreen() {
  const {
    id: chatId,
    name: chatName,
    avatar: chatAvatar,
  } = useLocalSearchParams();
  const navigation = useNavigation();
  const [input, setInput] = useState("");
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
        console.log(
          "🔥 Initializing Firebase user for:",
          currentUser.phoneNumber,
        );
        const auth = getAuthInstance();

        // Check if auth instance is available
        if (!auth) {
          console.warn(
            "⚠️ Firebase Auth not available, skipping user initialization",
          );

          // Create a mock Firebase user for offline mode
          const phoneBasedUserId = `phone_${currentUser.phoneNumber.replace(/\D/g, "")}`;
          setFirebaseUser({
            uid: phoneBasedUserId,
            phoneNumber: currentUser.phoneNumber,
            displayName: currentUser.name,
            email: null,
          });
          return;
        }

        // Check if user is already signed in
        if (auth.currentUser) {
          console.log("✅ Firebase user already exists:", auth.currentUser.uid);
          setFirebaseUser(auth.currentUser);
          return;
        }

        // 🔒 PHONE-BASED AUTH: Use phone number as unique identifier
        console.log("📱 Using phone-based authentication for messaging");

        // Create a consistent user ID based on phone number for messaging
        const phoneBasedUserId = `phone_${currentUser.phoneNumber.replace(/[^0-9]/g, "")}`;

        // Check if user document exists in Firestore
        try {
          const userDocRef = doc(db, "users", phoneBasedUserId);
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
            console.log(
              "✅ Created user document for messaging:",
              phoneBasedUserId,
            );
          } else {
            console.log(
              "✅ User document exists for messaging:",
              phoneBasedUserId,
            );
          }

          // Set a mock Firebase user object for messaging compatibility
          setFirebaseUser({
            uid: phoneBasedUserId,
            phoneNumber: currentUser.phoneNumber,
            displayName: currentUser.name,
            email: null, // No email needed for phone-based auth
          });
        } catch (firestoreError) {
          console.error(
            "❌ Error setting up user for messaging:",
            firestoreError,
          );
          // Still set the user for messaging to work
          setFirebaseUser({
            uid: phoneBasedUserId,
            phoneNumber: currentUser.phoneNumber,
            displayName: currentUser.name,
            email: null,
          });
        }
      } catch (error) {
        console.error("❌ Firebase user initialization failed:", error);
      }
    };

    initializeFirebaseUser();
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: chatName || "Chat",
      headerStyle: {
        backgroundColor: "#667eea",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    });
  }, [navigation, chatName]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      console.log("🎹 Keyboard will show:", event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardWillHide = () => {
      console.log("🎹 Keyboard will hide");
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const keyboardDidShow = (event: any) => {
      console.log("🎹 Keyboard did show:", event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardDidHide = () => {
      console.log("🎹 Keyboard did hide");
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    // Use different events for iOS and Android
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideListener = Keyboard.addListener(hideEvent, keyboardWillHide);
    const didShowListener = Keyboard.addListener(
      "keyboardDidShow",
      keyboardDidShow,
    );
    const didHideListener = Keyboard.addListener(
      "keyboardDidHide",
      keyboardDidHide,
    );

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
      collection(db, "chats", chatId as string, "messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
      console.log("❌ Cannot send message - missing data:", {
        hasInput: !!input.trim(),
        hasChatId: !!chatId,
        hasFirebaseUser: !!firebaseUser,
      });
      return;
    }

    // Store the message text and clear input immediately
    const messageText = input.trim();
    setInput("");

    try {
      console.log("📤 Sending message with Firebase user:", {
        senderId: firebaseUser.uid,
        senderEmail: firebaseUser.email,
        text: messageText,
      });

      // Check if Firebase is available
      if (!db) {
        console.warn("⚠️ Firebase not available, message not saved to cloud");
        // Add message to local state for immediate display
        const localMessage = {
          id: Date.now().toString(),
          text: messageText,
          senderId: firebaseUser.uid,
          senderName: currentUser?.name || "Unknown",
          senderPhoneNumber: currentUser?.phoneNumber || "",
          senderUsername: currentUser?.username || "",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, localMessage]);

        // Auto-scroll to bottom after adding message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);

        console.log("✅ Message added locally");
        return;
      }

      await addDoc(collection(db, "chats", chatId as string, "messages"), {
        text: messageText,
        senderId: firebaseUser.uid,
        senderName: currentUser?.name || "Unknown",
        senderPhoneNumber: currentUser?.phoneNumber || "",
        senderUsername: currentUser?.username || "",
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", chatId as string), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
      });

      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);

      console.log("✅ Message sent successfully");
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Add message to local state as fallback
      const localMessage = {
        id: Date.now().toString(),
        text: messageText,
        senderId: firebaseUser.uid,
        senderName: currentUser?.name || "Unknown",
        senderPhoneNumber: currentUser?.phoneNumber || "",
        senderUsername: currentUser?.username || "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, localMessage]);

      // Auto-scroll to bottom after adding message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);

      console.log("✅ Message added locally as fallback");
    }
  };

  const handleMediaUpload = () => {
    Alert.alert("Share Media", "Choose what to share", [
      {
        text: "Camera",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera permission is required to take photos.");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images", "videos"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await sendMediaMessage(asset.uri, asset.type === "video" ? "video" : "image");
            }
          } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Failed to take photo");
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Gallery permission is required to select media.");
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images", "videos"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await sendMediaMessage(asset.uri, asset.type === "video" ? "video" : "image");
            }
          } catch (error) {
            console.error("Error selecting media:", error);
            Alert.alert("Error", "Failed to select media");
          }
        },
      },
      {
        text: "Document",
        onPress: async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: "*/*",
              copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await sendMediaMessage(asset.uri, "document", asset.name);
            }
          } catch (error) {
            console.error("Error selecting document:", error);
            Alert.alert("Error", "Failed to select document");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const sendMediaMessage = async (uri: string, type: "image" | "video" | "document", originalFileName?: string) => {
    if (!chatId || !firebaseUser) return;

    try {
      // For now, just send a text message indicating media was shared
      const mediaText = type === "document"
        ? `📄 Document: ${originalFileName || "file"}`
        : type === "video"
        ? "🎥 Video shared"
        : "📷 Photo shared";

      // Upload media to Firebase Storage if available
      let uploadedMediaUrl = uri;
      let fileName = `${type}_file`;

      try {
        if (storage && uri) {
          fileName = `${Date.now()}_${type}_${firebaseUser.uid}`;
          // Storage reference prepared for future upload implementation
          // const storageRef = ref(storage, `chats/${chatId}/${fileName}`);

          // For now, store the local URI - in production this would upload the actual file
          // const uploadTask = uploadBytes(storageRef, fileBlob);
          // const downloadURL = await getDownloadURL(storageRef);
          // uploadedMediaUrl = downloadURL;

          console.log("📤 Media prepared for upload:", fileName);
        }
      } catch (uploadError) {
        console.warn("⚠️ Media upload failed, using local URI:", uploadError);
      }

      await addDoc(collection(db, "chats", chatId as string, "messages"), {
        text: mediaText,
        senderId: firebaseUser.uid,
        senderName: currentUser?.name || "Unknown",
        senderPhoneNumber: currentUser?.phoneNumber || "",
        senderUsername: currentUser?.username || "",
        timestamp: serverTimestamp(),
        mediaType: type,
        mediaUri: uploadedMediaUrl,
        mediaFileName: fileName || `${type}_file`,
      });

      await updateDoc(doc(db, "chats", chatId as string), {
        lastMessage: mediaText,
        lastMessageAt: serverTimestamp(),
      });

      console.log(`✅ ${type} message sent successfully`);
    } catch (error) {
      console.error(`❌ Error sending ${type} message:`, error);
      Alert.alert("Error", `Failed to send ${type}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === firebaseUser?.uid;

    return (
      <View
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          maxWidth: "80%",
          alignSelf: isMyMessage ? "flex-end" : "flex-start",
        }}
      >
        {!isMyMessage && (
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginBottom: 4,
              marginLeft: 8,
            }}
          >
            {item.senderName || item.senderPhoneNumber || "Unknown"}
          </Text>
        )}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: isMyMessage ? "#667eea" : "#f3f4f6",
            borderBottomRightRadius: isMyMessage ? 4 : 16,
            borderBottomLeftRadius: isMyMessage ? 16 : 4,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isMyMessage ? "#ffffff" : "#1f2937",
            }}
          >
            {item.text}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: isMyMessage ? "flex-end" : "flex-start",
            marginTop: 4,
            marginHorizontal: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginRight: isMyMessage ? 4 : 0,
            }}
          >
            {formatMessageTime(item.timestamp)}
          </Text>

          {/* Read Receipt Icons for sent messages */}
          {isMyMessage && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Single tick - sent */}
              <Ionicons
                name="checkmark"
                size={12}
                color="#9CA3AF"
                style={{ marginLeft: 2 }}
              />
              {/* Double tick - delivered */}
              <Ionicons
                name="checkmark"
                size={12}
                color="#9CA3AF"
                style={{ marginLeft: -4 }}
              />
              {/* Blue ticks would indicate read (future enhancement) */}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <IraChatWallpaper
      opacity={0.1}
      overlayColor="#FFFFFF"
      overlayOpacity={0.8}
      tileSize="medium"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* Enhanced Chat Header with Last Seen, Call Icons, and Settings */}
        <View
          style={{
            backgroundColor: "#667eea", // Sky blue header
            paddingHorizontal: 16,
            paddingVertical: 16,
            paddingTop: 50, // Account for status bar
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.2)",
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={26} color="#ffffff" />
          </TouchableOpacity>

          {/* Contact Avatar with Online Indicator */}
          <View style={{ marginRight: 16 }}>
            {(() => {
              const Avatar = require("../../src/components/Avatar").Avatar;
              return (
                <Avatar
                  name={chatName as string}
                  imageUrl={chatAvatar as string}
                  size={48}
                  showOnlineStatus={true}
                  isOnline={true}
                  borderWidth={2}
                  borderColor="rgba(255, 255, 255, 0.3)"
                />
              );
            })()}
          </View>

          {/* Contact Info with Last Seen */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              // Navigate to contact profile/settings
              console.log("Opening contact settings for:", chatName);
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: 2,
              }}
            >
              {chatName || "Unknown Contact"}
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)" }}>
              Online • Last seen recently
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Voice Call Button */}
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
              }}
              onPress={() => {
                Alert.alert(
                  "Voice Call",
                  `Start voice call with ${chatName}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Call",
                      onPress: () => {
                        // Navigate to voice call screen
                        console.log("Starting voice call with:", chatName);
                        // router.push(`/call?type=voice&contact=${chatId}`);
                      },
                    },
                  ],
                );
              }}
            >
              <Ionicons name="call" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* Video Call Button */}
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
              }}
              onPress={() => {
                Alert.alert(
                  "Video Call",
                  `Start video call with ${chatName}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Call",
                      onPress: () => {
                        // Navigate to video call screen
                        console.log("Starting video call with:", chatName);
                        // router.push(`/call?type=video&contact=${chatId}`);
                      },
                    },
                  ],
                );
              }}
            >
              <Ionicons name="videocam" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* Chat Settings Menu */}
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
              }}
              onPress={() => {
                Alert.alert("Chat Settings", "Choose an option", [
                  {
                    text: "View Contact",
                    onPress: () => console.log("View contact"),
                  },
                  {
                    text: "Media & Files",
                    onPress: () => console.log("Media & files"),
                  },
                  {
                    text: "Search Messages",
                    onPress: () => console.log("Search messages"),
                  },
                  {
                    text: "Clear Chat",
                    onPress: () => console.log("Clear chat"),
                    style: "destructive",
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Container */}
        <View style={{ flex: 1 }}>
          {messages.length === 0 ? (
            <EmptyState
              icon={require("../../assets/images/comment.png")}
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
            backgroundColor: "#f8fafc",
            borderTopWidth: 1,
            borderTopColor: "#e2e8f0",
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: Platform.OS === "ios" ? 12 : 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: "#f8fafc",
              minHeight: 48,
            }}
          >
            {/* Media Upload Button */}
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#667eea",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
              onPress={handleMediaUpload}
            >
              <Ionicons name="attach" size={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Text Input */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#cbd5e1",
                marginRight: 8,
                shadowColor: "#000",
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
                  color: "#1e293b",
                  textAlignVertical: "center",
                }}
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={1000}
                onFocus={() => {
                  console.log("🎯 Input focused - scrolling to bottom");
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 300);
                }}
                accessibilityLabel="Type your message"
                accessibilityHint="Enter text to send a message"
              />
            </View>

            {/* Voice Message Button (when no text) or Send Button (when text exists) */}
            {input.trim() ? (
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!firebaseUser}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#667eea",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                accessibilityLabel="Send message"
                accessibilityHint="Tap to send your message"
              >
                <Ionicons name="send" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#10B981", // Green for voice
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                onPress={() => {
                  Alert.alert(
                    "Voice Message",
                    "Voice message recording will be implemented soon!",
                    [{ text: "OK" }],
                  );
                }}
                accessibilityLabel="Record voice message"
                accessibilityHint="Tap and hold to record a voice message"
              >
                <Ionicons name="mic" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
    </IraChatWallpaper>
  );
}
