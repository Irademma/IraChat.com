// Initialize Firestore Collections for IraChat
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseSimple';

export const initializeFirestoreCollections = async () => {
  console.log('🗄️ Initializing Firestore collections...');

  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const userId = currentUser.uid;
    const userEmail = currentUser.email || '';

    // 1. CREATE CURRENT USER DOCUMENT
    console.log('📝 Creating user document...');
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: userEmail,
      displayName: currentUser.displayName || 'IraChat User',
      phoneNumber: currentUser.phoneNumber || '',
      avatar: currentUser.photoURL || '',
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      status: 'I use IraChat',
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
        privacy: {
          lastSeen: 'everyone',
          profilePhoto: 'everyone',
          status: 'everyone'
        }
      }
    });

    // 2. INITIALIZE COLLECTION STRUCTURES (no sample data)
    console.log('🏗️ Collection structures ready for real data...');

    console.log('✅ Firestore initialization completed successfully!');
    console.log('📊 User document created for:', userId);

    return {
      success: true,
      userId: userId,
      message: 'User document created successfully'
    };

  } catch (error) {
    console.error('❌ Error creating Firestore collections:', error);
    throw error;
  }
};

// Helper function to check if collections exist
export const checkCollectionsExist = async (): Promise<Record<string, boolean>> => {
  try {
    const collections = ['users', 'chats', 'messages', 'groups', 'documents', 'media'];
    const results: Record<string, boolean> = {};
    
    for (const collectionName of collections) {
      try {
        const { getDocs, limit, query } = await import('firebase/firestore');
        const q = query(collection(db, collectionName), limit(1));
        const snapshot = await getDocs(q);
        results[collectionName] = !snapshot.empty;
      } catch (error) {
        results[collectionName] = false;
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    return {};
  }
};
