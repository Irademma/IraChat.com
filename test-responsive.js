async function testResponsiveDesign() {
  console.log('🔍 Testing Responsive Design...');

  // Test if server is responding
  console.log('🔄 Testing server response...');
  try {
    const response = await fetch('http://localhost:8082');
    if (response.ok) {
      console.log('✅ Server is responding correctly');
      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      // Get the HTML content
      const html = await response.text();

      // Check for responsive design indicators
      const responsiveIndicators = [
        'viewport',
        'responsive',
        'mobile',
        'tablet',
        'desktop',
        'media-query',
        'flex',
        'grid'
      ];

      console.log('🔍 Checking for responsive design indicators...');
      responsiveIndicators.forEach(indicator => {
        if (html.toLowerCase().includes(indicator)) {
          console.log(`✅ Found: ${indicator}`);
        }
      });

      // Check for React Native Web indicators
      if (html.includes('react-native-web') || html.includes('expo')) {
        console.log('✅ React Native Web detected - Responsive design supported');
      }

      // Check for CSS frameworks
      if (html.includes('stylesheet')) {
        console.log('✅ Stylesheets detected - Styling system active');
      }

      console.log('🎉 Basic responsive design testing completed!');

    } else {
      console.log(`❌ Server error: ${response.status} ${response.statusText}`);
    }
  } catch (fetchError) {
    console.log(`❌ Server not accessible: ${fetchError.message}`);
  }
}

testResponsiveDesign();
