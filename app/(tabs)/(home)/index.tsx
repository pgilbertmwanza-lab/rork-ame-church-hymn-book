import { router, Stack } from "expo-router";
import { Search, Lock, Settings, Church, Languages, ArrowUpAZ, Hash, LogIn } from "lucide-react-native";
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

type SortType = "numerical" | "alphabetical";

export default function HomeScreen() {
  const { isMember, canAccessHymn, isDarkMode: isDark, language, toggleLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("numerical");
  const [showMembersModal, setShowMembersModal] = useState(false);

  const filteredHymns = useMemo(() => {
    let hymns = [...HYMNS];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      hymns = hymns.filter(
        (hymn) =>
          hymn.title.toLowerCase().includes(query) ||
          (hymn.titleBemba && hymn.titleBemba.toLowerCase().includes(query)) ||
          hymn.number.toString().includes(query) ||
          (hymn.lyrics && hymn.lyrics.toLowerCase().includes(query)) ||
          (hymn.lyricsBemba && hymn.lyricsBemba.toLowerCase().includes(query))
      );
    }

    if (sortType === "alphabetical") {
      hymns.sort((a, b) => {
        const titleA = language === "bemba" && a.titleBemba ? a.titleBemba : a.title;
        const titleB = language === "bemba" && b.titleBemba ? b.titleBemba : b.title;
        return titleA.localeCompare(titleB);
      });
    } else {
      hymns.sort((a, b) => a.number - b.number);
    }

    return hymns;
  }, [searchQuery, sortType, language]);

  const handleHymnPress = useCallback((item: typeof HYMNS[0]) => {
    const hasAccess = canAccessHymn(item.number);
    if (hasAccess) {
      router.push(`/hymn/${item.id}` as any);
    } else {
      setShowMembersModal(true);
    }
  }, [canAccessHymn]);

  const handleSignIn = useCallback(() => {
    setShowMembersModal(false);
    router.push("/sign-in" as any);
  }, []);

  const handleCreateAccount = useCallback(() => {
    setShowMembersModal(false);
    Linking.openURL("https://districtrayac.web.app/");
  }, []);

  const renderHymnItem = ({ item }: { item: typeof HYMNS[0] }) => {
    const hasAccess = canAccessHymn(item.number);
    const displayTitle = language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

    return (
      <TouchableOpacity
        style={[
          styles.hymnCard,
          isDark ? styles.hymnCardDark : styles.hymnCardLight,
          !hasAccess && styles.hymnCardLocked,
        ]}
        onPress={() => handleHymnPress(item)}
      >
        <View style={styles.hymnCardContent}>
          <View style={[styles.hymnNumber, !hasAccess && styles.hymnNumberLocked]}>
            <Text style={[styles.hymnNumberText, isDark ? styles.textDark : styles.textLight, !hasAccess && styles.hymnNumberTextLocked]}>
              {item.number}
            </Text>
          </View>
          <View style={styles.hymnInfo}>
            <Text
              style={[
                styles.hymnTitle,
                isDark ? styles.textDark : styles.textLight,
                !hasAccess && styles.lockedText,
              ]}
            >
              {displayTitle}
            </Text>
            {item.category && (
              <Text
                style={[
                  styles.hymnCategory,
                  isDark ? styles.subtextDark : styles.subtextLight,
                  !hasAccess && styles.lockedSubtext,
                ]}
              >
                {item.category}
              </Text>
            )}
          </View>
          {!hasAccess && (
            <View style={styles.lockBadge}>
              <Lock size={16} color={isDark ? "#555" : colors.mediumGray} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.appNameContainer}>
          <View style={styles.appIconBadge}>
            <Church size={24} color={colors.white} />
          </View>
          <View style={styles.appNameTextContainer}>
            <Text style={[styles.appNameMain, isDark ? styles.textDark : styles.textLight]}>
              AME Church
            </Text>
            <Text style={[styles.appNameSub, isDark ? styles.appNameSubDark : styles.appNameSubLight]}>
              HYMNS
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Languages size={20} color={isDark ? colors.dark.text : colors.light.primary} />
            <Text style={[styles.languageButtonText, isDark ? styles.textDark : styles.textLight]}>
              {language === "english" ? "EN" : "BE"}
            </Text>
          </TouchableOpacity>
          {!isMember && (
            <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/sign-in" as any)}>
              <LogIn size={18} color={colors.white} />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings" as any)}
          >
            <Settings size={24} color={isDark ? colors.dark.text : colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.sortFloatingButton,
          isDark ? styles.sortFloatingButtonDark : styles.sortFloatingButtonLight,
        ]}
        onPress={() => setSortType(sortType === "numerical" ? "alphabetical" : "numerical")}
      >
        {sortType === "numerical" ? (
          <Hash size={20} color={isDark ? colors.dark.text : colors.light.primary} />
        ) : (
          <ArrowUpAZ size={20} color={isDark ? colors.dark.text : colors.light.primary} />
        )}
        <Text style={[styles.sortFloatingText, isDark ? styles.textDark : styles.textLight]}>
          {sortType === "numerical" ? "123" : "A-Z"}
        </Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
          <Search size={20} color={isDark ? "#666" : colors.mediumGray} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
            placeholder="Search hymns..."
            placeholderTextColor={isDark ? "#666" : colors.light.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {!isMember && (
        <View style={[styles.previewBanner, isDark ? styles.previewBannerDark : styles.previewBannerLight]}>
          <Lock size={14} color={isDark ? colors.dark.textSecondary : colors.churchBlue} />
          <Text style={[styles.previewBannerText, isDark ? styles.previewBannerTextDark : styles.previewBannerTextLight]}>
            Viewing first 10 hymns · Sign in for the full library
          </Text>
        </View>
      )}

      <FlatList
        data={filteredHymns}
        renderItem={renderHymnItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showMembersModal}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMembersModal(false)}>
          <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalIconContainer}>
              <Lock size={36} color={colors.churchBlue} />
            </View>
            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Members Only
            </Text>
            <Text style={[styles.modalBody, isDark ? styles.subtextDark : styles.subtextLight]}>
              The full hymn library is available to registered members.
            </Text>
            <TouchableOpacity
              style={styles.modalSignInButton}
              onPress={handleSignIn}
            >
              <LogIn size={18} color={colors.white} />
              <Text style={styles.modalSignInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCreateButton, isDark ? styles.modalCreateButtonDark : styles.modalCreateButtonLight]}
              onPress={handleCreateAccount}
            >
              <Text style={[styles.modalCreateButtonText, isDark ? styles.textDark : styles.textLight]}>
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalDismissButton}
              onPress={() => setShowMembersModal(false)}
            >
              <Text style={[styles.modalDismissText, isDark ? styles.subtextDark : styles.subtextLight]}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: colors.light.background,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  appNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appNameTextContainer: {
    gap: -2,
  },
  appNameMain: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  appNameSub: {
    fontSize: 16,
    fontWeight: "800" as const,
    letterSpacing: 2,
  },
  appNameSubLight: {
    color: colors.churchBlue,
  },
  appNameSubDark: {
    color: colors.crimson,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsButton: {
    padding: 4,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.crimson,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchBoxLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBoxDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchInputLight: {
    color: colors.light.text,
  },
  searchInputDark: {
    color: colors.dark.text,
  },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 10,
  },
  previewBannerLight: {
    backgroundColor: "#E8EFF7",
  },
  previewBannerDark: {
    backgroundColor: "rgba(227, 27, 35, 0.12)",
  },
  previewBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  previewBannerTextLight: {
    color: colors.churchBlue,
  },
  previewBannerTextDark: {
    color: colors.dark.textSecondary,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  hymnCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hymnCardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hymnCardDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  hymnCardLocked: {
    opacity: 0.6,
  },
  hymnCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  hymnNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  hymnNumberLocked: {
    backgroundColor: colors.mediumGray,
  },
  hymnNumberText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.white,
  },
  hymnNumberTextLocked: {
    color: colors.white,
  },
  hymnInfo: {
    flex: 1,
  },
  hymnTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  hymnCategory: {
    fontSize: 14,
  },
  lockBadge: {
    padding: 8,
  },
  lockedText: {
    opacity: 0.7,
  },
  lockedSubtext: {
    opacity: 0.5,
  },
  textLight: {
    color: colors.light.text,
  },
  textDark: {
    color: colors.dark.text,
  },
  subtextLight: {
    color: colors.light.textSecondary,
  },
  subtextDark: {
    color: colors.dark.textSecondary,
  },
  sortFloatingButton: {
    position: "absolute" as const,
    top: 100,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  sortFloatingButtonLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sortFloatingButtonDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sortFloatingText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 28,
    margin: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 340,
  },
  modalContentLight: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContentDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(227, 27, 35, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginBottom: 10,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.crimson,
    width: "100%",
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  modalSignInButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalCreateButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  modalCreateButtonLight: {
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  modalCreateButtonDark: {
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "transparent",
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalDismissButton: {
    paddingVertical: 8,
  },
  modalDismissText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
});
