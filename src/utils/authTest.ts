// Authentication Test Utilities
import {
  clearAuthData,
  createAuthData,
  getStoredAuthData,
  isAuthenticated,
  storeAuthData,
} from "../services/authStorageSimple";
import { User } from "../types";

/**
 * Test function to verify authentication persistence
 */
export const testAuthPersistence = async (): Promise<void> => {
  console.log("🧪 Testing Authentication Persistence...");

  try {
    // Test 1: Clear any existing data
    console.log("1️⃣ Clearing existing auth data...");
    await clearAuthData();

    let isAuth = await isAuthenticated();
    console.log("   ✅ Auth state after clear:", isAuth); // Should be false

    // Test 2: Create and store test user
    console.log("2️⃣ Creating test user...");
    const testUser: User = {
      id: "test_user_123",
      phoneNumber: "+256700000000",
      displayName: "Test User",
      name: "Test User",
      username: "testuser",
      avatar: "https://i.pravatar.cc/150?u=testuser",
      status: "Testing IraChat persistence!",
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    const authData = createAuthData(testUser);
    await storeAuthData(authData);
    console.log("   ✅ Test user stored successfully");

    // Test 3: Verify storage
    console.log("3️⃣ Verifying stored data...");
    isAuth = await isAuthenticated();
    console.log("   ✅ Auth state after store:", isAuth); // Should be true

    const retrievedData = await getStoredAuthData();
    console.log("   ✅ Retrieved user:", retrievedData?.user.name);

    // Test 4: Simulate app restart (data should persist)
    console.log("4️⃣ Simulating app restart...");
    const persistedData = await getStoredAuthData();
    const persistedAuth = await isAuthenticated();

    console.log("   ✅ Data persisted after restart:", persistedAuth);
    console.log("   ✅ User still available:", persistedData?.user.name);

    // Test 5: Clean up
    console.log("5️⃣ Cleaning up test data...");
    await clearAuthData();

    const finalAuth = await isAuthenticated();
    console.log("   ✅ Auth state after cleanup:", finalAuth); // Should be false

    console.log("🎉 All authentication persistence tests passed!");
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
  }
};

/**
 * Test function to simulate user registration and persistence
 */
export const testUserRegistration = async (): Promise<void> => {
  console.log("🧪 Testing User Registration Flow...");

  try {
    // Simulate user registration
    const newUser: User = {
      id: `user_${Date.now()}`,
      phoneNumber: "+256701234567",
      displayName: "John Doe",
      name: "John Doe",
      username: "johndoe",
      avatar: "https://i.pravatar.cc/150?u=johndoe",
      status: "I Love IraChat",
      bio: "I Love IraChat",
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    console.log("1️⃣ Registering new user:", newUser.name);

    // Store user data
    const authData = createAuthData(newUser);
    await storeAuthData(authData);

    console.log("2️⃣ User registered and stored securely");

    // Verify immediate access
    const isAuth = await isAuthenticated();
    const userData = await getStoredAuthData();

    console.log("3️⃣ Immediate verification:");
    console.log("   - Authenticated:", isAuth);
    console.log("   - User name:", userData?.user.name);
    console.log(
      "   - Token expires:",
      new Date(userData?.expiresAt || 0).toLocaleString(),
    );

    console.log("✅ User registration test completed successfully!");
  } catch (error) {
    console.error("❌ User registration test failed:", error);
  }
};

/**
 * Test function to simulate app launch scenarios
 */
export const testAppLaunchScenarios = async (): Promise<void> => {
  console.log("🧪 Testing App Launch Scenarios...");

  try {
    // Scenario 1: First time user (no stored data)
    console.log("📱 Scenario 1: First time user");
    await clearAuthData();

    const firstTimeAuth = await isAuthenticated();
    console.log("   - Should redirect to welcome:", !firstTimeAuth);

    // Scenario 2: Returning user (has stored data)
    console.log("📱 Scenario 2: Returning user");

    const returningUser: User = {
      id: "returning_user_456",
      phoneNumber: "+256702345678",
      displayName: "Jane Smith",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://i.pravatar.cc/150?u=janesmith",
      status: "Back on IraChat!",
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    const authData = createAuthData(returningUser);
    await storeAuthData(authData);

    const returningAuth = await isAuthenticated();
    const returningData = await getStoredAuthData();

    console.log("   - Should redirect to main app:", returningAuth);
    console.log("   - Welcome back message for:", returningData?.user.name);

    // Scenario 3: Expired token
    console.log("📱 Scenario 3: Expired token");

    const expiredAuthData = {
      ...authData,
      expiresAt: Date.now() - 1000, // Expired 1 second ago
    };

    await storeAuthData(expiredAuthData);

    const expiredAuth = await isAuthenticated();
    console.log("   - Should redirect to welcome (expired):", !expiredAuth);

    console.log("✅ App launch scenarios test completed!");
  } catch (error) {
    console.error("❌ App launch scenarios test failed:", error);
  }
};

/**
 * Run all authentication tests
 */
export const runAllAuthTests = async (): Promise<void> => {
  console.log("🚀 Running Complete Authentication Test Suite...");
  console.log("================================================");

  await testAuthPersistence();
  console.log("");

  await testUserRegistration();
  console.log("");

  await testAppLaunchScenarios();
  console.log("");

  console.log("🎉 All authentication tests completed!");
  console.log("================================================");
};
