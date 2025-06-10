import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Popular country codes with flags
const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
  { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+250', country: 'RW', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
];

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCountryChange: (countryCode: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: boolean;
}

export default function PhoneNumberInput({
  value,
  onChangeText,
  onCountryChange,
  placeholder = "Enter phone number",
  editable = true,
  error = false
}: PhoneNumberInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[18]); // Default to Uganda
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery) ||
    country.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    onCountryChange(country.code);
    setModalVisible(false);
    setSearchQuery('');
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format based on country (basic formatting)
    if (selectedCountry.code === '+1') {
      // US/Canada format: (123) 456-7890
      if (cleaned.length >= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      } else if (cleaned.length >= 3) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
    }
    
    // Default: just return cleaned digits
    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const renderCountryItem = ({ item }: { item: typeof COUNTRY_CODES[0] }) => (
    <TouchableOpacity
      onPress={() => handleCountrySelect(item)}
      className="flex-row items-center py-3 px-4 border-b border-gray-100"
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text
          className="text-gray-800"
          style={{ fontWeight: '500' }}
        >
          {item.name}
        </Text>
        <Text className="text-gray-500 text-sm">{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-lg ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        style={{
          borderColor: error ? '#EF4444' : '#D1D5DB',
        }}
      >
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => editable && setModalVisible(true)}
          className="flex-row items-center px-3 py-3 border-r border-gray-300"
          disabled={!editable}
        >
          <Text className="text-xl mr-2">{selectedCountry.flag}</Text>
          <Text
            className="text-gray-700"
            style={{ fontWeight: '500' }}
          >
            {selectedCountry.code}
          </Text>
          {editable && (
            <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          editable={editable}
          className="flex-1 px-3 py-3 text-base"
          maxLength={20}
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text
              className="text-lg"
              style={{ fontWeight: '700' }}
            >
              Select Country
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="p-4">
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search countries..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base"
              />
            </View>
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item, index) => `${item.country}-${index}`}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          />
        </View>
      </Modal>
    </View>
  );
}
