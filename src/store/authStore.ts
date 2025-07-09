import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { auth } from '../services/supabase';
import { User, AuthState } from '../types';
import { STORAGE_KEYS } from '../constants';

// Determine if JSI is available (i.e., running on-device)
const isJSIAvailable = (global as any)?.nativeCallSyncHook != null;

// MMKV or AsyncStorage fallback
const mmkvStorage = isJSIAvailable
  ? {
      getItem: (key: string) => {
        const value = new MMKV().getString(key);
        return value ? JSON.parse(value) : null;
      },
      setItem: (key: string, value: any) => {
        new MMKV().set(key, JSON.stringify(value));
      },
      removeItem: (key: string) => {
        new MMKV().delete(key);
      },
    }
  : {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
      removeItem: AsyncStorage.removeItem,
    };

interface AuthStore extends AuthState {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
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
      user: null,
      isLoading: false,
      isAuthenticated: false,
      token: null,

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signIn(email, password);
          if (error || !data.user || !data.session) {
            set({ isLoading: false });
            return {
              success: false,
              error: error?.message || 'Sign in failed',
            };
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
            token: data.session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unexpected error' };
        }
      },

      signUp: async (email, password, firstName, lastName) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signUp(email, password, {
            firstName,
            lastName,
          });
          set({ isLoading: false });

          if (error || !data.user) {
            return {
              success: false,
              error: error?.message || 'Sign up failed',
            };
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unexpected error' };
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
        } catch (error) {
          set({ isLoading: false });
        }
      },

      resetPassword: async email => {
        set({ isLoading: true });
        try {
          const { error } = await auth.resetPassword(email);
          set({ isLoading: false });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unexpected error' };
        }
      },

      updatePassword: async password => {
        set({ isLoading: true });
        try {
          const { error } = await auth.updatePassword(password);
          set({ isLoading: false });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unexpected error' };
        }
      },

      updateProfile: async updates => {
        const { user } = get();
        if (!user) return { success: false, error: 'User not authenticated' };

        set({ isLoading: true });
        try {
          const { data, error } = await auth.getUser();

          if (error || !data.user) {
            set({ isLoading: false });
            return {
              success: false,
              error: error?.message || 'Failed to fetch user',
            };
          }

          const updatedUser: User = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          set({ user: updatedUser, isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unexpected error' };
        }
      },

      setUser: user => set({ user, isAuthenticated: !!user }),
      setLoading: loading => set({ isLoading: loading }),
      setToken: token => set({ token }),

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.getSession();

          if (error || !data.session?.user) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const user: User = {
            id: data.session.user.id,
            email: data.session.user.email!,
            firstName: data.session.user.user_metadata?.firstName || '',
            lastName: data.session.user.user_metadata?.lastName || '',
            avatar: data.session.user.user_metadata?.avatar || null,
            createdAt: data.session.user.created_at,
            updatedAt:
              data.session.user.updated_at || data.session.user.created_at,
            isActive: true,
            role: data.session.user.user_metadata?.role || 'member',
          };

          set({
            user,
            token: data.session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
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
          if (error || !data.session?.user) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return;
          }

          const user: User = {
            id: data.session.user.id,
            email: data.session.user.email!,
            firstName: data.session.user.user_metadata?.firstName || '',
            lastName: data.session.user.user_metadata?.lastName || '',
            avatar: data.session.user.user_metadata?.avatar || null,
            createdAt: data.session.user.created_at,
            updatedAt:
              data.session.user.updated_at || data.session.user.created_at,
            isActive: true,
            role: data.session.user.user_metadata?.role || 'member',
          };

          set({
            user,
            token: data.session.access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
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
        } catch (error) {
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
      storage: createJSONStorage(() => mmkvStorage as any),
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Optional: Listen to Supabase auth changes
auth.onAuthStateChange(async (event, session) => {
  const { setUser, setToken } = useAuthStore.getState();

  if (event === 'SIGNED_IN' && session?.user) {
    const user: User = {
      id: session.user.id,
      email: session.user.email!,
      firstName: session.user.user_metadata?.firstName || '',
      lastName: session.user.user_metadata?.lastName || '',
      avatar: session.user.user_metadata?.avatar || null,
      createdAt: session.user.created_at,
      updatedAt: session.user.updated_at || session.user.created_at,
      isActive: true,
      role: session.user.user_metadata?.role || 'member',
    };

    setUser(user);
    setToken(session.access_token);
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
    setToken(null);
  }
});

