// Firebase Authentication & Firestore Debug Component
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../services/firebaseSimple';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const FirebaseDebugger: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Not tested');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const user = auth?.currentUser;
    if (user) {
      setAuthStatus(`✅ Authenticated: ${user.uid} (${user.email})`);
    } else {
      setAuthStatus('❌ Not authenticated');
    }
  };

  const testFirestoreRead = async () => {
    try {
      console.log('🔍 Testing Firestore read permissions...');
      
      if (!auth?.currentUser) {
        setFirestoreStatus('❌ Not authenticated');
        return;
      }

      // Try to read users collection
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      setFirestoreStatus(`✅ Read successful: ${snapshot.docs.length} users found`);
      console.log('✅ Firestore read test passed');
      
    } catch (error: any) {
      console.error('❌ Firestore read test failed:', error);
      setFirestoreStatus(`❌ Read failed: ${error.message}`);
      
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permission Denied',
          'Firestore rules are blocking the read operation. Check your security rules.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const testFirestoreWrite = async () => {
    try {
      console.log('🔍 Testing Firestore write permissions...');
      
      if (!auth?.currentUser) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      // Try to write to users collection
      const testDoc = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        testField: 'debug-test',
        timestamp: new Date()
      };

      await addDoc(collection(db, 'users'), testDoc);
      
      Alert.alert('Success', 'Firestore write test passed!');
      console.log('✅ Firestore write test passed');
      
    } catch (error: any) {
      console.error('❌ Firestore write test failed:', error);
      Alert.alert(
        'Write Failed', 
        `Error: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const createTestUser = async () => {
    try {
      if (!auth?.currentUser) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const testUser = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || 'test@example.com',
        displayName: 'Test User',
        phoneNumber: '+1234567890',
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'users'), testUser);
      
      Alert.alert('Success', 'Test user created in Firestore!');
      console.log('✅ Test user created');
      
    } catch (error: any) {
      console.error('❌ Failed to create test user:', error);
      Alert.alert(
        'Failed', 
        `Could not create test user: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 16, 
      margin: 16, 
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: 16,
        textAlign: 'center'
      }}>
        🔧 Firebase Debug Panel
      </Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
          Authentication Status:
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
          {authStatus}
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
          Firestore Status:
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
          {firestoreStatus}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={checkAuthStatus}
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            Check Auth Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testFirestoreRead}
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            Test Firestore Read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testFirestoreWrite}
          style={{
            backgroundColor: '#f59e0b',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            Test Firestore Write
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={createTestUser}
          style={{
            backgroundColor: '#8b5cf6',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            Create Test User
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ 
        fontSize: 10, 
        color: '#9ca3af',
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Use this to debug Firebase authentication and permissions
      </Text>
    </View>
  );
};
