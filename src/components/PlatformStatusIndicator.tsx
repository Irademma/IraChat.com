// Platform Status Indicator Component
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { 
  isAuthReady, 
  getCurrentUserSafely, 
  getPlatformInfo 
} from '../services/firebaseSimple';
import { isUserAuthenticated } from '../services/authService';

interface PlatformStatus {
  platform: string;
  firebase: boolean;
  auth: boolean;
  user: boolean;
  persistence: string;
  timestamp: string;
}

export const PlatformStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateStatus = async () => {
    try {
      const platformInfo = getPlatformInfo();
      const userAuth = await isUserAuthenticated();
      const currentUser = getCurrentUserSafely();
      
      setStatus({
        platform: Platform.OS,
        firebase: true, // If we can call this, Firebase is working
        auth: isAuthReady(),
        user: userAuth,
        persistence: platformInfo.persistence,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error updating platform status:', error);
      setStatus({
        platform: Platform.OS,
        firebase: false,
        auth: false,
        user: false,
        persistence: 'Unknown',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    updateStatus();
    
    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !status) {
    return (
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="absolute top-12 right-4 bg-blue-500 rounded-full w-8 h-8 justify-center items-center z-50"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-xs font-bold">ℹ️</Text>
      </TouchableOpacity>
    );
  }

  const getStatusColor = (isWorking: boolean) => isWorking ? 'text-blue-600' : 'text-red-600';
  const getStatusIcon = (isWorking: boolean) => isWorking ? '✅' : '❌';

  return (
    <View className="absolute top-12 right-4 bg-white rounded-lg p-3 shadow-lg z-50 min-w-48">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-gray-800">Platform Status</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text className="text-gray-500 text-lg">×</Text>
        </TouchableOpacity>
      </View>
      
      <View className="space-y-1">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Platform:</Text>
          <Text className="text-sm font-medium">{status.platform.toUpperCase()}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Firebase:</Text>
          <Text className={`text-sm font-medium ${getStatusColor(status.firebase)}`}>
            {getStatusIcon(status.firebase)} {status.firebase ? 'Ready' : 'Error'}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Auth:</Text>
          <Text className={`text-sm font-medium ${getStatusColor(status.auth)}`}>
            {getStatusIcon(status.auth)} {status.auth ? 'Ready' : 'Error'}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">User:</Text>
          <Text className={`text-sm font-medium ${getStatusColor(status.user)}`}>
            {getStatusIcon(status.user)} {status.user ? 'Auth' : 'Guest'}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Storage:</Text>
          <Text className="text-sm font-medium text-blue-600">{status.persistence}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Updated:</Text>
          <Text className="text-xs text-gray-500">{status.timestamp}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={updateStatus}
        className="mt-2 bg-blue-500 rounded px-3 py-1"
      >
        <Text className="text-white text-xs text-center font-medium">Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlatformStatusIndicator;
