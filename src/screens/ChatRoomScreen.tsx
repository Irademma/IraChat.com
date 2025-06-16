import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyState from "../components/EmptyState";
import { auth, db } from "../services/firebaseSimple";
import { formatMessageTime } from "../utils/dateUtils";

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { chatId, chatName } = route.params;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const screenHeight = Dimensions.get("window").height;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `🔥 ${chatName || "Chat"}`, // Added fire emoji to identify this screen
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#667eea", // Sky blue title
      },
      headerStyle: {
        backgroundColor: "#f8fafc", // Light sky blue header
      },
    });
  }, [navigation, chatName]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      console.log(
        "🎹 [ReactNav] Keyboard will show:",
        event.endCoordinates.height,
      );
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);

      // Auto-scroll to bottom when keyboard appears
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    };

    const keyboardWillHide = () => {
      console.log("🎹 [ReactNav] Keyboard will hide");
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const keyboardDidShow = (event: any) => {
      console.log(
        "🎹 [ReactNav] Keyboard did show:",
        event.endCoordinates.height,
      );
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const keyboardDidHide = () => {
      console.log("🎹 [ReactNav] Keyboard did hide");
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

    // Also add the other events for better coverage
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

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);

      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: input,
      senderId: auth?.currentUser?.uid,
      senderPhoneNumber: auth?.currentUser?.phoneNumber,
      timestamp: serverTimestamp(),
    });

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: input,
      lastMessageAt: serverTimestamp(),
    });

    setInput("");

    // Auto-scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  };

  const renderItem = ({ item }: any) => {
    const isMyMessage = item.senderId === auth?.currentUser?.uid;

    return (
      <View
        className={`mx-4 my-2 max-w-[80%] ${isMyMessage ? "self-end" : "self-start"}`}
      >
        {!isMyMessage && (
          <Text className="text-xs text-gray-500 mb-1 ml-2">
            {item.senderPhoneNumber || "Unknown"}
          </Text>
        )}
        <View
          className={`px-4 py-3 rounded-2xl ${
            isMyMessage ? "rounded-br-md" : "bg-gray-200 rounded-bl-md"
          }`}
          style={{
            backgroundColor: isMyMessage ? "#667eea" : "#f3f4f6",
          }}
        >
          <Text
            className={`text-base ${
              isMyMessage ? "text-white" : "text-gray-800"
            }`}
          >
            {item.text}
          </Text>
        </View>
        <Text
          className={`text-xs text-gray-400 mt-1 ${
            isMyMessage ? "text-right mr-2" : "text-left ml-2"
          }`}
        >
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      {/* Messages Container - Adjusts height based on keyboard */}
      <View
        style={{
          flex: 1,
          marginBottom: isKeyboardVisible ? keyboardHeight + 80 : 80, // Dynamic margin
        }}
      >
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

      {/* Input Container - ABSOLUTELY POSITIONED */}
      <View
        style={{
          position: "absolute",
          bottom: isKeyboardVisible ? keyboardHeight : 0, // Moves up with keyboard
          left: 0,
          right: 0,
          backgroundColor: "#f1f5f9", // Light blue-gray background
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0", // Light gray border
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: "#667eea",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          {/* Text Input Container */}
          <View
            style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: "white",
              borderRadius: 24,
              borderWidth: 2,
              borderColor: input.trim() ? "#667eea" : "#e2e8f0",
              shadowColor: "#667eea",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: input.trim() ? 0.15 : 0.05,
              shadowRadius: 8,
              elevation: 3,
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
                color: "#1e293b", // Dark text for contrast
                textAlignVertical: "center",
              }}
              placeholderTextColor="#94a3b8" // Accessible gray
              multiline
              maxLength={1000}
              onFocus={() => {
                console.log(
                  "🎯 [ReactNav] Input focused - scrolling to bottom",
                );
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
            disabled={!input.trim()}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: input.trim() ? "#667eea" : "#cbd5e1",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: input.trim() ? "#667eea" : "#94a3b8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: input.trim() ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: input.trim() ? 6 : 3,
              transform: [{ scale: input.trim() ? 1 : 0.95 }],
            }}
            activeOpacity={0.8}
            accessibilityLabel={
              input.trim() ? "Send message" : "Enter text to send"
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: !input.trim() }}
          >
            <Ionicons
              name="send"
              size={22}
              color={input.trim() ? "white" : "#64748b"}
              style={{
                marginLeft: 3,
                opacity: input.trim() ? 1 : 0.7,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
