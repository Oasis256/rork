import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Book } from '@/types/audiobookshelf';
import BookCover from './BookCover';
import ProgressBar from './ProgressBar';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';

interface BookListItemProps {
  book: Book;
  onPress: (book: Book) => void;
}

export default function BookListItem({ book, onPress }: BookListItemProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.border : 'transparent' }
      ]}
      onPress={() => onPress(book)}
    >
      <BookCover book={book} size="small" />
      
      <View style={styles.details}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        
        {book.authors && book.authors.length > 0 && (
          <Text style={[styles.author, { color: colors.subtext }]} numberOfLines={1}>
            {book.authors.map(author => author.name).join(', ')}
          </Text>
        )}
        
        {book.series && (
          <Text style={[styles.series, { color: colors.subtext }]} numberOfLines={1}>
            {book.series.name} {book.series.sequence ? `#${book.series.sequence}` : ''}
          </Text>
        )}
        
        <View style={styles.progressContainer}>
          <ProgressBar progress={book.progress || 0} />
          <Text style={[styles.duration, { color: colors.subtext }]}>
            {formatDuration(book.duration)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 2,
  },
  series: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  duration: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});