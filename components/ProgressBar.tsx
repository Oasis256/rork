import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export default function ProgressBar({ progress, height = 4 }: ProgressBarProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={[styles.container, { height, backgroundColor: colors.inactive }]}>
      <View 
        style={[
          styles.progress, 
          { 
            width: `${clampedProgress * 100}%`,
            backgroundColor: colors.primary,
            height,
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});