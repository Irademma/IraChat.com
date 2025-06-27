import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: string;
  date: string;
  thumbnail: string;
  source: string; // Chat or group name
}

export default function DownloadedMediaScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | 'images' | 'videos' | 'documents'>('all');

  // Mock downloaded media data
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      name: 'IMG_20241201_143022.jpg',
      size: '2.4 MB',
      date: '2024-12-01',
      thumbnail: 'https://picsum.photos/200/200?random=1',
      source: 'Family Group'
    },
    {
      id: '2',
      type: 'video',
      name: 'VID_20241130_120000.mp4',
      size: '15.2 MB',
      date: '2024-11-30',
      thumbnail: 'https://picsum.photos/200/200?random=2',
      source: 'John Doe'
    },
    {
      id: '3',
      type: 'document',
      name: 'Project_Report.pdf',
      size: '1.8 MB',
      date: '2024-11-29',
      thumbnail: '',
      source: 'Work Team'
    },
    {
      id: '4',
      type: 'image',
      name: 'Screenshot_20241128.png',
      size: '856 KB',
      date: '2024-11-28',
      thumbnail: 'https://picsum.photos/200/200?random=4',
      source: 'Tech Support'
    },
  ]);

  const filteredItems = mediaItems.filter(item => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'images') return item.type === 'image';
    if (selectedTab === 'videos') return item.type === 'video';
    if (selectedTab === 'documents') return item.type === 'document';
    return true;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'document': return 'document-text-outline';
      default: return 'document-outline';
    }
  };

  const handleMediaPress = (item: MediaItem) => {
    Alert.alert(
      item.name,
      `Size: ${item.size}\nFrom: ${item.source}\nDate: ${item.date}`,
      [
        { text: "Share", onPress: () => console.log("Share:", item.name) },
        { text: "Delete", style: "destructive", onPress: () => console.log("Delete:", item.name) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={() => handleMediaPress(item)}
    >
      {/* Thumbnail or Icon */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 50, height: 50, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={getFileIcon(item.type) as any} size={24} color="#667eea" />
        )}
      </View>

      {/* File Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 4,
        }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          marginBottom: 2,
        }}>
          {item.size} • {item.date}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#9CA3AF',
        }}>
          From: {item.source}
        </Text>
      </View>

      {/* Type Badge */}
      <View style={{
        backgroundColor: item.type === 'image' ? '#DBEAFE' : 
                       item.type === 'video' ? '#FEF3C7' : '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
      }}>
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: item.type === 'image' ? '#3B82F6' : 
                 item.type === 'video' ? '#F59E0B' : '#10B981',
        }}>
          {item.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const tabs = [
    { key: 'all', label: 'All', count: mediaItems.length },
    { key: 'images', label: 'Images', count: mediaItems.filter(i => i.type === 'image').length },
    { key: 'videos', label: 'Videos', count: mediaItems.filter(i => i.type === 'video').length },
    { key: 'documents', label: 'Documents', count: mediaItems.filter(i => i.type === 'document').length },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#667eea',
        paddingTop: 55,
        paddingBottom: 8,
        paddingHorizontal: 20,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
          }}>
            Downloaded Media
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setSelectedTab(tab.key as any)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
              borderBottomWidth: 2,
              borderBottomColor: selectedTab === tab.key ? '#667eea' : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: selectedTab === tab.key ? '600' : '500',
              color: selectedTab === tab.key ? '#667eea' : '#6B7280',
            }}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Media List */}
      <FlatList
        data={filteredItems}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
          }}>
            <Ionicons name="download-outline" size={64} color="#9CA3AF" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#6B7280',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Downloaded Media
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
              textAlign: 'center',
              paddingHorizontal: 40,
            }}>
              Media files you download from chats will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}
