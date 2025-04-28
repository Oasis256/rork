import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useServerStore } from '@/store/serverStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { LogOut, Server, Info, Shield, Download } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  
  const { server, user, clearServer } = useServerStore();
  const { clearLibraries } = useLibraryStore();
  const { clearPlayer } = usePlayerStore();
  
  // Check if user is logged in - moved outside of conditional rendering
  useEffect(() => {
    if (!server || !user) {
      router.replace('/login');
    }
  }, [server, user, router]);
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            clearServer();
            clearLibraries();
            clearPlayer();
            router.replace('/login');
          }
        }
      ]
    );
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        { 
          backgroundColor: pressed && onPress ? colors.border : 'transparent',
          borderBottomColor: colors.border,
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </Pressable>
  );
  
  if (!server || !user) {
    // Return a loading state instead of Redirect
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Redirecting to login...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Server
        </Text>
        
        {renderSettingItem(
          <Server size={22} color={colors.primary} />,
          "Server URL",
          server?.url || "Not connected"
        )}
        
        {renderSettingItem(
          <Info size={22} color={colors.primary} />,
          "Username",
          user?.username || "Not logged in"
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Playback
        </Text>
        
        {renderSettingItem(
          <Download size={22} color={colors.primary} />,
          "Download over cellular",
          "Allow downloading books using cellular data",
          <Switch 
            value={false} 
            onValueChange={() => {}} 
            trackColor={{ false: colors.inactive, true: colors.primary }}
          />
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security
        </Text>
        
        {renderSettingItem(
          <Shield size={22} color={colors.primary} />,
          "Require authentication",
          "Ask for authentication when app starts",
          <Switch 
            value={false} 
            onValueChange={() => {}} 
            trackColor={{ false: colors.inactive, true: colors.primary }}
          />
        )}
      </View>
      
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { 
              backgroundColor: pressed ? colors.error + '20' : 'transparent',
              borderColor: colors.error,
            }
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </Pressable>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.subtext }]}>
          Audiobookshelf Connect v1.0.0
        </Text>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 14,
  },
});