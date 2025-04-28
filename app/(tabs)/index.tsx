import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useServerStore } from '@/store/serverStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { getBooks } from '@/api/audiobookshelf';
import { Book } from '@/types/audiobookshelf';
import BookListItem from '@/components/BookListItem';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user } = useServerStore();
  const { books, setBooks } = useLibraryStore();
  const { sessions } = usePlayerStore();
  
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in - moved outside of conditional rendering
  useEffect(() => {
    if (!server || !user) {
      router.replace('/login');
      return;
    }
    
    const fetchRecentBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, you would fetch recent books from the API
        // For now, we'll just use the first library's books
        const libraryId = 'root'; // Most Audiobookshelf servers have a root library
        const fetchedBooks = await getBooks(server, user.token, libraryId);
        
        setBooks(fetchedBooks);
        
        // Sort books by progress
        const booksWithProgress = fetchedBooks.filter(book => book.progress && book.progress > 0 && book.progress < 0.99);
        setInProgressBooks(booksWithProgress.slice(0, 5));
        
        // Sort remaining books by most recent
        const otherBooks = fetchedBooks.filter(book => !book.progress || book.progress === 0 || book.progress >= 0.99);
        setRecentBooks(otherBooks.slice(0, 5));
        
      } catch (err) {
        console.error('Error fetching recent books:', err);
        setError('Failed to load books. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentBooks();
  }, [server, user, router]);
  
  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}`);
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
  
  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }
  
  const renderBookItem = ({ item }: { item: Book }) => (
    <BookListItem book={item} onPress={handleBookPress} />
  );
  
  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {inProgressBooks.length > 0 && (
              <>
                {renderSectionHeader('Continue Listening')}
                <FlatList
                  data={inProgressBooks}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id}
                  horizontal={false}
                  scrollEnabled={false}
                />
              </>
            )}
            
            {recentBooks.length > 0 && (
              <>
                {renderSectionHeader('Recent Books')}
                <FlatList
                  data={recentBooks}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id}
                  horizontal={false}
                  scrollEnabled={false}
                />
              </>
            )}
            
            {inProgressBooks.length === 0 && recentBooks.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>
                  No books found. Visit the Libraries tab to browse your collection.
                </Text>
              </View>
            )}
          </>
        }
      />
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});