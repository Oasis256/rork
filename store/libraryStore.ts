import { create } from 'zustand';
import { Library, Book } from '@/types/audiobookshelf';

interface LibraryState {
  libraries: Library[];
  currentLibrary: Library | null;
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  setLibraries: (libraries: Library[]) => void;
  setCurrentLibrary: (library: Library | null) => void;
  setBooks: (books: Book[]) => void;
  setCurrentBook: (book: Book | null) => void;
  clearLibraries: () => void;
  clearError: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  libraries: [],
  currentLibrary: null,
  books: [],
  currentBook: null,
  isLoading: false,
  error: null,
  setLibraries: (libraries) => set({ libraries }),
  setCurrentLibrary: (currentLibrary) => set({ currentLibrary }),
  setBooks: (books) => set({ books }),
  setCurrentBook: (currentBook) => set({ currentBook }),
  clearLibraries: () => set({ libraries: [], currentLibrary: null, books: [], currentBook: null }),
  clearError: () => set({ error: null }),
}));