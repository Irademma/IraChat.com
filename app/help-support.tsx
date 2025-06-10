import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I create a new chat?",
    answer: "Tap the '+' button on the Chats tab, then select 'New Chat' and choose a contact from your list."
  },
  {
    question: "How do I send voice messages?",
    answer: "In any chat, tap and hold the microphone button to record a voice message. Release to send."
  },
  {
    question: "Can I delete messages?",
    answer: "Yes, long press on any message and select 'Delete' from the menu. You can delete for yourself or for everyone."
  },
  {
    question: "How do I change my profile picture?",
    answer: "Go to Profile tab, tap on your profile picture, and select 'Change Photo' to upload a new image."
  },
  {
    question: "How do I create a group chat?",
    answer: "Tap the '+' button on the Chats tab, select 'New Group', add participants, and give your group a name."
  },
  {
    question: "How do I backup my chats?",
    answer: "Go to Settings > Account > Backup & Restore to set up automatic chat backups to your cloud storage."
  },
  {
    question: "How do I block someone?",
    answer: "Go to the person's profile, tap the menu button (⋯), and select 'Block Contact'."
  },
  {
    question: "How do I report inappropriate content?",
    answer: "Long press on the message or content, select 'Report', and choose the appropriate reason."
  }
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'General', icon: 'help-circle' },
    { id: 'account', name: 'Account', icon: 'person' },
    { id: 'privacy', name: 'Privacy', icon: 'shield' },
    { id: 'technical', name: 'Technical', icon: 'settings' },
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@irachat.com?subject=IraChat Support Request'),
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubbles',
      action: () => Alert.alert('Coming Soon', 'Live chat support will be available soon'),
    },
    {
      title: 'Phone Support',
      description: 'Call our support line',
      icon: 'call',
      action: () => Linking.openURL('tel:+1234567890'),
    },
    {
      title: 'Community Forum',
      description: 'Join our community discussions',
      icon: 'people',
      action: () => Alert.alert('Coming Soon', 'Community forum will be available soon'),
    },
  ];

  const handleFAQToggle = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback before sending.');
      return;
    }

    Alert.alert(
      'Feedback Sent',
      'Thank you for your feedback! We will review it and get back to you if needed.',
      [{ text: 'OK', onPress: () => setFeedbackText('') }]
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View className="flex-row items-center mb-4 mt-6">
      <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon as any} size={18} color="#3B82F6" />
      </View>
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
    </View>
  );

  const ContactMethod = ({ method }: { method: typeof contactMethods[0] }) => (
    <TouchableOpacity
      onPress={method.action}
      className="flex-row items-center py-4 px-4 bg-white rounded-lg mb-3 border border-gray-200"
    >
      <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
        <Ionicons name={method.icon as any} size={24} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-base font-medium">{method.title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{method.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const FAQItem = ({ item, index }: { item: FAQItem; index: number }) => (
    <TouchableOpacity
      onPress={() => handleFAQToggle(index)}
      className="bg-white rounded-lg mb-3 border border-gray-200"
    >
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-gray-800 text-base font-medium flex-1 mr-3">
          {item.question}
        </Text>
        <Ionicons 
          name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#9CA3AF" 
        />
      </View>
      {expandedFAQ === index && (
        <View className="px-4 pb-4 border-t border-gray-100">
          <Text className="text-gray-600 text-sm leading-5 mt-3">
            {item.answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Help & Support</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Quick Actions */}
        <SectionHeader title="Get Help" icon="help-circle" />
        
        {contactMethods.map((method, index) => (
          <ContactMethod key={index} method={method} />
        ))}

        {/* FAQ Section */}
        <SectionHeader title="Frequently Asked Questions" icon="chatbubble-ellipses" />
        
        {faqData.map((item, index) => (
          <FAQItem key={index} item={item} index={index} />
        ))}

        {/* Feedback Section */}
        <SectionHeader title="Send Feedback" icon="chatbubbles" />
        
        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-gray-800 text-base font-medium mb-3">
            Help us improve IraChat
          </Text>
          
          {/* Category Selection */}
          <Text className="text-gray-600 text-sm mb-2">Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`flex-row items-center py-2 px-3 rounded-full mr-2 ${
                  selectedCategory === category.id ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : '#6B7280'} 
                />
                <Text className={`ml-2 text-sm ${
                  selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                }`}>
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
            className="bg-gray-50 rounded-lg p-3 text-gray-800 text-base border border-gray-200"
            style={{ textAlignVertical: 'top' }}
          />
          
          <Text className="text-gray-400 text-xs mt-2 mb-4">
            {feedbackText.length}/500 characters
          </Text>

          <TouchableOpacity
            onPress={handleSendFeedback}
            className="bg-blue-500 py-3 px-6 rounded-lg"
          >
            <Text className="text-white text-center font-medium">Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white rounded-lg p-4 mt-6 border border-gray-200">
          <Text className="text-gray-800 text-base font-medium mb-3">App Information</Text>
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
