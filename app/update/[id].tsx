import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function UpdateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#667eea',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: '600',
          color: 'white',
          marginRight: 24
        }}>
          Update Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 16
          }}>
            Update #{id}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#374151',
            lineHeight: 24,
            marginBottom: 16
          }}>
            This is a detailed view of the update. In a real app, this would show the full update content, 
            media, comments, and interaction options.
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginLeft: 8
            }}>
              Posted 2 hours ago
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Ionicons name="heart-outline" size={16} color="#6b7280" />
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginLeft: 8
            }}>
              24 likes
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginLeft: 8
            }}>
              5 comments
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          marginTop: 20,
          gap: 12
        }}>
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#667eea',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#10b981',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Comment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#f59e0b',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
