import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { ServerConfig } from '@/types/audiobookshelf';

interface ServerFormProps {
  onSubmit: (server: ServerConfig) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ServerForm({ onSubmit, isLoading, error }: ServerFormProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = () => {
    // Basic validation
    if (!url) {
      return;
    }
    
    // Ensure URL has protocol
    let serverUrl = url;
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      serverUrl = 'http://' + serverUrl;
    }
    
    // Remove trailing slash if present
    if (serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }
    
    onSubmit({
      url: serverUrl,
      username,
      password,
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.formGroup, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Server URL</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="e.g. http://192.168.1.100:13378"
          placeholderTextColor={colors.inactive}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View style={[styles.formGroup, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Username"
          placeholderTextColor={colors.inactive}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View style={[styles.formGroup, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Password"
          placeholderTextColor={colors.inactive}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
      
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { 
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          }
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Connect
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
});