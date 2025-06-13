import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Add accessibility for navigation
        presentation: 'modal'
      }}
    >

      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Register',
          headerShown: false
        }}
      />
    </Stack>
  );
}