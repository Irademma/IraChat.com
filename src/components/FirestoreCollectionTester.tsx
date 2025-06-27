// Firestore Collection Tester - Create missing collections
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../services/firebaseSimple';

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
            
            // Create real user data for collection
            await createRealUserData(col.name, currentUser.uid);
            results.push(`✅ Created real data for ${col.name}`);
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

  const createRealUserData = async (collectionName: string, userId: string) => {
    switch (collectionName) {
      case 'users':
        // Create only the current user's real data
        await addDoc(collection(db, 'users'), {
          uid: userId,
          email: auth?.currentUser?.email || '',
          displayName: auth?.currentUser?.displayName || 'IraChat User',
          phoneNumber: auth?.currentUser?.phoneNumber || '',
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date(),
          avatar: auth?.currentUser?.photoURL || '',
          status: 'I use IraChat'
        });
        break;

      default:
        // For other collections, create minimal structure
        await addDoc(collection(db, collectionName), {
          initialized: true,
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
