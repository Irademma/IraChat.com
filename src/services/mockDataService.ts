/**
 * Mock Data Service for IraChat Testing
 * 
 * This service provides realistic mock data for testing all pages and features
 * WITHOUT replacing the actual live functionality. It's purely additive for testing.
 */

export interface MockUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
  bio?: string;
}

export interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  isRead: boolean;
  reactions?: { emoji: string; userId: string; userName: string }[];
}

export interface MockChat {
  id: string;
  name?: string;
  participants: string[];
  participantNames: string[];
  lastMessage: MockMessage;
  unreadCount: number;
  isGroup: boolean;
  groupAvatar?: string;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
}

export interface MockGroup {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  memberCount: number;
  members: MockUser[];
  admins: string[];
  createdAt: Date;
  lastActivity: Date;
  isPublic: boolean;
}

export interface MockCall {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  timestamp: Date;
  isGroupCall?: boolean;
  groupName?: string;
}

export interface MockUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  timestamp: Date;
  views: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  duration?: number; // for videos
}

export interface MockContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isIraChatUser: boolean;
  status?: string;
  isBlocked: boolean;
}

export interface MockNotification {
  id: string;
  type: 'message' | 'call' | 'group' | 'update' | 'system';
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  actionData?: any;
}

class MockDataService {
  private static instance: MockDataService;
  
  // Mock data storage
  private mockUsers: MockUser[] = [];
  private mockChats: MockChat[] = [];
  private mockGroups: MockGroup[] = [];
  private mockCalls: MockCall[] = [];
  private mockUpdates: MockUpdate[] = [];
  private mockContacts: MockContact[] = [];
  private mockNotifications: MockNotification[] = [];
  
  private constructor() {
    this.initializeMockData();
  }
  
  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }
  
  private initializeMockData() {
    this.generateMockUsers();
    this.generateMockChats();
    this.generateMockGroups();
    this.generateMockCalls();
    this.generateMockUpdates();
    this.generateMockContacts();
    this.generateMockNotifications();
  }
  
  private generateMockUsers() {
    const names = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
      'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor',
      'Ivy Chen', 'Jack Anderson', 'Kate Williams', 'Liam Garcia',
      'Maya Patel', 'Noah Rodriguez', 'Olivia Martinez', 'Paul Kim'
    ];
    
    const statuses = [
      'I use IraChat', 'Available', 'Busy', 'At work', 'Sleeping',
      'In a meeting', 'Driving', 'At gym', 'Studying', 'Traveling'
    ];
    
    this.mockUsers = names.map((name, index) => ({
      id: `user_${index + 1}`,
      name,
      phone: `+1${(555000000 + index).toString()}`,
      avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
      status: statuses[index % statuses.length],
      isOnline: Math.random() > 0.3,
      lastSeen: new Date(Date.now() - Math.random() * 86400000 * 7), // Random within last week
      bio: `Hello! I'm ${name.split(' ')[0]}. Nice to meet you on IraChat!`
    }));
  }
  
  private generateMockChats() {
    const messageContents = [
      'Hey! How are you doing?',
      'Did you see the latest update?',
      'Let\'s meet up this weekend!',
      'Thanks for your help yesterday',
      'Can you send me that document?',
      'Great job on the presentation!',
      'What time works for you?',
      'I\'ll be there in 10 minutes',
      'Happy birthday! 🎉',
      'Good morning! ☀️'
    ];
    
    this.mockChats = this.mockUsers.slice(0, 10).map((user, index) => {
      const lastMessage: MockMessage = {
        id: `msg_${index}_last`,
        senderId: Math.random() > 0.5 ? user.id : 'current_user',
        senderName: Math.random() > 0.5 ? user.name : 'You',
        content: messageContents[index],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 3), // Random within last 3 days
        type: 'text',
        isRead: Math.random() > 0.3,
        reactions: Math.random() > 0.7 ? [
          { emoji: '👍', userId: user.id, userName: user.name }
        ] : undefined
      };
      
      return {
        id: `chat_${index + 1}`,
        participants: [user.id, 'current_user'],
        participantNames: [user.name, 'You'],
        lastMessage,
        unreadCount: Math.floor(Math.random() * 5),
        isGroup: false,
        isPinned: Math.random() > 0.8,
        isMuted: Math.random() > 0.9,
        isArchived: false
      };
    });
  }
  
  private generateMockGroups() {
    const groupNames = [
      'Family Group', 'Work Team', 'College Friends', 'Gym Buddies',
      'Book Club', 'Travel Planning', 'Study Group', 'Gaming Squad'
    ];
    
    this.mockGroups = groupNames.map((name, index) => {
      const memberCount = 3 + Math.floor(Math.random() * 15);
      const members = this.mockUsers.slice(0, memberCount);
      
      return {
        id: `group_${index + 1}`,
        name,
        description: `Welcome to ${name}! Let's stay connected.`,
        avatar: `https://picsum.photos/150/150?random=${index + 100}`,
        memberCount,
        members,
        admins: [members[0].id],
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random within last month
        lastActivity: new Date(Date.now() - Math.random() * 86400000 * 2), // Random within last 2 days
        isPublic: Math.random() > 0.7
      };
    });
  }
  
  private generateMockCalls() {
    const callTypes: ('voice' | 'video')[] = ['voice', 'video'];
    const directions: ('incoming' | 'outgoing' | 'missed')[] = ['incoming', 'outgoing', 'missed'];
    
    this.mockCalls = this.mockUsers.slice(0, 8).map((user, index) => ({
      id: `call_${index + 1}`,
      participantId: user.id,
      participantName: user.name,
      participantAvatar: user.avatar,
      type: callTypes[Math.floor(Math.random() * callTypes.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
      duration: Math.random() > 0.3 ? Math.floor(Math.random() * 3600) : undefined, // Random duration or missed
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random within last week
      isGroupCall: Math.random() > 0.8,
      groupName: Math.random() > 0.8 ? this.mockGroups[Math.floor(Math.random() * this.mockGroups.length)].name : undefined
    }));
  }
  
  private generateMockUpdates() {
    const captions = [
      'Beautiful sunset today! 🌅',
      'Great day at the beach',
      'Delicious dinner with friends',
      'New haircut, what do you think?',
      'Amazing concert last night!',
      'Weekend vibes ✨',
      'Coffee time ☕',
      'Workout complete! 💪'
    ];
    
    this.mockUpdates = this.mockUsers.slice(0, 8).map((user, index) => ({
      id: `update_${index + 1}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      mediaUrl: `https://picsum.photos/400/600?random=${index + 200}`,
      mediaType: Math.random() > 0.7 ? 'video' : 'image' as 'image' | 'video',
      caption: Math.random() > 0.3 ? captions[index] : undefined,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 1), // Random within last day
      views: Math.floor(Math.random() * 100) + 10,
      likes: Math.floor(Math.random() * 50) + 1,
      comments: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.5,
      duration: Math.random() > 0.7 ? Math.floor(Math.random() * 60) + 10 : undefined // For videos
    }));
  }
  
  private generateMockContacts() {
    this.mockContacts = this.mockUsers.map((user, index) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isIraChatUser: Math.random() > 0.3, // 70% are IraChat users
      status: user.status,
      isBlocked: Math.random() > 0.95 // 5% blocked
    }));
    
    // Add some non-IraChat contacts
    const nonIraChatContacts = [
      'Mom', 'Dad', 'Sister', 'Brother', 'Grandma', 'Uncle John'
    ].map((name, index) => ({
      id: `contact_${index + 100}`,
      name,
      phone: `+1${(555100000 + index).toString()}`,
      isIraChatUser: false,
      isBlocked: false
    }));
    
    this.mockContacts.push(...nonIraChatContacts);
  }
  
  private generateMockNotifications() {
    const notificationTypes = [
      { type: 'message' as const, title: 'New message', body: 'You have a new message from Alice' },
      { type: 'call' as const, title: 'Missed call', body: 'Missed call from Bob Smith' },
      { type: 'group' as const, title: 'Group update', body: 'You were added to Family Group' },
      { type: 'update' as const, title: 'New update', body: 'Carol posted a new update' },
      { type: 'system' as const, title: 'IraChat', body: 'Your backup is complete' }
    ];
    
    this.mockNotifications = notificationTypes.map((notif, index) => ({
      id: `notif_${index + 1}`,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3), // Random within last 3 days
      isRead: Math.random() > 0.4,
      actionData: { userId: this.mockUsers[index % this.mockUsers.length].id }
    }));
  }
  
  // Public methods to get mock data
  public getMockUsers(): MockUser[] {
    return [...this.mockUsers];
  }
  
  public getMockChats(): MockChat[] {
    return [...this.mockChats];
  }
  
  public getMockGroups(): MockGroup[] {
    return [...this.mockGroups];
  }
  
  public getMockCalls(): MockCall[] {
    return [...this.mockCalls];
  }
  
  public getMockUpdates(): MockUpdate[] {
    return [...this.mockUpdates];
  }
  
  public getMockContacts(): MockContact[] {
    return [...this.mockContacts];
  }
  
  public getMockNotifications(): MockNotification[] {
    return [...this.mockNotifications];
  }
  
  // Get mock messages for a specific chat
  public getMockMessagesForChat(chatId: string, count: number = 20): MockMessage[] {
    const chat = this.mockChats.find(c => c.id === chatId);
    if (!chat) return [];
    
    const messages: MockMessage[] = [];
    const messageContents = [
      'Hey there!', 'How are you?', 'What\'s up?', 'Good morning!',
      'Thanks!', 'See you later', 'That sounds great!', 'I agree',
      'Let me know', 'Sure thing', 'No problem', 'Awesome!',
      'Perfect!', 'Got it', 'Will do', 'Sounds good'
    ];
    
    for (let i = 0; i < count; i++) {
      const isFromCurrentUser = Math.random() > 0.5;
      const participant = chat.participants.find(p => p !== 'current_user') || chat.participants[0];
      const participantName = chat.participantNames.find(n => n !== 'You') || chat.participantNames[0];
      
      messages.push({
        id: `${chatId}_msg_${i}`,
        senderId: isFromCurrentUser ? 'current_user' : participant,
        senderName: isFromCurrentUser ? 'You' : participantName,
        content: messageContents[i % messageContents.length],
        timestamp: new Date(Date.now() - (count - i) * 60000 * Math.random() * 10), // Spread over time
        type: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'image' : 'audio') : 'text',
        mediaUrl: Math.random() > 0.8 ? `https://picsum.photos/300/200?random=${i}` : undefined,
        isRead: Math.random() > 0.2,
        reactions: Math.random() > 0.9 ? [
          { emoji: ['👍', '❤️', '😂', '😮', '😢', '😡'][Math.floor(Math.random() * 6)], userId: participant, userName: participantName }
        ] : undefined
      });
    }
    
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  // Utility method to check if mock data should be used
  public shouldUseMockData(): boolean {
    // Only use mock data when explicitly enabled via environment variable
    // This ensures it never interferes with real functionality unless intended
    return process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
  }
}

export const mockDataService = MockDataService.getInstance();
