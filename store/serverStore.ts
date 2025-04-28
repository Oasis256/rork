import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ServerConfig, User } from '@/types/audiobookshelf';

interface ServerState {
  server: ServerConfig | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setServer: (server: ServerConfig) => void;
  setUser: (user: User) => void;
  clearServer: () => void;
  clearError: () => void;
}

export const useServerStore = create<ServerState>()(
  persist(
    (set) => ({
      server: null,
      user: null,
      isLoading: false,
      error: null,
      setServer: (server) => set({ server }),
      setUser: (user) => set({ user }),
      clearServer: () => set({ server: null, user: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'server-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);