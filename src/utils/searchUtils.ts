import { GroupMember, GroupMessage } from '../types/groupChat';

interface SearchResult {
  id: string;
  type: 'message' | 'member' | 'contact' | 'username';
  title: string;
  subtitle?: string;
  content?: string;
  timestamp?: string;
  avatar?: string;
  username?: string;
}

export const searchMessages = (
  messages: GroupMessage[],
  query: string
): SearchResult[] => {
  if (!query.trim()) return [];

  const searchRegex = new RegExp(query, 'i');
  return messages
    .filter((message) => {
      return (
        searchRegex.test(message.content) ||
        searchRegex.test(message.sender.name) ||
        searchRegex.test(message.sender.username || '') ||
        (message.media?.some((media) => searchRegex.test(media.caption || '')))
      );
    })
    .map((message) => ({
      id: message.id,
      type: 'message',
      title: message.sender.name,
      subtitle: message.timestamp,
      content: message.content,
      timestamp: message.timestamp,
      avatar: message.sender.avatar,
      username: message.sender.username,
    }));
};

export const searchMembers = (
  members: GroupMember[],
  query: string
): SearchResult[] => {
  if (!query.trim()) return [];

  const searchRegex = new RegExp(query, 'i');
  return members
    .filter((member) => {
      return (
        searchRegex.test(member.name) ||
        searchRegex.test(member.username) ||
        searchRegex.test(member.role) ||
        searchRegex.test(member.email || '')
      );
    })
    .map((member) => ({
      id: member.id,
      type: 'member',
      title: member.name,
      subtitle: member.role,
      content: member.username,
      avatar: member.avatar,
      username: member.username,
    }));
};

export const searchContacts = (
  contacts: any[],
  query: string
): SearchResult[] => {
  if (!query.trim()) return [];

  const searchRegex = new RegExp(query, 'i');
  return contacts
    .filter((contact) => {
      return (
        searchRegex.test(contact.name) ||
        searchRegex.test(contact.username) ||
        searchRegex.test(contact.email)
      );
    })
    .map((contact) => ({
      id: contact.id,
      type: 'contact',
      title: contact.name,
      subtitle: contact.username,
      content: contact.email,
      avatar: contact.avatar,
      username: contact.username,
    }));
};

export const searchUsernames = (
  members: GroupMember[],
  contacts: any[],
  query: string
): SearchResult[] => {
  if (!query.trim()) return [];

  const searchRegex = new RegExp(query, 'i');
  const allUsers = [...members, ...contacts];
  
  return allUsers
    .filter((user) => searchRegex.test(user.username))
    .map((user) => ({
      id: user.id,
      type: 'username',
      title: user.username,
      subtitle: user.name,
      content: user.email || '',
      avatar: user.avatar,
      username: user.username,
    }));
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const highlightMatches = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const getSearchResults = async (
  query: string,
  messages: GroupMessage[],
  members: GroupMember[],
  contacts: any[]
): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const messageResults = searchMessages(messages, query);
  const memberResults = searchMembers(members, query);
  const contactResults = searchContacts(contacts, query);
  const usernameResults = searchUsernames(members, contacts, query);

  return [...messageResults, ...memberResults, ...contactResults, ...usernameResults];
};

export const sortSearchResults = (results: SearchResult[]): SearchResult[] => {
  return results.sort((a, b) => {
    // Prioritize exact matches
    const aExactMatch = a.title.toLowerCase() === a.title.toLowerCase();
    const bExactMatch = b.title.toLowerCase() === b.title.toLowerCase();
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;

    // Then sort by type
    const typeOrder = { username: 0, message: 1, member: 2, contact: 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }

    // Finally sort by title
    return a.title.localeCompare(b.title);
  });
};

export const filterSearchResults = (
  results: SearchResult[],
  filters: {
    messages?: boolean;
    members?: boolean;
    contacts?: boolean;
    usernames?: boolean;
  }
): SearchResult[] => {
  return results.filter((result) => {
    switch (result.type) {
      case 'message':
        return filters.messages !== false;
      case 'member':
        return filters.members !== false;
      case 'contact':
        return filters.contacts !== false;
      case 'username':
        return filters.usernames !== false;
      default:
        return true;
    }
  });
}; 