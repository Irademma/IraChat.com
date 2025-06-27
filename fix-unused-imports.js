// Script to find and fix unused imports
const fs = require('fs');
const path = require('path');

function findUnusedImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    // Check for unused React import
    if (content.includes("import React") && !content.includes("React.")) {
      // Check if JSX is used (which requires React in older versions)
      const hasJSX = content.includes('<') && content.includes('>');
      if (!hasJSX) {
        issues.push({
          line: lines.findIndex(line => line.includes("import React")) + 1,
          issue: "Unused React import",
          suggestion: "Remove React import if not using React.createElement"
        });
      }
    }

    // Check for unused Linking import
    if (content.includes("import { Linking }") && !content.includes("Linking.")) {
      issues.push({
        line: lines.findIndex(line => line.includes("import { Linking }")) + 1,
        issue: "Unused Linking import",
        suggestion: "Remove Linking from imports"
      });
    }

    // Check for unused Platform import
    if (content.includes("Platform") && content.includes("import") && !content.includes("Platform.OS")) {
      const platformImportLine = lines.findIndex(line => 
        line.includes("import") && line.includes("Platform") && !line.includes("//")
      );
      if (platformImportLine !== -1 && !content.includes("Platform.OS") && !content.includes("Platform.select")) {
        issues.push({
          line: platformImportLine + 1,
          issue: "Unused Platform import",
          suggestion: "Remove Platform from imports"
        });
      }
    }

    return issues;
  } catch (error) {
    return [{ issue: `Error reading file: ${error.message}` }];
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const issues = findUnusedImports(fullPath);
        if (issues.length > 0) {
          results.push({
            file: fullPath,
            issues: issues
          });
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

// Scan the project
console.log('🔍 Scanning for unused imports...\n');

const results = scanDirectory('.');

if (results.length === 0) {
  console.log('✅ No unused imports found!');
} else {
  console.log(`⚠️ Found unused imports in ${results.length} files:\n`);
  
  results.forEach(result => {
    console.log(`📄 ${result.file}`);
    result.issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.issue}`);
      console.log(`   💡 ${issue.suggestion}`);
    });
    console.log('');
  });
}

console.log('\n🔧 To fix these issues, remove the unused imports from the respective files.');
