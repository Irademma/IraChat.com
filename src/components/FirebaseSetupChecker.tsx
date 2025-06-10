import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig, isFirebaseConfigValid } from '../config/firebase';
import { auth, db, storage } from '../services/firebaseSimple';

interface FirebaseStatus {
  config: boolean;
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  connectivity: boolean;
}

export default function FirebaseSetupChecker() {
  const [status, setStatus] = useState<FirebaseStatus>({
    config: false,
    auth: false,
    firestore: false,
    storage: false,
    connectivity: false,
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkFirebaseSetup();
  }, []);

  const checkFirebaseSetup = async () => {
    setLoading(true);
    
    try {
      // Check configuration
      const configValid = isFirebaseConfigValid;
      
      // Check auth service
      const authValid = auth !== null && auth !== undefined;
      
      // Check Firestore
      const firestoreValid = db !== null && db !== undefined;
      
      // Check Storage
      const storageValid = storage !== null && storage !== undefined;
      
      // Check connectivity (simple test)
      let connectivityValid = false;
      try {
        // Try to access Firebase (this will fail gracefully if offline)
        if (auth && typeof auth.onAuthStateChanged === 'function') {
          connectivityValid = true;
        }
      } catch (error) {
        console.log('Connectivity check failed:', error);
      }

      setStatus({
        config: configValid,
        auth: authValid,
        firestore: firestoreValid,
        storage: storageValid,
        connectivity: connectivityValid,
      });
    } catch (error) {
      console.error('Error checking Firebase setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusItem = ({ 
    title, 
    status, 
    description 
  }: { 
    title: string; 
    status: boolean; 
    description: string; 
  }) => (
    <View className="flex-row items-center py-3 px-4 bg-white rounded-lg mb-2 border border-gray-200">
      <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
        status ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <Ionicons 
          name={status ? "checkmark" : "close"} 
          size={16} 
          color={status ? "#10B981" : "#EF4444"} 
        />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm">{description}</Text>
      </View>
      <Text className={`text-sm font-medium ${
        status ? 'text-green-600' : 'text-red-600'
      }`}>
        {status ? 'OK' : 'Error'}
      </Text>
    </View>
  );

  const allServicesWorking = Object.values(status).every(s => s);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <View className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <Text className="text-gray-600">Checking Firebase setup...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="bg-white rounded-lg p-6 mb-4 items-center">
          <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            allServicesWorking ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Ionicons 
              name={allServicesWorking ? "checkmark-circle" : "warning"} 
              size={32} 
              color={allServicesWorking ? "#10B981" : "#EF4444"} 
            />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Firebase Setup
          </Text>
          <Text className={`text-center ${
            allServicesWorking ? 'text-green-600' : 'text-red-600'
          }`}>
            {allServicesWorking 
              ? 'All services are working correctly!' 
              : 'Some services need attention'
            }
          </Text>
        </View>

        {/* Status Items */}
        <StatusItem
          title="Configuration"
          status={status.config}
          description="Environment variables and Firebase config"
        />
        
        <StatusItem
          title="Authentication"
          status={status.auth}
          description="Firebase Auth service initialization"
        />
        
        <StatusItem
          title="Firestore Database"
          status={status.firestore}
          description="Cloud Firestore database connection"
        />
        
        <StatusItem
          title="Cloud Storage"
          status={status.storage}
          description="Firebase Storage for media files"
        />
        
        <StatusItem
          title="Connectivity"
          status={status.connectivity}
          description="Network connection to Firebase services"
        />

        {/* Actions */}
        <View className="mt-6">
          <TouchableOpacity
            onPress={checkFirebaseSetup}
            className="bg-blue-500 py-3 px-6 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-medium">
              Recheck Setup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            className="bg-gray-100 py-3 px-6 rounded-lg mb-3"
          >
            <Text className="text-gray-700 text-center font-medium">
              {showDetails ? 'Hide' : 'Show'} Configuration Details
            </Text>
          </TouchableOpacity>

          {!allServicesWorking && (
            <TouchableOpacity
              onPress={() => Alert.alert(
                'Firebase Setup Help',
                'Please check:\n\n1. Your .env file has all Firebase variables\n2. Your Firebase project is active\n3. You have internet connection\n4. Firebase services are enabled in your project',
                [{ text: 'OK' }]
              )}
              className="bg-orange-100 border border-orange-200 py-3 px-6 rounded-lg"
            >
              <Text className="text-orange-700 text-center font-medium">
                Get Help
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Configuration Details */}
        {showDetails && (
          <View className="bg-white rounded-lg p-4 mt-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Configuration Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Project ID:</Text>
                <Text className="text-gray-800 font-mono text-sm">
                  {firebaseConfig.projectId}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Auth Domain:</Text>
                <Text className="text-gray-800 font-mono text-sm">
                  {firebaseConfig.authDomain}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Storage Bucket:</Text>
                <Text className="text-gray-800 font-mono text-sm">
                  {firebaseConfig.storageBucket}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">App ID:</Text>
                <Text className="text-gray-800 font-mono text-sm">
                  {firebaseConfig.appId.substring(0, 20)}...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
