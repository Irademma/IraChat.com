import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../theme/colors';

interface SearchResult {
  id: string;
  type: 'message' | 'member' | 'contact' | 'username';
  title: string;
  subtitle?: string;
  content?: string;
  timestamp?: string;
  avatar?: string;
  username?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onResultPress: (result: SearchResult) => void;
  onFilterChange?: (filters: { [key: string]: boolean }) => void;
  initialFilters?: { [key: string]: boolean };
}

const getResultIcon = (type: string) => {
  switch (type) {
    case 'message':
      return 'chatbubble-outline';
    case 'member':
      return 'person-outline';
    case 'contact':
      return 'people-outline';
    case 'username':
      return 'at-outline';
    default:
      return 'search-outline';
  }
};

const getResultColor = (type: string) => {
  switch (type) {
    case 'message':
      return colors.primary;
    case 'member':
      return colors.secondary;
    case 'contact':
      return colors.accent;
    case 'username':
      return colors.success;
    default:
      return colors.text;
  }
};

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onResultPress,
  onFilterChange,
  initialFilters = { messages: true, members: true, contacts: true, usernames: true },
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    setIsLoading(true);
    try {
      const searchResults = await onSearch(text);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onSearch('');
  };

  const handleFilterToggle = (filter: keyof typeof filters) => {
    const newFilters = { ...filters, [filter]: !filters[filter] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const renderFilterButton = (type: keyof typeof filters, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filters[type] && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterToggle(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filters[type] && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    const icon = getResultIcon(item.type);
    const iconColor = getResultColor(item.type);

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => onResultPress(item)}
      >
        <View style={styles.resultIconContainer}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
          {item.content && (
            <Text style={styles.resultContent} numberOfLines={2}>
              {item.content}
            </Text>
          )}
          {item.username && (
            <Text style={styles.resultUsername} numberOfLines={1}>
              @{item.username}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search messages, members, contacts..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('messages', 'Messages')}
        {renderFilterButton('members', 'Members')}
        {renderFilterButton('contacts', 'Contacts')}
        {renderFilterButton('usernames', 'Usernames')}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
        />
      ) : query.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    margin: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  resultsList: {
    maxHeight: 300,
    marginTop: 12,
  },
  resultsContent: {
    paddingBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  resultContent: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resultUsername: {
    color: colors.success,
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default SearchBar; 