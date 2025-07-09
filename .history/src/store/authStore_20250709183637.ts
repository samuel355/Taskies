import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { auth } from '../services/supabase';
import { User, AuthState } from '../types';
import { STORAGE_KEYS } from '../constants';

// Initialize MMKV storage
const storage = new MMKV();

// Custom storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      token: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signIn(email, password);

          if (error) {
            set({ isLoading: false });
            console.error('Sign in error:', error);
            set({ isLoading: false });
            return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
          }

          if (data.user && data.session) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata?.firstName || '',
              lastName: data.user.user_metadata?.lastName || '',
              avatar: data.user.user_metadata?.avatar || null,
              createdAt: data.user.created_at,
              updatedAt: data.user.updated_at || data.user.created_at,
              isActive: true,
              role: data.user.user_metadata?.role || 'member',
            };

            set({
              user,
              token: data.session.access_token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Authentication failed' };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
        }
      },

      signUp: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signUp(email, password, {
            firstName,
            lastName,
          });

          if (error) {
            set({ isLoading: false });
            console.error('Update password error:', error);
            set({ isLoading: false });
            return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
          }

          if (data.user) {
            // Note: User will need to verify email before they can sign in
            set({ isLoading: false });
            return { success: true };
          }

          set({ isLoading: false });
          set({ isLoading: false });
          return { success: false, error: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Registration failed' };
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Sign in error:', error);
          set({ isLoading: false });
          return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await auth.signOut();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Sign out error:', error);
          Alert.alert('Error', 'An unexpected error occurred while signing out.');
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          const { error } = await auth.resetPassword(email);

          set({ isLoading: false });

          if (error) {
            console.error('Sign up error:', error);
            set({ isLoading: false });
            return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
        }
      },

      updatePassword: async (password: string) => {
        set({ isLoading: true });
        try {
          const { error } = await auth.updatePassword(password);

          set({ isLoading: false });

          if (error) {
            console.error('Reset password error:', error);
            set({ isLoading: false });
            return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Sign up error:', error);
          set({ isLoading: false });
          return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        set({ isLoading: true });
        try {
          // Update user metadata in Supabase Auth
          const { data, error } = await auth.getUser();

          if (error || !data.user) {
            set({ isLoading: false });
            console.error('Update profile error:', error);
            set({ isLoading: false });
            return { success: false, error: error && error.message ? error.message : 'Failed to get user information' };
          }

          // Update the user in the store
          const updatedUser: User = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          set({
            user: updatedUser,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Update profile error:', error);
          set({ isLoading: false });
          return { success: false, error: error && error.message ? error.message : 'An unexpected error occurred' };
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.getSession();

          if (error) {
            console.error('Session error:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'An unexpected error occurred while getting the session.');
            return;
          }

          if (data.session && data.session.user) {
            const user: User = {
              id: data.session.user.id,
              email: data.session.user.email!,
              firstName: data.session.user.user_metadata?.firstName || '',
              lastName: data.session.user.user_metadata?.lastName || '',
              avatar: data.session.user.user_metadata?.avatar || null,
              createdAt: data.session.user.created_at,
              updatedAt: data.session.user.updated_at || data.session.user.created_at,
              isActive: true,
              role: data.session.user.user_metadata?.role || 'member',
            };

            set({
              user,
              token: data.session.access_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Initialize error:', error);
          Alert.alert('Error', 'An unexpected error occurred while initializing the app.');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await auth.getSession();

          if (error) {
            console.error('Refresh session error:', error);
            return;
          }

          if (data.session && data.session.user) {
            const user: User = {
              id: data.session.user.id,
              email: data.session.user.email!,
              firstName: data.session.user.user_metadata?.firstName || '',
              lastName: data.session.user.user_metadata?.lastName || '',
              avatar: data.session.user.user_metadata?.avatar || null,
              createdAt: data.session.user.created_at,
              updatedAt: data.session.user.updated_at || data.session.user.created_at,
              isActive: true,
              role: data.session.user.user_metadata?.role || 'member',
            };

            set({
              user,
              token: data.session.access_token,
              isAuthenticated: true,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } catch (error: any) {
          console.error('Refresh session error:', error);
          Alert.alert('Error', 'An unexpected error occurred while refreshing the session.');
        }
      },

      checkAuthState: async () => {
        try {
          const { data, error } = await auth.getUser();

          if (error || !data.user) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return;
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            firstName: data.user.user_metadata?.firstName || '',
            lastName: data.user.user_metadata?.lastName || '',
            avatar: data.user.user_metadata?.avatar || null,
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at || data.user.created_at,
            isActive: true,
            role: data.user.user_metadata?.role || 'member',
          };

          set({
            user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Check auth state error:', error);
          Alert.alert('Error', 'An unexpected error occurred while checking authentication state.');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);