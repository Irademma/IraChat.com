import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import optimizedContactsService from "../src/services/optimizedContactsService";

// No mock contacts - all contacts will come from phone and Firebase
export default function ContactsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real contacts from optimized contacts service
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const realContacts = await optimizedContactsService.getRegisteredContacts();
        setContacts(realContacts);
        setFilteredContacts(realContacts);
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const formatLastSeen = (lastSeen: Date | string | undefined): string => {
    try {
      if (!lastSeen) {
        return "Unknown";
      }

      let date: Date;
      if (lastSeen instanceof Date) {
        date = lastSeen;
      } else if (typeof lastSeen === "string") {
        date = new Date(lastSeen);
      } else {
        return "Unknown";
      }

      // Validate the date
      if (isNaN(date.getTime())) {
        return "Unknown";
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch (error) {
      console.error("Error formatting last seen:", error);
      return "Unknown";
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredContacts(filtered);
    }
  };

  const openChat = (contact: any) => {
    try {
      console.log('Opening chat with contact:', contact);

      // Validate required contact data
      if (!contact.id || !contact.name) {
        console.error('Invalid contact data:', contact);
        return;
      }

      router.push({
        pathname: "/individual-chat",
        params: {
          contactId: contact.id || contact.userId || '',
          contactName: contact.name || 'Unknown',
          contactAvatar: contact.avatar || '',
          contactIsOnline: (contact.isOnline || false).toString(),
          contactLastSeen: contact.lastSeen?.getTime?.().toString() || '',
        },
      });
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const renderContact = (contact: any, index: number) => {
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => openChat(contact)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#87CEEB', // Sky blue bottom border
          marginHorizontal: 0,
        }}
        activeOpacity={0.8}
      >
        {/* Avatar with better positioning */}
        <View style={{
          position: 'relative',
          marginRight: 14,
        }}>
          {(() => {
            const Avatar = require("../src/components/Avatar").Avatar;
            return (
              <Avatar
                name={contact.name}
                imageUrl={contact.avatar}
                size="medium"
                showOnlineStatus={true}
                isOnline={contact.isOnline}
              />
            );
          })()}
        </View>

        {/* Contact Info - Better aligned */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          paddingRight: 12,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 4,
          }}>
            {contact.name}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            {contact.isOnline ? (
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: '#10B981',
              }}>
                Online
              </Text>
            ) : (
              <Text style={{
                fontSize: 13,
                color: '#6B7280',
              }}>
                Last seen {formatLastSeen(contact.lastSeen)}
              </Text>
            )}
          </View>
        </View>

        {/* Chat Icon - Better styled */}
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: '#E0F2FE',
            borderRadius: 20,
            padding: 8,
            marginBottom: 4,
          }}>
            <Ionicons name="chatbubble" size={18} color="#0EA5E9" />
          </View>
          <Text style={{
            fontSize: 11,
            color: '#0EA5E9',
            fontWeight: '600',
          }}>
            IraChat
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-sky-500 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            Select Contact
          </Text>
          <Text className="text-white/80 text-sm">
            {filteredContacts.length} IraChat users
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-1 border border-gray-200">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            className="flex-1 ml-3 text-base"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      <ScrollView className="flex-1">
        {filteredContacts.map((contact, index) =>
          renderContact(contact, index),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
