import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, ChatState } from '../types';
import { serializeChat, serializeChats } from '../utils/firebaseSerializers';

const initialState: ChatState = {
  selectedChatId: null,
  chats: [],
  isLoading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSelectedChatId: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      // Data should already be serialized before dispatch
      state.chats = action.payload;
      state.isLoading = false;
      state.error = null;
      console.log('✅ Chats stored in Redux state:', state.chats.length);
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      // Serialize individual chat when adding
      const serializedChat = serializeChat(action.payload);
      state.chats.unshift(serializedChat);
      console.log('✅ Chat added and serialized:', serializedChat.id);
    },
    updateChat: (state, action: PayloadAction<{ id: string; updates: Partial<Chat> }>) => {
      const { id, updates } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.id === id);
      if (chatIndex !== -1) {
        const serializedUpdates = serializeChat(updates);
        state.chats[chatIndex] = { ...state.chats[chatIndex], ...serializedUpdates };
        // Move updated chat to top
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
        console.log('✅ Chat updated and serialized:', id);
      }
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat.id !== action.payload);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  setLoading,
  setSelectedChatId,
  setChats,
  addChat,
  updateChat,
  removeChat,
  setError,
  clearError
} = chatSlice.actions;
export default chatSlice.reducer;
