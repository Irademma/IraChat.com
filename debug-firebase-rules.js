// Debug script to test Firebase permissions
// Run this in your browser console on Firebase Console page

// Test delete permissions
async function testDeletePermissions() {
  console.log("🔍 Testing Firebase delete permissions...");
  
  try {
    // This will show current rules
    console.log("📋 Current Firestore rules:");
    
    // You can copy-paste this into Firebase Console Rules tab:
    const recommendedRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write/delete chats they participate in
    match /chats/{chatId} {
      allow read, write, delete: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
    }
    
    // Allow users to manage their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Messages within chats
    match /chats/{chatId}/messages/{messageId} {
      allow read, write, delete: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}`;
    
    console.log("📝 Recommended rules:");
    console.log(recommendedRules);
    
    console.log("✅ Copy the rules above and paste them in Firebase Console > Firestore Database > Rules");
    
  } catch (error) {
    console.error("❌ Error testing permissions:", error);
  }
}

// Run the test
testDeletePermissions();
