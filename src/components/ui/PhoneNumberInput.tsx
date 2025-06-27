import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COUNTRY_CODES,
  formatPhoneNumber,
  getPlaceholder,
  validatePhoneNumber,
  type CountryData
} from "../../utils/phoneUtils";

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
  placeholder,
  editable = true,
  error = false,
}: PhoneNumberInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    COUNTRY_CODES.find(c => c.country === "UG") || COUNTRY_CODES[18]
  ); // Default to Uganda
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update placeholder based on selected country
  const dynamicPlaceholder = placeholder || getPlaceholder(selectedCountry.code);

  // Filter countries based on search
  const filteredCountries = COUNTRY_CODES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery) ||
      country.country.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle country selection
  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    onCountryChange(country.code);
    setModalVisible(false);
    setSearchQuery("");
    // Clear the phone number when country changes to avoid format conflicts
    onChangeText("");
  };

  // Handle text input with formatting
  const handleTextChange = (text: string) => {
    const formatted = formatPhoneNumber(text, selectedCountry.code);
    onChangeText(formatted);
  };

  // Initialize country change callback
  useEffect(() => {
    onCountryChange(selectedCountry.code);
  }, [selectedCountry.code]);

  // Render country item in modal
  const renderCountryItem = ({ item }: { item: CountryData }) => (
    <TouchableOpacity
      onPress={() => handleCountrySelect(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
      }}
    >
      <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '500', 
          color: '#1f2937' 
        }}>
          {item.name}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#6b7280' 
        }}>
          {item.code}
        </Text>
      </View>
      {selectedCountry.code === item.code && selectedCountry.country === item.country && (
        <Ionicons name="checkmark" size={20} color="#87CEEB" />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? "#EF4444" : "#D1D5DB",
          borderRadius: 8,
          backgroundColor: 'white'
        }}
      >
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => editable && setModalVisible(true)}
          disabled={!editable}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRightWidth: 1,
            borderRightColor: '#d1d5db'
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>{selectedCountry.flag}</Text>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            {selectedCountry.code}
          </Text>
          {editable && (
            <Ionicons
              name="chevron-down"
              size={16}
              color="#6B7280"
              style={{ marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={dynamicPlaceholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          editable={editable}
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: '#1f2937'
          }}
          maxLength={25}
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>

      {/* Validation indicator */}
      {value.length > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginTop: 4 
        }}>
          <Ionicons
            name={validatePhoneNumber(value, selectedCountry.code) ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={validatePhoneNumber(value, selectedCountry.code) ? "#10b981" : "#ef4444"}
          />
          <Text style={{
            marginLeft: 4,
            fontSize: 12,
            color: validatePhoneNumber(value, selectedCountry.code) ? "#10b981" : "#ef4444"
          }}>
            {validatePhoneNumber(value, selectedCountry.code) 
              ? "Valid phone number" 
              : `Enter ${selectedCountry.minLength}-${selectedCountry.maxLength} digits`
            }
          </Text>
        </View>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            backgroundColor: '#87CEEB'
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '700',
              color: 'white'
            }}>
              Select Country
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={{ padding: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search countries..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 16
                }}
              />
            </View>
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item, index) => `${item.country}-${item.code}-${index}`}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
  );
}