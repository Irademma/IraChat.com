#!/usr/bin/env node

/**
 * Advanced IraChat App Testing & Optimization Script
 * Deep dive into performance, security, and user experience
 */

const fs = require("fs");
const path = require("path");

console.log("🔬 Starting Advanced IraChat App Analysis...\n");

const results = {
  performance: { passed: 0, failed: 0, issues: [] },
  security: { passed: 0, failed: 0, issues: [] },
  ux: { passed: 0, failed: 0, issues: [] },
  accessibility: { passed: 0, failed: 0, issues: [] },
  optimization: { passed: 0, failed: 0, issues: [] },
};

function logAdvancedTest(category, name, status, message = "") {
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(
    `${icon} [${category.toUpperCase()}] ${name}: ${status}${message ? ` - ${message}` : ""}`,
  );

  if (status === "PASS") results[category].passed++;
  else if (status === "FAIL") {
    results[category].failed++;
    results[category].issues.push(`${name}: ${message}`);
  }
}

// Test 1: Performance Analysis
console.log("⚡ PERFORMANCE ANALYSIS...");

function checkBundleOptimization() {
  const files = [
    "app/(tabs)/index.tsx",
    "app/(tabs)/groups.tsx",
    "app/(tabs)/updates.tsx",
    "app/(tabs)/calls.tsx",
  ];

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Check for lazy loading
      const hasLazyLoading =
        content.includes("React.lazy") || content.includes("dynamic import");

      // Check for unnecessary re-renders
      const hasUseMemo =
        content.includes("useMemo") || content.includes("useCallback");

      // Check for proper key props in lists
      const hasKeyExtractor =
        content.includes("keyExtractor") || content.includes("key=");

      if (hasKeyExtractor) {
        logAdvancedTest(
          "performance",
          `List optimization in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "performance",
          `List optimization in ${path.basename(file)}`,
          "FAIL",
          "Missing keyExtractor or key props",
        );
      }

      if (hasUseMemo) {
        logAdvancedTest(
          "performance",
          `Memoization in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "performance",
          `Memoization in ${path.basename(file)}`,
          "WARN",
          "Consider adding useMemo/useCallback",
        );
      }
    }
  });
}

checkBundleOptimization();

// Test 2: Security Analysis
console.log("\n🔒 SECURITY ANALYSIS...");

function checkSecurityPractices() {
  // Check Firebase rules and configuration
  const firebaseConfig = "src/config/firebase.ts";
  if (fs.existsSync(firebaseConfig)) {
    const content = fs.readFileSync(firebaseConfig, "utf8");

    // Check for hardcoded secrets (should use env vars)
    const hasEnvVars = content.includes("process.env");
    if (hasEnvVars) {
      logAdvancedTest("security", "Environment variables usage", "PASS");
    } else {
      logAdvancedTest(
        "security",
        "Environment variables usage",
        "WARN",
        "Consider using env vars for sensitive data",
      );
    }

    // Check for API key exposure
    const hasApiKeyFallback = content.includes("AIzaSy");
    if (hasApiKeyFallback) {
      logAdvancedTest(
        "security",
        "API key security",
        "WARN",
        "Fallback API key detected - ensure env vars are used in production",
      );
    } else {
      logAdvancedTest("security", "API key security", "PASS");
    }
  }

  // Check for input validation
  const chatFile = "app/chat/[id].tsx";
  if (fs.existsSync(chatFile)) {
    const content = fs.readFileSync(chatFile, "utf8");
    const hasInputValidation =
      content.includes("trim()") && content.includes("maxLength");

    if (hasInputValidation) {
      logAdvancedTest("security", "Input validation in chat", "PASS");
    } else {
      logAdvancedTest(
        "security",
        "Input validation in chat",
        "FAIL",
        "Missing input validation",
      );
    }
  }
}

checkSecurityPractices();

// Test 3: User Experience Analysis
console.log("\n🎨 USER EXPERIENCE ANALYSIS...");

function checkUXPatterns() {
  // Check for loading states
  const files = [
    "app/(tabs)/index.tsx",
    "app/new-chat.tsx",
    "app/chat/[id].tsx",
  ];

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Check for loading indicators
      const hasLoadingState =
        content.includes("ActivityIndicator") || content.includes("loading");
      if (hasLoadingState) {
        logAdvancedTest(
          "ux",
          `Loading states in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "ux",
          `Loading states in ${path.basename(file)}`,
          "FAIL",
          "Missing loading indicators",
        );
      }

      // Check for error handling
      const hasErrorHandling =
        content.includes("try") && content.includes("catch");
      if (hasErrorHandling) {
        logAdvancedTest(
          "ux",
          `Error handling in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "ux",
          `Error handling in ${path.basename(file)}`,
          "WARN",
          "Consider adding error handling",
        );
      }

      // Check for empty states
      const hasEmptyState =
        content.includes("EmptyState") ||
        content.includes("No ") ||
        content.includes("empty");
      if (hasEmptyState) {
        logAdvancedTest("ux", `Empty states in ${path.basename(file)}`, "PASS");
      } else {
        logAdvancedTest(
          "ux",
          `Empty states in ${path.basename(file)}`,
          "WARN",
          "Consider adding empty state handling",
        );
      }
    }
  });
}

checkUXPatterns();

// Test 4: Accessibility Analysis
console.log("\n♿ ACCESSIBILITY ANALYSIS...");

function checkAccessibility() {
  const accessibilityHook = "src/hooks/useAccessibility.ts";
  if (fs.existsSync(accessibilityHook)) {
    const content = fs.readFileSync(accessibilityHook, "utf8");

    const hasScreenReader = content.includes("isScreenReaderEnabled");
    const hasReduceMotion = content.includes("isReduceMotionEnabled");
    const hasFontScaling = content.includes("fontSize");

    if (hasScreenReader) {
      logAdvancedTest("accessibility", "Screen reader support", "PASS");
    } else {
      logAdvancedTest(
        "accessibility",
        "Screen reader support",
        "FAIL",
        "Missing screen reader support",
      );
    }

    if (hasReduceMotion) {
      logAdvancedTest("accessibility", "Reduce motion support", "PASS");
    } else {
      logAdvancedTest(
        "accessibility",
        "Reduce motion support",
        "FAIL",
        "Missing reduce motion support",
      );
    }

    if (hasFontScaling) {
      logAdvancedTest("accessibility", "Font scaling support", "PASS");
    } else {
      logAdvancedTest(
        "accessibility",
        "Font scaling support",
        "FAIL",
        "Missing font scaling support",
      );
    }
  }

  // Check for accessibility labels
  const chatFile = "app/chat/[id].tsx";
  if (fs.existsSync(chatFile)) {
    const content = fs.readFileSync(chatFile, "utf8");
    const hasAccessibilityLabels =
      content.includes("accessibilityLabel") ||
      content.includes("accessibilityHint");

    if (hasAccessibilityLabels) {
      logAdvancedTest("accessibility", "Accessibility labels in chat", "PASS");
    } else {
      logAdvancedTest(
        "accessibility",
        "Accessibility labels in chat",
        "WARN",
        "Consider adding accessibility labels",
      );
    }
  }
}

checkAccessibility();

// Test 5: Code Optimization Analysis
console.log("\n🚀 CODE OPTIMIZATION ANALYSIS...");

function checkCodeOptimization() {
  // Check for TypeScript usage
  const tsFiles = [
    "app/_layout.tsx",
    "src/redux/store.ts",
    "src/services/firebaseSimple.ts",
  ];

  tsFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Check for proper typing
      const hasInterfaces =
        content.includes("interface") || content.includes("type ");
      if (hasInterfaces) {
        logAdvancedTest(
          "optimization",
          `TypeScript types in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "optimization",
          `TypeScript types in ${path.basename(file)}`,
          "WARN",
          "Consider adding more type definitions",
        );
      }
    }
  });

  // Check for proper imports
  const componentFiles = [
    "src/components/EmptyState.tsx",
    "src/components/ContactItem.tsx",
    "src/components/ErrorBoundary.tsx",
  ];

  componentFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Check for unused imports
      const imports = content.match(/import.*from/g) || [];
      const hasCleanImports = imports.length < 10; // Reasonable threshold

      if (hasCleanImports) {
        logAdvancedTest(
          "optimization",
          `Import optimization in ${path.basename(file)}`,
          "PASS",
        );
      } else {
        logAdvancedTest(
          "optimization",
          `Import optimization in ${path.basename(file)}`,
          "WARN",
          "Consider reviewing imports",
        );
      }
    }
  });
}

checkCodeOptimization();

// Test 6: Mobile-Specific Optimizations
console.log("\n📱 MOBILE OPTIMIZATION ANALYSIS...");

function checkMobileOptimizations() {
  // Check for responsive design
  const responsiveFile = "src/utils/responsive.ts";
  if (fs.existsSync(responsiveFile)) {
    const content = fs.readFileSync(responsiveFile, "utf8");

    const hasBreakpoints =
      content.includes("breakpoints") || content.includes("isSmallDevice");
    const hasResponsiveFonts =
      content.includes("fontScale") || content.includes("fontSize");
    const hasResponsiveSpacing =
      content.includes("spacing") ||
      content.includes("wp") ||
      content.includes("hp");

    if (hasBreakpoints) {
      logAdvancedTest("optimization", "Device breakpoints", "PASS");
    } else {
      logAdvancedTest(
        "optimization",
        "Device breakpoints",
        "FAIL",
        "Missing device breakpoints",
      );
    }

    if (hasResponsiveFonts) {
      logAdvancedTest("optimization", "Responsive typography", "PASS");
    } else {
      logAdvancedTest(
        "optimization",
        "Responsive typography",
        "FAIL",
        "Missing responsive fonts",
      );
    }

    if (hasResponsiveSpacing) {
      logAdvancedTest("optimization", "Responsive spacing", "PASS");
    } else {
      logAdvancedTest(
        "optimization",
        "Responsive spacing",
        "FAIL",
        "Missing responsive spacing",
      );
    }
  }

  // Check for keyboard handling
  const chatFile = "app/chat/[id].tsx";
  if (fs.existsSync(chatFile)) {
    const content = fs.readFileSync(chatFile, "utf8");

    const hasKeyboardAvoidingView = content.includes("KeyboardAvoidingView");
    const hasKeyboardListeners =
      content.includes("Keyboard.addListener") ||
      content.includes("keyboardWillShow");

    if (hasKeyboardAvoidingView) {
      logAdvancedTest("optimization", "Keyboard avoidance", "PASS");
    } else {
      logAdvancedTest(
        "optimization",
        "Keyboard avoidance",
        "FAIL",
        "Missing KeyboardAvoidingView",
      );
    }

    if (hasKeyboardListeners) {
      logAdvancedTest("optimization", "Keyboard event handling", "PASS");
    } else {
      logAdvancedTest(
        "optimization",
        "Keyboard event handling",
        "WARN",
        "Consider adding keyboard listeners",
      );
    }
  }
}

checkMobileOptimizations();

// Final Advanced Results
console.log("\n" + "=".repeat(60));
console.log("🔬 ADVANCED ANALYSIS RESULTS");
console.log("=".repeat(60));

Object.keys(results).forEach((category) => {
  const { passed, failed, issues } = results[category];
  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 100;

  console.log(
    `\n📊 ${category.toUpperCase()}: ${percentage}% (${passed}/${total})`,
  );

  if (issues.length > 0) {
    console.log(`   Issues:`);
    issues.forEach((issue) => console.log(`   • ${issue}`));
  }
});

const totalPassed = Object.values(results).reduce(
  (sum, cat) => sum + cat.passed,
  0,
);
const totalFailed = Object.values(results).reduce(
  (sum, cat) => sum + cat.failed,
  0,
);
const overallPercentage = Math.round(
  (totalPassed / (totalPassed + totalFailed)) * 100,
);

console.log("\n" + "=".repeat(60));
console.log(
  `🎯 OVERALL SCORE: ${overallPercentage}% (${totalPassed}/${totalPassed + totalFailed})`,
);

if (overallPercentage >= 90) {
  console.log("🏆 EXCELLENT! Your app meets high-quality standards!");
} else if (overallPercentage >= 80) {
  console.log("👍 GOOD! Your app is well-optimized with room for improvement!");
} else {
  console.log("⚠️ NEEDS IMPROVEMENT! Consider addressing the issues above!");
}

console.log("\n" + "=".repeat(60));
