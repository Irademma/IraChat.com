import { Redirect } from 'expo-router';

export default function Index() {
  console.log('🚀 Index.tsx is being rendered - DIRECT TO WELCOME!');

  // For now, let's directly go to welcome to test
  return <Redirect href="/welcome" />;
}
