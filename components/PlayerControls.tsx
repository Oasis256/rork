import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import ProgressBar from './ProgressBar';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onChangePlaybackRate: () => void;
}

export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  onChangePlaybackRate,
}: PlayerControlsProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? currentTime / duration : 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} height={6} />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.subtext }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: colors.subtext }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controls}>
        <Pressable 
          style={styles.rateButton} 
          onPress={onChangePlaybackRate}
        >
          <Text style={[styles.rateText, { color: colors.primary }]}>
            {playbackRate.toFixed(1)}x
          </Text>
        </Pressable>
        
        <View style={styles.mainControls}>
          <Pressable 
            style={[styles.controlButton, styles.secondaryButton]} 
            onPress={onSkipBack}
          >
            <SkipBack size={24} color={colors.text} />
          </Pressable>
          
          <Pressable 
            style={[styles.controlButton, styles.primaryButton, { backgroundColor: colors.primary }]} 
            onPress={onPlayPause}
          >
            {isPlaying ? (
              <Pause size={28} color={colors.background} />
            ) : (
              <Play size={28} color={colors.background} />
            )}
          </Pressable>
          
          <Pressable 
            style={[styles.controlButton, styles.secondaryButton]} 
            onPress={onSkipForward}
          >
            <SkipForward size={24} color={colors.text} />
          </Pressable>
        </View>
        
        <Pressable style={styles.rateButton}>
          <Volume2 size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  primaryButton: {
    width: 60,
    height: 60,
    marginHorizontal: 20,
  },
  secondaryButton: {
    width: 44,
    height: 44,
  },
  rateButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});