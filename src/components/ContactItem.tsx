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
        {contact.avatar ? (
          <Image
            source={{ uri: contact.avatar }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#667eea",
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '700',
            }}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Online indicator */}
        {isOnline && (
          <View style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#10B981",
            borderWidth: 2,
            borderColor: 'white',
          }} />
        )}
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

        {/* Username */}
        {contact.username && (
          <Text style={{
            fontSize: 13,
            color: "#667eea",
            marginBottom: 2,
            fontWeight: '500',
          }}>
            @{contact.username}
          </Text>
        )}

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 13,
            color: '#6B7280',
            flex: 1,
          }}>
            {contact.status || contact.phoneNumber}
          </Text>

          {!isOnline && (
            <Text style={{
              fontSize: 11,
              color: '#9CA3AF',
            }}>
              {formatLastSeen(contact.lastSeen)}
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
}
