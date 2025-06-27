// Menu Overlay Component with Settings and Profile
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { RootState } from '../redux/store';
import { logout } from '../redux/userSlice';

interface MenuOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  slideAnimation: Animated.Value;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isVisible,
  onClose,
  slideAnimation,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors, isDark, toggleTheme } = useTheme();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfilePress = () => {
    onClose();
    router.push('/profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            onClose();
            router.replace('/welcome' as any);
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      onPress: handleProfilePress,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => {
        onClose();
        Alert.alert(
          'Notification Settings',
          'Configure your notification preferences:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Message Notifications',
              onPress: () => {
                Alert.alert('Message Notifications', 'Choose notification style:', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sound + Vibration', onPress: () => console.log('Sound + Vibration enabled') },
                  { text: 'Silent', onPress: () => console.log('Silent notifications enabled') },
                  { text: 'Off', onPress: () => console.log('Notifications disabled') }
                ]);
              }
            },
            {
              text: 'Call Notifications',
              onPress: () => {
                Alert.alert('Call Notifications', 'Configure call alerts:', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Ring + Vibrate', onPress: () => console.log('Ring + Vibrate enabled') },
                  { text: 'Vibrate Only', onPress: () => console.log('Vibrate only enabled') },
                  { text: 'Silent', onPress: () => console.log('Silent calls enabled') }
                ]);
              }
            }
          ]
        );
      },
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => {
        onClose();
        Alert.alert(
          'Privacy & Security',
          'Manage your privacy settings:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Last Seen',
              onPress: () => {
                Alert.alert('Last Seen Privacy', 'Who can see when you were last online?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Everyone', onPress: () => console.log('Last seen: Everyone') },
                  { text: 'Contacts Only', onPress: () => console.log('Last seen: Contacts only') },
                  { text: 'Nobody', onPress: () => console.log('Last seen: Nobody') }
                ]);
              }
            },
            {
              text: 'Profile Photo',
              onPress: () => {
                Alert.alert('Profile Photo Privacy', 'Who can see your profile photo?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Everyone', onPress: () => console.log('Profile photo: Everyone') },
                  { text: 'Contacts Only', onPress: () => console.log('Profile photo: Contacts only') },
                  { text: 'Nobody', onPress: () => console.log('Profile photo: Nobody') }
                ]);
              }
            },
            {
              text: 'Blocked Users',
              onPress: () => {
                Alert.alert('Blocked Users', 'Manage blocked contacts:', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'View Blocked List', onPress: () => console.log('Opening blocked users list') },
                  { text: 'Block Someone', onPress: () => console.log('Opening block user interface') }
                ]);
              }
            }
          ]
        );
      },
    },
    {
      id: 'storage',
      title: 'Storage & Data',
      icon: 'folder-outline',
      onPress: () => {
        onClose();
        Alert.alert(
          'Storage & Data',
          'Manage your storage and data usage:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Storage Usage',
              onPress: () => {
                Alert.alert('Storage Usage', 'IraChat Storage:\n\n📱 App Data: 45 MB\n📸 Photos: 120 MB\n🎥 Videos: 230 MB\n🎵 Audio: 15 MB\n📄 Documents: 8 MB\n\nTotal: 418 MB', [
                  { text: 'OK' },
                  { text: 'Clear Cache', onPress: () => {
                    Alert.alert('Clear Cache', 'Cache cleared successfully! Freed up 12 MB.');
                  }}
                ]);
              }
            },
            {
              text: 'Auto-Download',
              onPress: () => {
                Alert.alert('Auto-Download Settings', 'Configure automatic media downloads:', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Photos: WiFi Only', onPress: () => console.log('Photos: WiFi only') },
                  { text: 'Videos: Never', onPress: () => console.log('Videos: Never') },
                  { text: 'Audio: Always', onPress: () => console.log('Audio: Always') }
                ]);
              }
            },
            {
              text: 'Data Usage',
              onPress: () => {
                Alert.alert('Data Usage', 'This month:\n\n📊 Messages: 2.1 MB\n📸 Photos: 45 MB\n🎥 Videos: 120 MB\n📞 Calls: 85 MB\n\nTotal: 252.1 MB');
              }
            }
          ]
        );
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {
        onClose();
        Alert.alert(
          'Help & Support',
          'IraChat Support:\n\n📧 Email: support@irachat.app\n📱 Phone: +256 700 123 456\n💬 Live Chat: Available 24/7\n\n🔧 Common Issues:\n• Contact sync problems\n• Call quality issues\n• Message delivery\n• Account settings\n\nFor immediate help, contact us via any method above.',
          [
            { text: 'Contact Support', onPress: () => {
              Alert.alert('Contact Support', 'Choose contact method:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Email', onPress: () => console.log('Opening email...') },
                { text: 'Call', onPress: () => console.log('Opening phone...') }
              ]);
            }},
            { text: 'OK', style: 'default' }
          ]
        );
      },
    },
    {
      id: 'about',
      title: 'About IraChat',
      icon: 'information-circle-outline',
      onPress: () => {
        onClose();
        Alert.alert('About IraChat', 'IraChat v1.0.0\nBuilt with React Native & Expo');
      },
    },
  ];

  if (!isVisible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '80%',
            backgroundColor: colors.background,
            transform: [
              {
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <ScrollView style={{ flex: 1 }}>
              {/* Header with User Info */}
              <View
                style={{
                  backgroundColor: colors.primary,
                  paddingTop: 60,
                  paddingBottom: 30,
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  onPress={handleProfilePress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {currentUser?.avatar ? (
                    <Image
                      source={{ uri: currentUser.avatar }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        marginRight: 15,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 15,
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 24,
                          fontWeight: 'bold',
                        }}
                      >
                        {getUserInitials()}
                      </Text>
                    </View>
                  )}
                  
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 4,
                      }}
                    >
                      {currentUser?.name || 'User'}
                    </Text>
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 14,
                      }}
                    >
                      {currentUser?.phoneNumber || 'Phone number'}
                    </Text>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Theme Toggle */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={24}
                    color={colors.text}
                    style={{ marginRight: 15 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '500',
                    }}
                  >
                    Dark Theme
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              {/* Menu Items */}
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={colors.text}
                    style={{ marginRight: 15 }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '500',
                    }}
                  >
                    {item.title}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              ))}

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                  marginTop: 20,
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={colors.error}
                  style={{ marginRight: 15 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.error,
                    fontWeight: '500',
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MenuOverlay;
