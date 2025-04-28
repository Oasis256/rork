import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Book, Chapter, PlaybackSession } from '@/types/audiobookshelf';

interface PlayerState {
  isPlaying: boolean;
  currentBook: Book | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  sessions: Record<string, PlaybackSession>;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentBook: (book: Book | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setChapters: (chapters: Chapter[]) => void;
  setCurrentChapter: (chapter: Chapter | null) => void;
  updateSession: (bookId: string, time: number, duration: number) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentBook: null,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      chapters: [],
      currentChapter: null,
      sessions: {},
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentBook: (currentBook) => set({ currentBook }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setChapters: (chapters) => set({ chapters }),
      setCurrentChapter: (currentChapter) => set({ currentChapter }),
      updateSession: (bookId, time, duration) => {
        const progress = duration > 0 ? time / duration : 0;
        const sessions = {
          ...get().sessions,
          [bookId]: {
            id: bookId,
            bookId,
            currentTime: time,
            duration,
            progress,
            updatedAt: new Date().toISOString(),
          },
        };
        set({ sessions });
      },
      clearPlayer: () => set({
        isPlaying: false,
        currentBook: null,
        currentTime: 0,
        duration: 0,
        chapters: [],
        currentChapter: null,
      }),
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playbackRate: state.playbackRate,
        sessions: state.sessions,
      }),
    }
  )
);