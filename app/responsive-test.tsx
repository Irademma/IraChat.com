import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  isTablet, 
  isSmallDevice, 
  isLargeDevice, 
  wp, 
  hp, 
  spacing, 
  fontSizes, 
  borderRadius,
  getGridColumns 
} from '../src/utils/responsive';
import { 
  responsiveContainerStyles,
  responsiveTextStyles,
  responsiveButtonStyles,
  responsiveComponentSizes,
  getResponsiveValue 
} from '../src/styles/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ResponsiveTestScreen() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState('device-info');

  const deviceInfo = {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    isTablet: isTablet(),
    isSmallDevice: isSmallDevice(),
    isLargeDevice: isLargeDevice(),
    gridColumns: getGridColumns(),
    wp50: wp(50),
    hp10: hp(10),
  };

  const testSections = [
    { id: 'device-info', title: 'Device Info', icon: 'phone-portrait' },
    { id: 'typography', title: 'Typography', icon: 'text' },
    { id: 'buttons', title: 'Buttons', icon: 'radio-button-on' },
    { id: 'layout', title: 'Layout', icon: 'grid' },
    { id: 'components', title: 'Components', icon: 'cube' },
  ];

  const TestSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={responsiveContainerStyles.cardContainer}>
      <Text style={responsiveTextStyles.h3}>{title}</Text>
      {children}
    </View>
  );

  const DeviceInfoTest = () => (
    <TestSection title="Device Information">
      <View style={{ marginTop: spacing.md }}>
        {Object.entries(deviceInfo).map(([key, value]) => (
          <View key={key} style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            paddingVertical: spacing.xs,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB'
          }}>
            <Text style={responsiveTextStyles.body2}>{key}:</Text>
            <Text style={responsiveTextStyles.body1}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </TestSection>
  );

  const TypographyTest = () => (
    <TestSection title="Typography Scaling">
      <View style={{ marginTop: spacing.md }}>
        <Text style={responsiveTextStyles.h1}>Heading 1 - Main Title</Text>
        <Text style={responsiveTextStyles.h2}>Heading 2 - Section Title</Text>
        <Text style={responsiveTextStyles.h3}>Heading 3 - Subsection</Text>
        <Text style={responsiveTextStyles.h4}>Heading 4 - Small Heading</Text>
        <Text style={responsiveTextStyles.body1}>Body 1 - Main content text that should be readable across all devices.</Text>
        <Text style={responsiveTextStyles.body2}>Body 2 - Secondary content text for descriptions and details.</Text>
        <Text style={responsiveTextStyles.caption}>Caption - Small text for labels and metadata.</Text>
      </View>
    </TestSection>
  );

  const ButtonTest = () => (
    <TestSection title="Button Responsiveness">
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <TouchableOpacity style={responsiveButtonStyles.primary}>
          <Text style={[responsiveTextStyles.button, { color: '#FFFFFF' }]}>Primary Button</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={responsiveButtonStyles.secondary}>
          <Text style={[responsiveTextStyles.button, { color: '#FFFFFF' }]}>Secondary Button</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={responsiveButtonStyles.outline}>
          <Text style={[responsiveTextStyles.button, { color: '#3B82F6' }]}>Outline Button</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={responsiveButtonStyles.ghost}>
          <Text style={[responsiveTextStyles.button, { color: '#3B82F6' }]}>Ghost Button</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity style={[responsiveButtonStyles.icon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="heart" size={responsiveComponentSizes.icon.medium} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[responsiveButtonStyles.icon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="share" size={responsiveComponentSizes.icon.medium} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[responsiveButtonStyles.icon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="bookmark" size={responsiveComponentSizes.icon.medium} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TestSection>
  );

  const LayoutTest = () => {
    const gridColumns = getGridColumns();
    const itemWidth = getResponsiveValue('100%', '48%', '31%');
    
    return (
      <TestSection title="Layout Grid System">
        <View style={{ marginTop: spacing.md }}>
          <Text style={responsiveTextStyles.body2}>
            Grid Columns: {gridColumns} | Item Width: {itemWidth}
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginTop: spacing.md 
          }}>
            {Array.from({ length: 6 }, (_, i) => (
              <View
                key={i}
                style={{
                  width: gridColumns === 1 ? '100%' : gridColumns === 2 ? '48%' : '31%',
                  height: 80,
                  backgroundColor: '#3B82F6',
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.sm,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Item {i + 1}</Text>
              </View>
            ))}
          </View>
        </View>
      </TestSection>
    );
  };

  const ComponentTest = () => (
    <TestSection title="Component Sizing">
      <View style={{ marginTop: spacing.md, gap: spacing.md }}>
        {/* Avatar sizes */}
        <View>
          <Text style={responsiveTextStyles.body2}>Avatar Sizes:</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
            {Object.entries(responsiveComponentSizes.avatar).map(([size, dimension]) => (
              <View
                key={size}
                style={{
                  width: dimension,
                  height: dimension,
                  borderRadius: dimension / 2,
                  backgroundColor: '#3B82F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: dimension / 4 }}>{size[0].toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Icon sizes */}
        <View>
          <Text style={responsiveTextStyles.body2}>Icon Sizes:</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
            {Object.entries(responsiveComponentSizes.icon).map(([size, dimension]) => (
              <View key={size} style={{ alignItems: 'center' }}>
                <Ionicons name="star" size={dimension} color="#F59E0B" />
                <Text style={responsiveTextStyles.caption}>{size}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* List item heights */}
        <View>
          <Text style={responsiveTextStyles.body2}>List Item Heights:</Text>
          <View style={{ marginTop: spacing.xs, gap: spacing.xs }}>
            {Object.entries(responsiveComponentSizes.listItem).map(([size, height]) => (
              <View
                key={size}
                style={{
                  height,
                  backgroundColor: '#F3F4F6',
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  justifyContent: 'center',
                }}
              >
                <Text style={responsiveTextStyles.body2}>{size} - {height}px</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TestSection>
  );

  const renderTestContent = () => {
    switch (selectedTest) {
      case 'device-info':
        return <DeviceInfoTest />;
      case 'typography':
        return <TypographyTest />;
      case 'buttons':
        return <ButtonTest />;
      case 'layout':
        return <LayoutTest />;
      case 'components':
        return <ComponentTest />;
      default:
        return <DeviceInfoTest />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={responsiveContainerStyles.headerContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={responsiveTextStyles.h3}>Responsive Test</Text>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: isTablet() ? 'row' : 'column' }}>
        {/* Test Navigation */}
        <View style={{
          width: isTablet() ? 250 : '100%',
          backgroundColor: '#FFFFFF',
          borderRightWidth: isTablet() ? 1 : 0,
          borderBottomWidth: isTablet() ? 0 : 1,
          borderColor: '#E5E7EB',
        }}>
          <ScrollView 
            horizontal={!isTablet()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              padding: spacing.md,
              flexDirection: isTablet() ? 'column' : 'row',
              gap: spacing.sm 
            }}
          >
            {testSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                onPress={() => setSelectedTest(section.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  backgroundColor: selectedTest === section.id ? '#EBF8FF' : 'transparent',
                  minWidth: isTablet() ? 'auto' : 120,
                }}
              >
                <Ionicons 
                  name={section.icon as any} 
                  size={responsiveComponentSizes.icon.medium} 
                  color={selectedTest === section.id ? '#3B82F6' : '#6B7280'} 
                />
                <Text style={[
                  responsiveTextStyles.body2,
                  { 
                    marginLeft: spacing.xs,
                    color: selectedTest === section.id ? '#3B82F6' : '#6B7280',
                    fontWeight: selectedTest === section.id ? '600' : '400'
                  }
                ]}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Test Content */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={responsiveContainerStyles.listContainer}
        >
          {renderTestContent()}
        </ScrollView>
      </View>
    </View>
  );
}
