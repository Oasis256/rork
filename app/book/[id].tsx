import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useServerStore } from '@/store/serverStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { getBookDetails, getCoverUrl } from '@/api/audiobookshelf';
import { Book } from '@/types/audiobookshelf';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { ChevronLeft, Play, Clock, Calendar, User } from 'lucide-react-native';
import ProgressBar from '@/components/ProgressBar';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user } = useServerStore();
  const { books, setCurrentBook } = useLibraryStore();
  const { sessions } = usePlayerStore();
  
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in - moved outside of conditional rendering
  useEffect(() => {
    if (!server || !user) {
      router.replace('/login');
      return;
    }
    
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First check if we already have this book in our store
        const existingBook = books.find(b => b.id === id);
        
        if (existingBook) {
          setBook(existingBook);
        } else {
          // Fetch book details from API
          const bookDetails = await getBookDetails(server, user.token, id as string);
          setBook(bookDetails);
        }
        
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id, server, user, router, books]);
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handlePlayPress = () => {
    if (book) {
      setCurrentBook(book);
      router.push(`/player/${book.id}`);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
          onPress={handleBackPress}
        >
          <Text style={[styles.backButtonText, { color: colors.background }]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }
  
  // Get session progress if available
  const session = sessions[book.id];
  const progress = session ? session.progress : (book.progress || 0);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.headerButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Book Details
        </Text>
        <View style={styles.headerButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.coverContainer}>
          {book.cover ? (
            <Image
              source={{ uri: book.cover }}
              style={styles.cover}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.card }]}>
              <Text style={[styles.coverPlaceholderText, { color: colors.text }]}>
                No Cover
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.bookInfo}>
          <Text style={[styles.title, { color: colors.text }]}>
            {book.title}
          </Text>
          
          {book.authors && book.authors.length > 0 && (
            <Text style={[styles.author, { color: colors.subtext }]}>
              by {book.authors.map(author => author.name).join(', ')}
            </Text>
          )}
          
          {book.series && (
            <Text style={[styles.series, { color: colors.primary }]}>
              {book.series.name} {book.series.sequence ? `#${book.series.sequence}` : ''}
            </Text>
          )}
          
          <View style={styles.metadataContainer}>
            {book.duration > 0 && (
              <View style={styles.metadataItem}>
                <Clock size={16} color={colors.subtext} />
                <Text style={[styles.metadataText, { color: colors.subtext }]}>
                  {formatDuration(book.duration)}
                </Text>
              </View>
            )}
            
            {book.publishedYear && (
              <View style={styles.metadataItem}>
                <Calendar size={16} color={colors.subtext} />
                <Text style={[styles.metadataText, { color: colors.subtext }]}>
                  {book.publishedYear}
                </Text>
              </View>
            )}
            
            {book.narrators && book.narrators.length > 0 && (
              <View style={styles.metadataItem}>
                <User size={16} color={colors.subtext} />
                <Text style={[styles.metadataText, { color: colors.subtext }]}>
                  {book.narrators.join(', ')}
                </Text>
              </View>
            )}
          </View>
          
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} height={4} />
              <Text style={[styles.progressText, { color: colors.subtext }]}>
                {Math.round(progress * 100)}% complete
              </Text>
            </View>
          )}
          
          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              { 
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
            onPress={handlePlayPress}
          >
            <Play size={20} color={colors.background} />
            <Text style={[styles.playButtonText, { color: colors.background }]}>
              {progress > 0 ? 'Continue Listening' : 'Start Listening'}
            </Text>
          </Pressable>
          
          {book.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {book.description}
              </Text>
            </View>
          )}
          
          {book.genres && book.genres.length > 0 && (
            <View style={styles.genresContainer}>
              <Text style={[styles.genresTitle, { color: colors.text }]}>
                Genres
              </Text>
              <View style={styles.genresList}>
                {book.genres.map((genre, index) => (
                  <View 
                    key={index} 
                    style={[styles.genreTag, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                  >
                    <Text style={[styles.genreText, { color: colors.primary }]}>
                      {genre}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  cover: {
    width: 200,
    height: 300,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 16,
  },
  bookInfo: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    marginBottom: 4,
  },
  series: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  genresContainer: {
    marginBottom: 24,
  },
  genresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  genreText: {
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