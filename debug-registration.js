// Debug Registration Process
console.log("🔍 Debugging Registration Process...");

// Mock the storage for testing
const mockStorage = new Map();

const storage = {
  async setItem(key, value) {
    mockStorage.set(key, value);
    console.log(`✅ Stored: ${key}`);
  },

  async getItem(key) {
    const value = mockStorage.get(key);
    console.log(`📖 Retrieved: ${key} = ${value ? "Found" : "Not found"}`);
    return value || null;
  },

  async removeItem(key) {
    const deleted = mockStorage.delete(key);
    console.log(`🗑️ Deleted: ${key} = ${deleted ? "Success" : "Not found"}`);
  },
};

// Mock auth functions
const createAuthData = (user, token) => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  return {
    token: token || `mock_token_${user.id}_${now}`,
    expiresAt: now + oneWeek,
    user: user,
  };
};

const storeAuthData = async (authData) => {
  try {
    console.log("🔐 Storing auth data securely...");
    await storage.setItem("iraChat_auth_token", JSON.stringify(authData));
    await storage.setItem("iraChat_auth_state", "true");
    console.log("✅ Auth data stored successfully");
  } catch (error) {
    console.error("❌ Error storing auth data:", error);
    throw new Error(`Failed to store authentication data: ${error}`);
  }
};

const createUserAccount = async (userData) => {
  try {
    console.log("🚀 Creating new user account...");
    console.log("📝 User data:", {
      name: userData.name,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
    });

    // Validate input data
    if (!userData.name || !userData.name.trim()) {
      throw new Error("Name is required");
    }
    if (!userData.username || !userData.username.trim()) {
      throw new Error("Username is required");
    }
    if (!userData.phoneNumber || !userData.phoneNumber.trim()) {
      throw new Error("Phone number is required");
    }

    // Create user object
    const newUser = {
      id: `user_${Date.now()}`,
      phoneNumber: userData.phoneNumber,
      displayName: userData.name.trim(),
      name: userData.name.trim(),
      username: userData.username.trim(),
      avatar:
        userData.avatar || `https://i.pravatar.cc/150?u=${userData.username}`,
      status: userData.bio?.trim() || "I Love IraChat",
      bio: userData.bio?.trim() || "I Love IraChat",
      isOnline: true,
    };

    console.log("👤 Created user object:", newUser);

    // Store auth data securely
    console.log("💾 Storing auth data...");
    const authData = createAuthData(newUser);
    await storeAuthData(authData);

    console.log("✅ User account created successfully");

    return {
      success: true,
      message: "Account created successfully!",
      user: newUser,
    };
  } catch (error) {
    console.error("❌ Error creating user account:", error);
    console.error("❌ Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }
};

// Test the registration process
const testRegistration = async () => {
  console.log("\n🧪 Testing Registration Process...");
  console.log("=====================================");

  // Test 1: Valid registration
  console.log("\n1️⃣ Testing valid registration...");
  const validUserData = {
    name: "John Doe",
    username: "@johndoe",
    phoneNumber: "+256701234567",
    bio: "Test user",
    avatar: "",
  };

  const result1 = await createUserAccount(validUserData);
  console.log("Result:", result1);

  // Test 2: Missing name
  console.log("\n2️⃣ Testing missing name...");
  const invalidUserData1 = {
    name: "",
    username: "@testuser",
    phoneNumber: "+256701234567",
    bio: "Test user",
  };

  const result2 = await createUserAccount(invalidUserData1);
  console.log("Result:", result2);

  // Test 3: Missing username
  console.log("\n3️⃣ Testing missing username...");
  const invalidUserData2 = {
    name: "Test User",
    username: "",
    phoneNumber: "+256701234567",
    bio: "Test user",
  };

  const result3 = await createUserAccount(invalidUserData2);
  console.log("Result:", result3);

  // Test 4: Missing phone number
  console.log("\n4️⃣ Testing missing phone number...");
  const invalidUserData3 = {
    name: "Test User",
    username: "@testuser",
    phoneNumber: "",
    bio: "Test user",
  };

  const result4 = await createUserAccount(invalidUserData3);
  console.log("Result:", result4);

  console.log("\n=====================================");
  console.log("🎯 Registration testing complete!");
};

// Run the test
testRegistration().catch((error) => {
  console.error("❌ Test failed:", error);
});
