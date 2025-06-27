#!/usr/bin/env node

/**
 * IraChat UI/UX Comprehensive Analysis
 * Detailed examination of all components, screens, and user experience
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 IRACHAT UI/UX COMPREHENSIVE ANALYSIS");
console.log("=".repeat(60));
console.log("📱 Analyzing all screens, components, and user flows");
console.log("🔍 Identifying UI/UX issues and improvements");
console.log("=".repeat(60));

// UI/UX analysis results
const uiAnalysis = {
  screens: [],
  components: [],
  issues: [],
  recommendations: [],
  navigation: {},
  responsive: {},
  accessibility: {},
};

function analyzeScreen(screenPath, screenName) {
  if (!fs.existsSync(screenPath)) return null;

  const content = fs.readFileSync(screenPath, "utf8");

  return {
    name: screenName,
    path: screenPath,
    hasStyles: content.includes("StyleSheet") || content.includes("style="),
    hasNavigation: content.includes("navigation") || content.includes("router"),
    hasState: content.includes("useState") || content.includes("useEffect"),
    hasResponsive:
      content.includes("responsive") || content.includes("Dimensions"),
    hasAccessibility:
      content.includes("accessibilityLabel") ||
      content.includes("accessibilityHint"),
    hasErrorHandling: content.includes("try") && content.includes("catch"),
    hasLoading:
      content.includes("loading") || content.includes("ActivityIndicator"),
    lineCount: content.split("\n").length,
    components: extractComponents(content),
  };
}

function extractComponents(content) {
  const components = [];
  const componentMatches = content.match(/<([A-Z][a-zA-Z]*)/g);
  if (componentMatches) {
    componentMatches.forEach((match) => {
      const componentName = match.replace("<", "");
      if (!components.includes(componentName)) {
        components.push(componentName);
      }
    });
  }
  return components;
}

function analyzeAppStructure() {
  console.log("\n📱 APP STRUCTURE ANALYSIS:");
  console.log("-".repeat(50));

  // Main app screens
  const mainScreens = [
    { path: "app/index.tsx", name: "Main Entry" },
    { path: "app/_layout.tsx", name: "Root Layout" },
    { path: "app/welcome.tsx", name: "Welcome Screen" },
  ];

  // Auth screens
  const authScreens = [
    { path: "app/(auth)/index.tsx", name: "Authentication" },
    { path: "app/(auth)/_layout.tsx", name: "Auth Layout" },
    { path: "app/register.tsx", name: "Registration" },
  ];

  // Tab screens
  const tabScreens = [
    { path: "app/(tabs)/index.tsx", name: "Chats List" },
    { path: "app/(tabs)/calls.tsx", name: "Calls" },
    { path: "app/(tabs)/groups.tsx", name: "Groups" },
    { path: "app/(tabs)/updates.tsx", name: "Updates" },
    { path: "app/(tabs)/profile.tsx", name: "Profile" },
    { path: "app/(tabs)/settings.tsx", name: "Settings" },
  ];

  // Feature screens
  const featureScreens = [
    { path: "app/chat/[id].tsx", name: "Chat Room" },
    { path: "app/new-chat.tsx", name: "New Chat" },
    { path: "app/create-group.tsx", name: "Create Group" },
    { path: "app/contacts.tsx", name: "Contacts" },
    { path: "app/edit-profile.tsx", name: "Edit Profile" },
  ];

  // Settings screens
  const settingsScreens = [
    { path: "app/account-settings.tsx", name: "Account Settings" },
    { path: "app/privacy-settings.tsx", name: "Privacy Settings" },
    { path: "app/notifications-settings.tsx", name: "Notification Settings" },
    { path: "app/theme-settings.tsx", name: "Theme Settings" },
    { path: "app/help-support.tsx", name: "Help & Support" },
  ];

  const allScreens = [
    ...mainScreens,
    ...authScreens,
    ...tabScreens,
    ...featureScreens,
    ...settingsScreens,
  ];

  console.log("📊 SCREEN INVENTORY:");
  let existingScreens = 0;
  let missingScreens = 0;

  allScreens.forEach((screen) => {
    const analysis = analyzeScreen(screen.path, screen.name);
    if (analysis) {
      console.log(`✅ ${screen.name}: ${screen.path}`);
      uiAnalysis.screens.push(analysis);
      existingScreens++;
    } else {
      console.log(`❌ ${screen.name}: ${screen.path} (MISSING)`);
      missingScreens++;
    }
  });

  console.log(
    `\n📊 Screen Summary: ${existingScreens} existing, ${missingScreens} missing`,
  );
  return { existingScreens, missingScreens };
}

function analyzeComponents() {
  console.log("\n🧩 COMPONENT ANALYSIS:");
  console.log("-".repeat(50));

  const componentDir = "src/components";
  if (!fs.existsSync(componentDir)) {
    console.log("❌ Components directory not found");
    return;
  }

  const componentFiles = fs
    .readdirSync(componentDir)
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

  console.log("📦 AVAILABLE COMPONENTS:");
  componentFiles.forEach((file) => {
    const componentPath = path.join(componentDir, file);
    const content = fs.readFileSync(componentPath, "utf8");
    const componentName = file.replace(/\.(tsx|ts)$/, "");

    console.log(`✅ ${componentName}: ${componentPath}`);

    uiAnalysis.components.push({
      name: componentName,
      path: componentPath,
      isReusable:
        content.includes("export default") || content.includes("export const"),
      hasProps: content.includes("props") || content.includes("interface"),
      hasStyles: content.includes("StyleSheet") || content.includes("style="),
      lineCount: content.split("\n").length,
    });
  });

  console.log(
    `\n📊 Component Summary: ${componentFiles.length} components found`,
  );
}

function analyzeNavigation() {
  console.log("\n🧭 NAVIGATION ANALYSIS:");
  console.log("-".repeat(50));

  // Check tab layout
  const tabLayoutPath = "app/(tabs)/_layout.tsx";
  if (fs.existsSync(tabLayoutPath)) {
    const content = fs.readFileSync(tabLayoutPath, "utf8");
    console.log("✅ Tab Navigation: Configured");

    // Extract tab names
    const tabMatches = content.match(/name="([^"]+)"/g);
    if (tabMatches) {
      console.log("📱 Available Tabs:");
      tabMatches.forEach((match) => {
        const tabName = match.replace(/name="|"/g, "");
        console.log(`  - ${tabName}`);
      });
    }
  } else {
    console.log("❌ Tab Navigation: Not configured");
    uiAnalysis.issues.push("Tab navigation layout missing");
  }

  // Check stack navigation
  const rootLayoutPath = "app/_layout.tsx";
  if (fs.existsSync(rootLayoutPath)) {
    const content = fs.readFileSync(rootLayoutPath, "utf8");
    console.log("✅ Stack Navigation: Configured");

    if (content.includes("Stack")) {
      console.log("  - Uses Expo Router Stack");
    }
  } else {
    console.log("❌ Stack Navigation: Not configured");
    uiAnalysis.issues.push("Root navigation layout missing");
  }
}

function analyzeResponsiveDesign() {
  console.log("\n📱 RESPONSIVE DESIGN ANALYSIS:");
  console.log("-".repeat(50));

  const responsiveUtilsPath = "src/utils/responsive.ts";
  if (fs.existsSync(responsiveUtilsPath)) {
    const content = fs.readFileSync(responsiveUtilsPath, "utf8");
    console.log("✅ Responsive Utils: Available");

    // Check for responsive functions
    const responsiveFunctions = [
      "isVerySmallDevice",
      "isSmallDevice",
      "isCompactDevice",
      "fontSizes",
      "inputSizes",
    ];

    responsiveFunctions.forEach((func) => {
      if (content.includes(func)) {
        console.log(`  ✅ ${func}: Implemented`);
      } else {
        console.log(`  ❌ ${func}: Missing`);
      }
    });
  } else {
    console.log("❌ Responsive Utils: Not found");
    uiAnalysis.issues.push("Responsive design utilities missing");
  }

  // Check responsive usage in screens
  let responsiveScreens = 0;
  uiAnalysis.screens.forEach((screen) => {
    if (screen.hasResponsive) {
      responsiveScreens++;
    }
  });

  console.log(
    `📊 Responsive Implementation: ${responsiveScreens}/${uiAnalysis.screens.length} screens`,
  );
}

function analyzeAccessibility() {
  console.log("\n♿ ACCESSIBILITY ANALYSIS:");
  console.log("-".repeat(50));

  let accessibleScreens = 0;
  uiAnalysis.screens.forEach((screen) => {
    if (screen.hasAccessibility) {
      accessibleScreens++;
      console.log(`✅ ${screen.name}: Has accessibility features`);
    } else {
      console.log(`❌ ${screen.name}: Missing accessibility features`);
      uiAnalysis.issues.push(`${screen.name} lacks accessibility labels`);
    }
  });

  console.log(
    `📊 Accessibility Coverage: ${accessibleScreens}/${uiAnalysis.screens.length} screens`,
  );

  if (accessibleScreens < uiAnalysis.screens.length) {
    uiAnalysis.recommendations.push(
      "Add accessibility labels to all interactive elements",
    );
  }
}

function analyzeUserExperience() {
  console.log("\n👤 USER EXPERIENCE ANALYSIS:");
  console.log("-".repeat(50));

  // Check for loading states
  let screensWithLoading = 0;
  uiAnalysis.screens.forEach((screen) => {
    if (screen.hasLoading) {
      screensWithLoading++;
    }
  });

  console.log(
    `⏳ Loading States: ${screensWithLoading}/${uiAnalysis.screens.length} screens`,
  );

  // Check for error handling
  let screensWithErrorHandling = 0;
  uiAnalysis.screens.forEach((screen) => {
    if (screen.hasErrorHandling) {
      screensWithErrorHandling++;
    }
  });

  console.log(
    `🛡️ Error Handling: ${screensWithErrorHandling}/${uiAnalysis.screens.length} screens`,
  );

  // UX Recommendations
  if (screensWithLoading < uiAnalysis.screens.length * 0.8) {
    uiAnalysis.recommendations.push(
      "Add loading states to more screens for better UX",
    );
  }

  if (screensWithErrorHandling < uiAnalysis.screens.length * 0.8) {
    uiAnalysis.recommendations.push("Implement error handling in more screens");
  }
}

function generateUIUXReport() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 UI/UX ANALYSIS REPORT");
  console.log("=".repeat(60));

  console.log(`\n📱 SCREEN OVERVIEW:`);
  console.log(`Total Screens: ${uiAnalysis.screens.length}`);
  console.log(`Components: ${uiAnalysis.components.length}`);
  console.log(`Issues Found: ${uiAnalysis.issues.length}`);
  console.log(`Recommendations: ${uiAnalysis.recommendations.length}`);

  if (uiAnalysis.issues.length > 0) {
    console.log("\n❌ IDENTIFIED ISSUES:");
    uiAnalysis.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  if (uiAnalysis.recommendations.length > 0) {
    console.log("\n💡 RECOMMENDATIONS:");
    uiAnalysis.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  console.log("\n🎯 UI/UX QUALITY SCORE:");
  const totalChecks = 10;
  const passedChecks = totalChecks - uiAnalysis.issues.length;
  const qualityScore = Math.round((passedChecks / totalChecks) * 100);

  console.log(`📊 Overall Score: ${qualityScore}%`);

  if (qualityScore >= 90) {
    console.log("🎉 EXCELLENT UI/UX - Ready for publication!");
  } else if (qualityScore >= 75) {
    console.log("✅ GOOD UI/UX - Minor improvements recommended");
  } else if (qualityScore >= 60) {
    console.log("⚠️ FAIR UI/UX - Several improvements needed");
  } else {
    console.log("🔧 NEEDS WORK - Significant UI/UX improvements required");
  }

  console.log("\n🎨 UI/UX Analysis Complete!");
}

// Run the comprehensive UI/UX analysis
async function runUIUXAnalysis() {
  try {
    analyzeAppStructure();
    analyzeComponents();
    analyzeNavigation();
    analyzeResponsiveDesign();
    analyzeAccessibility();
    analyzeUserExperience();
    generateUIUXReport();
  } catch (error) {
    console.error("❌ UI/UX analysis failed:", error.message);
  }
}

runUIUXAnalysis().catch(console.error);
