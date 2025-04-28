import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Library } from '@/types/audiobookshelf';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';
import { BookOpen } from 'lucide-react-native';

interface LibraryCardProps {
  library: Library;
  onPress: (library: Library) => void;
}

export default function LibraryCard({ library, onPress }: LibraryCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        }
      ]}
      onPress={() => onPress(library)}
    >
      {library.cover ? (
        <Image
          source={{ uri: library.cover }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary }]}>
          <BookOpen size={32} color={colors.background} />
        </View>
      )}
      
      <View style={styles.details}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {library.name}
        </Text>
        
        <Text style={[styles.count, { color: colors.subtext }]}>
          {library.itemCount} {library.itemCount === 1 ? 'book' : 'books'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    width: '48%',
    marginBottom: 16,
  },
  cover: {
    width: '100%',
    height: 120,
  },
  coverPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
  },
});