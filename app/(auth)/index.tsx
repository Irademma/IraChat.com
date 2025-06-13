import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to welcome screen as the default auth route
  return <Redirect href="/(auth)/welcome" />;
}
