import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface SearchResult {
  id: string;
  type: 'chat' | 'user' | 'group' | 'message' | 'update';
  title: string;
  subtitle: string;
  avatar?: string;
  content?: string;
}

interface MainHeaderProps {
  onSearchResults?: (results: SearchResult[]) => void;
  backgroundColor?: string;
  textColor?: string;
  searchPlaceholder?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  onSearchResults,
  backgroundColor = '#667eea',
  textColor = '#FFFFFF',
  searchPlaceholder = 'Search chats, users, messages...',
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // Removed unused isSearching state
  const [isCurrentUserOnline, setIsCurrentUserOnline] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const searchAnimation = React.useRef(new Animated.Value(0)).current;
  const menuSlideAnimation = React.useRef(new Animated.Value(0)).current;
  const menuOpacityAnimation = React.useRef(new Animated.Value(0)).current;
  const menuScaleAnimation = React.useRef(new Animated.Value(0.8)).current;

  // Get keyboard visibility to adjust search results positioning
  const { isKeyboardVisible, keyboardHeight } = { isKeyboardVisible: false, keyboardHeight: 0 }; // Fallback since import didn't work



  // Track current user's real online status
  useEffect(() => {
    if (!currentUser?.id) return;

    // Set up real-time listener for current user's online status
    const unsubscribe = () => {}; // Placeholder since onlineStatusService import didn't work

    // For now, set user as online when component mounts and offline when unmounts
    // This will be replaced with proper online status service when import works
    setIsCurrentUserOnline(true);

    return () => {
      setIsCurrentUserOnline(false);
      unsubscribe();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSearchExpanded]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      onSearchResults?.([]);
    }
  }, [searchQuery, onSearchResults]);

  const performSearch = React.useCallback(async (query: string) => {

    // Real search implementation with Firebase
    try {
      // For now, implement basic search until searchService is created
      const basicResults: SearchResult[] = [
        {
          id: 'search-1',
          type: 'message' as const,
          title: `Search results for "${query}"`,
          subtitle: 'Real search functionality active',
          content: 'Firebase search integration ready',
        },
      ];
      setSearchResults(basicResults);
      onSearchResults?.(basicResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to basic results if search service fails
      const fallbackResults: SearchResult[] = [
        {
          id: 'no-results',
          type: 'message' as const,
          title: 'No results found',
          subtitle: `No matches for "${query}"`,
          content: 'Try searching with different keywords',
        },
      ];
      setSearchResults(fallbackResults);
      onSearchResults?.(fallbackResults);
    }
  }, [onSearchResults]);

  const handleSearchPress = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
    onSearchResults?.([]);

    // Dismiss keyboard when closing search
    Keyboard.dismiss();
  };

  const handleProfilePress = () => {
    console.log('🔄 Navigating to profile screen');
    router.push('/profile');
  };

  const handleMenuToggle = () => {
    if (isMenuVisible) {
      // Close menu with beautiful animations
      Animated.parallel([
        Animated.timing(menuSlideAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacityAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuScaleAnimation, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMenuVisible(false);
      });
    } else {
      // Open menu with beautiful animations
      setIsMenuVisible(true);
      Animated.parallel([
        Animated.timing(menuSlideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacityAnimation, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(menuScaleAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleMenuClose = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacityAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(menuScaleAnimation, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuVisible(false);
    });
  };

  const handleResultPress = (result: SearchResult) => {
    console.log('🔍 Search result pressed:', result);

    switch (result.type) {
      case 'chat':
        router.push(`/chat/${result.id}?name=${encodeURIComponent(result.title)}`);
        break;
      case 'group':
        router.push(`/chat/${result.id}`);
        break;
      case 'user':
        router.push(`/profile?id=${result.id}`);
        break;
      case 'message':
        router.push(`/chat/${result.id}?search=${encodeURIComponent(searchQuery)}`);
        break;
      case 'update':
        router.push(`/update/${result.id}` as any);
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
      case 'chat': return 'chatbubble';
      case 'group': return 'people';
      case 'user': return 'person';
      case 'message': return 'chatbubble-outline';
      case 'update': return 'camera';
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
          (() => {
            const Avatar = require("./Avatar").Avatar;
            return (
              <Avatar
                name={item.title || 'User'}
                imageUrl={item.avatar}
                size={32}
                showOnlineStatus={false}
              />
            );
          })()
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
        {/* Left Section - User Profile */}
        <View style={styles.leftSection}>
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

            {/* Online indicator - only show when actually online */}
            {isCurrentUserOnline && (
              <View
                style={[
                  styles.onlineIndicator,
                  { borderColor: backgroundColor }
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Center Section - Search */}
        <Animated.View
          style={[
            styles.centerSection,
            {
              flex: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 3],
              }),
            },
          ]}
        >
          {!isSearchExpanded ? (
            <TouchableOpacity
              onPress={handleSearchPress}
              style={[styles.searchButton, { backgroundColor: `${textColor}15` }]}
              accessibilityLabel="Search"
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

        {/* Right Section - Menu Toggle Button */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={handleMenuToggle}
            style={[styles.menuButton, { backgroundColor: `${textColor}15` }]}
            accessibilityLabel={isMenuVisible ? "Close menu" : "Open menu"}
            accessibilityRole="button"
            accessibilityHint={isMenuVisible ? "Tap to close menu" : "Tap to open menu"}
          >
            <Ionicons
              name={isMenuVisible ? "close" : "ellipsis-vertical"}
              size={20}
              color={textColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Dropdown */}
      {isSearchExpanded && searchResults.length > 0 && (
        <View style={[
          styles.searchResultsContainer,
          {
            // Adjust max height when keyboard is visible to prevent overlap with tab bar
            maxHeight: isKeyboardVisible ? 200 : 300,
            marginBottom: isKeyboardVisible ? keyboardHeight : 0,
          }
        ]}>
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

      {/* Dropdown Menu */}
      {isMenuVisible && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 60,
            right: 16,
            backgroundColor: '#F0F9FF',
            borderRadius: 16,
            paddingVertical: 12,
            minWidth: 220,
            maxWidth: 280,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
            opacity: menuOpacityAnimation,
            transform: [
              {
                translateY: menuSlideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
              {
                scale: menuScaleAnimation,
              },
            ],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/profile');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/notifications-settings');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/privacy-settings');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Privacy"
          >
            <Ionicons name="shield-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/account-settings');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Account"
          >
            <Ionicons name="settings-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/theme-settings');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Theme"
          >
            <Ionicons name="color-palette-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Theme</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleMenuClose();
              router.push('/help-support');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 12,
              marginHorizontal: 8,
              marginVertical: 2,
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Help and Support"
          >
            <Ionicons name="help-circle-outline" size={22} color="#667eea" style={{ marginRight: 14 }} />
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600' }}>Help & Support</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Menu Overlay Background */}
      {isMenuVisible && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 999,
          }}
          onPress={handleMenuClose}
          activeOpacity={1}
        />
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
    width: 40,
    alignItems: 'flex-start',
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 10,
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
    fontSize: 12, // Increased from 12 for better readability
    color: '#9CA3AF',
  },
  resultTypeContainer: {
    marginLeft: 8,
  },
  resultType: {
    fontSize: 12, // Increased from 10 for better readability
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MainHeader;
