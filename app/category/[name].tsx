import { useLocalSearchParams, router, Stack } from "expo-router";
import { ArrowLeft, Lock, ChevronRight, Music, LogIn } from "lucide-react-native";
import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import colors from "@/constants/colors";
import { BROWSE_CATEGORIES } from "@/constants/categories";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const {
    isDarkMode: isDark,
    language,
    canAccessHymn,
    textScale,
  } = useApp();
  const [showMembersModal, setShowMembersModal] = useState(false);

  const decodedName = decodeURIComponent(name ?? "");

  const category = useMemo(
    () => BROWSE_CATEGORIES.find((c) => c.name === decodedName),
    [decodedName]
  );

  const categoryHymns = useMemo(
    () => HYMNS.filter((h) => h.category === decodedName),
    [decodedName]
  );

  const handleHymnPress = useCallback(
    (item: (typeof HYMNS)[0]) => {
      if (canAccessHymn(item.number)) {
        router.push(`/hymn/${item.id}` as any);
      } else {
        setShowMembersModal(true);
      }
    },
    [canAccessHymn]
  );

  const handleSignIn = useCallback(() => {
    setShowMembersModal(false);
    router.push("/sign-in" as any);
  }, []);

  const handleCreateAccount = useCallback(() => {
    setShowMembersModal(false);
    Linking.openURL("https://districtrayac.web.app/");
  }, []);

  const accentColor = category?.color ?? colors.crimson;

  const renderHymnItem = useCallback(
    ({ item }: { item: (typeof HYMNS)[0] }) => {
      const hasAccess = canAccessHymn(item.number);
      const displayTitle =
        language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

      return (
        <TouchableOpacity
          style={[
            styles.hymnRow,
            isDark ? styles.hymnRowDark : styles.hymnRowLight,
            !hasAccess && styles.hymnRowLocked,
          ]}
          onPress={() => handleHymnPress(item)}
          activeOpacity={0.6}
        >
          <View style={[styles.hymnNumberBadge, { backgroundColor: accentColor }, !hasAccess && styles.hymnNumberBadgeLocked]}>
            <Text style={styles.hymnNumberText}>{item.number}</Text>
          </View>
          <View style={styles.hymnRowInfo}>
            <Text
              style={[
                styles.hymnRowTitle,
                isDark ? styles.textWhite : styles.textBlack,
                !hasAccess && styles.lockedText,
                { fontSize: Math.round(15 * textScale) },
              ]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {!!item.category && (
              <Text
                style={[
                  styles.hymnRowCategory,
                  isDark ? styles.hymnRowCategoryDark : styles.hymnRowCategoryLight,
                  !hasAccess && styles.lockedSubtext,
                ]}
              >
                {item.category}
              </Text>
            )}
          </View>
          {!hasAccess && <Lock size={14} color={colors.mutedGray} />}
          {hasAccess && <ChevronRight size={16} color={isDark ? "#444" : "#C4C4C8"} />}
        </TouchableOpacity>
      );
    },
    [canAccessHymn, language, isDark, handleHymnPress, accentColor, textScale]
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.headerCard}>
        <LinearGradient
          colors={[accentColor + "20", accentColor + "08"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={[styles.headerIconWrap, { backgroundColor: accentColor + "30" }]}>
            <Music size={28} color={accentColor} />
          </View>
          <Text style={[styles.headerCategoryName, isDark ? styles.textWhite : styles.textBlack]}>
            {decodedName}
          </Text>
          <Text style={[styles.headerCount, isDark ? { color: "#9CA3AF" } : { color: "#71717A" }]}>
            {categoryHymns.length} {categoryHymns.length === 1 ? "hymn" : "hymns"}
          </Text>
        </LinearGradient>
      </View>
    ),
    [accentColor, decodedName, categoryHymns.length, isDark]
  );

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={isDark ? "#FFFFFF" : "#1A1A1A"} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
            {decodedName}
          </Text>
          <View style={styles.backButton} />
        </View>

        <FlatList
          data={categoryHymns}
          renderItem={renderHymnItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDark ? { color: "#9CA3AF" } : { color: "#71717A" }]}>
                No hymns found in this category.
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showMembersModal}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMembersModal(false)}>
          <View
            style={[
              styles.modalContent,
              isDark ? styles.modalContentDark : styles.modalContentLight,
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Lock size={32} color={colors.crimson} />
            </View>
            <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
              Members Only
            </Text>
            <Text style={[styles.modalBody, isDark ? { color: "#9CA3AF" } : { color: "#71717A" }]}>
              The full hymn library is available to registered members.
            </Text>
            <TouchableOpacity style={styles.modalSignInButton} onPress={handleSignIn}>
              <LogIn size={18} color={colors.white} />
              <Text style={styles.modalSignInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalCreateButton,
                isDark ? styles.modalCreateButtonDark : styles.modalCreateButtonLight,
              ]}
              onPress={handleCreateAccount}
            >
              <Text style={[styles.modalCreateButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalDismissButton}
              onPress={() => setShowMembersModal(false)}
            >
              <Text style={styles.modalDismissText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: colors.linen,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    flex: 1,
    textAlign: "center",
  },
  headerCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  headerGradient: {
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerCategoryName: {
    fontSize: 24,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  headerCount: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  listContent: {
    paddingBottom: 100,
  },
  hymnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    borderRadius: 14,
  },
  hymnRowDark: {
    backgroundColor: "transparent",
  },
  hymnRowLight: {
    backgroundColor: colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    ...Platform.select({
      android: { elevation: 2 },
      default: {},
    }),
  },
  hymnRowLocked: {
    opacity: 0.5,
  },
  hymnNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  hymnNumberBadgeLocked: {
    backgroundColor: colors.mutedGray,
  },
  hymnNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800" as const,
  },
  hymnRowInfo: {
    flex: 1,
  },
  hymnRowTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  hymnRowCategory: {
    fontSize: 13,
  },
  hymnRowCategoryLight: {
    color: "#71717A",
  },
  hymnRowCategoryDark: {
    color: "#9CA3AF",
  },
  lockedText: {
    opacity: 0.7,
  },
  lockedSubtext: {
    opacity: 0.5,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textBlack: {
    color: "#1A1A1A",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    margin: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 340,
  },
  modalContentLight: {
    backgroundColor: colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    ...Platform.select({
      android: { elevation: 10 },
      default: {},
    }),
  },
  modalContentDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  modalIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(227, 27, 35, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    marginBottom: 8,
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
    height: 52,
    borderRadius: 14,
    marginBottom: 10,
  },
  modalSignInButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  modalCreateButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  modalCreateButtonLight: {
    borderColor: "#E4E4E7",
    backgroundColor: colors.linen,
  },
  modalCreateButtonDark: {
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    color: colors.mutedGray,
  },
});
