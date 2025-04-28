import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Book } from '@/types/audiobookshelf';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

interface BookCoverProps {
  book: Book;
  size?: 'small' | 'medium' | 'large';
}

export default function BookCover({ book, size = 'medium' }: BookCoverProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const dimensions = {
    small: { width: 80, height: 120 },
    medium: { width: 120, height: 180 },
    large: { width: 200, height: 300 },
  };
  
  const { width, height } = dimensions[size];
  
  if (!book.cover) {
    // Fallback when no cover is available
    return (
      <View 
        style={[
          styles.fallbackCover, 
          { width, height, backgroundColor: colors.card, borderColor: colors.border }
        ]}
      >
        <Text 
          style={[styles.fallbackTitle, { color: colors.text }]} 
          numberOfLines={4}
        >
          {book.title}
        </Text>
        {book.authors && book.authors.length > 0 && (
          <Text 
            style={[styles.fallbackAuthor, { color: colors.subtext }]}
            numberOfLines={1}
          >
            {book.authors[0].name}
          </Text>
        )}
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri: book.cover }}
      style={[styles.cover, { width, height }]}
      contentFit="cover"
      transition={300}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: 8,
  },
  fallbackCover: {
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackAuthor: {
    fontSize: 12,
    textAlign: 'center',
  },
});