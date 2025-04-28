import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useServerStore } from '@/store/serverStore';
import { login } from '@/api/audiobookshelf';
import ServerForm from '@/components/ServerForm';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user, setServer, setUser } = useServerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if already logged in
    if (server && user) {
      router.replace('/');
    }
  }, [server, user, router]);
  
  const handleSubmit = async (serverConfig: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await login(serverConfig);
      
      setServer({
        ...serverConfig,
        token: userData.token,
      });
      
      setUser(userData);
      
      router.replace('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = () => {
    handleSubmit({
      url: 'demo',
      username: 'demo',
      password: 'demo',
    });
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.background }]}>
              ABS
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Audiobookshelf Connect
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Connect to your Audiobookshelf server
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <ServerForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
          
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.subtext }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.demoButton,
              { 
                backgroundColor: colors.secondary,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
            onPress={handleDemoLogin}
          >
            <Text style={[styles.demoButtonText, { color: colors.background }]}>
              Try Demo Mode
            </Text>
          </Pressable>
          
          <Text style={[styles.demoText, { color: colors.subtext }]}>
            No server? Try our demo mode with sample content.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  demoButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});