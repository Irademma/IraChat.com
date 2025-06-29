import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ContactItem from "../src/components/ContactItem";
import { Contact, getIraChatContacts } from "../src/services/contactsService";
import { db } from "../src/services/firebaseSimple";

export default function NewChatScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phoneNumber.includes(searchQuery),
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const iraChatContacts = await getIraChatContacts();
      setContacts(iraChatContacts);
      setFilteredContacts(iraChatContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const createChatWithContact = async (contact: Contact) => {
    setCreating(true);
    try {
      // Create a new chat with the selected contact
      const chatDoc = await addDoc(collection(db, "chats"), {
        name: contact.name,
        isGroup: false,
        participants: [contact.phoneNumber], // Add contact's phone number
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        contactInfo: {
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          avatar: contact.avatar || "", // Ensure avatar is never undefined
          username: contact.username || "",
          status: contact.status || "I Love IraChat",
          bio: contact.bio || "I Love IraChat",
        },
      });

      console.log("✅ Chat created successfully:", chatDoc.id);

      // Navigate to the new chat with contact info
      const params = new URLSearchParams({
        name: contact.name,
        contactId: contact.id,
        phoneNumber: contact.phoneNumber,
        avatar: contact.avatar || "",
      });
      router.replace(`/chat/${chatDoc.id}?${params.toString()}`);
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <ContactItem contact={item} onPress={createChatWithContact} />
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 60,
    }}>
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          borderWidth: 3,
          borderColor: 'rgba(102, 126, 234, 0.2)',
        }}>
          <Ionicons
            name={searchQuery ? "search" : "people-outline"}
            size={40}
            color="#667eea"
          />
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          {searchQuery ? "No contacts found" : "No IraChat contacts yet"}
        </Text>

        <Text style={{
          fontSize: 16,
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 24,
        }}>
          {searchQuery
            ? "Try searching with a different name or phone number"
            : "Your friends who use IraChat will appear here when they join"}
        </Text>

        {!searchQuery && (
          <TouchableOpacity
            onPress={() => router.push("/invite-friends")}
            style={{
              backgroundColor: '#667eea',
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 16,
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="share" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Invite Friends
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );



  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F0F9FF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header with Safe Area and Gradient */}
      <View
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 5,
          paddingBottom: 12,
          paddingHorizontal: 20,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginTop: -3,
          }}>
            Select Contact
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <Ionicons
            name="search"
            size={20}
            color="rgba(255, 255, 255, 0.8)"
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Search by name, username, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#FFFFFF',
            }}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      {loading ? (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 30,
            alignItems: 'center',
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
          }}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              marginTop: 16,
              textAlign: 'center',
              fontWeight: '500',
            }}>
              Finding your contacts...
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
          }}
        />
      )}

      {/* Group Chat Option - Fixed positioning to stay at bottom */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(102, 126, 234, 0.1)',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <TouchableOpacity
          onPress={() => router.push("/create-group")}
          disabled={creating}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.2)',
          }}
          activeOpacity={0.7}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#667eea',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}>
            <Ionicons name="people" size={24} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#667eea',
              marginBottom: 2,
            }}>
              Create Group Chat
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
            }}>
              Start a conversation with multiple people
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Loading overlay for chat creation */}
      {creating && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 30,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 16,
            minWidth: 200,
          }}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={{
              fontSize: 16,
              color: '#374151',
              marginTop: 16,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              Starting conversation...
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
              marginTop: 4,
              textAlign: 'center',
            }}>
              Please wait a moment
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
