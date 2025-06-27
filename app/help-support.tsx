import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I create a new chat?",
    answer:
      "Tap the '+' button on the Chats tab, then select 'New Chat' and choose a contact from your list.",
  },
  {
    question: "How do I send voice messages?",
    answer:
      "In any chat, tap and hold the microphone button to record a voice message. Release to send.",
  },
  {
    question: "Can I delete messages?",
    answer:
      "Yes, long press on any message and select 'Delete' from the menu. You can delete for yourself or for everyone.",
  },
  {
    question: "How do I change my profile picture?",
    answer:
      "Go to Profile tab, tap on your profile picture, and select 'Change Photo' to upload a new image.",
  },
  {
    question: "How do I create a group chat?",
    answer:
      "Tap the '+' button on the Chats tab, select 'New Group', add participants, and give your group a name.",
  },
  {
    question: "How do I backup my chats?",
    answer:
      "Go to Settings > Account > Backup & Restore to set up automatic chat backups to your cloud storage.",
  },
  {
    question: "How do I block someone?",
    answer:
      "Go to the person's profile, tap the menu button (⋯), and select 'Block Contact'.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "Long press on the message or content, select 'Report', and choose the appropriate reason.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");

  const categories = [
    { id: "general", name: "General", icon: "help-circle" },
    { id: "account", name: "Account", icon: "person" },
    { id: "privacy", name: "Privacy", icon: "shield" },
    { id: "technical", name: "Technical", icon: "settings" },
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: "mail",
      action: () =>
        Linking.openURL(
          "mailto:support@irachat.com?subject=IraChat Support Request",
        ),
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: "chatbubbles",
      action: () => handleLiveChat(),
    },
    {
      title: "Phone Support",
      description: "Call our support line",
      icon: "call",
      action: () => Linking.openURL("tel:+256783835749"),
    },
    {
      title: "Community Forum",
      description: "Join our community discussions",
      icon: "people",
      action: () => handleCommunityForum(),
    },
  ];

  const handleFAQToggle = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert("Error", "Please enter your feedback before sending.");
      return;
    }

    Alert.alert(
      "Feedback Sent",
      "Thank you for your feedback! We will review it and get back to you if needed.",
      [{ text: "OK", onPress: () => setFeedbackText("") }],
    );
  };

  const handleLiveChat = () => {
    Alert.alert(
      "Live Chat Support",
      "Connect with our support team for real-time assistance.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Chat",
          onPress: () => {
            // Open live chat support interface
            Alert.alert(
              "Live Support",
              "Our support team is available 24/7. You can reach us at support@irachat.com or through our in-app messaging system.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Email Support",
                  onPress: () => Linking.openURL("mailto:support@irachat.com")
                },
                {
                  text: "Call Support",
                  onPress: () => Linking.openURL("tel:+1-800-IRACHAT")
                }
              ]
            );
          },
        },
      ]
    );
  };

  const handleCommunityForum = () => {
    Alert.alert(
      "Community Forum",
      "Join thousands of IraChat users in our community discussions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Visit Forum",
          onPress: () => {
            // Open community forum in browser or show community info
            Linking.openURL("https://community.irachat.com").catch(() => {
              Alert.alert(
                "Community Forum",
                "Join our community at community.irachat.com to:\n\n• Get help from other users\n• Share tips and tricks\n• Request new features\n• Connect with IraChat team\n\nYou can also reach us at community@irachat.com",
                [
                  { text: "OK" },
                  {
                    text: "Email Community",
                    onPress: () => Linking.openURL("mailto:community@irachat.com")
                  }
                ]
              );
            });
          },
        },
      ]
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 30,
    }}>
      <Ionicons name={icon as any} size={24} color="#667eea" style={{ marginRight: 12 }} />
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
      }}>
        {title}
      </Text>
    </View>
  );

  const ContactMethod = ({
    method,
  }: {
    method: (typeof contactMethods)[0];
  }) => (
    <TouchableOpacity
      onPress={method.action}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
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
      <View style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={method.icon as any} size={26} color="#667eea" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 4,
        }}>
          {method.title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          lineHeight: 20,
        }}>
          {method.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#667eea" />
    </TouchableOpacity>
  );

  const FAQItem = ({ item, index }: { item: FAQItem; index: number }) => (
    <TouchableOpacity
      onPress={() => handleFAQToggle(index)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
        overflow: 'hidden',
      }}
      activeOpacity={0.7}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
          flex: 1,
          marginRight: 12,
          lineHeight: 22,
        }}>
          {item.question}
        </Text>
        <Ionicons
          name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
          size={22}
          color="#667eea"
        />
      </View>
      {expandedFAQ === index && (
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderTopWidth: 1,
          borderTopColor: 'rgba(102, 126, 234, 0.1)',
          backgroundColor: 'rgba(102, 126, 234, 0.02)',
        }}>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            lineHeight: 22,
            marginTop: 16,
          }}>
            {item.answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            Help & Support
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 25,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <SectionHeader title="Get Help" icon="help-circle" />

        {contactMethods.map((method, index) => (
          <ContactMethod key={index} method={method} />
        ))}

        {/* FAQ Section */}
        <SectionHeader
          title="Frequently Asked Questions"
          icon="chatbubble-ellipses"
        />

        {faqData.map((item, index) => (
          <FAQItem key={index} item={item} index={index} />
        ))}

        {/* Feedback Section */}
        <SectionHeader title="Send Feedback" icon="chatbubbles" />

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6,
          borderWidth: 1,
          borderColor: 'rgba(102, 126, 234, 0.1)',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Help us improve IraChat
          </Text>

          {/* Category Selection */}
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: 12,
          }}>
            Category:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 12,
                  backgroundColor: selectedCategory === category.id ? '#667eea' : 'rgba(102, 126, 234, 0.1)',
                  borderWidth: 1,
                  borderColor: selectedCategory === category.id ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? "white" : "#667eea"}
                />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedCategory === category.id ? "white" : "#667eea",
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Feedback Input */}
          <TextInput
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Tell us about your experience or suggest improvements..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={500}
            style={{
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: '#374151',
              borderWidth: 2,
              borderColor: 'rgba(102, 126, 234, 0.2)',
              textAlignVertical: "top",
              minHeight: 100,
            }}
          />

          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            marginTop: 8,
            marginBottom: 20,
            textAlign: 'right',
          }}>
            {feedbackText.length}/500 characters
          </Text>

          <TouchableOpacity
            onPress={handleSendFeedback}
            style={{
              backgroundColor: '#667eea',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              color: 'white',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Send Feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white rounded-lg p-4 mt-6 border border-gray-200">
          <Text className="text-gray-800 text-base font-medium mb-3">
            App Information
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Version</Text>
              <Text className="text-gray-800">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Build</Text>
              <Text className="text-gray-800">2024.01.01</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Platform</Text>
              <Text className="text-gray-800">React Native</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
