import { Stack, router } from "expo-router";
import { Heart, ChevronRight } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

export default function FavoritesTabScreen() {
  const { favoriteHymns, isDarkMode: isDark, language } = useApp();

  const renderItem = useCallback(
    ({ item }: { item: (typeof favoriteHymns)[0] }) => {
      const displayTitle =
        language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push(`/hymn/${item.id}` as any)}
          activeOpacity={0.6}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.number}</Text>
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.title, isDark ? styles.textWhite : styles.textDarkColor]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {item.category && <Text style={styles.category}>{item.category}</Text>}
          </View>
          <Heart size={18} color={colors.crimson} fill={colors.crimson} />
        </TouchableOpacity>
      );
    },
    [isDark, language]
  );

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textDarkColor]}>
          Favorites
        </Text>
      </View>

      {favoriteHymns.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={56} color={isDark ? "#2A2A2E" : "#E0E0E0"} />
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textDarkColor]}>
            No Favorites Yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any hymn to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteHymns}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  listContent: { paddingBottom: 100 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 14, fontWeight: "800" as const },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" as const, marginBottom: 2 },
  category: { fontSize: 13, color: colors.mutedGray },
  textWhite: { color: "#FFFFFF" },
  textDarkColor: { color: colors.light.text },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.mutedGray,
  },
});
