#!/usr/bin/env node

/**
 * Comprehensive Bundle Content Analyzer for IraChat
 * Ensures ONLY essential files are bundled
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Comprehensive Bundle Content Analysis...');

// Define what SHOULD and SHOULD NOT be bundled
const bundleRules = {
  // SHOULD BE BUNDLED (Essential for app)
  essential: {
    code: [
      'src/**/*.ts',
      'src/**/*.tsx', 
      'app/**/*.ts',
      'app/**/*.tsx',
      'app.json',
      'package.json'
    ],
    assets: [
      'assets/images/*.png',
      'assets/fonts/*.ttf',
      'assets/sounds/*.mp3'
    ],
    config: [
      'metro.config.js',
      'babel.config.js'
    ]
  },
  
  // SHOULD NOT BE BUNDLED (Development/Build artifacts)
  forbidden: {
    development: [
      'node_modules/**/*',
      '.git/**/*',
      '.expo/**/*',
      '.vscode/**/*',
      '.idea/**/*',
      'android/app/build/**/*',
      'ios/build/**/*'
    ],
    documentation: [
      'README.md',
      '*.md',
      'docs/**/*',
      'IMPLEMENTATION_SUMMARY.md',
      'FIRESTORE-RULES-COMPLETE-SUMMARY.md'
    ],
    scripts: [
      'optimize-*.js',
      'analyze-*.js',
      'remove-*.js',
      'compress-*.js',
      'bundle-*.js',
      'safe-*.js',
      'implement-*.js'
    ],
    config: [
      'tsconfig.json',
      '.gitignore',
      '.npmignore',
      'yarn.lock',
      'package-lock.json'
    ],
    backup: [
      '*.backup',
      'backup/**/*',
      'assets/images/backup/**/*'
    ],
    web: [
      'web-build/**/*',
      'dist/**/*',
      'public/**/*',
      'postcss.config.js',
      'tailwind.config.js'
    ]
  }
};

function analyzeCurrentBundling() {
  console.log('\n📊 CURRENT BUNDLE PATTERN ANALYSIS:');
  console.log('=' .repeat(50));
  
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const currentPatterns = appJson.expo.assetBundlePatterns || [];
  
  console.log('Current assetBundlePatterns:');
  currentPatterns.forEach(pattern => {
    console.log(`  📁 ${pattern}`);
  });
  
  return currentPatterns;
}

function scanProjectFiles() {
  console.log('\n🔍 SCANNING PROJECT FILES:');
  console.log('=' .repeat(30));
  
  const projectFiles = {
    essential: [],
    forbidden: [],
    unknown: []
  };
  
  function scanDirectory(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativeFullPath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Skip certain directories entirely
          if (['node_modules', '.git', '.expo', 'android/app/build', 'ios/build'].includes(relativeFullPath)) {
            return;
          }
          scanDirectory(fullPath, relativeFullPath);
        } else {
          categorizeFile(relativeFullPath, stats.size);
        }
      });
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  function categorizeFile(filePath, size) {
    const sizeMB = (size / (1024 * 1024)).toFixed(3);
    
    // Check if essential
    if (isEssentialFile(filePath)) {
      projectFiles.essential.push({ path: filePath, size: sizeMB });
    }
    // Check if forbidden
    else if (isForbiddenFile(filePath)) {
      projectFiles.forbidden.push({ path: filePath, size: sizeMB });
    }
    // Unknown/questionable
    else {
      projectFiles.unknown.push({ path: filePath, size: sizeMB });
    }
  }
  
  function isEssentialFile(filePath) {
    const essential = [
      /^src\/.*\.(ts|tsx)$/,
      /^app\/.*\.(ts|tsx)$/,
      /^assets\/images\/.*\.png$/,
      /^assets\/fonts\/.*\.ttf$/,
      /^assets\/sounds\/.*\.mp3$/,
      /^(app|package)\.json$/,
      /^(metro|babel)\.config\.js$/
    ];
    
    return essential.some(pattern => pattern.test(filePath));
  }
  
  function isForbiddenFile(filePath) {
    const forbidden = [
      /^node_modules\//,
      /^\.git\//,
      /^\.expo\//,
      /^\.vscode\//,
      /^android\/app\/build\//,
      /^ios\/build\//,
      /.*\.md$/,
      /^optimize-.*\.js$/,
      /^analyze-.*\.js$/,
      /^remove-.*\.js$/,
      /^compress-.*\.js$/,
      /^bundle-.*\.js$/,
      /^safe-.*\.js$/,
      /^implement-.*\.js$/,
      /^tsconfig\.json$/,
      /^\.gitignore$/,
      /.*\.backup$/,
      /^backup\//,
      /^web-build\//,
      /^dist\//,
      /^public\//
    ];
    
    return forbidden.some(pattern => pattern.test(filePath));
  }
  
  scanDirectory('.');
  return projectFiles;
}

function generateOptimalBundlePattern() {
  console.log('\n🎯 GENERATING OPTIMAL BUNDLE PATTERN:');
  console.log('=' .repeat(40));
  
  const optimalPattern = [
    // Essential assets only
    "assets/images/LOGO.png",
    "assets/images/BACKGROUND.png", 
    "assets/images/splash.png",
    "assets/images/profile.png",
    "assets/images/camera.png",
    "assets/images/comment.png",
    "assets/images/groups.png",
    "assets/images/heart.png",
    "assets/images/heart-red.png",
    "assets/images/notification.png",
    "assets/images/posts.png",
    "assets/images/setting.png"
  ];
  
  console.log('📦 OPTIMAL BUNDLE PATTERN:');
  console.log('(Only essential assets, no wildcards)');
  
  optimalPattern.forEach(pattern => {
    const exists = fs.existsSync(pattern);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${pattern}`);
  });
  
  return optimalPattern;
}

function calculateBundleSizes() {
  console.log('\n📊 BUNDLE SIZE CALCULATION:');
  console.log('=' .repeat(35));
  
  const files = scanProjectFiles();
  
  let essentialSize = 0;
  let forbiddenSize = 0;
  let unknownSize = 0;
  
  files.essential.forEach(file => {
    essentialSize += parseFloat(file.size);
  });
  
  files.forbidden.forEach(file => {
    forbiddenSize += parseFloat(file.size);
  });
  
  files.unknown.forEach(file => {
    unknownSize += parseFloat(file.size);
  });
  
  console.log(`✅ Essential files: ${essentialSize.toFixed(2)}MB (${files.essential.length} files)`);
  console.log(`❌ Forbidden files: ${forbiddenSize.toFixed(2)}MB (${files.forbidden.length} files)`);
  console.log(`⚠️  Unknown files: ${unknownSize.toFixed(2)}MB (${files.unknown.length} files)`);
  
  console.log('\n🚨 FORBIDDEN FILES THAT MIGHT BE BUNDLED:');
  files.forbidden.slice(0, 10).forEach(file => {
    if (parseFloat(file.size) > 0.1) { // Show files > 100KB
      console.log(`  ❌ ${file.path} (${file.size}MB)`);
    }
  });
  
  return { essentialSize, forbiddenSize, unknownSize, files };
}

function createStrictBundleConfig() {
  console.log('\n🔧 CREATING STRICT BUNDLE CONFIGURATION:');
  console.log('=' .repeat(45));
  
  const optimalPattern = generateOptimalBundlePattern();
  
  // Update app.json with strict bundling
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Set strict asset bundling
  appJson.expo.assetBundlePatterns = optimalPattern;
  
  // Ensure mobile-only
  appJson.expo.platforms = ["ios", "android"];
  
  // Add bundle optimizations
  appJson.expo.android = {
    ...appJson.expo.android,
    enableProguardInReleaseBuilds: true,
    enableSeparateBuildPerCPUArchitecture: true,
    universalApk: false
  };
  
  // Save strict configuration
  fs.writeFileSync('app-strict.json', JSON.stringify(appJson, null, 2));
  console.log('✅ Created app-strict.json with optimal bundling');
  
  // Create .expobundleignore file
  const bundleIgnore = `
# Development files
*.md
README*
docs/
.git/
.expo/
.vscode/
.idea/
node_modules/

# Build artifacts
android/app/build/
ios/build/
dist/
web-build/
build/

# Scripts and tools
optimize-*.js
analyze-*.js
remove-*.js
compress-*.js
bundle-*.js
safe-*.js
implement-*.js

# Configuration files
tsconfig.json
.gitignore
.npmignore
yarn.lock
package-lock.json
postcss.config.js
tailwind.config.js

# Backup files
*.backup
backup/
assets/images/backup/

# Temporary files
*.tmp
*.log
.DS_Store
Thumbs.db
`;
  
  fs.writeFileSync('.expobundleignore', bundleIgnore.trim());
  console.log('✅ Created .expobundleignore to exclude unwanted files');
  
  return optimalPattern;
}

function generateBundleReport() {
  console.log('\n📋 COMPREHENSIVE BUNDLE REPORT:');
  console.log('=' .repeat(40));
  
  const currentPatterns = analyzeCurrentBundling();
  const sizes = calculateBundleSizes();
  const optimalPattern = createStrictBundleConfig();
  
  console.log('\n🎯 BUNDLE OPTIMIZATION SUMMARY:');
  console.log(`Current patterns: ${currentPatterns.length}`);
  console.log(`Optimal patterns: ${optimalPattern.length}`);
  console.log(`Essential files: ${sizes.essentialSize.toFixed(2)}MB`);
  console.log(`Forbidden files: ${sizes.forbiddenSize.toFixed(2)}MB`);
  console.log(`Potential savings: ${sizes.forbiddenSize.toFixed(2)}MB`);
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Replace app.json with app-strict.json');
  console.log('2. Use .expobundleignore to exclude unwanted files');
  console.log('3. Build with: npx expo run:android --variant release');
  console.log('4. Verify bundle size reduction');
  
  console.log('\n✅ Bundle analysis complete!');
  console.log(`📦 Expected bundle: ~${sizes.essentialSize.toFixed(2)}MB (essential files only)`);
  
  return {
    currentSize: sizes.essentialSize + sizes.forbiddenSize + sizes.unknownSize,
    optimizedSize: sizes.essentialSize,
    savings: sizes.forbiddenSize + sizes.unknownSize
  };
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Comprehensive Bundle Analysis...\n');
  const report = generateBundleReport();
  console.log(`\n🎉 Bundle optimization complete!`);
  console.log(`💾 Potential size reduction: ${report.savings.toFixed(2)}MB`);
}

module.exports = { generateBundleReport };
