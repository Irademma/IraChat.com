import { useLocalSearchParams, useRouter } from 'expo-router';
import { GroupChatScreen } from '../../src/screens/GroupChatScreen';
import IndividualChatScreen from '../../src/screens/IndividualChatScreen';

export default function ChatRoomScreen() {
  const { id: chatId, name: chatName, isGroup } = useLocalSearchParams();
  const router = useRouter();
  const isGroupChat = isGroup === 'true';

  // Route to appropriate chat screen based on chat type
  if (isGroupChat) {
    return (
      <GroupChatScreen
        groupId={chatId as string}
        currentUserId="current-user-id" // You'll need to get this from your auth state
        isAdmin={false} // You'll need to determine this from group data
        onBack={() => router.back()}
        navigation={router}
      />
    );
  }

  return (
    <IndividualChatScreen />
  );
}
