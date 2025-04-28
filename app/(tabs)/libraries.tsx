import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useServerStore } from '@/store/serverStore';
import { useLibraryStore } from '@/store/libraryStore';
import { getLibraries, getBooks } from '@/api/audiobookshelf';
import { Library, Book } from '@/types/audiobookshelf';
import LibraryCard from '@/components/LibraryCard';
import BookListItem from '@/components/BookListItem';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function LibrariesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user } = useServerStore();
  const { 
    libraries, 
    currentLibrary, 
    books, 
    setLibraries, 
    setCurrentLibrary, 
    setBooks 
  } = useLibraryStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in - moved outside of conditional rendering
  useEffect(() => {
    if (!server || !user) {
      router.replace('/login');
      return;
    }
    
    const fetchLibraries = async () => {
      if (libraries.length > 0) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedLibraries = await getLibraries(server, user.token);
        setLibraries(fetchedLibraries);
        
      } catch (err) {
        console.error('Error fetching libraries:', err);
        setError('Failed to load libraries. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLibraries();
  }, [server, user, router, libraries.length]);
  
  const handleLibraryPress = async (library: Library) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentLibrary(library);
      
      const fetchedBooks = await getBooks(server!, user!.token, library.id);
      setBooks(fetchedBooks);
      
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}`);
  };
  
  const handleBackPress = () => {
    setCurrentLibrary(null);
    setBooks([]);
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
  
  if (currentLibrary) {
    // Show books in the selected library
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {currentLibrary.name}
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        {books.length > 0 ? (
          <FlatList
            data={books}
            renderItem={({ item }) => (
              <BookListItem book={item} onPress={handleBookPress} />
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No books found in this library.
            </Text>
          </View>
        )}
      </View>
    );
  }
  
  // Show list of libraries
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {libraries.length > 0 ? (
        <FlatList
          data={libraries}
          renderItem={({ item }) => (
            <LibraryCard library={item} onPress={handleLibraryPress} />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.libraryList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            No libraries found. Please check your server configuration.
          </Text>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  libraryList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});