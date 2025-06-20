// Firestore Collection Tester - Create missing collections
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../services/firebaseSimple';
import { Ionicons } from '@expo/vector-icons';

export const FirestoreCollectionTester: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const testAndCreateCollections = async () => {
    setIsCreating(true);
    setTestResults([]);
    const results: string[] = [];

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please log in first');
        setIsCreating(false);
        return;
      }

      results.push('🔍 Testing Firestore collections...');
      setTestResults([...results]);

      // Test collections that need to exist
      const collectionsToTest = [
        { name: 'users', required: true },
        { name: 'chats', required: false },
        { name: 'messages', required: false },
        { name: 'groups', required: false },
        { name: 'media', required: false },
        { name: 'documents', required: false },
      ];

      for (const col of collectionsToTest) {
        try {
          results.push(`📋 Testing ${col.name} collection...`);
          setTestResults([...results]);

          const testQuery = query(collection(db, col.name), limit(1));
          const snapshot = await getDocs(testQuery);
          
          if (snapshot.empty && col.required) {
            results.push(`⚠️ ${col.name} collection is empty, creating sample data...`);
            setTestResults([...results]);
            
            // Create sample data based on collection type
            await createSampleData(col.name, currentUser.uid);
            results.push(`✅ Created sample data for ${col.name}`);
          } else {
            results.push(`✅ ${col.name} collection exists (${snapshot.docs.length} docs)`);
          }
          setTestResults([...results]);
        } catch (error: any) {
          if (error.code === 'permission-denied') {
            results.push(`❌ Permission denied for ${col.name} - check Firestore rules`);
          } else {
            results.push(`❌ Error testing ${col.name}: ${error.message}`);
          }
          setTestResults([...results]);
        }
      }

      results.push('🎉 Collection testing complete!');
      setTestResults([...results]);

    } catch (error: any) {
      results.push(`❌ Error: ${error.message}`);
      setTestResults([...results]);
    } finally {
      setIsCreating(false);
    }
  };

  const createSampleData = async (collectionName: string, userId: string) => {
    switch (collectionName) {
      case 'users':
        await addDoc(collection(db, 'users'), {
          uid: userId,
          email: auth?.currentUser?.email || 'user@example.com',
          displayName: 'Test User',
          phoneNumber: '+1234567890',
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date(),
          avatar: 'https://via.placeholder.com/150/87CEEB/FFFFFF?text=U'
        });
        
        // Create a few more sample users for contact discovery
        await addDoc(collection(db, 'users'), {
          uid: 'sample-user-1',
          email: 'alice@example.com',
          displayName: 'Alice Johnson',
          phoneNumber: '+1234567891',
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date(),
          avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A'
        });

        await addDoc(collection(db, 'users'), {
          uid: 'sample-user-2',
          email: 'bob@example.com',
          displayName: 'Bob Smith',
          phoneNumber: '+1234567892',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(),
          avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=B'
        });
        break;

      case 'chats':
        await addDoc(collection(db, 'chats'), {
          participants: [userId, 'sample-user-1'],
          name: 'Sample Chat',
          isGroup: false,
          lastMessage: 'Hello! This is a test message.',
          lastMessageAt: new Date(),
          createdAt: new Date()
        });
        break;

      default:
        // For other collections, just create a placeholder
        await addDoc(collection(db, collectionName), {
          placeholder: true,
          createdAt: new Date(),
          createdBy: userId
        });
        break;
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
        🔧 Firestore Collection Tester
      </Text>

      <TouchableOpacity
        onPress={testAndCreateCollections}
        disabled={isCreating}
        style={{
          backgroundColor: '#87CEEB',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16,
          opacity: isCreating ? 0.7 : 1
        }}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="build" size={20} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              Test & Create Collections
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={{
          backgroundColor: '#f9fafb',
          padding: 12,
          borderRadius: 8,
          maxHeight: 200,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Test Results:
          </Text>
          {testResults.map((result, index) => (
            <Text key={index} style={{ 
              fontSize: 12, 
              color: '#374151',
              marginBottom: 4,
              fontFamily: 'monospace'
            }}>
              {result}
            </Text>
          ))}
        </View>
      )}

      <Text style={{ 
        fontSize: 10, 
        color: '#9ca3af',
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        This will test and create missing Firestore collections
      </Text>
    </View>
  );
};
