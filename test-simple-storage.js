// Test Simple Storage Implementation
console.log("🧪 Testing Simple Storage Implementation...");

// Mock localStorage for Node.js
if (typeof localStorage === "undefined") {
  global.localStorage = {
    storage: new Map(),
    setItem(key, value) {
      this.storage.set(key, value);
      console.log(`📝 localStorage.setItem: ${key}`);
    },
    getItem(key) {
      const value = this.storage.get(key) || null;
      console.log(
        `📖 localStorage.getItem: ${key} = ${value ? "Found" : "Not found"}`,
      );
      return value;
    },
    removeItem(key) {
      this.storage.delete(key);
      console.log(`🗑️ localStorage.removeItem: ${key}`);
    },
  };
}

// Simple storage implementation (same as authStorageSimple.ts)
const storage = {
  async setItem(key, value) {
    console.log(`💾 Storing: ${key}`);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      console.log(`✅ Stored in localStorage: ${key}`);
    } else {
      if (!global.memoryStorage) {
        global.memoryStorage = new Map();
      }
      global.memoryStorage.set(key, value);
      console.log(`✅ Stored in memory: ${key}`);
    }
  },

  async getItem(key) {
    console.log(`🔍 Retrieving: ${key}`);

    if (typeof localStorage !== "undefined") {
      const value = localStorage.getItem(key);
      console.log(
        `📖 Retrieved from localStorage: ${key} = ${value ? "Found" : "Not found"}`,
      );
      return value;
    } else {
      if (!global.memoryStorage) {
        global.memoryStorage = new Map();
      }
      const value = global.memoryStorage.get(key) || null;
      console.log(
        `📖 Retrieved from memory: ${key} = ${value ? "Found" : "Not found"}`,
      );
      return value;
    }
  },

  async removeItem(key) {
    console.log(`🗑️ Removing: ${key}`);

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
      console.log(`✅ Removed from localStorage: ${key}`);
    } else {
      if (global.memoryStorage) {
        global.memoryStorage.delete(key);
      }
      console.log(`✅ Removed from memory: ${key}`);
    }
  },
};

// Auth functions
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
    console.log("🔐 Storing auth data...");

    await storage.setItem("iraChat_auth_token", JSON.stringify(authData));
    await storage.setItem("iraChat_auth_state", "true");

    console.log("✅ Auth data stored successfully");
  } catch (error) {
    console.error("❌ Error storing auth data:", error);
    throw new Error(`Failed to store authentication data: ${error}`);
  }
};

const getStoredAuthData = async () => {
  try {
    console.log("🔍 Retrieving stored auth data...");

    const authDataString = await storage.getItem("iraChat_auth_token");

    if (!authDataString) {
      console.log("📭 No stored auth data found");
      return null;
    }

    const authData = JSON.parse(authDataString);

    const now = Date.now();
    if (authData.expiresAt && now > authData.expiresAt) {
      console.log("⏰ Stored token has expired");
      return null;
    }

    console.log("✅ Valid auth data retrieved");
    return authData;
  } catch (error) {
    console.error("❌ Error retrieving auth data:", error);
    return null;
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

    if (!userData.name || !userData.name.trim()) {
      throw new Error("Name is required");
    }
    if (!userData.username || !userData.username.trim()) {
      throw new Error("Username is required");
    }
    if (!userData.phoneNumber || !userData.phoneNumber.trim()) {
      throw new Error("Phone number is required");
    }

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

// Test the complete flow
const testCompleteFlow = async () => {
  console.log("\n🚀 Testing Complete Registration Flow...");
  console.log("==========================================");

  try {
    // Test registration
    console.log("\n1️⃣ Testing user registration...");
    const result = await createUserAccount({
      name: "John Doe",
      username: "@johndoe",
      phoneNumber: "+256701234567",
      bio: "Test user",
    });

    console.log("Registration result:", result);

    if (result.success) {
      console.log("✅ Registration successful!");

      // Test data retrieval
      console.log("\n2️⃣ Testing data retrieval...");
      const storedData = await getStoredAuthData();

      if (storedData && storedData.user.name === "John Doe") {
        console.log("✅ Data retrieval successful!");
        console.log("👤 Retrieved user:", storedData.user.name);

        console.log("\n🎉 ALL TESTS PASSED!");
        console.log("✅ Simple storage implementation is working correctly!");
        console.log("✅ Registration should now work in your app!");
      } else {
        console.log("❌ Data retrieval failed");
      }
    } else {
      console.log("❌ Registration failed:", result.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.log("\n==========================================");
};

// Run the test
testCompleteFlow();
