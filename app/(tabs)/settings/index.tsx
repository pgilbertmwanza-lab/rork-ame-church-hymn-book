import { Stack, router } from "expo-router";
import { Moon, Sun, Type, LogOut, User, ExternalLink, LogIn } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { FontSize } from "@/types/hymn";

export default function SettingsTabScreen() {
  const { user, signOut } = useAuth();
  const { fontSize, updateFontSize, isDarkMode, toggleDarkMode, isMember } = useApp();
  const isDark = isDarkMode;

  const fontSizes: FontSize[] = ["small", "medium", "large", "xlarge"];

  const fontSizeLabels: Record<FontSize, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    xlarge: "Extra Large",
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
            Settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Account
          </Text>
          {isMember ? (
            <>
              <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.accountInfo}>
                  <View style={styles.avatar}>
                    <User size={24} color={colors.white} />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={[styles.accountName, isDark ? styles.textDark : styles.textLight]}>
                      {user?.displayName || "User"}
                    </Text>
                    <Text style={[styles.accountEmail, isDark ? styles.subtextDark : styles.subtextLight]}>
                      {user?.email}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Member</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.card, isDark ? styles.cardDark : styles.cardLight, styles.cardMargin]}
                onPress={() => Linking.openURL("https://districtrayac.web.app/")}
              >
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <ExternalLink size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                    <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                      Manage Account
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.guestInfo}>
                <View style={styles.guestAvatar}>
                  <User size={24} color={colors.mediumGray} />
                </View>
                <View style={styles.guestDetails}>
                  <Text style={[styles.accountName, isDark ? styles.textDark : styles.textLight]}>
                    Guest
                  </Text>
                  <Text style={[styles.accountEmail, isDark ? styles.subtextDark : styles.subtextLight]}>
                    Sign in for full library access
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.settingsSignInButton}
                onPress={() => router.push("/sign-in" as any)}
              >
                <LogIn size={16} color={colors.white} />
                <Text style={styles.settingsSignInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Appearance
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDarkMode ? (
                  <Moon size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                ) : (
                  <Sun size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                )}
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.borderGray, true: colors.crimson }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, styles.cardMargin]}>
            <View style={styles.settingColumn}>
              <View style={styles.settingLeft}>
                <Type size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Font Size
                </Text>
              </View>
              <View style={styles.fontSizeOptions}>
                {fontSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      fontSize === size && styles.fontSizeButtonActive,
                      isDark ? styles.fontSizeButtonDark : styles.fontSizeButtonLight,
                    ]}
                    onPress={() => updateFontSize(size)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        fontSize === size && styles.fontSizeButtonTextActive,
                        isDark && fontSize !== size && styles.fontSizeButtonTextDark,
                      ]}
                    >
                      {fontSizeLabels[size]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {isMember && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.card,
                styles.signOutCard,
                isDark ? styles.signOutCardDark : styles.signOutCardLight,
              ]}
              onPress={signOut}
            >
              <LogOut size={20} color={colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark ? styles.subtextDark : styles.subtextLight]}>
            African Methodist Episcopal Church Hymns v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.linen },
  containerDark: { backgroundColor: colors.dark.background },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 12 },
  card: { borderRadius: 14, padding: 16 },
  cardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 0,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardMargin: { marginTop: 12 },
  accountInfo: { flexDirection: "row", gap: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  accountDetails: { flex: 1, justifyContent: "center" },
  accountName: { fontSize: 18, fontWeight: "600" as const, marginBottom: 4 },
  accountEmail: { fontSize: 14, marginBottom: 8 },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "600" as const },
  guestInfo: { flexDirection: "row", gap: 16, marginBottom: 14 },
  guestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.borderGray,
    alignItems: "center",
    justifyContent: "center",
  },
  guestDetails: { flex: 1, justifyContent: "center" },
  settingsSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    borderRadius: 14,
  },
  settingsSignInText: { color: colors.white, fontSize: 15, fontWeight: "600" as const },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: { gap: 16 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: "500" as const },
  fontSizeOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  fontSizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0,
  },
  fontSizeButtonLight: {
    borderColor: "transparent",
    backgroundColor: colors.linen,
  },
  fontSizeButtonDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.background,
  },
  fontSizeButtonActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  fontSizeButtonText: { fontSize: 14, fontWeight: "500" as const, color: "#4B5563" },
  fontSizeButtonTextDark: { color: colors.dark.textSecondary },
  fontSizeButtonTextActive: { color: "#FFFFFF", fontWeight: "700" as const },
  signOutText: { fontSize: 16, fontWeight: "700" as const, color: "#B91C1C" },
  signOutCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  signOutCardLight: {
    backgroundColor: "#fff1f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  signOutCardDark: {
    backgroundColor: "rgba(227, 27, 35, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(227, 27, 35, 0.2)",
  },

  footer: { alignItems: "center", paddingVertical: 24 },
  footerText: { fontSize: 14 },
  textLight: { color: "#1A1A1A" },
  textDark: { color: colors.dark.text },
  subtextLight: { color: "#71717A" },
  subtextDark: { color: colors.dark.textSecondary },
});
