import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Contact, formatLastSeen } from "../services/contactsService";

interface ContactItemProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
}

export default function ContactItem({ contact, onPress }: ContactItemProps) {
  const isOnline = formatLastSeen(contact.lastSeen) === "Online";

  return (
    <TouchableOpacity
      onPress={() => onPress(contact)}
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
      activeOpacity={0.7}
      style={{
        backgroundColor: "white",
      }}
    >
      {/* Avatar */}
      <View className="relative mr-3">
        {contact.avatar ? (
          <Image
            source={{ uri: contact.avatar }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "#667eea" }}
          >
            <Text className="text-white text-lg" style={{ fontWeight: "700" }}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Online indicator */}
        {isOnline && (
          <View
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: "#667eea" }}
          />
        )}
      </View>

      {/* Contact Info */}
      <View className="flex-1">
        <Text
          className="text-gray-900 text-base mb-1"
          style={{ fontWeight: "600" }}
        >
          {contact.name}
        </Text>

        {/* Username */}
        {contact.username && (
          <Text className="text-sm mb-1" style={{ color: "#667eea" }}>
            @{contact.username}
          </Text>
        )}

        <View className="flex-row items-center">
          <Text className="text-gray-500 text-sm flex-1">
            {contact.status || contact.phoneNumber}
          </Text>

          {!isOnline && (
            <Text className="text-gray-400 text-xs">
              {formatLastSeen(contact.lastSeen)}
            </Text>
          )}
        </View>
      </View>

      {/* Chat indicator */}
      <View className="ml-2">
        <Ionicons name="chatbubble-outline" size={18} color="#667eea" />
      </View>
    </TouchableOpacity>
  );
}
