#!/usr/bin/env node
/**
 * UI/UX Issues Fixer for IraChat
 * 
 * Comprehensive script to identify and fix common UI/UX issues
 * across the IraChat application
 */

const fs = require('fs');
const path = require('path');

// UI/UX Issues to check and fix
const uiIssues = {
  colorConsistency: {
    name: 'Color System Consistency',
    description: 'Check for excessive or inconsistent color usage',
    files: ['app/(tabs)/*.tsx', 'src/components/*.tsx'],
  },
  textReadability: {
    name: 'Text Readability',
    description: 'Check font sizes, contrast, and alignment',
    files: ['app/(tabs)/*.tsx', 'src/components/*.tsx'],
  },
  avatarConsistency: {
    name: 'Avatar System Consistency',
    description: 'Check for consistent avatar implementation',
    files: ['app/(tabs)/*.tsx', 'src/components/*.tsx'],
  },
  emptyStates: {
    name: 'Empty State Implementation',
    description: 'Check for engaging empty states',
    files: ['app/(tabs)/*.tsx'],
  },
  navigationFeedback: {
    name: 'Navigation Visual Feedback',
    description: 'Check tab selection and navigation indicators',
    files: ['app/(tabs)/_layout.tsx'],
  },
};

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function analyzeColorUsage(content) {
  const issues = [];
  
  // Check for excessive color usage
  const colorMatches = content.match(/#[0-9A-Fa-f]{6}/g) || [];
  const uniqueColors = [...new Set(colorMatches)];
  
  if (uniqueColors.length > 10) {
    issues.push({
      type: 'warning',
      message: `Too many colors used (${uniqueColors.length}). Consider using design system colors.`,
      suggestion: 'Import colors from src/styles/designSystem.ts',
    });
  }
  
  // Check for hardcoded colors instead of design system
  const hardcodedColors = ['#667eea', '#87ceeb', '#10b981', '#ef4444'];
  hardcodedColors.forEach(color => {
    if (content.includes(color) && !content.includes('colors.')) {
      issues.push({
        type: 'info',
        message: `Hardcoded color ${color} found. Consider using design system.`,
        suggestion: `Replace with colors.primary, colors.primaryLight, etc.`,
      });
    }
  });
  
  return issues;
}

function analyzeTextReadability(content) {
  const issues = [];
  
  // Check for small font sizes
  const fontSizeMatches = content.match(/fontSize:\s*(\d+)/g) || [];
  fontSizeMatches.forEach(match => {
    const size = parseInt(match.match(/\d+/)[0]);
    if (size < 14) {
      issues.push({
        type: 'warning',
        message: `Small font size detected (${size}px). Consider using at least 14px for readability.`,
        suggestion: 'Use typography.fontSize.base (16px) from design system',
      });
    }
  });
  
  // Check for className usage instead of style objects
  if (content.includes('className=') && content.includes('text-')) {
    issues.push({
      type: 'info',
      message: 'Tailwind className usage detected. Consider using design system styles.',
      suggestion: 'Use textStyles from src/styles/designSystem.ts',
    });
  }
  
  return issues;
}

function analyzeAvatarUsage(content) {
  const issues = [];
  
  // Check for inconsistent avatar implementation
  if (content.includes('<Image') && content.includes('rounded-full')) {
    if (!content.includes('Avatar') && !content.includes('ProfileAvatar')) {
      issues.push({
        type: 'warning',
        message: 'Manual avatar implementation detected.',
        suggestion: 'Use Avatar component from src/components/Avatar.tsx',
      });
    }
  }
  
  // Check for missing fallback avatars
  if (content.includes('source={{ uri:') && !content.includes('onError')) {
    issues.push({
      type: 'warning',
      message: 'Avatar without error handling detected.',
      suggestion: 'Add onError handler or use Avatar component with automatic fallbacks',
    });
  }
  
  return issues;
}

function analyzeEmptyStates(content) {
  const issues = [];
  
  // Check for old EmptyState usage
  if (content.includes('EmptyState') && !content.includes('EmptyStateImproved')) {
    issues.push({
      type: 'info',
      message: 'Old EmptyState component usage detected.',
      suggestion: 'Use EmptyStateImproved components for better UX',
    });
  }
  
  // Check for missing empty states
  if (content.includes('length === 0') && !content.includes('EmptyState')) {
    issues.push({
      type: 'warning',
      message: 'Potential missing empty state detected.',
      suggestion: 'Add appropriate empty state component',
    });
  }
  
  return issues;
}

function analyzeNavigationFeedback(content) {
  const issues = [];
  
  // Check for proper tab styling
  if (content.includes('tabBarActiveTintColor') && content.includes('tabBarInactiveTintColor')) {
    if (!content.includes('#667eea')) {
      issues.push({
        type: 'info',
        message: 'Tab colors may not match IraChat brand colors.',
        suggestion: 'Use #667eea for active tabs and #9CA3AF for inactive tabs',
      });
    }
  }
  
  return issues;
}

function analyzeFile(filePath) {
  if (!checkFileExists(filePath)) {
    return { file: filePath, issues: [{ type: 'error', message: 'File not found' }] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Run all analyses
  issues.push(...analyzeColorUsage(content));
  issues.push(...analyzeTextReadability(content));
  issues.push(...analyzeAvatarUsage(content));
  issues.push(...analyzeEmptyStates(content));
  issues.push(...analyzeNavigationFeedback(content));
  
  return { file: filePath, issues };
}

function generateReport(results) {
  console.log('🎨 IraChat UI/UX Analysis Report\n');
  
  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  
  results.forEach(result => {
    if (result.issues.length > 0) {
      console.log(`📄 ${result.file}`);
      
      result.issues.forEach(issue => {
        totalIssues++;
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${issue.message}`);
        
        if (issue.suggestion) {
          console.log(`     💡 ${issue.suggestion}`);
        }
        
        if (issue.type === 'error') errorCount++;
        else if (issue.type === 'warning') warningCount++;
        else infoCount++;
      });
      
      console.log('');
    }
  });
  
  // Summary
  console.log('📊 Summary:');
  console.log(`  Total Issues: ${totalIssues}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  ⚠️ Warnings: ${warningCount}`);
  console.log(`  ℹ️ Info: ${infoCount}`);
  
  return { totalIssues, errorCount, warningCount, infoCount };
}

function generateFixSuggestions() {
  console.log(`
🔧 Recommended Fixes:

1. **Color System**
   - Import: import { colors } from '../styles/designSystem';
   - Replace hardcoded colors with design system colors
   - Use colors.primary, colors.gray500, etc.

2. **Typography**
   - Import: import { textStyles } from '../styles/designSystem';
   - Use textStyles.h1, textStyles.body, etc.
   - Ensure minimum 14px font size for readability

3. **Avatar System**
   - Import: import { Avatar } from '../components/Avatar';
   - Replace manual avatar implementations
   - Use consistent avatar sizing and fallbacks

4. **Empty States**
   - Import: import { EmptyStateImproved } from '../components/EmptyStateImproved';
   - Replace old EmptyState components
   - Add engaging illustrations and clear actions

5. **Navigation**
   - Use consistent brand colors for tabs
   - Ensure clear visual feedback for active states
   - Add proper accessibility labels

📱 Quick Commands:
   - Fix colors: Replace hardcoded colors with design system
   - Fix avatars: Replace Image components with Avatar component
   - Fix empty states: Use EmptyStateImproved components
   - Fix typography: Use textStyles from design system
`);
}

function main() {
  console.log('🚀 Starting IraChat UI/UX Analysis...\n');
  
  const filesToAnalyze = [
    'app/(tabs)/index.tsx',
    'app/(tabs)/groups.tsx',
    'app/(tabs)/updates.tsx',
    'app/(tabs)/calls.tsx',
    'app/(tabs)/_layout.tsx',
    'app/fast-contacts.tsx',
    'src/components/MainHeader.tsx',
  ];
  
  const results = filesToAnalyze.map(analyzeFile);
  const summary = generateReport(results);
  
  if (summary.totalIssues === 0) {
    console.log('🎉 No UI/UX issues found! Your app looks great!');
  } else {
    generateFixSuggestions();
  }
  
  console.log('\n✅ Analysis complete!');
  
  return summary.totalIssues === 0;
}

if (require.main === module) {
  main();
}
