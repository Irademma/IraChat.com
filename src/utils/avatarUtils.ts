/**
 * Avatar Utilities for IraChat
 * 
 * Provides consistent avatar handling with fallbacks,
 * initials generation, and color assignment
 */

import { colors } from '../styles/designSystem';

// Predefined colors for avatar backgrounds
const avatarColors = [
  '#667eea', // Primary blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

/**
 * Generate initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '?';
  }
  
  // Clean the name and split into words
  const cleanName = name.trim().replace(/[^a-zA-Z\s]/g, '');
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return '?';
  }
  
  if (words.length === 1) {
    // Single word - take first two characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words - take first character of first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color for a name
 */
export const getAvatarColor = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return avatarColors[0];
  }
  
  // Create a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a color index
  const colorIndex = Math.abs(hash) % avatarColors.length;
  return avatarColors[colorIndex];
};

/**
 * Check if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check if it's a valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check if it has an image extension or is from known image services
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  const imageServices = /(gravatar|ui-avatars|pravatar|picsum|unsplash)/i;
  
  return imageExtensions.test(url) || imageServices.test(url);
};

/**
 * Generate avatar props for consistent avatar display
 */
export interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | number;
  showInitials?: boolean;
}

export interface AvatarStyle {
  width: number;
  height: number;
  borderRadius: number;
  backgroundColor: string;
  justifyContent: 'center';
  alignItems: 'center';
}

export interface AvatarTextStyle {
  color: string;
  fontSize: number;
  fontWeight: '600';
  textAlign: 'center';
}

export const getAvatarStyles = (props: AvatarProps): {
  containerStyle: AvatarStyle;
  textStyle: AvatarTextStyle;
  initials: string;
  hasValidImage: boolean;
} => {
  const { imageUrl, name, size = 'medium' } = props;
  
  // Determine size
  let avatarSize: number;
  switch (size) {
    case 'small':
      avatarSize = 32;
      break;
    case 'medium':
      avatarSize = 48;
      break;
    case 'large':
      avatarSize = 64;
      break;
    default:
      avatarSize = typeof size === 'number' ? size : 48;
  }
  
  const hasValidImage = isValidImageUrl(imageUrl);
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  
  const containerStyle: AvatarStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: hasValidImage ? colors.gray200 : backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  const textStyle: AvatarTextStyle = {
    color: colors.white,
    fontSize: Math.floor(avatarSize * 0.4), // 40% of avatar size
    fontWeight: '600',
    textAlign: 'center',
  };
  
  return {
    containerStyle,
    textStyle,
    initials,
    hasValidImage,
  };
};

/**
 * Clean and validate contact name
 */
export const cleanContactName = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') {
    return 'Unknown';
  }
  
  // Remove common system prefixes and clean the name
  const cleaned = name
    .replace(/^\*\d+#?/, '') // Remove *43#, *123# etc.
    .replace(/^[\+\-\*#\s]+/, '') // Remove leading symbols
    .replace(/[\+\-\*#]+$/, '') // Remove trailing symbols
    .trim();
  
  // If nothing left after cleaning, return Unknown
  if (!cleaned || cleaned.length === 0) {
    return 'Unknown';
  }
  
  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Check if a contact entry is a system entry that should be filtered out
 */
export const isSystemContact = (contact: any): boolean => {
  if (!contact) return true;
  
  const name = contact.name || contact.displayName || '';
  const phone = contact.phoneNumbers?.[0]?.number || contact.phone || '';
  
  // System number patterns
  const systemPatterns = [
    /^\*\d+#?$/, // *43#, *123#, etc.
    /^#\d+#?$/, // #123#, etc.
    /^\d{1,3}$/, // Short codes like 911, 411
    /^[+\-\*#\s]+$/, // Only symbols
  ];
  
  // Check if phone number matches system patterns
  const isSystemPhone = systemPatterns.some(pattern => pattern.test(phone));
  
  // Check if name is empty or system-like
  const isSystemName = !name || 
    name.trim().length === 0 || 
    systemPatterns.some(pattern => pattern.test(name));
  
  return isSystemPhone || isSystemName;
};

/**
 * Deduplicate contacts by phone number
 */
export const deduplicateContacts = (contacts: any[]): any[] => {
  if (!Array.isArray(contacts)) return [];
  
  const seen = new Set<string>();
  const deduplicated: any[] = [];
  
  for (const contact of contacts) {
    // Skip system contacts
    if (isSystemContact(contact)) {
      continue;
    }
    
    const phone = contact.phoneNumbers?.[0]?.number || contact.phone || '';
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove formatting
    
    // Skip if we've seen this phone number before
    if (seen.has(normalizedPhone)) {
      continue;
    }
    
    // Skip if phone number is too short or invalid
    if (normalizedPhone.length < 7) {
      continue;
    }
    
    seen.add(normalizedPhone);
    deduplicated.push({
      ...contact,
      name: cleanContactName(contact.name || contact.displayName),
      phone: normalizedPhone,
    });
  }
  
  return deduplicated;
};

/**
 * Generate a placeholder avatar URL with initials
 */
export const generatePlaceholderAvatar = (name: string, size: number = 150): string => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name).replace('#', '');
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&size=${size}&bold=true`;
};

export default {
  getInitials,
  getAvatarColor,
  isValidImageUrl,
  getAvatarStyles,
  cleanContactName,
  isSystemContact,
  deduplicateContacts,
  generatePlaceholderAvatar,
};
