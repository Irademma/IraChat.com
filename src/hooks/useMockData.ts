/**
 * Hook for using mock data in IraChat components
 * 
 * This hook provides easy access to mock data for testing purposes
 * while preserving the live functionality of the app.
 */

import { useState, useEffect } from 'react';
import { 
  mockDataService, 
  MockUser, 
  MockChat, 
  MockGroup, 
  MockCall, 
  MockUpdate, 
  MockContact, 
  MockNotification,
  MockMessage 
} from '../services/mockDataService';

export interface MockDataHookReturn {
  // Mock data
  mockUsers: MockUser[];
  mockChats: MockChat[];
  mockGroups: MockGroup[];
  mockCalls: MockCall[];
  mockUpdates: MockUpdate[];
  mockContacts: MockContact[];
  mockNotifications: MockNotification[];
  
  // Utility functions
  getMockMessagesForChat: (chatId: string, count?: number) => MockMessage[];
  shouldUseMockData: boolean;
  
  // Loading state
  isLoading: boolean;
}

export const useMockData = (): MockDataHookReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [mockData, setMockData] = useState({
    mockUsers: [] as MockUser[],
    mockChats: [] as MockChat[],
    mockGroups: [] as MockGroup[],
    mockCalls: [] as MockCall[],
    mockUpdates: [] as MockUpdate[],
    mockContacts: [] as MockContact[],
    mockNotifications: [] as MockNotification[],
  });

  useEffect(() => {
    // Simulate loading time for realistic testing
    const loadMockData = async () => {
      setIsLoading(true);
      
      // Small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMockData({
        mockUsers: mockDataService.getMockUsers(),
        mockChats: mockDataService.getMockChats(),
        mockGroups: mockDataService.getMockGroups(),
        mockCalls: mockDataService.getMockCalls(),
        mockUpdates: mockDataService.getMockUpdates(),
        mockContacts: mockDataService.getMockContacts(),
        mockNotifications: mockDataService.getMockNotifications(),
      });
      
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  return {
    ...mockData,
    getMockMessagesForChat: mockDataService.getMockMessagesForChat.bind(mockDataService),
    shouldUseMockData: mockDataService.shouldUseMockData(),
    isLoading,
  };
};

// Specific hooks for individual data types
export const useMockUsers = () => {
  const { mockUsers, isLoading, shouldUseMockData } = useMockData();
  return { mockUsers, isLoading, shouldUseMockData };
};

export const useMockChats = () => {
  const { mockChats, isLoading, shouldUseMockData } = useMockData();
  return { mockChats, isLoading, shouldUseMockData };
};

export const useMockGroups = () => {
  const { mockGroups, isLoading, shouldUseMockData } = useMockData();
  return { mockGroups, isLoading, shouldUseMockData };
};

export const useMockCalls = () => {
  const { mockCalls, isLoading, shouldUseMockData } = useMockData();
  return { mockCalls, isLoading, shouldUseMockData };
};

export const useMockUpdates = () => {
  const { mockUpdates, isLoading, shouldUseMockData } = useMockData();
  return { mockUpdates, isLoading, shouldUseMockData };
};

export const useMockContacts = () => {
  const { mockContacts, isLoading, shouldUseMockData } = useMockData();
  return { mockContacts, isLoading, shouldUseMockData };
};

export const useMockNotifications = () => {
  const { mockNotifications, isLoading, shouldUseMockData } = useMockData();
  return { mockNotifications, isLoading, shouldUseMockData };
};

export const useMockMessages = (chatId: string, count?: number) => {
  const { getMockMessagesForChat, shouldUseMockData } = useMockData();
  const [mockMessages, setMockMessages] = useState<MockMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (chatId && shouldUseMockData) {
      setIsLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        const messages = getMockMessagesForChat(chatId, count);
        setMockMessages(messages);
        setIsLoading(false);
      }, 300);
    } else {
      setIsLoading(false);
    }
  }, [chatId, count, getMockMessagesForChat, shouldUseMockData]);

  return { mockMessages, isLoading, shouldUseMockData };
};
