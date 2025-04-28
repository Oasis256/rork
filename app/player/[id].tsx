import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useServerStore } from '@/store/serverStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { getBookDetails, getBookChapters, getStreamUrl, updateProgress } from '@/api/audiobookshelf';
import { Book, Chapter } from '@/types/audiobookshelf';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { ChevronDown, ListMusic } from 'lucide-react-native';
import BookCover from '@/components/BookCover';
import PlayerControls from '@/components/PlayerControls';
import ChaptersList from '@/components/ChaptersList';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user } = useServerStore();
  const { currentBook, setCurrentBook } = useLibraryStore();
  const { 
    isPlaying, 
    currentTime, 
    playbackRate, 
    chapters,
    currentChapter,
    sessions,
    setIsPlaying, 
    setCurrentTime, 
    setPlaybackRate,
    setChapters,
    setCurrentChapter,
    updateSession,
  } = usePlayerStore();
  
  const [book, setBook] = useState<Book | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if user is logged in - moved outside of conditional rendering
  useEffect(() => {
    if (!server || !user) {
      router.replace('/login');
      return;
    }
    
    const loadBookData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use current book from store if available, otherwise fetch from API
        let bookData = currentBook && currentBook.id === id ? currentBook : null;
        
        if (!bookData) {
          bookData = await getBookDetails(server, user.token, id as string);
          setCurrentBook(bookData);
        }
        
        setBook(bookData);
        
        // Load chapters
        const bookChapters = await getBookChapters(server, user.token, id as string);
        setChapters(bookChapters);
        
        // Set initial position from saved progress
        const session = sessions[id as string];
        if (session) {
          setCurrentTime(session.currentTime);
        } else {
          setCurrentTime(0);
        }
        
      } catch (err) {
        console.error('Error loading book data:', err);
        setError('Failed to load book data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookData();
    
    // Cleanup on unmount
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [id, server, user, router]);
  
  // Set up audio player
  useEffect(() => {
    if (!book || !server || !user) return;
    
    const setupAudio = async () => {
      try {
        setAudioLoaded(false);
        
        // Unload any existing sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        
        // Configure audio session
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        
        // Get stream URL
        const streamUrl = getStreamUrl(server, user.token, book.id);
        
        // Create and load the sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { 
            positionMillis: currentTime * 1000,
            progressUpdateIntervalMillis: 1000,
            rate: playbackRate,
          },
          onPlaybackStatusUpdate
        );
        
        soundRef.current = sound;
        setAudioLoaded(true);
        
        // Start playing if isPlaying is true
        if (isPlaying) {
          await sound.playAsync();
        }
        
        // Set up progress update interval
        updateIntervalRef.current = setInterval(() => {
          if (isPlaying && book) {
            updateProgress(server, user.token, book.id, currentTime, book.duration);
            updateSession(book.id, currentTime, book.duration);
          }
        }, 30000); // Update every 30 seconds
        
      } catch (err) {
        console.error('Error setting up audio:', err);
        setError('Failed to load audio. Please try again.');
        setAudioLoaded(true); // Set to true so we don't show loading forever
      }
    };
    
    setupAudio();
    
    // Cleanup
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [book, server, user]);
  
  // Update playback rate when it changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setRateAsync(playbackRate, true);
    }
  }, [playbackRate]);
  
  // Update current chapter based on current time
  useEffect(() => {
    if (!chapters || chapters.length === 0) return;
    
    const chapter = chapters.find(
      (ch) => currentTime >= ch.start && currentTime < ch.end
    );
    
    if (chapter && (!currentChapter || chapter.id !== currentChapter.id)) {
      setCurrentChapter(chapter);
    }
  }, [currentTime, chapters, currentChapter]);
  
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
    }
  };
  
  const handlePlayPause = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    
    if (!soundRef.current) return;
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };
  
  const handleSeek = async (time: number) => {
    if (!soundRef.current) return;
    
    await soundRef.current.setPositionAsync(time * 1000);
    setCurrentTime(time);
  };
  
  const handleSkipBack = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    
    // Skip back 30 seconds
    const newTime = Math.max(0, currentTime - 30);
    handleSeek(newTime);
  };
  
  const handleSkipForward = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    
    // Skip forward 30 seconds
    const newTime = Math.min(book?.duration || 0, currentTime + 30);
    handleSeek(newTime);
  };
  
  const handleChangePlaybackRate = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    // Cycle through playback rates: 1.0 -> 1.25 -> 1.5 -> 1.75 -> 2.0 -> 0.75 -> 1.0
    const rates = [1.0, 1.25, 1.5, 1.75, 2.0, 0.75];
    const currentIndex = rates.findIndex(rate => rate === playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };
  
  const handleSelectChapter = (chapter: Chapter) => {
    handleSeek(chapter.start);
    setShowChapters(false);
  };
  
  const handleClose = () => {
    router.back();
  };
  
  const toggleChapters = () => {
    setShowChapters(!showChapters);
  };
  
  if (!server || !user) {
    // Return a loading state instead of Redirect
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Redirecting to login...</Text>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error || !book) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || 'Book not found'}
        </Text>
        <Pressable 
          style={[styles.backButton, { backgroundColor: colors.primary }]} 
          onPress={handleClose}
        >
          <Text style={[styles.backButtonText, { color: colors.background }]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.headerButton} onPress={handleClose}>
          <ChevronDown size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Now Playing
        </Text>
        <Pressable style={styles.headerButton} onPress={toggleChapters}>
          <ListMusic size={24} color={colors.text} />
        </Pressable>
      </View>
      
      {showChapters ? (
        <ChaptersList 
          chapters={chapters} 
          currentTime={currentTime} 
          onSelectChapter={handleSelectChapter} 
        />
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.coverContainer}>
            <BookCover book={book} size="large" />
          </View>
          
          <View style={styles.bookInfo}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            
            {book.authors && book.authors.length > 0 && (
              <Text style={[styles.author, { color: colors.subtext }]} numberOfLines={1}>
                {book.authors.map(author => author.name).join(', ')}
              </Text>
            )}
            
            {currentChapter && (
              <Text style={[styles.chapter, { color: colors.primary }]} numberOfLines={1}>
                {currentChapter.title}
              </Text>
            )}
          </View>
          
          {!audioLoaded ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtext }]}>
                Loading audio...
              </Text>
            </View>
          ) : (
            <PlayerControls 
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={book.duration}
              playbackRate={playbackRate}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSkipBack={handleSkipBack}
              onSkipForward={handleSkipForward}
              onChangePlaybackRate={handleChangePlaybackRate}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  coverContainer: {
    marginBottom: 24,
  },
  bookInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  chapter: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});