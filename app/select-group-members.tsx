import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Contacts from "expo-contacts";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
}

export default function SelectGroupMembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  // Load all phone contacts
  useEffect(() => {
    loadContacts();
    // Parse existing selected members if any
    if (params.selectedMembers) {
      try {
        const existing = JSON.parse(params.selectedMembers as string);
        setSelectedMembers(existing);
      } catch (error) {
        console.error("Error parsing selected members:", error);
      }
    }
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
            isIraChatUser: Math.random() > 0.3, // Mock: 70% are IraChat users
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllContacts(formattedContacts);
      } else {
        Alert.alert("Permission Required", "Please allow access to contacts to select group members.");
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

  // Toggle member selection
  const toggleMemberSelection = (contact: Contact) => {
    const isSelected = selectedMembers.find(m => m.id === contact.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== contact.id));
    } else {
      setSelectedMembers([...selectedMembers, contact]);
    }
  };

  // Handle done button
  const handleDone = () => {
    router.back();
    // Pass selected members back to create group page
    // In a real app, you'd use a state management solution or callback
    console.log("Selected members:", selectedMembers);
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedMembers.find(m => m.id === item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleMemberSelection(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.05)' : '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
        }}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: isSelected ? '#667eea' : 'rgba(102, 126, 234, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isSelected ? '#FFFFFF' : '#667eea',
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
                  IRACHAT USER
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Selection Indicator */}
        <View style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isSelected ? '#667eea' : 'transparent',
          borderWidth: 2,
          borderColor: isSelected ? '#667eea' : 'rgba(102, 126, 234, 0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
              Select Members
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 2,
            }}>
              {selectedMembers.length} selected
            </Text>
          </View>
          {selectedMembers.length > 0 && (
            <TouchableOpacity
              onPress={handleDone}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '600',
              }}>
                Done
              </Text>
            </TouchableOpacity>
          )}
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

      {/* Selected Members Count */}
      {selectedMembers.length > 0 && (
        <View style={{
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(102, 126, 234, 0.1)',
        }}>
          <Text style={{
            fontSize: 14,
            color: '#667eea',
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="people-outline" size={40} color="#667eea" />
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}>
              {loading ? "Loading contacts..." : "No contacts found"}
            </Text>
            {!loading && (
              <Text style={{
                fontSize: 14,
                color: '#6B7280',
                textAlign: 'center',
              }}>
                {searchQuery ? "Try a different search term" : "No contacts available"}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
