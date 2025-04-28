import React from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { Chapter } from '@/types/audiobookshelf';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

interface ChaptersListProps {
  chapters: Chapter[];
  currentTime: number;
  onSelectChapter: (chapter: Chapter) => void;
}

export default function ChaptersList({ 
  chapters, 
  currentTime, 
  onSelectChapter 
}: ChaptersListProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const isCurrentChapter = (chapter: Chapter) => {
    return currentTime >= chapter.start && currentTime < chapter.end;
  };
  
  const renderChapter = ({ item }: { item: Chapter }) => {
    const current = isCurrentChapter(item);
    const duration = item.end - item.start;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.chapterItem,
          { 
            backgroundColor: current ? colors.primary + '20' : (pressed ? colors.border : 'transparent'),
            borderLeftColor: current ? colors.primary : 'transparent',
          }
        ]}
        onPress={() => onSelectChapter(item)}
      >
        <View style={styles.chapterContent}>
          <Text 
            style={[
              styles.chapterTitle, 
              { color: current ? colors.primary : colors.text }
            ]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.chapterDuration, { color: colors.subtext }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </Pressable>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.text }]}>Chapters</Text>
      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  chapterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
  },
  chapterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 16,
    flex: 1,
  },
  chapterDuration: {
    fontSize: 14,
    marginLeft: 8,
  },
});