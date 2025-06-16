// Scroll-Responsive UI Demo Screen
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IraChatScrollContainer } from '../src/components/ScrollResponsiveContainer';

export default function ScrollDemoScreen() {
  const router = useRouter();

  // Generate demo content
  const generateDemoContent = () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(
        <View
          key={i}
          style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginVertical: 8,
            padding: 16,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 8,
            }}
          >
            Demo Item {i}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 20,
            }}
          >
            This is a demo item to test the scroll-responsive UI behavior. 
            Scroll up to hide the header and tab bar, scroll down to show them again.
            The behavior mimics X (Twitter) exactly.
          </Text>
          
          {i % 5 === 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#87CEEB',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                marginTop: 12,
                alignSelf: 'flex-start',
              }}
              onPress={() => console.log(`Pressed item ${i}`)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Action Button
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return items;
  };

  return (
    <IraChatScrollContainer
      refreshing={false}
      onRefresh={() => {
        console.log('Refreshing...');
        // Simulate refresh
        setTimeout(() => {
          console.log('Refresh complete');
        }, 2000);
      }}
    >
      {/* Demo Header */}
      <View
        style={{
          backgroundColor: '#87CEEB',
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 24,
          padding: 20,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: 'white',
            marginBottom: 8,
          }}
        >
          🚀 Scroll-Responsive UI Demo
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          Scroll up to hide header & tab bar{'\n'}
          Scroll down to show them again{'\n'}
          Just like X (Twitter)!
        </Text>
        
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            ← Back to Chats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View
        style={{
          backgroundColor: '#f0f9ff',
          marginHorizontal: 16,
          marginBottom: 16,
          padding: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#0ea5e9',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#0c4a6e',
            marginBottom: 8,
          }}
        >
          📱 How to Test:
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#075985',
            lineHeight: 20,
          }}
        >
          • Scroll UP slowly → Header & tab bar slide out{'\n'}
          • Scroll DOWN → Header & tab bar slide back in{'\n'}
          • Pull to refresh → Bars always show during refresh{'\n'}
          • Scroll to top → Bars always visible{'\n'}
          • Smooth animations with no flickering
        </Text>
      </View>

      {/* Demo Content */}
      {generateDemoContent()}

      {/* Bottom Spacer */}
      <View style={{ height: 40 }} />
    </IraChatScrollContainer>
  );
}
