// Real Contacts Integration Service with expo-contacts
import * as Contacts from "expo-contacts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Platform } from "react-native";
import { firestore } from "./firebaseSimple";

export interface Contact {
  id: string;
  name: string;
  username?: string; // Unique username for search
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
  status?: string;
  lastSeen?: Date;
  bio?: string;
  userId?: string;
  isOnline?: boolean;
}

// OPTIMIZED CONTACTS SERVICE - Fast loading with caching
class ContactsService {
  private contacts: Contact[] = [];
  private hasPermission = false;
  private contactsCache: Contact[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading = false;

  /**
   * Request contacts permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        console.log("🌐 Web platform - contacts not available");
        return false;
      }

      const { status } = await Contacts.requestPermissionsAsync();
      this.hasPermission = status === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("❌ Error requesting contacts permission:", error);
      return false;
    }
  }

  /**
   * Normalize phone number for consistent comparison
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let normalized = phoneNumber.replace(/[^\d+]/g, "");

    // If it starts with +, keep it
    if (normalized.startsWith("+")) {
      return normalized;
    }

    // If it's a 10-digit number, assume it's US and add +1
    if (normalized.length === 10) {
      return `+1${normalized}`;
    }

    // If it's 11 digits starting with 1, add +
    if (normalized.length === 11 && normalized.startsWith("1")) {
      return `+${normalized}`;
    }

    return normalized;
  }

  /**
   * Get all phone contacts from device
   */
  async getPhoneContacts(): Promise<Contact[]> {
    try {
      if (Platform.OS === "web") {
        console.log("🌐 Web platform - contacts not available");
        return [];
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error("Contacts permission denied");
      }

      console.log("📱 Fetching phone contacts...");

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
      });

      const contacts = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0,
        )
        .map((contact) => ({
          id: contact.id || Math.random().toString(),
          name: contact.name || "Unknown",
          phoneNumber: this.normalizePhoneNumber(
            contact.phoneNumbers?.[0]?.number || "",
          ),
          isIraChatUser: false, // Will be updated when checking registration
          status: "Available",
          lastSeen: new Date(),
        }))
        .filter((contact) => contact.phoneNumber.length > 0);

      this.contacts = contacts;
      console.log(`✅ Found ${contacts.length} contacts with phone numbers`);
      return contacts;
    } catch (error) {
      console.error("❌ Error fetching contacts:", error);
      return [];
    }
  }

  /**
   * Check which contacts are registered on IraChat
   */
  async getIraChatContacts(): Promise<Contact[]> {
    try {
      if (!firestore) {
        throw new Error("Firestore not initialized");
      }

      const phoneContacts = await this.getPhoneContacts();
      if (phoneContacts.length === 0) {
        return [];
      }

      const allPhoneNumbers = phoneContacts.map(
        (contact) => contact.phoneNumber,
      );

      console.log("🔍 Checking which contacts are registered on IraChat...");

      // Query users collection for registered phone numbers (batch in groups of 10)
      const registeredUsers = new Map();

      for (let i = 0; i < allPhoneNumbers.length; i += 10) {
        const batch = allPhoneNumbers.slice(i, i + 10);
        const usersQuery = query(
          collection(firestore, "users"),
          where("phoneNumber", "in", batch),
        );

        const snapshot = await getDocs(usersQuery);
        snapshot.forEach((doc) => {
          const userData = doc.data();
          registeredUsers.set(userData.phoneNumber, {
            userId: doc.id,
            ...userData,
          });
        });
      }

      // Map phone contacts to IraChat contacts
      const iraChatContacts = phoneContacts.map((contact) => {
        const userData = registeredUsers.get(contact.phoneNumber);

        if (userData) {
          return {
            ...contact,
            isIraChatUser: true,
            userId: userData.userId,
            avatar: userData.avatar,
            lastSeen: userData.lastSeen?.toDate(),
            isOnline: userData.isOnline || false,
            status: userData.status,
            bio: userData.bio,
            username: userData.username,
          };
        }

        return contact;
      });

      const registeredCount = iraChatContacts.filter(
        (c) => c.isIraChatUser,
      ).length;
      console.log(`✅ Found ${registeredCount} contacts registered on IraChat`);

      return iraChatContacts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("❌ Error checking IraChat contacts:", error);
      return [];
    }
  }

  /**
   * Get only registered IraChat contacts
   */
  async getRegisteredContacts(): Promise<Contact[]> {
    const contacts = await this.getIraChatContacts();
    return contacts.filter((contact) => contact.isIraChatUser);
  }

  /**
   * Search contacts by name or phone number
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const contacts = await this.getIraChatContacts();
    const searchTerm = query.toLowerCase();

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phoneNumber.includes(query) ||
        contact.username?.toLowerCase().includes(searchTerm),
    );
  }

  /**
   * Get contact by phone number
   */
  async getContactByPhone(phoneNumber: string): Promise<Contact | null> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const contacts = await this.getIraChatContacts();

    return (
      contacts.find((contact) => contact.phoneNumber === normalizedPhone) ||
      null
    );
  }

  /**
   * Get contact by user ID
   */
  async getContactByUserId(userId: string): Promise<Contact | null> {
    const contacts = await this.getIraChatContacts();
    return contacts.find((contact) => contact.userId === userId) || null;
  }

  /**
   * Refresh contacts data
   */
  async refreshContacts(): Promise<Contact[]> {
    console.log("🔄 Refreshing contacts...");
    return this.getIraChatContacts();
  }
}

// Format last seen time
export const formatLastSeen = (lastSeen: Date | string | undefined): string => {
  try {
    if (!lastSeen) {
      return "Unknown";
    }

    let date: Date;
    if (lastSeen instanceof Date) {
      date = lastSeen;
    } else if (typeof lastSeen === "string") {
      date = new Date(lastSeen);
    } else {
      return "Unknown";
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return "Unknown";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Online";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  } catch (error) {
    console.error("Error formatting last seen:", error);
    return "Unknown";
  }
};

// Create service instance
const contactsServiceInstance = new ContactsService();

// Export service and utility functions
export const contactsService = {
  ...contactsServiceInstance,
  formatLastSeen,
  // Legacy compatibility methods
  getIraChatContacts: () => contactsServiceInstance.getIraChatContacts(),
  getRealDeviceContacts: () => contactsServiceInstance.getPhoneContacts(),
  getContacts: () => contactsServiceInstance.getIraChatContacts(),
  getContactById: (id: string) =>
    contactsServiceInstance.getContactByUserId(id),
  searchContacts: (query: string) =>
    contactsServiceInstance.searchContacts(query),
  getContactByPhone: (phone: string) =>
    contactsServiceInstance.getContactByPhone(phone),
};

// Named exports for backward compatibility
export const getIraChatContacts = () =>
  contactsServiceInstance.getIraChatContacts();
export const getRealDeviceContacts = () =>
  contactsServiceInstance.getPhoneContacts();
export const searchContacts = (query: string) =>
  contactsServiceInstance.searchContacts(query);
export const getContactByPhone = (phone: string) =>
  contactsServiceInstance.getContactByPhone(phone);

export default contactsService;
