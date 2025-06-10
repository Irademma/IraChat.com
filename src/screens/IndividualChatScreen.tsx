import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ChatRoom } from '../components/ChatRoom';
import { auth } from '../services/firebase';

const IndividualChatScreen = () => {
  const params = useLocalSearchParams();

  useEffect(() => {
    // Ensure user is authenticated
    if (!auth.currentUser) {
      console.warn('User not authenticated');
      // You might want to redirect to login here
    }
  }, []);

  // Parse contact data from params
  const contact = {
    id: params.contactId as string,
    name: params.contactName as string,
    avatar: params.contactAvatar as string,
    isOnline: params.contactIsOnline === 'true',
  };

  return (
    <ChatRoom
      chatId={contact.id}
      partnerName={contact.name}
      partnerAvatar={contact.avatar}
      isOnline={contact.isOnline}
      partnerId={contact.id}
    />
  );
};

export default IndividualChatScreen;
