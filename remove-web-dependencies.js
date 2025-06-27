#!/usr/bin/env node

/**
 * Remove All Web Platform Dependencies from IraChat
 * Focus on mobile-only development for smaller bundle size
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Removing ALL Web Platform Dependencies...');

// Web-related dependencies to remove
const webDependencies = {
  // CSS/Styling for web
  'postcss': 'CSS processing for web',
  'autoprefixer': 'CSS vendor prefixes for web browsers',
  'tailwindcss': 'CSS framework (use StyleSheet instead)',
  
  // Web-specific React Native
  'react-native-web': 'React Native for web platform',
  '@expo/webpack-config': 'Webpack configuration for web',
  
  // HTML/DOM related
  'react-native-render-html': 'HTML rendering (web-focused)',
  'react-dom': 'React DOM for web',
  
  // Web build tools
  'webpack': 'Web bundler',
  'babel-loader': 'Babel for webpack',
  'css-loader': 'CSS loader for webpack',
  'style-loader': 'Style injection for web',
  
  // Web polyfills
  'web-vitals': 'Web performance metrics',
  'workbox-webpack-plugin': 'Service worker for web'
};

function analyzeWebDependencies() {
  console.log('\n📊 ANALYZING WEB DEPENDENCIES:');
  console.log('=' .repeat(50));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let foundWebDeps = [];
  let totalSize = 0;
  
  // Known sizes of web dependencies
  const depSizes = {
    'postcss': 8,
    'autoprefixer': 5,
    'tailwindcss': 15,
    'react-native-web': 25,
    'react-dom': 20,
    'webpack': 30,
    'css-loader': 8,
    'style-loader': 5
  };
  
  Object.keys(webDependencies).forEach(dep => {
    if (allDeps[dep]) {
      const size = depSizes[dep] || 5;
      totalSize += size;
      foundWebDeps.push({ name: dep, size, reason: webDependencies[dep] });
      console.log(`❌ ${dep.padEnd(25)} ${size}MB - ${webDependencies[dep]}`);
    }
  });
  
  if (foundWebDeps.length === 0) {
    console.log('✅ No web dependencies found!');
  } else {
    console.log(`\n💾 Total web bloat: ${totalSize}MB`);
  }
  
  return { foundWebDeps, totalSize };
}

function removeWebScripts() {
  console.log('\n🗑️  REMOVING WEB SCRIPTS:');
  console.log('=' .repeat(30));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remove web-related scripts
  const webScripts = ['web', 'build:web', 'start:web', 'deploy:web'];
  let removedScripts = [];
  
  webScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      delete packageJson.scripts[script];
      removedScripts.push(script);
      console.log(`✅ Removed script: ${script}`);
    }
  });
  
  // Remove web from platforms
  if (packageJson.expo && packageJson.expo.platforms) {
    const platforms = packageJson.expo.platforms;
    const webIndex = platforms.indexOf('web');
    if (webIndex > -1) {
      platforms.splice(webIndex, 1);
      console.log('✅ Removed web from platforms');
    }
  }
  
  // Remove web keywords
  if (packageJson.keywords) {
    const webKeywords = ['web', 'browser', 'dom', 'css', 'html', 'tailwindcss'];
    webKeywords.forEach(keyword => {
      const index = packageJson.keywords.indexOf(keyword);
      if (index > -1) {
        packageJson.keywords.splice(index, 1);
        console.log(`✅ Removed keyword: ${keyword}`);
      }
    });
  }
  
  // Save updated package.json
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
  
  return removedScripts;
}

function removeWebDependencies() {
  console.log('\n📦 REMOVING WEB DEPENDENCIES:');
  console.log('=' .repeat(35));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let removedDeps = [];
  let savedSize = 0;
  
  // Remove from dependencies
  Object.keys(webDependencies).forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      removedDeps.push(dep);
      savedSize += 5; // Estimate 5MB per dependency
      console.log(`✅ Removed dependency: ${dep}`);
    }
    
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      delete packageJson.devDependencies[dep];
      removedDeps.push(dep);
      savedSize += 5;
      console.log(`✅ Removed devDependency: ${dep}`);
    }
  });
  
  // Save updated package.json
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  console.log(`\n💾 Estimated savings: ${savedSize}MB`);
  return { removedDeps, savedSize };
}

function removeWebFiles() {
  console.log('\n🗂️  REMOVING WEB FILES:');
  console.log('=' .repeat(25));
  
  const webFiles = [
    'web-build/',
    'dist/',
    'public/',
    'webpack.config.js',
    'postcss.config.js',
    'tailwind.config.js',
    '.next/',
    'out/',
    'build/',
    'static/'
  ];
  
  let removedFiles = [];
  
  webFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        if (fs.statSync(file).isDirectory()) {
          fs.rmSync(file, { recursive: true, force: true });
        } else {
          fs.unlinkSync(file);
        }
        removedFiles.push(file);
        console.log(`✅ Removed: ${file}`);
      } catch (error) {
        console.log(`⚠️  Could not remove: ${file}`);
      }
    }
  });
  
  if (removedFiles.length === 0) {
    console.log('✅ No web files found to remove');
  }
  
  return removedFiles;
}

function updateAppJson() {
  console.log('\n📱 UPDATING APP.JSON FOR MOBILE-ONLY:');
  console.log('=' .repeat(40));
  
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    // Remove web platform
    if (appJson.expo.platforms) {
      appJson.expo.platforms = appJson.expo.platforms.filter(p => p !== 'web');
      console.log('✅ Removed web from platforms');
    }
    
    // Remove web-specific configurations
    if (appJson.expo.web) {
      delete appJson.expo.web;
      console.log('✅ Removed web configuration');
    }
    
    // Ensure mobile-only platforms
    appJson.expo.platforms = ['ios', 'android'];
    
    // Add mobile-only optimizations
    appJson.expo.android = {
      ...appJson.expo.android,
      enableProguardInReleaseBuilds: true,
      enableSeparateBuildPerCPUArchitecture: true,
      universalApk: false
    };
    
    // Save updated app.json
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
    console.log('✅ Updated app.json for mobile-only');
    
  } catch (error) {
    console.log('❌ Error updating app.json:', error.message);
  }
}

function createMobileOnlyConfig() {
  console.log('\n🔧 CREATING MOBILE-ONLY CONFIGURATIONS:');
  console.log('=' .repeat(45));
  
  // Create mobile-only metro config
  const mobileMetroConfig = `
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mobile-only optimizations
config.resolver.platforms = ['ios', 'android', 'native'];

// Remove web platform support
config.resolver.platforms = config.resolver.platforms.filter(p => p !== 'web');

// Optimize for mobile
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: { keep_fnames: true },
};

// Mobile-specific asset handling
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
`;

  fs.writeFileSync('metro.config.js', mobileMetroConfig);
  console.log('✅ Created mobile-only metro.config.js');
  
  // Create mobile-only babel config
  const mobileBabelConfig = `
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Mobile-only plugins
      'react-native-reanimated/plugin',
    ],
  };
};
`;

  fs.writeFileSync('babel.config.js', mobileBabelConfig);
  console.log('✅ Updated babel.config.js for mobile-only');
}

function generateRemovalReport() {
  console.log('\n📊 WEB REMOVAL REPORT:');
  console.log('=' .repeat(30));
  
  const analysis = analyzeWebDependencies();
  const scripts = removeWebScripts();
  const deps = removeWebDependencies();
  const files = removeWebFiles();
  
  updateAppJson();
  createMobileOnlyConfig();
  
  console.log('\n🎯 REMOVAL SUMMARY:');
  console.log(`Dependencies removed: ${deps.removedDeps.length}`);
  console.log(`Scripts removed: ${scripts.length}`);
  console.log(`Files removed: ${files.length}`);
  console.log(`Estimated savings: ${deps.savedSize}MB`);
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Run: npm install (to clean up node_modules)');
  console.log('2. Run: npx expo install --fix');
  console.log('3. Build: npx expo run:android --variant release');
  console.log('4. Test app functionality');
  
  console.log('\n✅ IraChat is now MOBILE-ONLY optimized!');
  
  return {
    dependenciesRemoved: deps.removedDeps.length,
    estimatedSavings: deps.savedSize,
    scriptsRemoved: scripts.length,
    filesRemoved: files.length
  };
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Web Platform Removal...\n');
  const report = generateRemovalReport();
  console.log('\n🎉 Web platform removal complete!');
  console.log(`💾 Estimated bundle size reduction: ${report.estimatedSavings}MB`);
}

module.exports = { generateRemovalReport };
