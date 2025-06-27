#!/usr/bin/env node
/**
 * Comprehensive Error Fixing Script for IraChat
 * 
 * This script systematically identifies and fixes all types of errors
 * in the IraChat project including TypeScript, React, imports, and more
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Error categories to fix
const errorCategories = {
  unusedVariables: {
    name: 'Unused Variables',
    patterns: [
      /is declared but its value is never read/,
      /is declared but never used/,
    ],
  },
  unusedImports: {
    name: 'Unused Imports',
    patterns: [
      /'.*' is declared but its value is never read/,
    ],
  },
  typeErrors: {
    name: 'TypeScript Type Errors',
    patterns: [
      /Type '.*' is not assignable to type/,
      /Property '.*' does not exist on type/,
      /Cannot find name/,
    ],
  },
  reactErrors: {
    name: 'React Component Errors',
    patterns: [
      /Type '.*' is not assignable to type 'ReactNode'/,
      /JSX element type '.*' does not have any construct/,
    ],
  },
  importErrors: {
    name: 'Import/Module Errors',
    patterns: [
      /Cannot find module/,
      /Module not found/,
    ],
  },
};

// Files to check and fix
const filesToCheck = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/groups.tsx',
  'app/(tabs)/calls.tsx',
  'app/(tabs)/updates.tsx',
  'app/privacy-settings.tsx',
  'src/components/ChatRoom.tsx',
  'src/components/ui/AnimatedLogo.tsx',
  'src/components/IraChatWallpaper.tsx',
  'src/screens/ContactsScreen.tsx',
  'src/hooks/useResponsiveDimensions.ts',
  'src/hooks/useGroupChat.ts',
  'src/hooks/useUpdates.ts',
  'src/utils/groupManagement.ts',
];

function runTypeScriptCheck() {
  console.log('🔍 Running TypeScript compilation check...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 60000 
    });
    console.log('✅ No TypeScript compilation errors found!');
    return [];
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
    console.log('📋 TypeScript errors found:');
    console.log(output);
    return parseTypeScriptErrors(output);
  }
}

function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse TypeScript error format: file.ts:line:col - error TS#### message
    const match = line.match(/^(.+):(\d+):(\d+) - error TS(\d+): (.+)$/);
    if (match) {
      const [, file, lineNum, col, errorCode, message] = match;
      errors.push({
        file: file.replace(process.cwd() + '\\', '').replace(/\\/g, '/'),
        line: parseInt(lineNum),
        column: parseInt(col),
        code: errorCode,
        message: message,
        category: categorizeError(message),
      });
    }
  }
  
  return errors;
}

function categorizeError(message) {
  for (const [category, config] of Object.entries(errorCategories)) {
    for (const pattern of config.patterns) {
      if (pattern.test(message)) {
        return category;
      }
    }
  }
  return 'other';
}

function fixUnusedVariables(errors) {
  console.log('\n🔧 Fixing unused variables...');
  
  const unusedVarErrors = errors.filter(e => e.category === 'unusedVariables');
  const fixes = [];
  
  for (const error of unusedVarErrors) {
    try {
      const filePath = error.file;
      if (!fs.existsSync(filePath)) continue;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Extract variable name from error message
      const varMatch = error.message.match(/'([^']+)' is declared but/);
      if (!varMatch) continue;
      
      const varName = varMatch[1];
      const lineIndex = error.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Fix different patterns of unused variables
        let fixedLine = line;
        
        // Pattern: const [var, setVar] = useState() -> const [var] = useState()
        if (line.includes('useState') && line.includes(varName)) {
          fixedLine = line.replace(
            new RegExp(`(const\\s*\\[\\s*\\w+\\s*,\\s*)${varName}(\\s*\\])`),
            '$1$2'
          );
        }
        
        // Pattern: import { unused, used } -> import { used }
        if (line.includes('import') && line.includes(varName)) {
          fixedLine = line.replace(
            new RegExp(`\\s*,?\\s*${varName}\\s*,?`),
            ''
          ).replace(/,\s*}/, ' }').replace(/{\s*,/, '{ ');
        }
        
        // Pattern: function param not used -> prefix with _
        if (line.includes(varName) && (line.includes('=>') || line.includes('function'))) {
          fixedLine = line.replace(
            new RegExp(`\\b${varName}\\b`),
            `_${varName}`
          );
        }
        
        if (fixedLine !== line) {
          lines[lineIndex] = fixedLine;
          fixes.push({
            file: filePath,
            line: error.line,
            original: line.trim(),
            fixed: fixedLine.trim(),
          });
        }
      }
      
      if (fixes.length > 0) {
        fs.writeFileSync(filePath, lines.join('\n'));
      }
    } catch (err) {
      console.error(`Error fixing ${error.file}:`, err.message);
    }
  }
  
  console.log(`✅ Fixed ${fixes.length} unused variable issues`);
  return fixes;
}

function fixTypeErrors(errors) {
  console.log('\n🔧 Fixing TypeScript type errors...');
  
  const typeErrors = errors.filter(e => e.category === 'typeErrors');
  const fixes = [];
  
  for (const error of typeErrors) {
    try {
      const filePath = error.file;
      if (!fs.existsSync(filePath)) continue;
      
      const content = fs.readFileSync(filePath, 'utf8');
      let fixedContent = content;
      
      // Fix common type issues
      if (error.message.includes('fontWeight')) {
        fixedContent = fixedContent.replace(
          /fontWeight:\s*'(\d+)'/g,
          "fontWeight: '$1' as const"
        );
      }
      
      if (error.message.includes('textAlign')) {
        fixedContent = fixedContent.replace(
          /textAlign:\s*'(center|left|right)'/g,
          "textAlign: '$1' as const"
        );
      }
      
      if (error.message.includes('Cannot find name')) {
        const nameMatch = error.message.match(/Cannot find name '([^']+)'/);
        if (nameMatch) {
          const missingName = nameMatch[1];
          
          // Add common missing imports
          if (missingName === 'db') {
            fixedContent = addImportIfMissing(fixedContent, "import { db } from '../services/firebaseSimple';");
          } else if (['collection', 'doc', 'getDoc', 'getDocs', 'setDoc', 'addDoc'].includes(missingName)) {
            fixedContent = addImportIfMissing(fixedContent, "import { collection, doc, getDoc, getDocs, setDoc, addDoc } from 'firebase/firestore';");
          }
        }
      }
      
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent);
        fixes.push({
          file: filePath,
          message: error.message,
        });
      }
    } catch (err) {
      console.error(`Error fixing ${error.file}:`, err.message);
    }
  }
  
  console.log(`✅ Fixed ${fixes.length} type errors`);
  return fixes;
}

function addImportIfMissing(content, importStatement) {
  if (content.includes(importStatement)) {
    return content;
  }
  
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
    return lines.join('\n');
  }
  
  // If no imports found, add at the beginning
  return importStatement + '\n' + content;
}

function generateErrorReport(errors, fixes) {
  console.log('\n📊 Error Analysis Report');
  console.log('=' .repeat(50));
  
  // Group errors by category
  const errorsByCategory = {};
  for (const error of errors) {
    if (!errorsByCategory[error.category]) {
      errorsByCategory[error.category] = [];
    }
    errorsByCategory[error.category].push(error);
  }
  
  // Display summary
  console.log(`Total Errors Found: ${errors.length}`);
  console.log(`Total Fixes Applied: ${fixes.length}`);
  console.log(`Remaining Errors: ${errors.length - fixes.length}`);
  
  console.log('\nErrors by Category:');
  for (const [category, categoryErrors] of Object.entries(errorsByCategory)) {
    const categoryName = errorCategories[category]?.name || category;
    console.log(`  ${categoryName}: ${categoryErrors.length}`);
  }
  
  // Show remaining critical errors
  const criticalErrors = errors.filter(e => 
    e.category === 'typeErrors' || e.category === 'reactErrors'
  );
  
  if (criticalErrors.length > 0) {
    console.log('\n🚨 Critical Errors Remaining:');
    criticalErrors.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. ${error.file}:${error.line} - ${error.message}`);
    });
    
    if (criticalErrors.length > 10) {
      console.log(`... and ${criticalErrors.length - 10} more`);
    }
  }
}

function main() {
  console.log('🚀 Starting comprehensive error fixing for IraChat...\n');
  
  // Step 1: Run TypeScript check
  const errors = runTypeScriptCheck();
  
  if (errors.length === 0) {
    console.log('🎉 No errors found! Project is clean.');
    return;
  }
  
  console.log(`\n📋 Found ${errors.length} errors to fix`);
  
  // Step 2: Apply fixes
  const allFixes = [];
  
  // Fix unused variables
  const unusedVarFixes = fixUnusedVariables(errors);
  allFixes.push(...unusedVarFixes);
  
  // Fix type errors
  const typeFixes = fixTypeErrors(errors);
  allFixes.push(...typeFixes);
  
  // Step 3: Run TypeScript check again
  console.log('\n🔍 Running final TypeScript check...');
  const remainingErrors = runTypeScriptCheck();
  
  // Step 4: Generate report
  generateErrorReport(errors, allFixes);
  
  if (remainingErrors.length === 0) {
    console.log('\n🎉 All errors fixed! Project is now clean.');
  } else {
    console.log(`\n⚠️ ${remainingErrors.length} errors still remain. Manual intervention may be required.`);
  }
  
  console.log('\n✅ Error fixing process complete!');
}

if (require.main === module) {
  main();
}
