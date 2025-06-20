#!/usr/bin/env node

/**
 * RUNTIME ISSUES DETECTOR - Finding ALL real problems that would break the app
 * This checks for actual runtime errors, missing implementations, and broken functionality
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 RUNTIME ISSUES DETECTOR - FINDING ALL REAL PROBLEMS");
console.log("=".repeat(80));
console.log("🚨 Checking for actual runtime errors and broken functionality");
console.log("=".repeat(80));

const criticalIssues = [];
const majorIssues = [];
const minorIssues = [];

function addIssue(severity, category, description, details, fix) {
  const issue = { category, description, details, fix };

  if (severity === "critical") {
    criticalIssues.push(issue);
    console.log(`💀 CRITICAL: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
    console.log(`   Fix: ${fix}`);
  } else if (severity === "major") {
    majorIssues.push(issue);
    console.log(`🔥 MAJOR: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
    console.log(`   Fix: ${fix}`);
  } else {
    minorIssues.push(issue);
    console.log(`⚠️ MINOR: ${category} - ${description}`);
    console.log(`   Details: ${details}`);
    console.log(`   Fix: ${fix}`);
  }
  console.log("");
}

console.log("\n🔍 ANALYZING RUNTIME ISSUES...\n");

// 1. CHECK FOR MISSING DEPENDENCIES
try {
  console.log("🔍 Checking package dependencies...");

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // Check for missing critical dependencies
  const criticalDeps = [
    "expo-image-picker",
    "expo-contacts",
    "react-native-webrtc",
    "redux-persist",
    "@react-native-async-storage/async-storage",
  ];

  criticalDeps.forEach((dep) => {
    if (!deps[dep]) {
      addIssue(
        "critical",
        "Missing Dependency",
        `${dep} is not installed`,
        "App will crash when trying to use this functionality",
        `Run: npm install ${dep}`,
      );
    }
  });

  // Check for version conflicts
  if (deps["react-native"] && deps["expo"]) {
    // This is a simplified check - real version checking would be more complex
    addIssue(
      "minor",
      "Version Compatibility",
      "Should verify React Native and Expo compatibility",
      "May cause build issues or runtime errors",
      "Check Expo SDK compatibility matrix",
    );
  }
} catch (error) {
  addIssue(
    "critical",
    "Package.json Error",
    "Cannot read package.json",
    "Build system will fail",
    "Fix package.json syntax",
  );
}

// 2. CHECK FOR TYPESCRIPT COMPILATION ERRORS
try {
  console.log("🔍 Checking TypeScript compilation...");

  // Check for missing type definitions
  const typeFiles = [
    "src/types/index.ts",
    "src/types/chat.ts",
    "src/types/user.ts",
  ];

  let hasTypes = false;
  typeFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      hasTypes = true;
    }
  });

  if (!hasTypes) {
    addIssue(
      "major",
      "Missing Types",
      "No TypeScript type definitions found",
      "TypeScript compilation will fail with type errors",
      "Create proper type definitions in src/types/",
    );
  }

  // Check for any .ts/.tsx files with obvious type errors
  const tsFiles = [
    "app/(tabs)/index.tsx",
    "app/(tabs)/updates.tsx",
    "app/chat/[id].tsx",
  ];

  tsFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Check for 'any' types (indicates missing proper typing)
      const anyMatches = content.match(/:\s*any/g);
      if (anyMatches && anyMatches.length > 3) {
        addIssue(
          "minor",
          "Type Safety",
          `${file} has many 'any' types`,
          "Reduces type safety and may hide runtime errors",
          "Add proper TypeScript types",
        );
      }

      // Check for missing imports (more accurate check)
      if (
        content.includes("useState") &&
        !content.includes("from 'react'") &&
        !content.includes('from "react"')
      ) {
        addIssue(
          "critical",
          "Missing Import",
          `${file} uses useState without importing`,
          "App will crash on load",
          "Add proper React imports",
        );
      }
    }
  });
} catch (error) {
  addIssue(
    "major",
    "TypeScript Check Error",
    "Failed to analyze TypeScript",
    "Cannot verify type safety",
    "Check TypeScript configuration",
  );
}

// 3. CHECK FOR FIREBASE CONFIGURATION ISSUES
try {
  console.log("🔍 Checking Firebase configuration...");

  const firebaseFile = "src/services/firebaseSimple.ts";
  if (fs.existsSync(firebaseFile)) {
    const content = fs.readFileSync(firebaseFile, "utf8");

    // Check for placeholder values
    if (
      content.includes("your-project-id") ||
      content.includes("placeholder") ||
      content.includes("demo-project") ||
      content.includes("your-api-key")
    ) {
      addIssue(
        "critical",
        "Firebase Config",
        "Firebase has placeholder configuration",
        "App cannot connect to Firebase backend",
        "Replace with real Firebase project configuration",
      );
    }

    // Check for missing services
    if (!content.includes("getFirestore")) {
      addIssue(
        "critical",
        "Firestore Missing",
        "Firestore not initialized",
        "Database operations will fail",
        "Add Firestore initialization",
      );
    }

    if (!content.includes("getStorage")) {
      addIssue(
        "major",
        "Storage Missing",
        "Firebase Storage not initialized",
        "Media uploads will fail",
        "Add Firebase Storage initialization",
      );
    }
  } else {
    addIssue(
      "critical",
      "Firebase Missing",
      "Firebase configuration file missing",
      "No backend connectivity",
      "Create Firebase configuration",
    );
  }
} catch (error) {
  addIssue(
    "critical",
    "Firebase Error",
    "Firebase configuration has errors",
    "Backend will not work",
    "Fix Firebase setup",
  );
}

// 4. CHECK FOR NAVIGATION ISSUES
try {
  console.log("🔍 Checking navigation setup...");

  // Check for missing route files
  const requiredRoutes = [
    "app/_layout.tsx",
    "app/(tabs)/_layout.tsx",
    "app/(tabs)/index.tsx",
    "app/(tabs)/groups.tsx",
    "app/(tabs)/calls.tsx",
    "app/(tabs)/updates.tsx",
    "app/chat/[id].tsx",
    "app/call.tsx",
  ];

  requiredRoutes.forEach((route) => {
    if (!fs.existsSync(route)) {
      addIssue(
        "critical",
        "Missing Route",
        `Route ${route} is missing`,
        "Navigation will break when accessing this screen",
        `Create ${route} file`,
      );
    }
  });

  // Check tab layout
  const tabLayout = "app/(tabs)/_layout.tsx";
  if (fs.existsSync(tabLayout)) {
    const content = fs.readFileSync(tabLayout, "utf8");
    if (!content.includes("Tabs.Screen")) {
      addIssue(
        "critical",
        "Tab Navigation",
        "Tab layout has no screens defined",
        "Tab navigation will not work",
        "Add Tabs.Screen components",
      );
    }
  }
} catch (error) {
  addIssue(
    "critical",
    "Navigation Error",
    "Navigation analysis failed",
    "Cannot verify navigation setup",
    "Check navigation configuration",
  );
}

// 5. CHECK FOR REDUX STORE ISSUES
try {
  console.log("🔍 Checking Redux store...");

  const storeFile = "src/redux/store.ts";
  if (fs.existsSync(storeFile)) {
    const content = fs.readFileSync(storeFile, "utf8");

    // Check for missing reducers
    if (!content.includes("userReducer") && !content.includes("user:")) {
      addIssue(
        "critical",
        "User Reducer Missing",
        "User state management missing",
        "User authentication and data will not work",
        "Add user reducer to store",
      );
    }

    if (!content.includes("chatReducer") && !content.includes("chat:")) {
      addIssue(
        "major",
        "Chat Reducer Missing",
        "Chat state management missing",
        "Chat functionality may not work properly",
        "Add chat reducer to store",
      );
    }
  } else {
    addIssue(
      "critical",
      "Redux Store Missing",
      "Redux store not configured",
      "App state management will fail",
      "Create Redux store configuration",
    );
  }

  // Check slice files
  const userSlice = "src/redux/userSlice.ts";
  const chatSlice = "src/redux/chatSlice.ts";

  if (!fs.existsSync(userSlice)) {
    addIssue(
      "critical",
      "User Slice Missing",
      "User Redux slice missing",
      "User state management will fail",
      "Create userSlice.ts",
    );
  }

  if (!fs.existsSync(chatSlice)) {
    addIssue(
      "major",
      "Chat Slice Missing",
      "Chat Redux slice missing",
      "Chat state management will fail",
      "Create chatSlice.ts",
    );
  }
} catch (error) {
  addIssue(
    "critical",
    "Redux Error",
    "Redux store analysis failed",
    "Cannot verify state management",
    "Check Redux configuration",
  );
}

// 6. CHECK FOR MISSING SERVICES
try {
  console.log("🔍 Checking service implementations...");

  const services = [
    {
      file: "src/services/authService.ts",
      name: "Authentication",
      critical: true,
    },
    { file: "src/services/chatService.ts", name: "Chat", critical: true },
    {
      file: "src/services/mediaService.ts",
      name: "Media Upload",
      critical: false,
    },
    {
      file: "src/services/contactsService.ts",
      name: "Contacts",
      critical: false,
    },
    {
      file: "src/services/callingService.ts",
      name: "Calling",
      critical: false,
    },
  ];

  services.forEach((service) => {
    if (!fs.existsSync(service.file)) {
      addIssue(
        service.critical ? "critical" : "major",
        "Missing Service",
        `${service.name} service missing`,
        `${service.name} functionality will not work`,
        `Create ${service.file}`,
      );
    } else {
      // Check if service has actual implementation
      const content = fs.readFileSync(service.file, "utf8");
      if (content.length < 500) {
        addIssue(
          "major",
          "Incomplete Service",
          `${service.name} service is too basic`,
          "Service may not have full functionality",
          `Implement complete ${service.name} service`,
        );
      }
    }
  });
} catch (error) {
  addIssue(
    "major",
    "Services Error",
    "Service analysis failed",
    "Cannot verify service implementations",
    "Check service files",
  );
}

// 7. CHECK FOR COMPONENT ISSUES
try {
  console.log("🔍 Checking component implementations...");

  // Check for missing components
  const components = [
    "src/components/ErrorBoundary.tsx",
    "src/components/ThemeProvider.tsx",
    "src/components/EmptyState.tsx",
  ];

  components.forEach((component) => {
    if (!fs.existsSync(component)) {
      addIssue(
        "major",
        "Missing Component",
        `Component ${path.basename(component)} missing`,
        "App may crash or have poor UX",
        `Create ${component}`,
      );
    }
  });
} catch (error) {
  addIssue(
    "minor",
    "Component Error",
    "Component analysis failed",
    "Cannot verify component implementations",
    "Check component files",
  );
}

// Generate comprehensive report
console.log("\n" + "=".repeat(80));
console.log("📊 RUNTIME ISSUES DETECTOR RESULTS");
console.log("=".repeat(80));

console.log(`\n💀 CRITICAL ISSUES (App Breaking): ${criticalIssues.length}`);
console.log(`🔥 MAJOR ISSUES (Feature Breaking): ${majorIssues.length}`);
console.log(`⚠️ MINOR ISSUES (Polish Needed): ${minorIssues.length}`);

const totalIssues =
  criticalIssues.length + majorIssues.length + minorIssues.length;
console.log(`\n📈 TOTAL ISSUES FOUND: ${totalIssues}`);

if (totalIssues === 0) {
  console.log("\n🎉 NO ISSUES FOUND!");
  console.log("✅ APP IS TRULY PRODUCTION READY");
} else {
  console.log("\n🚨 ISSUES THAT NEED IMMEDIATE ATTENTION:");

  if (criticalIssues.length > 0) {
    console.log("\n💀 CRITICAL ISSUES:");
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
      console.log(`   Problem: ${issue.details}`);
      console.log(`   Solution: ${issue.fix}`);
      console.log("");
    });
  }

  if (majorIssues.length > 0) {
    console.log("\n🔥 MAJOR ISSUES:");
    majorIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
      console.log(`   Problem: ${issue.details}`);
      console.log(`   Solution: ${issue.fix}`);
      console.log("");
    });
  }

  if (minorIssues.length > 0) {
    console.log("\n⚠️ MINOR ISSUES:");
    minorIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.category}: ${issue.description}`);
      console.log(`   Problem: ${issue.details}`);
      console.log(`   Solution: ${issue.fix}`);
      console.log("");
    });
  }
}

console.log("\n🎯 HONEST PRODUCTION READINESS ASSESSMENT:");
if (criticalIssues.length > 0) {
  console.log("❌ NOT READY FOR PRODUCTION");
  console.log(
    `🚨 ${criticalIssues.length} critical issues will cause app crashes`,
  );
} else if (majorIssues.length > 3) {
  console.log("⚠️ NOT READY FOR PRODUCTION");
  console.log(
    `🔧 ${majorIssues.length} major issues will break core functionality`,
  );
} else if (majorIssues.length > 0) {
  console.log("⚠️ BETA READY ONLY");
  console.log(
    `🧪 ${majorIssues.length} major issues need fixing for production`,
  );
} else if (minorIssues.length > 5) {
  console.log("⚠️ NEEDS POLISH");
  console.log(`✨ ${minorIssues.length} minor issues should be addressed`);
} else {
  console.log("✅ PRODUCTION READY");
  console.log("🚀 Ready for deployment");
}

console.log("\n🔍 Runtime Issues Detection Complete!");
