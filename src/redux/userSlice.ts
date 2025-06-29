import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "../types";
import { clearAuthData } from "../services/authStorageSimple";

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    logout: (state) => {
      console.log("🔄 Redux: Logging out user...");
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear stored auth data (async operation, but we don't wait for it)
      clearAuthData().catch((error) => {
        console.error("❌ Error clearing auth data during logout:", error);
      });

      console.log("✅ Redux: User logged out");
    },
    // Add action to completely reset state (for logout)
    resetState: () => {
      console.log("🔄 Redux: Resetting entire user state...");
      return initialState;
    },
    setAuthError: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
    },
  },
});

export const { setLoading, setUser, updateUser, logout, resetState, setAuthError } =
  userSlice.actions;
export default userSlice.reducer;
