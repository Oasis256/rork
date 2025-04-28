export interface ServerConfig {
  url: string;
  username: string;
  password: string;
  token?: string;
}

export interface User {
  id: string;
  username: string;
  token: string;
}

export interface Library {
  id: string;
  name: string;
  cover?: string;
  itemCount: number;
}

export interface Author {
  id: string;
  name: string;
}

export interface Series {
  id: string;
  name: string;
  sequence?: number;
}

export interface Book {
  id: string;
  title: string;
  authors: Author[];
  series?: Series;
  cover?: string;
  description?: string;
  duration: number;
  progress?: number;
  narrators?: string[];
  publishedYear?: number;
  genres?: string[];
  path?: string;
}

export interface Chapter {
  id: string;
  title: string;
  start: number;
  end: number;
}

export interface PlaybackSession {
  id: string;
  bookId: string;
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: string;
}

export interface AudioTrack {
  id: string;
  index: number;
  path: string;
  duration: number;
  startOffset: number;
}