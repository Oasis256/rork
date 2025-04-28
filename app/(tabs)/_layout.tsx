import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { Home, BookOpen, Settings } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="libraries"
        options={{
          title: "Libraries",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}