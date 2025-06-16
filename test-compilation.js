#!/usr/bin/env node

/**
 * Test compilation and check for remaining TypeScript errors
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Testing TypeScript Compilation...\n");

// Check if TypeScript is available
try {
  const tscPath = path.join(process.cwd(), "node_modules", ".bin", "tsc.cmd");

  if (fs.existsSync(tscPath)) {
    console.log("✅ TypeScript compiler found");

    // Try to compile without emitting files
    try {
      console.log("🔄 Running TypeScript compilation check...");

      const result = execSync(`"${tscPath}" --noEmit --skipLibCheck`, {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 60000,
      });

      console.log("✅ TypeScript compilation successful!");
      console.log("🎉 No TypeScript errors found!");
    } catch (error) {
      console.log("❌ TypeScript compilation failed:");
      console.log(error.stdout || error.message);

      // Count errors
      const errorOutput = error.stdout || error.message;
      const errorMatches = errorOutput.match(/error TS\d+:/g);
      const errorCount = errorMatches ? errorMatches.length : 0;

      console.log(`\n📊 Found ${errorCount} TypeScript errors`);

      if (errorCount > 0 && errorCount < 50) {
        console.log("\n🔧 Errors are manageable - showing first few:");
        const lines = errorOutput.split("\n").slice(0, 20);
        lines.forEach((line) => {
          if (line.includes("error TS")) {
            console.log(`   ${line}`);
          }
        });
      }
    }
  } else {
    console.log("❌ TypeScript compiler not found");
  }
} catch (error) {
  console.log("❌ Error checking TypeScript:", error.message);
}

// Check critical files exist
console.log("\n📁 Checking critical files...");

const criticalFiles = [
  "app/_layout.tsx",
  "app/index.tsx",
  "app/(tabs)/_layout.tsx",
  "app/(tabs)/index.tsx",
  "src/types/index.ts",
  "src/redux/store.ts",
  "src/services/firebaseSimple.ts",
  "package.json",
];

let allFilesExist = true;

criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log("\n🎉 All critical files exist!");
} else {
  console.log("\n⚠️ Some critical files are missing");
}

// Check package.json dependencies
console.log("\n📦 Checking dependencies...");

try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const requiredDeps = [
    "expo",
    "expo-router",
    "react",
    "react-native",
    "firebase",
    "@reduxjs/toolkit",
    "react-redux",
  ];

  const missingDeps = requiredDeps.filter(
    (dep) =>
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep],
  );

  if (missingDeps.length === 0) {
    console.log("✅ All required dependencies present");
  } else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(", ")}`);
  }
} catch (error) {
  console.log("❌ Error reading package.json:", error.message);
}

console.log("\n" + "=".repeat(50));
console.log("📊 COMPILATION TEST COMPLETE");
console.log("=".repeat(50));
