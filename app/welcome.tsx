import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { ResponsiveContainer, ResponsiveSpacer, SafeResponsiveLayout } from '../src/components/layout/SafeResponsiveLayout';
import AnimatedLogo from '../src/components/ui/AnimatedLogo';
import { useResponsiveDimensions, useResponsiveFontSizes, useResponsiveLayout, useResponsiveSpacing } from '../src/hooks/useResponsiveDimensions';
import { markAppLaunched } from '../src/services/authStorageSimple';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isXSmall, isSmall, isMedium, isDesktop, width } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();
  const fontSizes = useResponsiveFontSizes();
  const layout = useResponsiveLayout();

  const handleCreateAccount = async () => {
    console.log('Create Account button clicked');
    // Mark that the user has interacted with the app (no longer a first-time user)
    await markAppLaunched();
    router.push('/register');
  };

  // Enhanced responsive values with overlap prevention - Increased logo sizes
  const logoSize = isXSmall ? 80 : isSmall ? 100 : isMedium ? 120 : 140;
  const maxContentWidth = isXSmall ? Math.min(width - 32, 300) : isDesktop ? 400 : '100%';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#667eea' // Beautiful blue background that works on all platforms
      }}
      accessible={true}
      accessibilityLabel="Welcome screen with beautiful blue background"
    >
      <SafeResponsiveLayout
        centered
        maxWidth
        backgroundColor="transparent"
        safeArea={true}
        style={{
          backgroundColor: 'transparent'
        }}
      >
      {/* App Logo Section */}
      <ResponsiveContainer type="default">
        <View
          style={{
            marginBottom: Math.max(spacing.sectionSpacing, 24),
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center'
          }}
        >
          <AnimatedLogo
            size={logoSize}
            source={require('../assets/images/LOGO.png')}
          />

          <ResponsiveSpacer size="lg" />

          {/* Welcome Text */}
          <Text
            style={{
              fontSize: fontSizes['3xl'],
              fontWeight: '700',
              marginBottom: spacing.itemSpacing,
              lineHeight: fontSizes['3xl'] * 1.2,
              textAlign: 'center',
              paddingHorizontal: spacing.safeArea,
              color: '#FFFFFF',
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2
            }}
            selectable={false}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Welcome to IraChat heading"
          >
            Welcome to IraChat
          </Text>

          <Text
            style={{
              fontSize: fontSizes.base,
              lineHeight: fontSizes.base * 1.5,
              maxWidth: maxContentWidth,
              textAlign: 'center',
              paddingHorizontal: spacing.safeArea,
              color: '#F8FAFC',
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1
            }}
            selectable={false}
            accessible={true}
            accessibilityLabel="Connect with friends and family through secure messaging"
          >
            Connect with friends and family through secure messaging
          </Text>
        </View>
      </ResponsiveContainer>

      {/* Action Button Section */}
      <ResponsiveContainer type="form">
        <View
          style={{
            maxWidth: maxContentWidth,
            marginTop: Math.max(spacing.sectionSpacing, 16),
            alignSelf: 'center',
            width: '100%'
          }}
        >
          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: Math.max(spacing.buttonPadding.vertical, 12),
              paddingHorizontal: Math.max(spacing.buttonPadding.horizontal, 16),
              marginBottom: spacing.sectionSpacing,
              minHeight: layout.minButtonHeight,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#1E40AF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 0,
              borderRadius: 8,
              width: '100%',
              cursor: 'pointer',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create Account button"
            accessibilityHint="Tap to start creating your account"
          >
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: '600',
                color: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text
            style={{
              fontSize: fontSizes.sm,
              lineHeight: fontSizes.sm * 1.4,
              textAlign: 'center',
              paddingHorizontal: spacing.safeArea,
              color: '#E2E8F0',
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1
            }}
            selectable={false}
            accessible={true}
            accessibilityHint="Legal information about terms and privacy"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ResponsiveContainer>

      </SafeResponsiveLayout>
    </View>
  );
}
