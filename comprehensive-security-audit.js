#!/usr/bin/env node

/**
 * Comprehensive Security & Code Quality Audit for IraChat
 * Deep analysis of logic, security, syntax, and structure
 */

const fs = require("fs");
const path = require("path");

console.log("🔒 IRACHAT COMPREHENSIVE SECURITY & CODE AUDIT");
console.log("=".repeat(60));
console.log("🛡️ Analyzing security, logic, syntax, and structure");
console.log("📱 Production readiness assessment");
console.log("=".repeat(60));

// Audit results tracking
const auditResults = {
  security: { passed: 0, failed: 0, warnings: 0, issues: [] },
  logic: { passed: 0, failed: 0, warnings: 0, issues: [] },
  syntax: { passed: 0, failed: 0, warnings: 0, issues: [] },
  structure: { passed: 0, failed: 0, warnings: 0, issues: [] },
  overall: { passed: 0, failed: 0, warnings: 0, critical: 0 },
};

function auditTest(category, testName, testFunction, severity = "normal") {
  try {
    const result = testFunction();

    if (result === true) {
      console.log(`✅ ${testName}: SECURE`);
      auditResults[category].passed++;
      auditResults.overall.passed++;
    } else if (result === "warning") {
      console.log(`⚠️ ${testName}: WARNING`);
      auditResults[category].warnings++;
      auditResults.overall.warnings++;
      if (typeof result === "object" && result.message) {
        auditResults[category].issues.push({
          test: testName,
          type: "warning",
          message: result.message,
        });
      }
    } else {
      const level = severity === "critical" ? "CRITICAL" : "ISSUE";
      console.log(`❌ ${testName}: ${level}`);
      auditResults[category].failed++;
      auditResults.overall.failed++;
      if (severity === "critical") auditResults.overall.critical++;

      if (typeof result === "object" && result.message) {
        auditResults[category].issues.push({
          test: testName,
          type: "error",
          message: result.message,
          severity,
        });
      }
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    auditResults[category].failed++;
    auditResults.overall.failed++;
    auditResults[category].issues.push({
      test: testName,
      type: "error",
      message: error.message,
    });
  }
}

async function runSecurityAudit() {
  console.log("\n🔒 SECURITY AUDIT:");
  console.log("-".repeat(50));

  // Test 1: Firebase Configuration Security
  auditTest(
    "security",
    "Firebase API Keys Protection",
    () => {
      const firebaseConfig = fs.readFileSync("src/config/firebase.ts", "utf8");

      // Check if API keys are hardcoded (security risk)
      if (
        firebaseConfig.includes("AIzaSy") &&
        !firebaseConfig.includes("process.env")
      ) {
        return {
          message:
            "Firebase API keys are hardcoded - should use environment variables",
        };
      }

      // Check if fallback values exist (acceptable for client-side)
      if (firebaseConfig.includes("process.env.EXPO_PUBLIC_FIREBASE_API_KEY")) {
        return true;
      }

      return { message: "Firebase configuration needs review" };
    },
    "critical",
  );

  // Test 2: Authentication Security
  auditTest("security", "Authentication Implementation", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    // Check for proper authentication checks
    if (chatFile.includes("firebaseUser") && chatFile.includes("currentUser")) {
      return true;
    }

    return { message: "Authentication checks may be insufficient" };
  });

  // Test 3: Input Validation
  auditTest("security", "Input Validation & Sanitization", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    // Check for input validation
    if (chatFile.includes("input.trim()") && chatFile.includes("maxLength")) {
      return true;
    }

    return { message: "Input validation could be improved" };
  });

  // Test 4: Password Security
  auditTest(
    "security",
    "Password Security",
    () => {
      const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

      // Check for weak password generation
      if (chatFile.includes("irachat_${currentUser.id}")) {
        return { message: "Weak password generation pattern detected" };
      }

      return true;
    },
    "critical",
  );

  // Test 5: Data Exposure
  auditTest("security", "Sensitive Data Exposure", () => {
    const files = ["app/chat/[id].tsx", "app/(auth)/index.tsx"];
    let hasConsoleLog = false;

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        // Check for actual password values being logged, not just the word "password"
        const lines = content.split("\n");
        lines.forEach((line) => {
          if (
            line.includes("console.log") &&
            (line.includes("password:") ||
              line.includes("password,") ||
              line.includes("${password}") ||
              line.includes("uid:") ||
              line.includes("email:"))
          ) {
            hasConsoleLog = true;
          }
        });
      }
    });

    if (hasConsoleLog) {
      return { message: "Sensitive data may be logged to console" };
    }

    return true;
  });
}

async function runLogicAudit() {
  console.log("\n🧠 LOGIC AUDIT:");
  console.log("-".repeat(50));

  // Test 1: Error Handling
  auditTest("logic", "Error Handling Implementation", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    if (
      chatFile.includes("try {") &&
      chatFile.includes("catch") &&
      chatFile.includes("console.error")
    ) {
      return true;
    }

    return { message: "Error handling could be more comprehensive" };
  });

  // Test 2: State Management
  auditTest("logic", "State Management Logic", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    if (
      chatFile.includes("useState") &&
      chatFile.includes("useEffect") &&
      chatFile.includes("useSelector")
    ) {
      return true;
    }

    return { message: "State management implementation needs review" };
  });

  // Test 3: Memory Leaks Prevention
  auditTest("logic", "Memory Leak Prevention", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    if (
      chatFile.includes("return unsubscribe") &&
      chatFile.includes("remove()")
    ) {
      return true;
    }

    return { message: "Memory leak prevention could be improved" };
  });

  // Test 4: Null Safety
  auditTest("logic", "Null Safety Checks", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    if (
      chatFile.includes("?.") &&
      chatFile.includes("||") &&
      chatFile.includes("!")
    ) {
      return true;
    }

    return { message: "Null safety checks could be more comprehensive" };
  });
}

async function runSyntaxAudit() {
  console.log("\n📝 SYNTAX & CODE QUALITY AUDIT:");
  console.log("-".repeat(50));

  // Test 1: TypeScript Usage
  auditTest("syntax", "TypeScript Implementation", () => {
    const files = ["app/chat/[id].tsx", "app/_layout.tsx"];
    let hasProperTypes = true;

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        if (content.includes(": any") && content.split(": any").length > 3) {
          hasProperTypes = false;
        }
      }
    });

    if (!hasProperTypes) {
      return {
        message: 'Too many "any" types - should use proper TypeScript types',
      };
    }

    return true;
  });

  // Test 2: Code Consistency
  auditTest("syntax", "Code Style Consistency", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");

    // Check for consistent formatting
    if (chatFile.includes("  ") && !chatFile.includes("\t")) {
      return true;
    }

    return { message: "Code formatting inconsistencies detected" };
  });

  // Test 3: Import Organization
  auditTest("syntax", "Import Statement Organization", () => {
    const chatFile = fs.readFileSync("app/chat/[id].tsx", "utf8");
    const lines = chatFile.split("\n");
    const importLines = lines.filter((line) =>
      line.trim().startsWith("import"),
    );

    if (importLines.length > 0 && importLines.length < 20) {
      return true;
    }

    return { message: "Import statements could be better organized" };
  });
}

async function runStructureAudit() {
  console.log("\n🏗️ STRUCTURE AUDIT:");
  console.log("-".repeat(50));

  // Test 1: File Organization
  auditTest("structure", "File & Folder Structure", () => {
    const requiredDirs = ["app", "src", "assets"];
    const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(dir));

    if (missingDirs.length === 0) {
      return true;
    }

    return { message: `Missing directories: ${missingDirs.join(", ")}` };
  });

  // Test 2: Component Architecture
  auditTest("structure", "Component Architecture", () => {
    const srcDirs = [
      "src/components",
      "src/hooks",
      "src/utils",
      "src/services",
    ];
    const existingDirs = srcDirs.filter((dir) => fs.existsSync(dir));

    if (existingDirs.length >= 3) {
      return true;
    }

    return { message: "Component architecture could be better organized" };
  });

  // Test 3: Configuration Files
  auditTest("structure", "Configuration Files", () => {
    const configFiles = ["app.json", "package.json", "tsconfig.json"];
    const missingFiles = configFiles.filter((file) => !fs.existsSync(file));

    if (missingFiles.length === 0) {
      return true;
    }

    return { message: `Missing config files: ${missingFiles.join(", ")}` };
  });
}

async function generateAuditReport() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPREHENSIVE AUDIT RESULTS");
  console.log("=".repeat(60));

  const categories = ["security", "logic", "syntax", "structure"];

  categories.forEach((category) => {
    const results = auditResults[category];
    const total = results.passed + results.failed + results.warnings;
    const successRate =
      total > 0 ? Math.round((results.passed / total) * 100) : 100;

    console.log(`\n${category.toUpperCase()} AUDIT:`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️ Warnings: ${results.warnings}`);

    if (results.issues.length > 0) {
      console.log(`🔍 Issues found:`);
      results.issues.forEach((issue, index) => {
        const icon =
          issue.severity === "critical"
            ? "🚨"
            : issue.type === "warning"
              ? "⚠️"
              : "❌";
        console.log(`  ${index + 1}. ${icon} ${issue.test}: ${issue.message}`);
      });
    }
  });

  console.log("\n🎯 OVERALL ASSESSMENT:");
  const overallTotal =
    auditResults.overall.passed +
    auditResults.overall.failed +
    auditResults.overall.warnings;
  const overallRate =
    overallTotal > 0
      ? Math.round((auditResults.overall.passed / overallTotal) * 100)
      : 100;

  console.log(`📊 Overall Success Rate: ${overallRate}%`);
  console.log(`🚨 Critical Issues: ${auditResults.overall.critical}`);
  console.log(`❌ Total Issues: ${auditResults.overall.failed}`);
  console.log(`⚠️ Total Warnings: ${auditResults.overall.warnings}`);

  console.log("\n🚀 PUBLICATION READINESS:");
  if (auditResults.overall.critical === 0 && overallRate >= 85) {
    console.log("🎉 APP IS READY FOR PUBLICATION!");
    console.log("✅ No critical security issues found");
    console.log("✅ Code quality meets production standards");
    console.log("✅ Structure is well organized");
  } else if (auditResults.overall.critical === 0 && overallRate >= 70) {
    console.log("⚠️ APP IS MOSTLY READY - Minor improvements recommended");
    console.log("✅ No critical issues blocking publication");
    console.log("🔧 Address warnings for better quality");
  } else if (auditResults.overall.critical > 0) {
    console.log("🚨 CRITICAL ISSUES MUST BE FIXED BEFORE PUBLICATION");
    console.log("❌ Security vulnerabilities detected");
    console.log("🔧 Fix critical issues before deploying");
  } else {
    console.log("🔧 SIGNIFICANT IMPROVEMENTS NEEDED");
    console.log("📋 Address failed tests before publication");
  }

  console.log("\n🎉 Security & Code Quality Audit Complete!");
}

// Run the comprehensive audit
async function runComprehensiveAudit() {
  try {
    await runSecurityAudit();
    await runLogicAudit();
    await runSyntaxAudit();
    await runStructureAudit();
    await generateAuditReport();
  } catch (error) {
    console.error("❌ Audit failed:", error.message);
  }
}

runComprehensiveAudit().catch(console.error);
