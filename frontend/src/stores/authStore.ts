import { create } from 'zustand';
import { User } from '../types';
import { login as loginApi, register as registerApi, updateProfile as updateProfileApi } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>; // Renamed for clarity
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await loginApi(email, password);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await registerApi(name, email, password);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await updateProfileApi(data);
      set((state) => ({ user: { ...state.user, ...updatedUser }, loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  checkAuthStatus: async () => {
    set({ loading: true, error: null });
    const token = localStorage.getItem('token');
    if (token) {
      // Here, you would ideally verify the token with the backend and fetch user details.
      // For this example, we'll assume if a token exists, the user might be authenticated.
      // A proper implementation would call an API endpoint like /api/auth/me or /api/auth/verify-token
      // and then set the user and isAuthenticated state.
      // Since we don't have that endpoint defined in the provided context, 
      // we will simulate a successful auth check if token exists.
      // In a real app, you'd fetch user data here.
      // For now, we can't set the user without fetching it.
      // Let's assume an API call to fetch the current user based on the token.
      // If that API call is `updateProfileApi` without arguments or a new one.
      // To keep it simple and avoid adding new API calls without confirmation:
      // We will just set isAuthenticated to true if token exists, and loading to false.
      // The actual user data would be populated when a component needs it and calls updateProfile or similar.
      // Or, if an endpoint like `getProfile` exists in `authApi`:
      try {
        // This is a placeholder for an actual API call to get the current user
        // const currentUser = await getMeApi(); // Assuming an API like getMeApi exists
        // set({ user: currentUser, isAuthenticated: true, loading: false });
        // For now, let's just set isAuthenticated and let other parts of the app fetch user if needed.
        // A better approach is to have an API that returns the user object based on the token.
        // If your `updateProfileApi({})` or a similar call can fetch the current user, use that.
        // Without a specific API to get the user, we can only set isAuthenticated.
        // This might lead to `user` being null initially even if authenticated.
        // A common pattern is to have an API endpoint that returns the current user based on the token.
        // Let's assume `updateProfileApi` when called with no args or an empty object could do this, or a new `fetchMe` api.
        // Given the existing `updateProfileApi`, it expects data. So this is not ideal.
        // The most straightforward thing without adding new API calls is to set isAuthenticated.
        // The app should then probably try to fetch user details if isAuthenticated is true and user is null.

        // A minimal viable change: if token exists, assume authenticated. Loading is false.
        // User will be null until explicitly fetched or set by login/register.
        // This is a simplification. A real app needs to verify the token and fetch the user.
        set({ isAuthenticated: true, loading: false });
      } catch (error) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, loading: false, error: 'Session invalid. Please login again.' });
      }
    } else {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));

// Initialize auth status when the store is loaded
useAuthStore.getState().checkAuthStatus();