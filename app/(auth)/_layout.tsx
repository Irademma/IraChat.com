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
        name="index"
        options={{
          title: 'Authentication',
          headerShown: false
        }}
      />
    </Stack>
  );
}