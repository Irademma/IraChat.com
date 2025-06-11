// Authentication Testing Screen
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createUserAccount, getCurrentUser, signOutUser } from './src/services/authService';
import {
    clearAuthData,
    createAuthData,
    getStoredAuthData,
    isAuthenticated,
    storeAuthData
} from './src/services/authStorageSimple';
import {
    testAppLaunchScenarios,
    testAuthPersistence,
    testUserRegistration
} from './src/utils/authTest';

export default function AuthTestScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setIsRunning(true);
    addResult(`\n🧪 Starting ${testName}...`);
    
    try {
      await testFunction();
      addResult(`✅ ${testName} PASSED`);
    } catch (error) {
      addResult(`❌ ${testName} FAILED: ${error}`);
    }
    
    setIsRunning(false);
  };

  const testBasicStorage = async () => {
    // Test basic storage functionality
    await clearAuthData();
    
    const testUser = {
      id: 'test_123',
      phoneNumber: '+256700000000',
      displayName: 'Test User',
      name: 'Test User',
      username: 'testuser',
      avatar: 'https://i.pravatar.cc/150?u=test',
      status: 'Testing!',
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    const authData = createAuthData(testUser);
    await storeAuthData(authData);
    
    const retrieved = await getStoredAuthData();
    const isAuth = await isAuthenticated();
    
    if (!retrieved || !isAuth || retrieved.user.name !== 'Test User') {
      throw new Error('Storage test failed');
    }
    
    await clearAuthData();
    const clearedAuth = await isAuthenticated();
    
    if (clearedAuth) {
      throw new Error('Clear test failed');
    }
  };

  const testUserCreation = async () => {
    const result = await createUserAccount({
      name: 'John Doe',
      username: '@johndoe',
      phoneNumber: '+256701234567',
      bio: 'Test user',
      avatar: 'https://i.pravatar.cc/150?u=john'
    });

    if (!result.success || !result.user) {
      throw new Error(`User creation failed: ${result.message}`);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.name !== 'John Doe') {
      throw new Error('User retrieval failed');
    }

    await signOutUser();
  };

  const testTokenExpiration = async () => {
    const testUser = {
      id: 'expired_test',
      phoneNumber: '+256700000001',
      displayName: 'Expired User',
      name: 'Expired User',
      username: 'expireduser',
      avatar: 'https://i.pravatar.cc/150?u=expired',
      status: 'Will expire',
      isOnline: true,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    };

    // Create expired token (1 second ago)
    const expiredAuthData = {
      token: 'expired_token_123',
      expiresAt: Date.now() - 1000,
      user: testUser
    };

    await storeAuthData(expiredAuthData);
    
    // Should return false for expired token
    const isAuth = await isAuthenticated();
    if (isAuth) {
      throw new Error('Expired token was not handled correctly');
    }
  };

  const testAppFlow = async () => {
    // Simulate complete app flow
    await clearAuthData();
    
    // 1. First launch - should not be authenticated
    let isAuth = await isAuthenticated();
    if (isAuth) {
      throw new Error('Fresh install should not be authenticated');
    }

    // 2. User registers
    const result = await createUserAccount({
      name: 'Flow Test User',
      username: '@flowtest',
      phoneNumber: '+256701111111',
      bio: 'Testing app flow'
    });

    if (!result.success) {
      throw new Error('Registration failed in flow test');
    }

    // 3. Should now be authenticated
    isAuth = await isAuthenticated();
    if (!isAuth) {
      throw new Error('Should be authenticated after registration');
    }

    // 4. Simulate app restart - should still be authenticated
    const user = await getCurrentUser();
    if (!user || user.name !== 'Flow Test User') {
      throw new Error('User not persisted after restart simulation');
    }

    // 5. User logs out
    await signOutUser();

    // 6. Should not be authenticated after logout
    isAuth = await isAuthenticated();
    if (isAuth) {
      throw new Error('Should not be authenticated after logout');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    addResult('🚀 Starting Complete Authentication Test Suite');
    addResult('================================================');

    const tests = [
      { name: 'Basic Storage', func: testBasicStorage },
      { name: 'User Creation', func: testUserCreation },
      { name: 'Token Expiration', func: testTokenExpiration },
      { name: 'Complete App Flow', func: testAppFlow },
      { name: 'Persistence Tests', func: testAuthPersistence },
      { name: 'Registration Tests', func: testUserRegistration },
      { name: 'Launch Scenarios', func: testAppLaunchScenarios }
    ];

    for (const test of tests) {
      try {
        addResult(`\n🧪 Running ${test.name}...`);
        await test.func();
        addResult(`✅ ${test.name} PASSED`);
      } catch (error) {
        addResult(`❌ ${test.name} FAILED: ${error}`);
      }
    }

    addResult('\n================================================');
    addResult('🎉 Test Suite Complete!');
    setIsRunning(false);
  };

  const showCurrentAuthState = async () => {
    try {
      const isAuth = await isAuthenticated();
      const user = await getCurrentUser();
      const authData = await getStoredAuthData();

      Alert.alert(
        'Current Auth State',
        `Authenticated: ${isAuth}\n` +
        `User: ${user?.name || 'None'}\n` +
        `Token Expires: ${authData?.expiresAt ? new Date(authData.expiresAt).toLocaleString() : 'N/A'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to get auth state: ${error}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🧪 Authentication Tests
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={runAllTests}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9CA3AF' : '#3B82F6',
            padding: 12,
            borderRadius: 8,
            margin: 4,
            flex: 1,
            minWidth: '45%'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showCurrentAuthState}
          style={{
            backgroundColor: '#667eea',
            padding: 12,
            borderRadius: 8,
            margin: 4,
            flex: 1,
            minWidth: '45%'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Check Auth State
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => runTest('Basic Storage', testBasicStorage)}
          disabled={isRunning}
          style={{
            backgroundColor: '#8B5CF6',
            padding: 12,
            borderRadius: 8,
            margin: 4,
            flex: 1,
            minWidth: '45%'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Test Storage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => runTest('App Flow', testAppFlow)}
          disabled={isRunning}
          style={{
            backgroundColor: '#F59E0B',
            padding: 12,
            borderRadius: 8,
            margin: 4,
            flex: 1,
            minWidth: '45%'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Test App Flow
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearResults}
          style={{
            backgroundColor: '#EF4444',
            padding: 12,
            borderRadius: 8,
            margin: 4,
            flex: 1,
            minWidth: '45%'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Clear Results
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ 
          flex: 1, 
          backgroundColor: '#1F2937', 
          borderRadius: 8, 
          padding: 12 
        }}
        showsVerticalScrollIndicator={false}
      >
        {testResults.map((result, index) => (
          <Text 
            key={index} 
            style={{ 
              color: result.includes('❌') ? '#EF4444' :
                     result.includes('✅') ? '#667eea' :
                     result.includes('🧪') ? '#F59E0B' : '#E5E7EB',
              fontFamily: 'monospace',
              fontSize: 12,
              marginBottom: 2
            }}
          >
            {result}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' }}>
            No test results yet. Run some tests to see output here.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
