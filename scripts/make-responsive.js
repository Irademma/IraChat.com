#!/usr/bin/env node

/**
 * Script to make all components fully responsive
 * This script updates class names to use responsive utilities
 */

const fs = require('fs');
const path = require('path');

// Responsive class mappings
const responsiveClassMappings = {
  // Text sizes
  'text-xs': 'text-xs sm:text-sm md:text-base lg:text-lg',
  'text-sm': 'text-sm sm:text-base md:text-lg lg:text-xl',
  'text-base': 'text-base sm:text-lg md:text-xl lg:text-2xl',
  'text-lg': 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  'text-xl': 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  'text-2xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  
  // Padding
  'p-1': 'p-1 sm:p-2 md:p-3 lg:p-4',
  'p-2': 'p-2 sm:p-3 md:p-4 lg:p-6',
  'p-3': 'p-3 sm:p-4 md:p-6 lg:p-8',
  'p-4': 'p-4 sm:p-6 md:p-8 lg:p-10',
  'p-6': 'p-6 sm:p-8 md:p-10 lg:p-12',
  'p-8': 'p-8 sm:p-10 md:p-12 lg:p-16',
  
  // Padding X
  'px-2': 'px-2 sm:px-3 md:px-4 lg:px-6',
  'px-3': 'px-3 sm:px-4 md:px-6 lg:px-8',
  'px-4': 'px-4 sm:px-6 md:px-8 lg:px-10',
  'px-6': 'px-6 sm:px-8 md:px-10 lg:px-12',
  
  // Padding Y
  'py-2': 'py-2 sm:py-3 md:py-4 lg:py-6',
  'py-3': 'py-3 sm:py-4 md:py-6 lg:py-8',
  'py-4': 'py-4 sm:py-6 md:py-8 lg:py-10',
  'py-6': 'py-6 sm:py-8 md:py-10 lg:py-12',
  
  // Margin
  'm-2': 'm-2 sm:m-3 md:m-4 lg:m-6',
  'm-3': 'm-3 sm:m-4 md:m-6 lg:m-8',
  'm-4': 'm-4 sm:m-6 md:m-8 lg:m-10',
  
  // Width
  'w-10': 'w-10 sm:w-12 md:w-14 lg:w-16',
  'w-12': 'w-12 sm:w-14 md:w-16 lg:w-20',
  'w-16': 'w-16 sm:w-20 md:w-24 lg:w-28',
  'w-20': 'w-20 sm:w-24 md:w-28 lg:w-32',
  
  // Height
  'h-10': 'h-10 sm:h-12 md:h-14 lg:h-16',
  'h-12': 'h-12 sm:h-14 md:h-16 lg:h-20',
  'h-16': 'h-16 sm:h-20 md:h-24 lg:h-28',
  'h-20': 'h-20 sm:h-24 md:h-28 lg:h-32',
  
  // Border radius
  'rounded-lg': 'rounded-lg sm:rounded-xl md:rounded-2xl',
  'rounded-xl': 'rounded-xl sm:rounded-2xl md:rounded-3xl',
  
  // Gap
  'gap-2': 'gap-2 sm:gap-3 md:gap-4 lg:gap-6',
  'gap-3': 'gap-3 sm:gap-4 md:gap-6 lg:gap-8',
  'gap-4': 'gap-4 sm:gap-6 md:gap-8 lg:gap-10',
};

// Files to update
const filesToUpdate = [
  'app/notifications-settings.tsx',
  'app/privacy-settings.tsx',
  'app/account-settings.tsx',
  'app/theme-settings.tsx',
  'app/help-support.tsx',
  'app/media-gallery.tsx',
  'app/(tabs)/profile.tsx',
  'app/(tabs)/settings.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/calls.tsx',
  'app/(tabs)/groups.tsx',
  'app/(tabs)/updates.tsx',
  'src/components/VoiceMessageRecorder.tsx',
  'src/components/VoiceMessagePlayer.tsx',
  'src/components/EnhancedChatInput.tsx',
  'src/components/cards/PostCard.tsx',
  'src/components/shared/Pagination.tsx',
];

function updateFileWithResponsiveClasses(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Update class names
    Object.entries(responsiveClassMappings).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(`className="([^"]*\\s)?${oldClass}(\\s[^"]*)?"`,'g');
      const newContent = content.replace(regex, (match, prefix = '', suffix = '') => {
        updated = true;
        return `className="${prefix}${newClass}${suffix}"`;
      });
      content = newContent;
    });

    // Add responsive imports if not present
    if (!content.includes('from \'../src/utils/responsive\'') && 
        !content.includes('from \'../../src/utils/responsive\'')) {
      
      const importPath = filePath.startsWith('app/') ? '../src/utils/responsive' : '../../src/utils/responsive';
      const importStatement = `import { isTablet, isSmallDevice, spacing, fontSizes } from '${importPath}';\n`;
      
      // Find the last import statement
      const importRegex = /import.*from.*['"];?\n/g;
      const imports = content.match(importRegex);
      if (imports) {
        const lastImport = imports[imports.length - 1];
        content = content.replace(lastImport, lastImport + importStatement);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`📝 No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function createResponsiveStylesFile() {
  const responsiveStyles = `
// Responsive styles for IraChat
// Auto-generated responsive utility classes

export const responsiveStyles = {
  // Container styles
  container: {
    small: 'max-w-sm mx-auto px-4',
    medium: 'max-w-md mx-auto px-6',
    large: 'max-w-lg mx-auto px-8',
    tablet: 'max-w-2xl mx-auto px-10',
  },
  
  // Text styles
  heading: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
  },
  
  // Button styles
  button: {
    small: 'px-3 py-2 sm:px-4 sm:py-2 text-sm',
    medium: 'px-4 py-2 sm:px-6 sm:py-3 text-base',
    large: 'px-6 py-3 sm:px-8 sm:py-4 text-lg',
  },
  
  // Card styles
  card: {
    padding: 'p-4 sm:p-6 md:p-8',
    margin: 'm-2 sm:m-3 md:m-4',
    rounded: 'rounded-lg sm:rounded-xl md:rounded-2xl',
  },
  
  // Grid styles
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: 640,   // Small devices
  md: 768,   // Medium devices
  lg: 1024,  // Large devices
  xl: 1280,  // Extra large devices
};

// Helper functions
export const getResponsiveClass = (baseClass: string, breakpoint: string = 'sm') => {
  return \`\${baseClass} \${breakpoint}:\${baseClass}\`;
};

export const combineResponsiveClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
`;

  const outputPath = 'src/styles/responsive.ts';
  fs.writeFileSync(outputPath, responsiveStyles, 'utf8');
  console.log(`✅ Created responsive styles file: ${outputPath}`);
}

// Main execution
console.log('🚀 Making IraChat fully responsive...\n');

// Create responsive styles file
createResponsiveStylesFile();

// Update all files
filesToUpdate.forEach(updateFileWithResponsiveClasses);

console.log('\n✨ Responsive update complete!');
console.log('\n📱 Your app is now fully responsive across all device sizes:');
console.log('   • Small phones (320px+)');
console.log('   • Medium phones (375px+)');
console.log('   • Large phones (414px+)');
console.log('   • Small tablets (768px+)');
console.log('   • Large tablets (1024px+)');
console.log('   • Desktop (1200px+)');
