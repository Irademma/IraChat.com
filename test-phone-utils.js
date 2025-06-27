// Test script for phone utilities
// Run this in Node.js to test the phone utility functions

// Mock the phone utils functions for testing
const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States", minLength: 10, maxLength: 10 },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom", minLength: 10, maxLength: 11 },
  { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda", minLength: 9, maxLength: 9 },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria", minLength: 10, maxLength: 10 },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India", minLength: 10, maxLength: 10 },
];

const validatePhoneNumber = (phoneNumber, countryCode) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  if (!country) {
    return cleaned.length >= 6 && cleaned.length <= 15;
  }
  
  return cleaned.length >= country.minLength && cleaned.length <= country.maxLength;
};

const formatPhoneNumber = (phoneNumber, countryCode) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (countryCode === "+1" && cleaned.length >= 3) {
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
  }
  
  if (countryCode === "+44" && cleaned.length >= 6) {
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
  }
  
  if (cleaned.length >= 6) {
    return cleaned.replace(/(\d{3,4})(?=\d)/g, '$1 ');
  }
  
  return cleaned;
};

const formatForFirebase = (phoneNumber, countryCode) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return `${countryCode}${cleaned}`;
};

// Test cases
console.log('🧪 Testing Phone Utilities\n');

// Test 1: US Phone Number Validation
console.log('📱 Test 1: US Phone Numbers');
console.log('Valid US (2345678901):', validatePhoneNumber('2345678901', '+1')); // Should be true
console.log('Invalid US (123456):', validatePhoneNumber('123456', '+1')); // Should be false
console.log('US Formatting (2345678901):', formatPhoneNumber('2345678901', '+1'));
console.log('US Firebase format:', formatForFirebase('2345678901', '+1'));
console.log('');

// Test 2: Uganda Phone Number Validation
console.log('📱 Test 2: Uganda Phone Numbers');
console.log('Valid Uganda (712345678):', validatePhoneNumber('712345678', '+256')); // Should be true
console.log('Invalid Uganda (12345):', validatePhoneNumber('12345', '+256')); // Should be false
console.log('Uganda Formatting (712345678):', formatPhoneNumber('712345678', '+256'));
console.log('Uganda Firebase format:', formatForFirebase('712345678', '+256'));
console.log('');

// Test 3: UK Phone Number Validation
console.log('📱 Test 3: UK Phone Numbers');
console.log('Valid UK (7700900123):', validatePhoneNumber('7700900123', '+44')); // Should be true
console.log('Invalid UK (123):', validatePhoneNumber('123', '+44')); // Should be false
console.log('UK Formatting (7700900123):', formatPhoneNumber('7700900123', '+44'));
console.log('UK Firebase format:', formatForFirebase('7700900123', '+44'));
console.log('');

// Test 4: Nigeria Phone Number Validation
console.log('📱 Test 4: Nigeria Phone Numbers');
console.log('Valid Nigeria (8021234567):', validatePhoneNumber('8021234567', '+234')); // Should be true
console.log('Invalid Nigeria (123456):', validatePhoneNumber('123456', '+234')); // Should be false
console.log('Nigeria Formatting (8021234567):', formatPhoneNumber('8021234567', '+234'));
console.log('Nigeria Firebase format:', formatForFirebase('8021234567', '+234'));
console.log('');

// Test 5: India Phone Number Validation
console.log('📱 Test 5: India Phone Numbers');
console.log('Valid India (9876543210):', validatePhoneNumber('9876543210', '+91')); // Should be true
console.log('Invalid India (123456):', validatePhoneNumber('123456', '+91')); // Should be false
console.log('India Formatting (9876543210):', formatPhoneNumber('9876543210', '+91'));
console.log('India Firebase format:', formatForFirebase('9876543210', '+91'));
console.log('');

// Test 6: Edge Cases
console.log('📱 Test 6: Edge Cases');
console.log('Empty string validation:', validatePhoneNumber('', '+1'));
console.log('Non-numeric characters (US):', formatPhoneNumber('(234) 567-8901', '+1'));
console.log('Mixed input formatting:', formatPhoneNumber('234-567-8901', '+1'));
console.log('');

console.log('✅ Phone utilities testing complete!');
