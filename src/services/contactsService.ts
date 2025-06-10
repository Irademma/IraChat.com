// Mock contacts service for development
// In production, this would integrate with device contacts and Firebase users

export interface Contact {
  id: string;
  name: string;
  username?: string; // Unique username for search
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
  status?: string;
  lastSeen?: Date;
  bio?: string;
}

// Mock contacts data - simulating phone book contacts who are IraChat users
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    phoneNumber: '+256701234567',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isIraChatUser: true,
    status: 'I Love IraChat',
    bio: 'Software developer from Kampala',
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    phoneNumber: '+256702345678',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isIraChatUser: true,
    status: 'Available',
    bio: 'Teacher and mother of two',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: 'mikej',
    phoneNumber: '+256703456789',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isIraChatUser: true,
    status: 'Busy',
    bio: 'Business consultant',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    username: 'sarahw',
    phoneNumber: '+256704567890',
    avatar: 'https://i.pravatar.cc/150?img=4',
    isIraChatUser: true,
    status: 'At work',
    bio: 'Marketing specialist',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '5',
    name: 'David Brown',
    username: 'davidb',
    phoneNumber: '+256705678901',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isIraChatUser: true,
    status: 'Sleeping',
    bio: 'Night shift worker',
    lastSeen: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: '6',
    name: 'Emma Davis',
    username: 'emmad',
    phoneNumber: '+256706789012',
    avatar: 'https://i.pravatar.cc/150?img=6',
    isIraChatUser: true,
    status: 'In a meeting',
    bio: 'Project manager',
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: '7',
    name: 'Alex Thompson',
    username: 'alextech',
    phoneNumber: '+256707890123',
    avatar: 'https://i.pravatar.cc/150?img=7',
    isIraChatUser: true,
    status: 'Coding...',
    bio: 'Full-stack developer',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    username: 'lisaa',
    phoneNumber: '+256708901234',
    avatar: 'https://i.pravatar.cc/150?img=8',
    isIraChatUser: true,
    status: 'Traveling',
    bio: 'Travel blogger',
    lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: '9',
    name: 'Chris Martin',
    username: 'chrismusic',
    phoneNumber: '+256709012345',
    avatar: 'https://i.pravatar.cc/150?img=9',
    isIraChatUser: true,
    status: 'Playing music',
    bio: 'Musician and producer',
    lastSeen: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
  {
    id: '10',
    name: 'Rachel Green',
    username: 'rachelg',
    phoneNumber: '+256700123456',
    avatar: 'https://i.pravatar.cc/150?img=10',
    isIraChatUser: true,
    status: 'Shopping',
    bio: 'Fashion enthusiast',
    lastSeen: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
  },
];

// Get all contacts who are IraChat users
export const getIraChatContacts = async (): Promise<Contact[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter only IraChat users and sort by name
  return mockContacts
    .filter(contact => contact.isIraChatUser)
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Search contacts by name, username, or phone number
export const searchContacts = async (query: string): Promise<Contact[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const lowercaseQuery = query.toLowerCase();
  return mockContacts
    .filter(contact =>
      contact.isIraChatUser && (
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.username?.toLowerCase().includes(lowercaseQuery) ||
        contact.phoneNumber.includes(query)
      )
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get contact by phone number
export const getContactByPhone = async (phoneNumber: string): Promise<Contact | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockContacts.find(contact => 
    contact.phoneNumber === phoneNumber && contact.isIraChatUser
  ) || null;
};

// Format last seen time
export const formatLastSeen = (lastSeen: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Online';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
};
