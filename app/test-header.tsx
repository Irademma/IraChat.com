// Test screen to verify MainHeader changes
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MainHeader } from '../src/components/MainHeader';

export default function TestHeaderScreen() {
  const handleSearchResults = (results: any[]) => {
    console.log('Search results:', results);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <MainHeader 
        onSearchResults={handleSearchResults}
        backgroundColor="#667eea"
        textColor="#FFFFFF"
        searchPlaceholder="Search everything..."
      />
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          MainHeader Test Screen
        </Text>
        
        <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 15 }}>
          This screen demonstrates the updated MainHeader component with:
        </Text>
        
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          • User profile picture on the left (replaces IraChat logo)
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          • Expandable search in the center
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          • Menu button on the right
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          • Online indicator on profile picture
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          • Keyboard-aware search results
        </Text>
        
        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 30, marginBottom: 15 }}>
          Test Instructions:
        </Text>
        
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          1. Tap the profile picture on the left to navigate to profile
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          2. Tap the search icon in the center to expand search
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          3. Type in the search field to see results
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
          4. Tap the menu button on the right (three dots)
        </Text>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
