/**
 * Mock Data Indicator Component
 * 
 * Shows when mock data is being used for testing purposes
 * Provides toggle functionality and information about mock data
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../hooks/useMockData';

interface MockDataIndicatorProps {
  position?: 'top' | 'bottom';
  showToggle?: boolean;
}

export const MockDataIndicator: React.FC<MockDataIndicatorProps> = ({
  position = 'bottom',
  showToggle = true
}) => {
  const { shouldUseMockData, isLoading } = useMockData();
  const [showInfo, setShowInfo] = useState(false);
  const [mockDataEnabled, setMockDataEnabled] = useState(shouldUseMockData);

  if (!__DEV__ && !shouldUseMockData) {
    return null; // Don't show in production unless explicitly enabled
  }

  const toggleMockData = () => {
    setMockDataEnabled(!mockDataEnabled);
    // In a real implementation, you might want to update a global state or AsyncStorage
    console.log('Mock data toggled:', !mockDataEnabled);
  };

  const indicatorStyle = {
    position: 'absolute' as const,
    left: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: mockDataEnabled ? '#4CAF50' : '#FF9800',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    ...(position === 'top' ? { top: 50 } : { bottom: 100 })
  };

  return (
    <>
      <View style={indicatorStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons 
            name={mockDataEnabled ? "flask" : "flask-outline"} 
            size={16} 
            color="white" 
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', flex: 1 }}>
            {mockDataEnabled ? 'Mock Data Active' : 'Live Data Active'}
            {isLoading && ' (Loading...)'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowInfo(true)}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="information-circle-outline" size={16} color="white" />
          </TouchableOpacity>
          
          {showToggle && (
            <TouchableOpacity
              onPress={toggleMockData}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 4
              }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                {mockDataEnabled ? 'DISABLE' : 'ENABLE'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            maxWidth: '90%',
            maxHeight: '80%'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                🧪 Mock Data Info
              </Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 }}>
                Mock data is currently <Text style={{ fontWeight: 'bold', color: mockDataEnabled ? '#4CAF50' : '#FF9800' }}>
                  {mockDataEnabled ? 'ENABLED' : 'DISABLED'}
                </Text> for testing purposes.
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                  📊 Available Mock Data:
                </Text>
                <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  • 16 realistic users with avatars{'\n'}
                  • 10 chat conversations{'\n'}
                  • 8 group chats{'\n'}
                  • 8 call history entries{'\n'}
                  • 8 social updates{'\n'}
                  • 22 contacts (IraChat + regular){'\n'}
                  • 5 notifications{'\n'}
                  • 20+ messages per chat
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                  🎯 Purpose:
                </Text>
                <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  Mock data helps test and demonstrate all IraChat features without requiring real users or data. 
                  It's purely additive and doesn't replace live functionality.
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                  ⚡ Features Tested:
                </Text>
                <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  • Chat lists and conversations{'\n'}
                  • Group management{'\n'}
                  • Social updates feed{'\n'}
                  • Call history{'\n'}
                  • Contact discovery{'\n'}
                  • Search functionality{'\n'}
                  • Notifications{'\n'}
                  • Media sharing
                </Text>
              </View>

              <View style={{
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16
              }}>
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                  💡 Tip: Mock data is automatically enabled in development mode. 
                  In production, it can be enabled via environment variables for testing.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowInfo(false)}
              style={{
                backgroundColor: '#667eea',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
