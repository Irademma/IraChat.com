import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Platform,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
}

export default function InviteFriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  // Load all phone contacts
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        const formattedContacts: Contact[] = data
          .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => ({
            id: contact.id || Math.random().toString(),
            name: contact.name || "Unknown",
            phoneNumber: contact.phoneNumbers![0].number || "",
            isIraChatUser: Math.random() > 0.7, // Mock: 30% are IraChat users
          }))
          .sort((a, b) => {
            // Sort IraChat users first, then alphabetically
            if (a.isIraChatUser && !b.isIraChatUser) return -1;
            if (!a.isIraChatUser && b.isIraChatUser) return 1;
            return a.name.localeCompare(b.name);
          });

        setAllContacts(formattedContacts);
      } else {
        Alert.alert("Permission Required", "Please allow access to contacts to invite friends.");
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search
  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  // Separate IraChat users and non-users
  const iraChatUsers = filteredContacts.filter(c => c.isIraChatUser);
  const nonIraChatUsers = filteredContacts.filter(c => !c.isIraChatUser);

  // Generate IraChat invite link
  const generateInviteLink = () => {
    return "https://irachat.app/invite?ref=user123"; // Mock invite link
  };

  // Handle invite action
  const handleInvite = async (contact: Contact) => {
    const inviteLink = generateInviteLink();
    const message = `Hey ${contact.name}! 👋\n\nI'm using IraChat for messaging and I think you'd love it too! It's fast, secure, and has amazing features.\n\nJoin me on IraChat: ${inviteLink}\n\nSee you there! 🚀`;

    try {
      if (Platform.OS === 'ios') {
        // iOS: Use SMS
        const url = `sms:${contact.phoneNumber}&body=${encodeURIComponent(message)}`;
        await Linking.openURL(url);
      } else {
        // Android: Use Share API
        await Share.share({
          message: message,
          title: "Join me on IraChat!",
        });
      }
    } catch (error) {
      console.error("Error sharing invite:", error);
      Alert.alert("Error", "Failed to send invite. Please try again.");
    }
  };

  // Handle chat with IraChat user
  const handleChatWithUser = (contact: Contact) => {
    router.push({
      pathname: "/individual-chat",
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar || "",
        contactIsOnline: "true",
        contactLastSeen: "",
      },
    });
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => item.isIraChatUser ? handleChatWithUser(item) : handleInvite(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
      }}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: item.isIraChatUser ? 'rgba(102, 126, 234, 0.1)' : 'rgba(156, 163, 175, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: item.isIraChatUser ? '#667eea' : '#9CA3AF',
        }}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Contact Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 4,
        }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginRight: 8,
          }}>
            {item.phoneNumber}
          </Text>
          {item.isIraChatUser && (
            <View style={{
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 10,
                color: '#667eea',
                fontWeight: '600',
              }}>
                ON IRACHAT
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Icon */}
      <Ionicons 
        name={item.isIraChatUser ? "chatbubble" : "share"} 
        size={20} 
        color={item.isIraChatUser ? "#667eea" : "#9CA3AF"} 
      />
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number, icon: string) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: count === iraChatUsers.length ? 0 : 24,
    }}>
      <Ionicons name={icon as any} size={20} color="#667eea" style={{ marginRight: 8 }} />
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
      }}>
        {title} ({count})
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header */}
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
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: '#FFFFFF',
            }}>
              Invite Friends
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 2,
            }}>
              Share IraChat with your contacts
            </Text>
          </View>
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
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.8)" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 16, color: '#FFFFFF' }}
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
      <FlatList
        data={[...iraChatUsers, ...nonIraChatUsers]}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {iraChatUsers.length > 0 && renderSectionHeader("On IraChat", iraChatUsers.length, "checkmark-circle")}
            {iraChatUsers.length > 0 && nonIraChatUsers.length > 0 && (
              <View style={{ marginTop: 24 }}>
                {renderSectionHeader("Invite to IraChat", nonIraChatUsers.length, "person-add")}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
