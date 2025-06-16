// Initialize Firestore Collections for IraChat
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebaseSimple';

export const initializeFirestoreCollections = async () => {
  console.log('🗄️ Initializing Firestore collections...');
  
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      console.log('⚠️ No authenticated user - creating sample data');
    }

    const userId = currentUser?.uid || 'sample-user-id';
    const userEmail = currentUser?.email || 'sample@example.com';

    // 1. CREATE USERS COLLECTION
    console.log('📝 Creating users collection...');
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: userEmail,
      displayName: currentUser?.displayName || 'Sample User',
      phoneNumber: currentUser?.phoneNumber || '+1234567890',
      avatar: 'https://via.placeholder.com/150/87CEEB/FFFFFF?text=User',
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en'
      }
    });

    // 2. CREATE CHATS COLLECTION
    console.log('💬 Creating chats collection...');
    const chatId = 'sample-chat-' + Date.now();
    await setDoc(doc(db, 'chats', chatId), {
      participants: [userId, 'other-user-id'],
      name: 'Sample Chat',
      isGroup: false,
      lastMessage: 'Welcome to IraChat!',
      lastMessageAt: serverTimestamp(),
      lastMessageBy: userId,
      createdAt: serverTimestamp(),
      avatar: null,
      unreadCount: {
        [userId]: 0,
        'other-user-id': 1
      }
    });

    // 3. CREATE MESSAGES COLLECTION
    console.log('📨 Creating messages collection...');
    const messageId = 'sample-message-' + Date.now();
    await setDoc(doc(db, 'messages', messageId), {
      chatId: chatId,
      senderId: userId,
      text: 'Welcome to IraChat! This is your first message.',
      type: 'text',
      timestamp: serverTimestamp(),
      readBy: [userId],
      mediaUrl: null,
      fileName: null,
      reactions: {},
      replyTo: null
    });

    // 4. CREATE GROUPS COLLECTION
    console.log('👥 Creating groups collection...');
    const groupId = 'sample-group-' + Date.now();
    await setDoc(doc(db, 'groups', groupId), {
      name: 'IraChat Welcome Group',
      description: 'Welcome to the IraChat community!',
      participants: [userId, 'other-user-1', 'other-user-2'],
      admins: [userId],
      avatar: 'https://via.placeholder.com/150/87CEEB/FFFFFF?text=Group',
      createdBy: userId,
      createdAt: serverTimestamp(),
      maxMembers: 1024,
      settings: {
        onlyAdminsCanMessage: false,
        onlyAdminsCanAddMembers: true
      }
    });

    // 5. CREATE DOCUMENTS COLLECTION
    console.log('📄 Creating documents collection...');
    const docId = 'sample-doc-' + Date.now();
    await setDoc(doc(db, 'documents', docId), {
      fileName: 'IraChat_Welcome_Guide.pdf',
      fileSize: 1024000, // 1MB
      fileType: 'application/pdf',
      uploadedBy: userId,
      uploadedAt: serverTimestamp(),
      downloadUrl: 'https://example.com/sample-document.pdf',
      chatId: chatId,
      description: 'Welcome guide for new users'
    });

    // 6. CREATE MEDIA COLLECTION
    console.log('🎬 Creating media collection...');
    const mediaId = 'sample-media-' + Date.now();
    await setDoc(doc(db, 'media', mediaId), {
      type: 'image',
      url: 'https://via.placeholder.com/800x600/87CEEB/FFFFFF?text=Sample+Image',
      thumbnail: 'https://via.placeholder.com/200x150/87CEEB/FFFFFF?text=Thumb',
      duration: null, // for videos/audio
      uploadedBy: userId,
      uploadedAt: serverTimestamp(),
      chatId: chatId,
      fileName: 'sample-image.jpg',
      fileSize: 512000, // 512KB
      dimensions: {
        width: 800,
        height: 600
      }
    });

    console.log('✅ All Firestore collections created successfully!');
    console.log('📊 Collections created:');
    console.log('  - users');
    console.log('  - chats');
    console.log('  - messages');
    console.log('  - groups');
    console.log('  - documents');
    console.log('  - media');

    return {
      success: true,
      collections: ['users', 'chats', 'messages', 'groups', 'documents', 'media'],
      sampleData: {
        userId,
        chatId,
        groupId,
        messageId,
        docId,
        mediaId
      }
    };

  } catch (error) {
    console.error('❌ Error creating Firestore collections:', error);
    throw error;
  }
};

// Helper function to check if collections exist
export const checkCollectionsExist = async () => {
  try {
    const collections = ['users', 'chats', 'messages', 'groups', 'documents', 'media'];
    const results = {};
    
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
