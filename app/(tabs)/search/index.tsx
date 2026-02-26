import { router, Stack } from "expo-router";
import { Search as SearchIcon, Lock, ChevronRight } from "lucide-react-native";
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

export default function SearchScreen() {
  const { canAccessHymn, isDarkMode: isDark, language } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return HYMNS.filter(
      (hymn) =>
        hymn.title.toLowerCase().includes(query) ||
        (hymn.titleBemba && hymn.titleBemba.toLowerCase().includes(query)) ||
        hymn.number.toString().includes(query) ||
        (hymn.category && hymn.category.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof HYMNS)[0] }) => {
      const hasAccess = canAccessHymn(item.number);
      const displayTitle =
        language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

      return (
        <TouchableOpacity
          style={[styles.row, !hasAccess && styles.rowLocked]}
          onPress={() => {
            if (hasAccess) {
              router.push(`/hymn/${item.id}` as any);
            }
          }}
          activeOpacity={0.6}
        >
          <View style={[styles.badge, !hasAccess && styles.badgeLocked]}>
            <Text style={styles.badgeText}>{item.number}</Text>
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.title, isDark ? styles.textWhite : styles.textDarkColor]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {!!item.category && <Text style={styles.category}>{item.category}</Text>}
          </View>
          {!hasAccess ? (
            <Lock size={14} color={colors.mutedGray} />
          ) : (
            <ChevronRight size={16} color={isDark ? "#444" : "#CCC"} />
          )}
        </TouchableOpacity>
      );
    },
    [canAccessHymn, language, isDark]
  );

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textDarkColor]}>
          Search
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
          <SearchIcon size={18} color={colors.mutedGray} />
          <TextInput
            style={[styles.searchInput, isDark ? { color: "#fff" } : { color: "#212121" }]}
            placeholder="Search by title, number, or category..."
            placeholderTextColor={colors.mutedGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {!searchQuery.trim() ? (
        <View style={styles.emptyState}>
          <SearchIcon size={56} color={isDark ? "#2A2A2E" : "#E0E0E0"} />
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textDarkColor]}>
            Find Your Hymn
          </Text>
          <Text style={styles.emptySubtitle}>
            Search by title, number, or category
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textDarkColor]}>
            No Results
          </Text>
          <Text style={styles.emptySubtitle}>
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
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
  containerLight: { backgroundColor: colors.linen },
  containerDark: { backgroundColor: colors.dark.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  searchWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchBoxLight: {
    backgroundColor: colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchBoxDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingBottom: 100 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    borderRadius: 14,
    backgroundColor: colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rowLocked: { opacity: 0.5 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLocked: { backgroundColor: colors.mutedGray },
  badgeText: { color: "#fff", fontSize: 14, fontWeight: "800" as const },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" as const, marginBottom: 2 },
  category: { fontSize: 13, color: "#71717A" },
  textWhite: { color: "#FFFFFF" },
  textDarkColor: { color: "#1A1A1A" },
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
