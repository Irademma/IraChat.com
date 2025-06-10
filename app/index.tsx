import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  // This component will be replaced by the _layout.tsx routing logic
  // Show a simple loading screen while the app initializes
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
    }}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center'
      }}>
        Loading IraChat...
      </Text>
    </View>
  );
}
