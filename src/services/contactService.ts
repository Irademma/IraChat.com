// 👥 CONTACT SERVICE - Manage user contacts and phone book
// Save contacts, sync with device, and manage contact relationships

import * as Contacts from 'expo-contacts';
import { Alert, Platform } from 'react-native';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface IraChatContact {
  id: string;
  userId?: string; // IraChat user ID if they're on the platform
  name: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  isIraChatUser: boolean;
  isBlocked: boolean;
  isFavorite: boolean;
  lastSeen?: Date;
  status?: string;
  addedAt: Date;
  updatedAt: Date;
  // Device contact info
  deviceContactId?: string;
  isFromDevice: boolean;
}

export interface ContactSyncResult {
  totalContacts: number;
  iraChatUsers: number;
  newContacts: number;
  updatedContacts: number;
}

class ContactService {
  /**
   * Request contacts permission
   */
  async requestContactsPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting contacts permission:', error);
      return false;
    }
  }

  /**
   * Sync device contacts with IraChat
   */
  async syncDeviceContacts(currentUserId: string): Promise<ContactSyncResult> {
    try {
      const hasPermission = await this.requestContactsPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant contacts permission to sync your contacts with IraChat.'
        );
        return { totalContacts: 0, iraChatUsers: 0, newContacts: 0, updatedContacts: 0 };
      }

      console.log('📱 Syncing device contacts...');

      // Get device contacts
      const { data: deviceContacts } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
      });

      console.log(`📱 Found ${deviceContacts.length} device contacts`);

      let newContacts = 0;
      let updatedContacts = 0;
      let iraChatUsers = 0;

      // Process each device contact
      for (const deviceContact of deviceContacts) {
        if (!deviceContact.phoneNumbers || deviceContact.phoneNumbers.length === 0) {
          continue; // Skip contacts without phone numbers
        }

        const phoneNumber = this.normalizePhoneNumber(deviceContact.phoneNumbers[0].number || '');
        if (!phoneNumber) continue;

        const contactName = deviceContact.name || 'Unknown Contact';

        // Check if contact already exists
        const existingContact = await this.getContactByPhone(currentUserId, phoneNumber);

        if (existingContact) {
          // Update existing contact
          await this.updateContact(currentUserId, existingContact.id, {
            name: contactName,
            email: deviceContact.emails?.[0]?.email,
            deviceContactId: deviceContact.id,
            isFromDevice: true,
            updatedAt: new Date(),
          });
          updatedContacts++;
        } else {
          // Check if this phone number belongs to an IraChat user
          const iraChatUser = await this.findIraChatUserByPhone(phoneNumber);

          // Create new contact
          const newContact: Omit<IraChatContact, 'id'> = {
            userId: iraChatUser?.id,
            name: contactName,
            phoneNumber,
            email: deviceContact.emails?.[0]?.email,
            avatar: iraChatUser?.avatar,
            isIraChatUser: !!iraChatUser,
            isBlocked: false,
            isFavorite: false,
            lastSeen: iraChatUser?.lastSeen,
            status: iraChatUser?.status,
            addedAt: new Date(),
            updatedAt: new Date(),
            deviceContactId: deviceContact.id,
            isFromDevice: true,
          };

          await this.addContact(currentUserId, newContact);
          newContacts++;

          if (iraChatUser) {
            iraChatUsers++;
          }
        }
      }

      console.log(`✅ Contact sync complete: ${newContacts} new, ${updatedContacts} updated, ${iraChatUsers} IraChat users`);

      return {
        totalContacts: deviceContacts.length,
        iraChatUsers,
        newContacts,
        updatedContacts,
      };
    } catch (error) {
      console.error('❌ Error syncing device contacts:', error);
      return { totalContacts: 0, iraChatUsers: 0, newContacts: 0, updatedContacts: 0 };
    }
  }

  /**
   * Add a new contact
   */
  async addContact(
    currentUserId: string,
    contact: Omit<IraChatContact, 'id'>
  ): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const contactId = `${currentUserId}_${Date.now()}`;
      const contactRef = doc(db, 'contacts', contactId);

      await setDoc(contactRef, {
        ...contact,
        ownerId: currentUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Contact added:', contactId);
      return { success: true, contactId };
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      return { success: false, error: 'Failed to add contact' };
    }
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    currentUserId: string,
    contactId: string,
    updates: Partial<IraChatContact>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      
      await updateDoc(contactRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Contact updated:', contactId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      return { success: false, error: 'Failed to update contact' };
    }
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      await deleteDoc(contactRef);

      console.log('✅ Contact deleted:', contactId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      return { success: false, error: 'Failed to delete contact' };
    }
  }

  /**
   * Get user's contacts
   */
  async getUserContacts(currentUserId: string): Promise<IraChatContact[]> {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('ownerId', '==', currentUserId));

      const snapshot = await getDocs(q);
      const contacts: IraChatContact[] = [];

      snapshot.docs.forEach(doc => {
        contacts.push({
          id: doc.id,
          ...doc.data(),
        } as IraChatContact);
      });

      return contacts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('❌ Error getting user contacts:', error);
      return [];
    }
  }

  /**
   * Subscribe to user's contacts
   */
  subscribeToUserContacts(
    currentUserId: string,
    callback: (contacts: IraChatContact[]) => void
  ): () => void {
    console.log('👥 Subscribing to user contacts:', currentUserId);

    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, where('ownerId', '==', currentUserId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contacts: IraChatContact[] = [];

      snapshot.docs.forEach(doc => {
        contacts.push({
          id: doc.id,
          ...doc.data(),
        } as IraChatContact);
      });

      const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
      console.log('👥 Received user contacts:', sortedContacts.length);
      callback(sortedContacts);
    });

    return unsubscribe;
  }

  /**
   * Get contact by phone number
   */
  async getContactByPhone(currentUserId: string, phoneNumber: string): Promise<IraChatContact | null> {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        where('ownerId', '==', currentUserId),
        where('phoneNumber', '==', phoneNumber)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as IraChatContact;
    } catch (error) {
      console.error('❌ Error getting contact by phone:', error);
      return null;
    }
  }

  /**
   * Find IraChat user by phone number
   */
  async findIraChatUserByPhone(phoneNumber: string): Promise<any | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber));

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error('❌ Error finding IraChat user by phone:', error);
      return null;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(
    currentUserId: string,
    contactId: string,
    isFavorite: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateContact(currentUserId, contactId, { isFavorite });
  }

  /**
   * Search contacts
   */
  searchContacts(contacts: IraChatContact[], query: string): IraChatContact[] {
    if (!query.trim()) return contacts;

    const searchTerm = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.phoneNumber.includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Normalize phone number for consistent storage
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Basic validation
    if (cleaned.length < 10) return '';
    
    return cleaned;
  }

  /**
   * Get IraChat users from contacts
   */
  getIraChatUsers(contacts: IraChatContact[]): IraChatContact[] {
    return contacts.filter(contact => contact.isIraChatUser);
  }

  /**
   * Get favorite contacts
   */
  getFavoriteContacts(contacts: IraChatContact[]): IraChatContact[] {
    return contacts.filter(contact => contact.isFavorite);
  }
}

// Export singleton instance
export const contactService = new ContactService();
export default contactService;
