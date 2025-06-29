// 🔍 MESSAGE SEARCH - Search through chat messages
// Allows users to find specific messages within a conversation

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text?: string;
  content?: string;
  timestamp: any;
  senderId: string;
  senderName?: string;
}

interface MessageSearchProps {
  isVisible: boolean;
  onClose: () => void;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
}

interface SearchResult extends Message {
  highlightedText: string;
  matchIndex: number;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  isVisible,
  onClose,
  messages,
  onMessageSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Perform search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase();

      messages.forEach((message) => {
        const messageText = message.text || message.content || '';
        const lowerText = messageText.toLowerCase();
        const matchIndex = lowerText.indexOf(searchTerm);

        if (matchIndex !== -1) {
          // Create highlighted text
          const beforeMatch = messageText.substring(0, matchIndex);
          const match = messageText.substring(matchIndex, matchIndex + query.length);
          const afterMatch = messageText.substring(matchIndex + query.length);
          
          const highlightedText = `${beforeMatch}<highlight>${match}</highlight>${afterMatch}`;

          results.push({
            ...message,
            highlightedText,
            matchIndex,
          });
        }
      });

      // Sort by timestamp (newest first)
      results.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeB.getTime() - timeA.getTime();
      });

      setSearchResults(results);
      setSelectedIndex(0);
      setIsSearching(false);
    }, 300);
  }, [messages]);

  // Handle search input change
  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Navigate search results
  const navigateResults = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;

    let newIndex = selectedIndex;
    if (direction === 'up') {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = selectedIndex < searchResults.length - 1 ? selectedIndex + 1 : 0;
    }
    
    setSelectedIndex(newIndex);
    
    // Auto-select the message
    if (searchResults[newIndex]) {
      onMessageSelect(searchResults[newIndex].id);
    }
  };

  // Render highlighted text
  const renderHighlightedText = (highlightedText: string) => {
    const parts = highlightedText.split(/<highlight>|<\/highlight>/);
    return (
      <Text style={styles.messageText} numberOfLines={2}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={index % 2 === 1 ? styles.highlightedText : styles.normalText}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  // Format timestamp
  const formatTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Render search result item
  const renderSearchResult = ({ item, index }: { item: SearchResult; index: number }) => (
    <TouchableOpacity
      style={[
        styles.resultItem,
        index === selectedIndex && styles.selectedResultItem,
      ]}
      onPress={() => {
        setSelectedIndex(index);
        onMessageSelect(item.id);
        onClose();
      }}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.senderName}>{item.senderName || 'Unknown'}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
      {renderHighlightedText(item.highlightedText)}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Search Messages</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in conversation..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation Controls */}
          {searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <Text style={styles.resultCount}>
                {selectedIndex + 1} of {searchResults.length}
              </Text>
              <TouchableOpacity
                onPress={() => navigateResults('up')}
                style={styles.navButton}
              >
                <Ionicons name="chevron-up" size={20} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigateResults('down')}
                style={styles.navButton}
              >
                <Ionicons name="chevron-down" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Search Results */}
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchQuery.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Search Messages</Text>
              <Text style={styles.emptySubtitle}>
                Type to search through your conversation history
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>
                No messages match "{searchQuery}"
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  navButton: {
    padding: 8,
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultsList: {
    paddingVertical: 8,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedResultItem: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    color: '#6B7280',
  },
  highlightedText: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '600',
  },
});

export default MessageSearch;
