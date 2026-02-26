import { router, Stack } from "expo-router";
import {
  Search,
  Lock,
  Church,
  Languages,
  LogIn,
  Sparkles,
  Cloud,
  Music,
  Shield,
  Heart,
  Wine,
  Star,
  Sun,
  Flame,
  Globe,
  Cross,
  HandMetal,
  ChevronRight,
} from "lucide-react-native";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { BROWSE_CATEGORIES } from "@/constants/categories";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

type SortType = "numerical" | "alphabetical";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = (SCREEN_WIDTH - 48 - 12) / 2;

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Cloud,
  Music,
  HandMetal,
  Shield,
  Heart,
  Wine,
  Star,
  Sun,
  Flame,
  Globe,
  Cross,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getHymnOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % HYMNS.length;
  return HYMNS[index];
}

export default function HomeScreen() {
  const {
    isMember,
    canAccessHymn,
    isDarkMode: isDark,
    language,
    toggleLanguage,
    recentHymns,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("numerical");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroFade, heroSlide]);

  const hymnOfTheDay = useMemo(() => getHymnOfTheDay(), []);
  const greeting = useMemo(() => getGreeting(), []);

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

  const handleHymnPress = useCallback(
    (item: (typeof HYMNS)[0]) => {
      const hasAccess = canAccessHymn(item.number);
      if (hasAccess) {
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

  const toggleSearch = useCallback(() => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);
    Animated.spring(searchAnim, {
      toValue,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
    if (showSearch) {
      setSearchQuery("");
    }
  }, [showSearch, searchAnim]);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      const categoryHymns = HYMNS.filter((h) => h.category === categoryName);
      if (categoryHymns.length > 0) {
        const firstAccessible = categoryHymns.find((h) => canAccessHymn(h.number));
        if (firstAccessible) {
          router.push(`/hymn/${firstAccessible.id}` as any);
        } else {
          setShowMembersModal(true);
        }
      }
    },
    [canAccessHymn]
  );

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderHymnItem = useCallback(
    ({ item }: { item: (typeof HYMNS)[0] }) => {
      const hasAccess = canAccessHymn(item.number);
      const displayTitle =
        language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

      return (
        <TouchableOpacity
          style={[styles.hymnRow, !hasAccess && styles.hymnRowLocked]}
          onPress={() => handleHymnPress(item)}
          activeOpacity={0.6}
        >
          <View style={[styles.hymnNumberBadge, !hasAccess && styles.hymnNumberBadgeLocked]}>
            <Text style={styles.hymnNumberText}>{item.number}</Text>
          </View>
          <View style={styles.hymnRowInfo}>
            <Text
              style={[
                styles.hymnRowTitle,
                isDark ? styles.textWhite : styles.textDark,
                !hasAccess && styles.lockedText,
              ]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {!!item.category && (
              <Text style={[styles.hymnRowCategory, !hasAccess && styles.lockedSubtext]}>
                {item.category}
              </Text>
            )}
          </View>
          {!hasAccess && (
            <Lock size={14} color={colors.mutedGray} />
          )}
          {hasAccess && (
            <ChevronRight size={16} color={isDark ? "#444" : "#CCC"} />
          )}
        </TouchableOpacity>
      );
    },
    [canAccessHymn, language, isDark, handleHymnPress]
  );

  const renderRecentCard = useCallback(
    ({ item }: { item: (typeof HYMNS)[0] }) => {
      const displayTitle =
        language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

      return (
        <TouchableOpacity
          style={styles.recentCard}
          onPress={() => router.push(`/hymn/${item.id}` as any)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#1A1A1D", "#252528"]}
            style={styles.recentCardGradient}
          >
            <View style={styles.recentCardNumberContainer}>
              <Text style={styles.recentCardNumber}>{item.number}</Text>
            </View>
            <Text style={styles.recentCardTitle} numberOfLines={2}>
              {displayTitle}
            </Text>
            <Text style={styles.recentCardCategory} numberOfLines={1}>
              {item.category ?? "Hymn"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [language]
  );

  const renderCategoryCard = useCallback(
    ({ item, index }: { item: (typeof BROWSE_CATEGORIES)[0]; index: number }) => {
      const IconComponent = ICON_MAP[item.icon];
      const isLeft = index % 2 === 0;

      return (
        <TouchableOpacity
          style={[
            styles.categoryCard,
            isLeft ? { marginRight: 6 } : { marginLeft: 6 },
          ]}
          onPress={() => handleCategoryPress(item.name)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[item.color + "22", item.color + "08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryCardGradient}
          >
            <View style={[styles.categoryIconWrap, { backgroundColor: item.color + "30" }]}>
              {IconComponent && <IconComponent size={20} color={item.color} />}
            </View>
            <Text
              style={[
                styles.categoryCardText,
                isDark ? styles.textWhite : styles.textDark,
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [isDark, handleCategoryPress]
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greetingText, isDark ? styles.textMuted : styles.textMutedLight]}>
              {greeting}
            </Text>
            <Text style={[styles.greetingTitle, isDark ? styles.textWhite : styles.textDark]}>
              AME Church Hymns
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleLanguage}>
              <Languages size={20} color={isDark ? colors.dark.textSecondary : colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleSearch}>
              <Search size={20} color={isDark ? colors.dark.textSecondary : colors.light.primary} />
            </TouchableOpacity>
            {!isMember && (
              <TouchableOpacity
                style={styles.signInPill}
                onPress={() => router.push("/sign-in" as any)}
              >
                <LogIn size={14} color={colors.white} />
                <Text style={styles.signInPillText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Animated.View
          style={[
            styles.searchAnimContainer,
            { height: searchHeight, opacity: searchOpacity },
          ]}
        >
          <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
            <Search size={18} color={colors.mutedGray} />
            <TextInput
              style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
              placeholder="Search hymns by title, number, or lyrics..."
              placeholderTextColor={colors.mutedGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={showSearch}
            />
          </View>
        </Animated.View>

        {!searchQuery.trim() && (
          <>
            <Animated.View
              style={{
                opacity: heroFade,
                transform: [{ translateY: heroSlide }],
              }}
            >
              <TouchableOpacity
                style={styles.heroCard}
                onPress={() => handleHymnPress(hymnOfTheDay)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? [colors.crimson, "#5E0B0B", colors.deepBlack]
                      : [colors.crimson, "#8B1A1F", "#2A0505"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroBadge}>
                      <Sparkles size={12} color={colors.amber} />
                      <Text style={styles.heroBadgeText}>Hymn of the Day</Text>
                    </View>
                    <Church size={28} color="rgba(255,255,255,0.2)" />
                  </View>
                  <View style={styles.heroBottom}>
                    <Text style={styles.heroNumber}>#{hymnOfTheDay.number}</Text>
                    <Text style={styles.heroTitle} numberOfLines={2}>
                      {language === "bemba" && hymnOfTheDay.titleBemba
                        ? hymnOfTheDay.titleBemba
                        : hymnOfTheDay.title}
                    </Text>
                    {!!hymnOfTheDay.category && (
                      <Text style={styles.heroCategory}>{hymnOfTheDay.category}</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {!isMember && (
              <View style={styles.previewBanner}>
                <Lock size={13} color={colors.amber} />
                <Text style={styles.previewBannerText}>
                  Viewing first 10 hymns · Sign in for the full library
                </Text>
              </View>
            )}

            {recentHymns.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isDark ? styles.textWhite : styles.textDark,
                  ]}
                >
                  Jump Back In
                </Text>
                <FlatList
                  data={recentHymns.slice(0, 5)}
                  renderItem={renderRecentCard}
                  keyExtractor={(item) => "recent-" + item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentList}
                />
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark ? styles.textWhite : styles.textDark,
                ]}
              >
                Browse Categories
              </Text>
              <View style={styles.categoriesGrid}>
                {BROWSE_CATEGORIES.map((cat, index) => (
                  <React.Fragment key={cat.name}>
                    {renderCategoryCard({ item: cat, index })}
                  </React.Fragment>
                ))}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.allHymnsHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isDark ? styles.textWhite : styles.textDark,
                  ]}
                >
                  All Hymns
                </Text>
                <TouchableOpacity
                  style={[styles.sortPill, isDark ? styles.sortPillDark : styles.sortPillLight]}
                  onPress={() =>
                    setSortType(sortType === "numerical" ? "alphabetical" : "numerical")
                  }
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      isDark ? styles.textWhite : styles.textDark,
                    ]}
                  >
                    {sortType === "numerical" ? "# Number" : "A-Z"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {!!searchQuery.trim() && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textDark]}>
              Results
            </Text>
          </View>
        )}
      </View>
    ),
    [
      isDark,
      greeting,
      isMember,
      language,
      hymnOfTheDay,
      recentHymns,
      searchQuery,
      showSearch,
      sortType,
      searchHeight,
      searchOpacity,
      heroFade,
      heroSlide,
      toggleLanguage,
      toggleSearch,
      handleHymnPress,
      renderRecentCard,
      renderCategoryCard,
    ]
  );

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <FlatList
          data={filteredHymns}
          renderItem={renderHymnItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
            <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textDark]}>
              Members Only
            </Text>
            <Text style={[styles.modalBody, isDark ? styles.textMuted : styles.textMutedLight]}>
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
              <Text
                style={[
                  styles.modalCreateButtonText,
                  isDark ? styles.textWhite : styles.textDark,
                ]}
              >
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
    backgroundColor: colors.light.background,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.1)",
  },
  signInPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  signInPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700" as const,
  },
  searchAnimContainer: {
    paddingHorizontal: 20,
    overflow: "hidden",
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchBoxLight: {
    backgroundColor: "#F0F0F2",
  },
  searchBoxDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  searchInputLight: {
    color: colors.light.text,
  },
  searchInputDark: {
    color: colors.dark.text,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.crimson,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowColor: colors.crimson,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  heroGradient: {
    padding: 24,
    minHeight: 180,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  heroBottom: {
    marginTop: 20,
  },
  heroNumber: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  heroCategory: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "500" as const,
    marginTop: 6,
  },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "rgba(227, 27, 35, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(227, 27, 35, 0.15)",
  },
  previewBannerText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.mutedGray,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700" as const,
    paddingHorizontal: 20,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  recentList: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 12,
  },
  recentCard: {
    width: 140,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  recentCardGradient: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  recentCardNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(227, 27, 35, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  recentCardNumber: {
    color: colors.crimson,
    fontSize: 14,
    fontWeight: "800" as const,
  },
  recentCardTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700" as const,
    lineHeight: 18,
    marginTop: 8,
  },
  recentCardCategory: {
    color: colors.mutedGray,
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryCard: {
    width: CARD_SIZE,
    height: 72,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  categoryCardGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: "700" as const,
    flex: 1,
    lineHeight: 17,
  },
  allHymnsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortPillLight: {
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  sortPillDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  hymnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  hymnRowLocked: {
    opacity: 0.5,
  },
  hymnNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.crimson,
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
    color: colors.mutedGray,
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
  textDark: {
    color: colors.light.text,
  },
  textMuted: {
    color: colors.dark.textSecondary,
  },
  textMutedLight: {
    color: colors.light.textSecondary,
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
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
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
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  modalSignInButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700" as const,
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
