// Phone Number Utilities for International Support
export interface CountryData {
  code: string;
  country: string;
  flag: string;
  name: string;
  minLength: number;
  maxLength: number;
  format?: string;
}

// Extended country codes with validation rules
export const COUNTRY_CODES: CountryData[] = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States", minLength: 10, maxLength: 10, format: "(###) ###-####" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada", minLength: 10, maxLength: 10, format: "(###) ###-####" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom", minLength: 10, maxLength: 11 },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France", minLength: 9, maxLength: 9 },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany", minLength: 10, maxLength: 12 },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy", minLength: 9, maxLength: 11 },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain", minLength: 9, maxLength: 9 },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia", minLength: 10, maxLength: 10 },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China", minLength: 11, maxLength: 11 },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan", minLength: 10, maxLength: 11 },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea", minLength: 10, maxLength: 11 },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India", minLength: 10, maxLength: 10 },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia", minLength: 9, maxLength: 9 },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil", minLength: 10, maxLength: 11 },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico", minLength: 10, maxLength: 10 },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa", minLength: 9, maxLength: 9 },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria", minLength: 10, maxLength: 10 },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya", minLength: 9, maxLength: 9 },
  { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda", minLength: 9, maxLength: 9 },
  { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania", minLength: 9, maxLength: 9 },
  { code: "+250", country: "RW", flag: "🇷🇼", name: "Rwanda", minLength: 9, maxLength: 9 },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE", minLength: 9, maxLength: 9 },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia", minLength: 9, maxLength: 9 },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt", minLength: 10, maxLength: 11 },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey", minLength: 10, maxLength: 10 },
  // Additional African countries
  { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia", minLength: 9, maxLength: 9 },
  { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana", minLength: 9, maxLength: 9 },
  { code: "+225", country: "CI", flag: "🇨🇮", name: "Ivory Coast", minLength: 8, maxLength: 8 },
  { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal", minLength: 9, maxLength: 9 },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco", minLength: 9, maxLength: 9 },
  // Additional European countries
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands", minLength: 9, maxLength: 9 },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium", minLength: 9, maxLength: 9 },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland", minLength: 9, maxLength: 9 },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria", minLength: 10, maxLength: 11 },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark", minLength: 8, maxLength: 8 },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden", minLength: 9, maxLength: 9 },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway", minLength: 8, maxLength: 8 },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland", minLength: 9, maxLength: 10 },
  // Additional Asian countries
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore", minLength: 8, maxLength: 8 },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia", minLength: 9, maxLength: 10 },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand", minLength: 9, maxLength: 9 },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam", minLength: 9, maxLength: 10 },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines", minLength: 10, maxLength: 10 },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia", minLength: 9, maxLength: 12 },
];

/**
 * Validate phone number based on country-specific rules
 */
export const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  if (!country) {
    // Generic validation for unknown countries
    return cleaned.length >= 6 && cleaned.length <= 15;
  }
  
  return cleaned.length >= country.minLength && cleaned.length <= country.maxLength;
};

/**
 * Format phone number for display based on country
 */
export const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  // US/Canada formatting
  if (countryCode === "+1" && cleaned.length >= 6) {
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
  }
  
  // UK formatting
  if (countryCode === "+44" && cleaned.length >= 6) {
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
  }
  
  // Default: add spaces every 3-4 digits
  if (cleaned.length >= 6) {
    return cleaned.replace(/(\d{3,4})(?=\d)/g, '$1 ');
  }
  
  return cleaned;
};

/**
 * Format phone number for Firebase (international format)
 */
export const formatForFirebase = (phoneNumber: string, countryCode: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return `${countryCode}${cleaned}`;
};

/**
 * Get country data by country code
 */
export const getCountryByCode = (countryCode: string): CountryData | undefined => {
  return COUNTRY_CODES.find(c => c.code === countryCode);
};

/**
 * Get placeholder text for phone input based on country
 */
export const getPlaceholder = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  
  switch (countryCode) {
    case "+1":
      return "(234) 567-8900";
    case "+44":
      return "7700 900123";
    case "+33":
      return "6 12 34 56 78";
    case "+49":
      return "30 12345678";
    case "+91":
      return "98765 43210";
    case "+86":
      return "138 0013 8000";
    case "+81":
      return "90 1234 5678";
    case "+234":
      return "802 123 4567";
    case "+254":
    case "+256":
    case "+255":
    case "+250":
      return "712 345 678";
    case "+971":
      return "50 123 4567";
    default:
      return "Enter phone number";
  }
};

/**
 * Normalize phone number for consistent storage/comparison
 */
export const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }
  
  return normalized;
};

/**
 * Check if phone number is valid for Firebase Auth
 */
export const isValidForFirebase = (phoneNumber: string): boolean => {
  const normalized = normalizePhoneNumber(phoneNumber);
  // Firebase requires E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(normalized);
};
