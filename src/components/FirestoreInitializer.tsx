// Component to initialize Firestore collections
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initializeFirestoreCollections, checkCollectionsExist } from '../utils/initializeFirestore';

export const FirestoreInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [collectionsStatus, setCollectionsStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await initializeFirestoreCollections();
      Alert.alert(
        '✅ Success!',
        `Created ${result.collections.length} collections:\n${result.collections.join(', ')}`,
        [{ text: 'OK' }]
      );
      // Check status after initialization
      await checkStatus();
    } catch (error) {
      console.error('❌ Initialization error:', error);
      Alert.alert(
        '❌ Error',
        `Failed to initialize collections: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkCollectionsExist();
      setCollectionsStatus(status);
    } catch (error) {
      console.error('❌ Status check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const renderCollectionStatus = (name: string, exists: boolean) => (
    <View key={name} style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginVertical: 2,
      backgroundColor: exists ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderRadius: 8
    }}>
      <Ionicons 
        name={exists ? 'checkmark-circle' : 'close-circle'} 
        size={16} 
        color={exists ? '#10B981' : '#EF4444'} 
      />
      <Text style={{ 
        marginLeft: 8, 
        fontSize: 14,
        color: exists ? '#10B981' : '#EF4444',
        fontWeight: '500'
      }}>
        {name}
      </Text>
    </View>
  );

  return (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 20, 
      margin: 16, 
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center'
      }}>
        🗄️ Firestore Collections Setup
      </Text>

      <Text style={{ 
        fontSize: 14, 
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 20
      }}>
        Initialize the required collections for IraChat
      </Text>

      {/* Initialize Button */}
      <TouchableOpacity
        onPress={handleInitialize}
        disabled={isInitializing}
        style={{
          backgroundColor: '#87CEEB',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 12,
          opacity: isInitializing ? 0.7 : 1
        }}
      >
        {isInitializing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              Create Collections
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Check Status Button */}
      <TouchableOpacity
        onPress={checkStatus}
        disabled={isChecking}
        style={{
          backgroundColor: '#f3f4f6',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#6b7280" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="refresh" size={18} color="#6b7280" />
            <Text style={{ 
              color: '#6b7280', 
              fontSize: 14, 
              fontWeight: '500',
              marginLeft: 6
            }}>
              Check Status
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Collections Status */}
      {collectionsStatus && (
        <View>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: 8
          }}>
            Collections Status:
          </Text>
          {Object.entries(collectionsStatus).map(([name, exists]) => 
            renderCollectionStatus(name, exists as boolean)
          )}
        </View>
      )}

      <Text style={{ 
        fontSize: 12, 
        color: '#9ca3af',
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        This will create sample data for testing
      </Text>
    </View>
  );
};
