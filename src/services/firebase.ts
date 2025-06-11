/**
 * Firebase service - Main Firebase configuration and utilities
 * This is an alias to firebaseSimple.ts for compatibility
 */

// Re-export everything from firebaseSimple for compatibility
export * from './firebaseSimple';

// Import and re-export specific items
import { 
  app as firebaseApp, 
  auth as firebaseAuth, 
  db as firestore, 
  storage as firebaseStorage 
} from './firebaseSimple';

// Firebase SDK imports for advanced features
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

import {
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

// Export Firebase SDK functions for use throughout the app
export {
  // Firestore functions
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  
  // Storage functions
  storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut as signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  
  // Firebase instances
  firebaseApp as app,
  firebaseAuth as auth,
  firestore as db,
  firebaseStorage as storage
};

// Type exports
export type {
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
  FirebaseUser
};

// Helper functions
export const getFirebaseTimestamp = () => serverTimestamp();
export const createTimestamp = (date: Date) => Timestamp.fromDate(date);
export const timestampToDate = (timestamp: any) => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Collection references
export const getUsersCollection = () => collection(firestore, 'users');
export const getChatsCollection = () => collection(firestore, 'chats');
export const getMessagesCollection = (chatId: string) => 
  collection(firestore, 'chats', chatId, 'messages');
export const getUpdatesCollection = () => collection(firestore, 'updates');
export const getGroupsCollection = () => collection(firestore, 'groups');

// Document references
export const getUserDoc = (userId: string) => doc(firestore, 'users', userId);
export const getChatDoc = (chatId: string) => doc(firestore, 'chats', chatId);
export const getMessageDoc = (chatId: string, messageId: string) => 
  doc(firestore, 'chats', chatId, 'messages', messageId);
export const getUpdateDoc = (updateId: string) => doc(firestore, 'updates', updateId);
export const getGroupDoc = (groupId: string) => doc(firestore, 'groups', groupId);

// Storage references
export const getUserAvatarRef = (userId: string, fileName: string) =>
  storageRef(firebaseStorage, `avatars/${userId}/${fileName}`);
export const getChatMediaRef = (chatId: string, fileName: string) =>
  storageRef(firebaseStorage, `chats/${chatId}/${fileName}`);
export const getUpdateMediaRef = (updateId: string, fileName: string) =>
  storageRef(firebaseStorage, `updates/${updateId}/${fileName}`);

console.log('✅ Firebase service initialized and ready');
