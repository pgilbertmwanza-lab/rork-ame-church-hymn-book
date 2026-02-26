import { Tabs } from "expo-router";
import { Home, Search, Heart, Settings, Church, ScrollText } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { useApp } from "@/contexts/app-context";

export default function TabLayout() {
  const { isDarkMode: isDark } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#E31B23" : "#1A237E",
        tabBarInactiveTintColor: isDark ? "#555" : "#9CA3AF",
        tabBarStyle: Platform.OS === "web"
          ? {
              backgroundColor: isDark
                ? "rgba(10, 10, 11, 0.92)"
                : "rgba(255, 255, 255, 0.88)",
              borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              borderTopWidth: StyleSheet.hairlineWidth,
            }
          : {
              position: "absolute" as const,
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
        tabBarBackground: () =>
          Platform.OS !== "web" ? (
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600" as const,
          letterSpacing: 0.2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="call-to-worship"
        options={{
          title: "Worship",
          tabBarIcon: ({ color, size }) => <Church size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Heart size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="apostles-creed"
        options={{
          title: "Creed",
          tabBarIcon: ({ color, size }) => <ScrollText size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
