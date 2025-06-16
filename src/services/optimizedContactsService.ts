// OPTIMIZED CONTACTS SERVICE - Fast loading with caching and performance improvements
import * as Contacts from "expo-contacts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Platform } from "react-native";
import { firestore } from "./firebaseSimple";

export interface Contact {
  id: string;
  name: string;
  username?: string;
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
  status?: string;
  lastSeen?: Date;
  bio?: string;
  userId?: string;
  isOnline?: boolean;
}

// OPTIMIZED CONTACTS SERVICE with caching and performance improvements
class OptimizedContactsService {
  private contactsCache: Contact[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading = false;
  private hasPermission = false;

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
    if (!phoneNumber) return "";
    
    // Remove all non-digit characters except +
    let normalized = phoneNumber.replace(/[^\d+]/g, "");
    
    // Handle different formats
    if (normalized.startsWith("00")) {
      normalized = "+" + normalized.substring(2);
    } else if (normalized.startsWith("0") && !normalized.startsWith("00")) {
      // Assume it's a local number, you might want to add country code
      normalized = normalized.substring(1);
    }
    
    return normalized;
  }

  /**
   * Get phone contacts from device - OPTIMIZED
   */
  async getPhoneContacts(): Promise<Contact[]> {
    try {
      if (Platform.OS === "web") {
        console.log("🌐 Web platform - using mock contacts");
        return this.getMockContacts();
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("📱 No contacts permission - using mock contacts");
        return this.getMockContacts();
      }

      console.log("📱 Fetching phone contacts...");

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
        ],
      });

      // OPTIMIZED: Process contacts with minimal operations
      const contacts = data
        .filter(contact => contact.name && contact.phoneNumbers?.length)
        .map(contact => {
          const phoneNumber = this.normalizePhoneNumber(contact.phoneNumbers![0].number || "");
          return {
            id: contact.id || Math.random().toString(),
            name: contact.name!,
            phoneNumber,
            isIraChatUser: false,
            status: "Available",
            lastSeen: new Date(),
            avatar: `https://via.placeholder.com/150/E5E7EB/6B7280?text=${contact.name!.charAt(0)}`
          };
        })
        .filter(contact => contact.phoneNumber.length > 5); // Filter out invalid numbers

      console.log(`✅ Found ${contacts.length} valid contacts`);
      return contacts;
    } catch (error) {
      console.error("❌ Error fetching contacts:", error);
      return this.getMockContacts();
    }
  }

  /**
   * Get mock contacts for testing/fallback
   */
  private getMockContacts(): Contact[] {
    return [
      {
        id: "mock1",
        name: "Alice Johnson",
        phoneNumber: "+1234567890",
        isIraChatUser: true,
        avatar: "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A",
        isOnline: true,
        status: "Available"
      },
      {
        id: "mock2", 
        name: "Bob Smith",
        phoneNumber: "+1234567891",
        isIraChatUser: true,
        avatar: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=B",
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: "mock3",
        name: "Charlie Brown", 
        phoneNumber: "+1234567892",
        isIraChatUser: false,
        avatar: "https://via.placeholder.com/150/45B7D1/FFFFFF?text=C"
      }
    ];
  }

  /**
   * FAST: Get IraChat contacts with caching and optimization
   */
  async getIraChatContacts(): Promise<Contact[]> {
    try {
      // Check cache first - INSTANT RETURN
      if (this.contactsCache && this.isCacheValid()) {
        console.log("⚡ Returning cached contacts (instant)");
        return this.contactsCache;
      }

      // Prevent multiple simultaneous loads
      if (this.isLoading) {
        console.log("⏳ Already loading contacts...");
        return this.contactsCache || [];
      }

      this.isLoading = true;
      console.log("🚀 Fast-loading contacts...");

      // Get phone contacts
      const phoneContacts = await this.getPhoneContacts();
      if (phoneContacts.length === 0) {
        this.isLoading = false;
        return [];
      }

      // OPTIMIZED: Get unique phone numbers
      const uniquePhones = [...new Set(phoneContacts.map(c => c.phoneNumber))];
      console.log(`🔍 Checking ${uniquePhones.length} unique numbers...`);

      // OPTIMIZED: Use larger batches and parallel processing
      const registeredUsers = await this.batchCheckRegistration(uniquePhones);

      // OPTIMIZED: Map contacts efficiently
      const iraChatContacts = phoneContacts.map(contact => {
        const userData = registeredUsers.get(contact.phoneNumber);
        
        if (userData) {
          return {
            ...contact,
            isIraChatUser: true,
            userId: userData.userId,
            avatar: userData.avatar || `https://via.placeholder.com/150/87CEEB/FFFFFF?text=${contact.name.charAt(0)}`,
            lastSeen: userData.lastSeen?.toDate(),
            isOnline: userData.isOnline || false,
            status: userData.status || "Available",
            bio: userData.bio,
            username: userData.username,
          };
        }

        return contact;
      });

      // Sort: IraChat users first, then alphabetically
      const sortedContacts = iraChatContacts.sort((a, b) => {
        if (a.isIraChatUser && !b.isIraChatUser) return -1;
        if (!a.isIraChatUser && b.isIraChatUser) return 1;
        return a.name.localeCompare(b.name);
      });

      const registeredCount = sortedContacts.filter(c => c.isIraChatUser).length;
      console.log(`✅ Found ${registeredCount} IraChat users (${sortedContacts.length} total)`);

      // Cache results
      this.contactsCache = sortedContacts;
      this.cacheTimestamp = Date.now();
      this.isLoading = false;

      return sortedContacts;
    } catch (error) {
      console.error("❌ Error loading contacts:", error);
      this.isLoading = false;
      return this.getMockContacts();
    }
  }

  /**
   * OPTIMIZED: Batch check registration with parallel processing
   */
  private async batchCheckRegistration(phoneNumbers: string[]): Promise<Map<string, any>> {
    try {
      if (!firestore) {
        console.log("⚠️ Firestore not available");
        return new Map();
      }

      const registeredUsers = new Map();
      const batchSize = 30; // Larger batches for better performance
      const promises = [];

      // Create parallel batch promises
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);
        promises.push(this.queryUserBatch(batch));
      }

      // Execute all batches in parallel
      const results = await Promise.all(promises);
      
      // Merge results
      results.forEach(batchMap => {
        batchMap.forEach((userData, phone) => {
          registeredUsers.set(phone, userData);
        });
      });

      return registeredUsers;
    } catch (error) {
      console.error("❌ Error batch checking registration:", error);
      return new Map();
    }
  }

  /**
   * Query single batch of users
   */
  private async queryUserBatch(phoneNumbers: string[]): Promise<Map<string, any>> {
    try {
      const usersQuery = query(
        collection(firestore, "users"),
        where("phoneNumber", "in", phoneNumbers)
      );

      const snapshot = await getDocs(usersQuery);
      const batchUsers = new Map();

      snapshot.forEach(doc => {
        const userData = doc.data();
        batchUsers.set(userData.phoneNumber, {
          userId: doc.id,
          ...userData,
        });
      });

      return batchUsers;
    } catch (error) {
      console.error("❌ Error querying batch:", error);
      return new Map();
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return this.contactsCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  /**
   * Clear cache and force refresh
   */
  async refreshContacts(): Promise<Contact[]> {
    console.log("🔄 Force refreshing contacts...");
    this.contactsCache = null;
    this.cacheTimestamp = 0;
    return this.getIraChatContacts();
  }

  /**
   * Get only registered IraChat contacts
   */
  async getRegisteredContacts(): Promise<Contact[]> {
    const contacts = await this.getIraChatContacts();
    return contacts.filter(contact => contact.isIraChatUser);
  }

  /**
   * Search contacts (uses cache)
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const contacts = await this.getIraChatContacts();
    const searchTerm = query.toLowerCase();

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.phoneNumber.includes(query) ||
      contact.username?.toLowerCase().includes(searchTerm)
    );
  }
}

// Create optimized service instance
const optimizedContactsService = new OptimizedContactsService();

export default optimizedContactsService;
