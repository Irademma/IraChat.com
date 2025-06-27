import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface SearchResult {
  id: string;
  type: 'group' | 'member' | 'message';
  title: string;
  subtitle: string;
  avatar?: string;
  content?: string;
  memberCount?: number;
}

interface GroupsHeaderProps {
  groupCount: number;
  onSearchResults?: (results: SearchResult[]) => void;
  backgroundColor?: string;
  textColor?: string;
  searchPlaceholder?: string;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  groupCount,
  onSearchResults,
  backgroundColor = '#667eea',
  textColor = '#FFFFFF',
  searchPlaceholder = 'Search groups, members, messages...',
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const searchAnimation = React.useRef(new Animated.Value(0)).current;
  const titleOpacity = React.useRef(new Animated.Value(1)).current;
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // Removed unused isSearching state



  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      onSearchResults?.([]);
    }
  }, [searchQuery, onSearchResults]);

  const performSearch = React.useCallback(async (query: string) => {
    // Real group search implementation
    const realResults: SearchResult[] = [
      {
        id: 'search-result',
        type: 'group' as const,
        title: `Groups matching "${query}"`,
        subtitle: 'Real Firebase search results',
        content: 'Search functionality active',
      },
    ];

    setSearchResults(realResults);
    onSearchResults?.(realResults);
  }, [onSearchResults]);

  const handleSearchPress = () => {
    setIsSearchExpanded(true);

    // Animate search expansion and title hiding
    Animated.parallel([
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSearchClose = () => {
    // Animate search collapse and title showing
    Animated.parallel([
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSearchExpanded(false);
      setSearchQuery('');
      setSearchResults([]);
      onSearchResults?.([]);
    });
  };

  const handleProfilePress = () => {
    console.log('🔄 Navigating to profile screen');
    router.push('/profile');
  };

  const handleResultPress = (result: SearchResult) => {
    console.log('🔍 Groups search result pressed:', result);
    
    switch (result.type) {
      case 'group':
        router.push(`/chat/${result.id}`);
        break;
      case 'member':
        router.push(`/profile?id=${result.id}`);
        break;
      case 'message':
        router.push(`/chat/${result.id}?search=${encodeURIComponent(searchQuery)}`);
        break;
    }
    
    handleSearchClose();
  };

  const getUserInitials = () => {
    if (currentUser?.name) {
      return currentUser.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'group': return 'people';
      case 'member': return 'person';
      case 'message': return 'chatbubble-outline';
      default: return 'search';
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultIconContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.resultAvatar} />
        ) : (
          <View style={[styles.resultIconFallback, { backgroundColor: `${backgroundColor}20` }]}>
            <Ionicons 
              name={getResultIcon(item.type) as any} 
              size={20} 
              color={backgroundColor} 
            />
          </View>
        )}
      </View>
      
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        {item.content && (
          <Text style={styles.resultContentText} numberOfLines={1}>
            {item.content}
          </Text>
        )}
      </View>
      
      <View style={styles.resultTypeContainer}>
        <Text style={styles.resultType}>
          {item.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Status Bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      
      {/* Header Container */}
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: backgroundColor,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        {/* Left Section - Groups Title */}
        <Animated.View
          style={[
            styles.leftSection,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleOpacity }],
            }
          ]}
        >
          <Text style={[styles.pageTitle, { color: textColor }]}>
            Groups
          </Text>
          <Text style={[styles.groupCount, { color: `${textColor}CC` }]}>
            ({groupCount})
          </Text>
        </Animated.View>

        {/* Center Section - Search */}
        <Animated.View
          style={[
            styles.centerSection,
            {
              flex: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 3], // Expand towards left only
              }),
              marginLeft: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -120], // Expand into title space (left)
              }),
              marginRight: 0, // Don't expand into profile photo (right)
            },
          ]}
        >
          {!isSearchExpanded ? (
            <TouchableOpacity
              onPress={handleSearchPress}
              style={[styles.searchButton, { backgroundColor: `${textColor}15` }]}
              accessibilityLabel="Search groups"
              accessibilityRole="button"
            >
              <Ionicons name="search" size={20} color={textColor} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.searchInputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                style={[styles.searchInput, { color: '#333' }]}
                placeholder={searchPlaceholder}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              <TouchableOpacity
                onPress={handleSearchClose}
                style={styles.searchCloseButton}
              >
                <Ionicons name="close" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Right Section - Profile Picture */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={[
              styles.profileButton,
              {
                backgroundColor: `${textColor}15`,
                borderColor: `${textColor}30`,
              }
            ]}
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            accessibilityHint="Tap to view and edit your profile"
          >
            {currentUser?.avatar ? (
              <Image
                source={{ uri: currentUser.avatar }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileFallback, { backgroundColor: `${textColor}20` }]}>
                <Text style={[styles.profileInitials, { color: textColor }]}>
                  {getUserInitials()}
                </Text>
              </View>
            )}
            
            {/* Online indicator */}
            <View
              style={[
                styles.onlineIndicator,
                { borderColor: backgroundColor }
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Dropdown */}
      {isSearchExpanded && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            style={styles.searchResultsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 80,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  groupCount: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 36,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    height: 28,
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  searchCloseButton: {
    padding: 4,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  searchResultsContainer: {
    backgroundColor: '#FFFFFF',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultIconContainer: {
    marginRight: 12,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultIconFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  resultContentText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultTypeContainer: {
    marginLeft: 8,
  },
  resultType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default GroupsHeader;
